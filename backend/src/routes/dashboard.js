import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { requireAuth, requireStaff } from '../middleware/auth.js';

export const dashboardRouter = Router();

dashboardRouter.get('/consumer', requireAuth, async (req, res, next) => {
  try {
    const consumerId = req.consumer?.id;
    if (!consumerId) {
      res.json({
        consumption: { current: 0, unit: 'kWh', daily: 0, weekly: 0, monthly: 0 },
        billEstimate: 0,
        balance: 0,
        currency: 'KES',
        connectivity: 'unknown',
        signal: 0,
        alertCount: 0,
      });
      return;
    }

    const { data: meter } = await supabaseAdmin
      .from('meters')
      .select('id, status, signal_strength, connectivity, battery_pct')
      .eq('consumer_id', consumerId)
      .maybeSingle();

    const { data: readings } = meter
      ? await supabaseAdmin
          .from('readings')
          .select('kwh, recorded_at')
          .eq('meter_id', meter.id)
          .order('recorded_at', { ascending: false })
          .limit(30)
      : { data: [] };

    const { data: unpaidBill } = await supabaseAdmin
      .from('bills')
      .select('amount')
      .eq('consumer_id', consumerId)
      .eq('status', 'unpaid')
      .order('due_date', { ascending: true })
      .limit(1)
      .maybeSingle();

    const { count: alertCount } = await supabaseAdmin
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('consumer_id', consumerId)
      .eq('is_read', false);

    const latest = readings?.[0]?.kwh ?? 0;
    const daily = readings?.slice(0, 3).reduce((s, r) => s + Number(r.kwh), 0) / 3 || 0;

    res.json({
      consumption: {
        current: latest,
        unit: 'kWh',
        daily: Math.round(daily * 10) / 10,
        weekly: readings?.slice(0, 7).reduce((s, r) => s + Number(r.kwh), 0) ?? 0,
        monthly: readings?.reduce((s, r) => s + Number(r.kwh), 0) ?? 0,
      },
      billEstimate: unpaidBill?.amount ?? 0,
      balance: req.consumer.outstanding_balance ?? 0,
      currency: req.consumer.currency ?? 'KES',
      connectivity: meter?.connectivity ?? meter?.status ?? 'offline',
      signal: meter?.signal_strength ?? 0,
      alertCount: alertCount ?? 0,
      readings: readings ?? [],
    });
  } catch (err) {
    next(err);
  }
});

/** Single request for sidebar notification badges */
dashboardRouter.get('/nav-badges', requireAuth, async (req, res, next) => {
  try {
    const role = req.profile?.role ?? 'consumer';

    if (role === 'consumer' && req.consumer?.id) {
      const [{ count: unread }, { count: unpaid }] = await Promise.all([
        supabaseAdmin
          .from('alerts')
          .select('*', { count: 'exact', head: true })
          .eq('consumer_id', req.consumer.id)
          .eq('is_read', false),
        supabaseAdmin
          .from('bills')
          .select('*', { count: 'exact', head: true })
          .eq('consumer_id', req.consumer.id)
          .eq('status', 'unpaid'),
      ]);
      res.json({ notifications: unread ?? 0, billing: unpaid ?? 0 });
      return;
    }

    if (['admin', 'manager', 'billing', 'technician'].includes(role)) {
      const [
        { count: offlineMeters },
        { count: openFaults },
        { count: unreadAlerts },
      ] = await Promise.all([
        supabaseAdmin.from('meters').select('*', { count: 'exact', head: true }).neq('status', 'online'),
        supabaseAdmin.from('incidents').select('*', { count: 'exact', head: true }).neq('status', 'resolved'),
        supabaseAdmin.from('alerts').select('*', { count: 'exact', head: true }).eq('is_read', false),
      ]);
      res.json({
        meterFleet: offlineMeters ?? 0,
        faults: openFaults ?? 0,
        notifications: unreadAlerts ?? 0,
      });
      return;
    }

    res.json({});
  } catch (err) {
    next(err);
  }
});

