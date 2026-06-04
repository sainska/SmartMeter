import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { requireAuth, requireStaff } from '../middleware/auth.js';

export const operationsRouter = Router();

operationsRouter.use(requireAuth, requireStaff);

operationsRouter.get('/incidents', async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('incidents')
      .select('*, meters(serial_number)')
      .order('created_at', { ascending: false });
    if (error) throw error;

    res.json(
      (data ?? []).map((i) => ({
        id: i.id,
        type: i.incident_type,
        meter: i.meters?.serial_number ?? '—',
        status: i.status,
        assignee: i.assignee_name ?? 'Unassigned',
      })),
    );
  } catch (err) {
    next(err);
  }
});

operationsRouter.get('/tamper', async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('tamper_events')
      .select('*, meters(serial_number)')
      .order('created_at', { ascending: false });
    if (error) throw error;

    res.json(
      (data ?? []).map((t) => ({
        id: t.id,
        meter: t.meters?.serial_number ?? '—',
        type: t.event_type,
        status: t.status,
      })),
    );
  } catch (err) {
    next(err);
  }
});

operationsRouter.get('/transmission', async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('transmission_logs')
      .select('id, transmitted_at, status, technology, meters(serial_number)')
      .order('transmitted_at', { ascending: false })
      .limit(100);
    if (error) throw error;

    res.json(
      (data ?? []).map((l) => ({
        id: l.id,
        device: l.meters?.serial_number ?? '—',
        time: new Date(l.transmitted_at).toTimeString().slice(0, 8),
        status: l.status,
        tech: l.technology,
      })),
    );
  } catch (err) {
    next(err);
  }
});

operationsRouter.get('/fault-summary', async (_req, res, next) => {
  try {
    const types = [
      { title: 'Meter malfunction', type: 'malfunction' },
      { title: 'Communication failure', type: 'Communication failure' },
      { title: 'Battery failure', type: 'Battery low' },
    ];
    const { data: incidents } = await supabaseAdmin
      .from('incidents')
      .select('incident_type, status')
      .neq('status', 'resolved');

    const counts = {};
    (incidents ?? []).forEach((i) => {
      counts[i.incident_type] = (counts[i.incident_type] || 0) + 1;
    });

    res.json(
      types.map((t) => ({
        title: t.title,
        count: counts[t.type] ?? counts[t.title] ?? 0,
        variant: (counts[t.type] ?? counts[t.title] ?? 0) > 5 ? 'danger' : 'warning',
      })),
    );
  } catch (err) {
    next(err);
  }
});
