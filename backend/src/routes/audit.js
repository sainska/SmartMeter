import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';

export const auditRouter = Router();

auditRouter.get('/', requireAuth, requireRoles('admin'), async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;

    res.json(
      (data ?? []).map((l) => ({
        id: l.id,
        time: new Date(l.created_at).toTimeString().slice(0, 8),
        user: l.actor_email ?? 'system',
        action: l.action,
        detail: l.detail,
      })),
    );
  } catch (err) {
    next(err);
  }
});

auditRouter.get('/profiles', requireAuth, requireRoles('admin'), async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, role, employee_id')
      .order('created_at', { ascending: false });
    if (error) throw error;

    res.json(
      (data ?? []).map((p) => ({
        id: p.id,
        name: p.full_name,
        role: p.role,
        status: 'active',
      })),
    );
  } catch (err) {
    next(err);
  }
});
