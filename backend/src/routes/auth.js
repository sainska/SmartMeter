import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

authRouter.get('/me', requireAuth, async (req, res) => {
  res.json({
    user: { id: req.user.id, email: req.user.email },
    profile: req.profile,
    consumer: req.consumer,
  });
});

authRouter.patch('/role', requireAuth, async (req, res, next) => {
  try {
    const { role } = req.body;
    const allowed = ['consumer', 'admin', 'technician', 'billing', 'manager'];
    if (!allowed.includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    if (role === 'consumer' && req.user.email) {
      await supabaseAdmin
        .from('consumers')
        .update({ profile_id: req.user.id })
        .eq('email', req.user.email);
    }

    res.json({ profile: data });
  } catch (err) {
    next(err);
  }
});

authRouter.patch('/profile', requireAuth, async (req, res, next) => {
  try {
    const { full_name, phone } = req.body;
    const updates = { updated_at: new Date().toISOString() };
    if (full_name) updates.full_name = full_name;
    if (phone) updates.phone = phone;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();
    if (error) throw error;

    if (req.consumer?.id && phone) {
      await supabaseAdmin.from('consumers').update({ phone }).eq('id', req.consumer.id);
    }

    res.json({ profile: data });
  } catch (err) {
    next(err);
  }
});

authRouter.get('/settings', async (_req, res, next) => {
  try {
    const { data } = await supabaseAdmin
      .from('system_settings')
      .select('key, value')
      .in('key', ['app_version', 'regional']);

    const settings = Object.fromEntries((data ?? []).map((s) => [s.key, s.value]));
    res.json({
      version: settings.app_version ?? '2.4.1',
      regional: settings.regional ?? {},
    });
  } catch (err) {
    next(err);
  }
});
