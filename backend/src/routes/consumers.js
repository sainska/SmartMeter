import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { requireAuth, requireStaff } from '../middleware/auth.js';

export const consumersRouter = Router();

consumersRouter.use(requireAuth, requireStaff);

consumersRouter.get('/', async (req, res, next) => {
  try {
    const { q, status } = req.query;
    let query = supabaseAdmin
      .from('consumers')
      .select(`id, full_name, phone, email, ward, status, outstanding_balance, meters ( serial_number )`)
      .order('id', { ascending: true });

    if (status && status !== 'all') query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    let rows = data ?? [];
    if (q) {
      const lower = String(q).toLowerCase();
      rows = rows.filter(
        (c) =>
          c.full_name?.toLowerCase().includes(lower) ||
          c.id?.toLowerCase().includes(lower) ||
          c.phone?.includes(lower) ||
          c.email?.toLowerCase().includes(lower),
      );
    }

    res.json(
      rows.map((c) => ({
        id: c.id,
        name: c.full_name,
        phone: c.phone,
        email: c.email,
        ward: c.ward,
        meter: c.meters?.[0]?.serial_number ?? null,
        status: c.status,
        balance: c.outstanding_balance,
      })),
    );
  } catch (err) {
    next(err);
  }
});

consumersRouter.post('/', async (req, res, next) => {
  try {
    const { full_name, phone, email, ward, meter_serial } = req.body;
    const id = `C-${Date.now().toString().slice(-4)}`;

    const { data, error } = await supabaseAdmin
      .from('consumers')
      .insert({ id, full_name, phone, email, ward, status: 'active' })
      .select()
      .single();

    if (error) throw error;

    if (meter_serial) {
      await supabaseAdmin
        .from('meters')
        .update({ consumer_id: id, display_name: full_name })
        .eq('serial_number', meter_serial);
    }

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});
