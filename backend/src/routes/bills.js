import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { requireAuth, requireStaff } from '../middleware/auth.js';

export const billsRouter = Router();

billsRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    let query = supabaseAdmin
      .from('bills')
      .select('*')
      .order('due_date', { ascending: false });

    if (req.profile.role === 'consumer') {
      if (!req.consumer?.id) {
        res.json([]);
        return;
      }
      query = query.eq('consumer_id', req.consumer.id);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(
      (data ?? []).map((b) => ({
        id: b.id,
        invoice_number: b.invoice_number,
        period: b.period_label,
        amount: Number(b.amount),
        status: b.status,
        due: b.due_date,
        consumption_charges: Number(b.consumption_charges),
        taxes_fees: Number(b.taxes_fees),
        currency: b.currency,
      })),
    );
  } catch (err) {
    next(err);
  }
});

billsRouter.get('/payments', requireAuth, async (req, res, next) => {
  try {
    let query = supabaseAdmin
      .from('payments')
      .select('*')
      .order('paid_at', { ascending: false });

    if (req.profile.role === 'consumer' && req.consumer?.id) {
      query = query.eq('consumer_id', req.consumer.id);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(
      (data ?? []).map((p) => ({
        id: p.id,
        bill_id: p.bill_id,
        date: p.paid_at?.slice(0, 10),
        amount: Number(p.amount),
        amount_label: `KES ${Number(p.amount).toLocaleString()}`,
        method: p.method,
        ref: p.reference_code,
        status: p.status,
        mpesa_receipt: p.mpesa_receipt,
      })),
    );
  } catch (err) {
    next(err);
  }
});

/** @deprecated Use POST /api/payments/manual or /api/payments/stk-push */
billsRouter.post('/payments', requireAuth, async (req, res, next) => {
  try {
    const { amount, method, bill_id, phone } = req.body;
    const consumerId = req.consumer?.id;
    if (!consumerId) {
      res.status(400).json({ error: 'No consumer account linked' });
      return;
    }

    if ((method || 'M-Pesa') === 'M-Pesa' && phone) {
      res.status(400).json({
        error: 'Use POST /api/payments/stk-push for M-Pesa',
        redirect: '/api/payments/stk-push',
      });
      return;
    }

    const ref = `PAY-${Date.now().toString(36).toUpperCase()}`;
    const { data: payment, error } = await supabaseAdmin
      .from('payments')
      .insert({
        consumer_id: consumerId,
        bill_id: bill_id || null,
        amount: Number(amount),
        method: method || 'Bank',
        reference_code: ref,
        status: 'processing',
      })
      .select()
      .single();

    if (error) throw error;

    const { completePayment } = await import('../services/paymentGateway.js');
    const completed = await completePayment(payment, { callbackPayload: { legacy: true } });
    res.status(201).json(completed);
  } catch (err) {
    next(err);
  }
});

billsRouter.get('/tariffs', requireAuth, requireStaff, async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('tariffs').select('*').eq('active', true);
    if (error) throw error;
    res.json(
      (data ?? []).map((t) => ({
        id: t.id,
        name: t.name,
        tiers: t.tier_description,
        subsidy: `${t.rural_subsidy_pct}%`,
      })),
    );
  } catch (err) {
    next(err);
  }
});