dashboardRouter.get('/admin', requireAuth, requireStaff, async (_req, res, next) => {
  try {
    const [
      { count: activeMeters },
      { count: offlineMeters },
      { count: openFaults },
      { data: revenue },
    ] = await Promise.all([
      supabaseAdmin.from('meters').select('*', { count: 'exact', head: true }).eq('status', 'online'),
      supabaseAdmin.from('meters').select('*', { count: 'exact', head: true }).neq('status', 'online'),
      supabaseAdmin.from('incidents').select('*', { count: 'exact', head: true }).neq('status', 'resolved'),
      supabaseAdmin.from('payments').select('amount').gte('paid_at', new Date(new Date().setDate(1)).toISOString()),
    ]);

    const totalRevenue = revenue?.reduce((s, p) => s + Number(p.amount), 0) ?? 0;

    res.json({
      kpis: [
        { label: 'Active meters', value: String(activeMeters ?? 0), delta: 'online fleet', deltaType: 'up' },
        { label: 'Offline / fault', value: String(offlineMeters ?? 0), delta: 'needs attention', deltaType: 'down' },
        { label: 'Open incidents', value: String(openFaults ?? 0), delta: 'operations', deltaType: 'down' },
        { label: 'Revenue (MTD)', value: `KES ${Math.round(totalRevenue).toLocaleString()}`, deltaType: 'up' },
      ],
    });
  } catch (err) {
    next(err);
  }
});

dashboardRouter.get('/billing-summary', requireAuth, requireStaff, async (_req, res, next) => {
  try {
    const monthStart = new Date(new Date().setDate(1)).toISOString();
    const [{ data: bills }, { data: payments }, { data: consumers }] = await Promise.all([
      supabaseAdmin.from('bills').select('amount, status, due_date, period_label'),
      supabaseAdmin.from('payments').select('amount, paid_at').order('paid_at', { ascending: false }),
      supabaseAdmin.from('consumers').select('outstanding_balance'),
    ]);

    const unpaid = (bills ?? []).filter((b) => b.status === 'unpaid' || b.status === 'overdue');
    const outstanding = unpaid.reduce((s, b) => s + Number(b.amount), 0)
      + (consumers ?? []).reduce((s, c) => s + Number(c.outstanding_balance || 0), 0);
    const mtdPayments = (payments ?? []).filter((p) => p.paid_at >= monthStart);
    const mtdRevenue = mtdPayments.reduce((s, p) => s + Number(p.amount), 0);
    const totalBilled = (bills ?? []).reduce((s, b) => s + Number(b.amount), 0);
    const totalPaid = (payments ?? []).reduce((s, p) => s + Number(p.amount), 0);
    const collectionRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 1000) / 10 : 0;

    const byMonth = {};
    (payments ?? []).forEach((p) => {
      const m = p.paid_at?.slice(0, 7) ?? 'unknown';
      byMonth[m] = (byMonth[m] || 0) + Number(p.amount);
    });
    const months = Object.keys(byMonth).sort().slice(-5);
    const revenueChart = months.map((m) => Math.round(byMonth[m] / 1000) / 1000);
    const revenueLabels = months.map((m) => {
      const [, mo] = m.split('-');
      return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(mo) - 1] ?? m;
    });

    const lastBill = (bills ?? []).sort((a, b) => (b.due_date > a.due_date ? 1 : -1))[0];

    res.json({
      monthlyRevenue: mtdRevenue,
      outstanding: Math.round(outstanding),
      collectionRate,
      unpaidCount: unpaid.length,
      totalBills: bills?.length ?? 0,
      paidCount: (bills ?? []).filter((b) => b.status === 'paid').length,
      revenueChart: revenueChart.length ? revenueChart : [3.2, 3.5, 3.8, 4.0, 4.2],
      revenueLabels: revenueLabels.length ? revenueLabels : ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      lastInvoiceRun: lastBill?.period_label ?? '—',
      lastInvoiceCount: bills?.length ?? 0,
      currency: 'KES',
    });
  } catch (err) {
    next(err);
  }
});

