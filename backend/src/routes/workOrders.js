import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { requireAuth, requireStaff } from '../middleware/auth.js';

export const workOrdersRouter = Router();

workOrdersRouter.use(requireAuth, requireStaff);

workOrdersRouter.get('/', async (req, res, next) => {
  try {
    let query = supabaseAdmin
      .from('work_orders')
      .select('*, meters(serial_number)')
      .order('scheduled_date', { ascending: true });

    if (req.profile.role === 'technician') {
      query = query.or(`assignee_profile_id.eq.${req.user.id},assignee_profile_id.is.null`);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(
      (data ?? []).map((w) => ({
        id: w.id,
        task: w.task,
        description: w.description,
        location: w.location,
        meterId: w.meters?.serial_number,
        priority: w.priority,
        status: w.status,
        scheduled: w.scheduled_date,
      })),
    );
  } catch (err) {
    next(err);
  }
});

workOrdersRouter.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('work_orders')
      .select('*, meters(serial_number)')
      .eq('id', req.params.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: 'Work order not found' });
      return;
    }

    res.json({
      id: data.id,
      task: data.task,
      description: data.description,
      location: data.location,
      meterId: data.meters?.serial_number,
      priority: data.priority,
      status: data.status,
      scheduled: data.scheduled_date,
    });
  } catch (err) {
    next(err);
  }
});

workOrdersRouter.patch('/:id', async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.status) updates.status = req.body.status;
    if (req.body.status === 'accepted') updates.assignee_profile_id = req.user.id;
    if (req.body.status === 'completed') updates.completed_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('work_orders')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

workOrdersRouter.get('/records/maintenance', async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('maintenance_records')
      .select('*, meters(serial_number)')
      .order('performed_at', { ascending: false });
    if (error) throw error;

    res.json(
      (data ?? []).map((r) => ({
        id: r.id,
        date: r.performed_at,
        meter: r.meters?.serial_number ?? '—',
        type: r.record_type,
        notes: r.notes,
        work_order_id: r.work_order_id,
      })),
    );
  } catch (err) {
    next(err);
  }
});