dashboardRouter.get('/analytics', requireAuth, requireStaff, async (_req, res, next) => {
  try {
    const [{ data: readings }, { data: payments }] = await Promise.all([
      supabaseAdmin.from('readings').select('kwh, recorded_at').order('recorded_at', { ascending: false }).limit(200),
      supabaseAdmin.from('payments').select('amount, paid_at').order('paid_at', { ascending: false }).limit(100),
    ]);

    const usageByMonth = {};
    (readings ?? []).forEach((r) => {
      const m = r.recorded_at?.slice(0, 7) ?? 'unknown';
      usageByMonth[m] = (usageByMonth[m] || 0) + Number(r.kwh);
    });
    const uMonths = Object.keys(usageByMonth).sort().slice(-5);
    const usageChart = uMonths.map((m) => Math.round(usageByMonth[m]));
    const usageLabels = uMonths.map((m) => m.slice(5));

    const revByMonth = {};
    (payments ?? []).forEach((p) => {
      const m = p.paid_at?.slice(0, 7) ?? 'unknown';
      revByMonth[m] = (revByMonth[m] || 0) + Number(p.amount) / 1000;
    });
    const rMonths = Object.keys(revByMonth).sort().slice(-5);

    const totalKwh = (readings ?? []).reduce((s, r) => s + Number(r.kwh), 0);
    const avgDaily = readings?.length ? Math.round((totalKwh / readings.length) * 10) / 10 : 0;

    res.json({
      usageChart: usageChart.length ? usageChart : [820, 845, 880, 910, 935],
      usageLabels: usageLabels.length ? usageLabels : ['01', '02', '03', '04', '05'],
      revenueChart: rMonths.map((m) => Math.round(revByMonth[m] * 10) / 10),
      revenueLabels: rMonths.map((m) => m.slice(5)),
      totalKwh: Math.round(totalKwh),
      avgDaily,
      forecastNextMonth: Math.round(totalKwh * 1.05),
      carbonReductionKg: Math.round(totalKwh * 0.42),
    });
  } catch (err) {
    next(err);
  }
});

dashboardRouter.get('/communication', requireAuth, requireStaff, async (_req, res, next) => {
  try {
    const [{ data: meters }, { data: logs }] = await Promise.all([
      supabaseAdmin.from('meters').select('signal_strength, connectivity, status'),
      supabaseAdmin.from('transmission_logs').select('status, technology, transmitted_at').order('transmitted_at', { ascending: false }).limit(100),
    ]);

    const signals = (meters ?? []).map((m) => Number(m.signal_strength) || 0).filter((s) => s > 0);
    const avgSignal = signals.length ? Math.round((signals.reduce((a, b) => a + b, 0) / signals.length) * 10) / 10 : 0;
    const success = (logs ?? []).filter((l) => l.status === 'success').length;
    const total = logs?.length || 1;
    const uptime = Math.round((success / total) * 1000) / 10;
    const failed = (logs ?? []).filter((l) => l.status === 'failed').length;
    const packetLoss = Math.round((failed / total) * 1000) / 10;
    const techs = [...new Set((logs ?? []).map((l) => l.technology).filter(Boolean))];
    const lowSignal = (meters ?? []).filter((m) => Number(m.signal_strength) < 2).length;

    res.json({
      avgSignal: `${avgSignal} / 5`,
      latencyMs: 420,
      packetLoss: `${packetLoss}%`,
      uptime: `${uptime}%`,
      technologies: techs.length ? techs : ['GSM', 'LoRa', 'MQTT'],
      deadZones: lowSignal,
      fleetUptime: `${uptime}%`,
    });
  } catch (err) {
    next(err);
  }
});

dashboardRouter.get('/usage-trends', requireAuth, async (req, res, next) => {
  try {
    let meterId = null;
    if (req.consumer?.id) {
      const { data: m } = await supabaseAdmin
        .from('meters')
        .select('id')
        .eq('consumer_id', req.consumer.id)
        .maybeSingle();
      meterId = m?.id;
    }

    if (!meterId && req.isStaff) {
      const { data: m } = await supabaseAdmin.from('meters').select('id').limit(1).maybeSingle();
      meterId = m?.id;
    }

    if (!meterId) {
      res.json({ hourly: [], daily: [], monthly: [] });
      return;
    }

    const { data: readings } = await supabaseAdmin
      .from('readings')
      .select('kwh, recorded_at')
      .eq('meter_id', meterId)
      .order('recorded_at', { ascending: false })
      .limit(50);

    const vals = (readings ?? []).map((r) => Number(r.kwh)).reverse();
    res.json({
      hourly: vals.slice(-12).length ? vals.slice(-12) : [2, 3, 2, 4, 6, 8],
      daily: vals.slice(-7).length ? vals.slice(-7) : [18, 22, 19, 24, 28, 21, 20],
      monthly: vals.slice(-6).length ? vals.slice(-6) : [120, 132, 128, 142],
    });
  } catch (err) {
    next(err);
  }
});
