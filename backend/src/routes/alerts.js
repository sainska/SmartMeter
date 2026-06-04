import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { requireAuth, requireStaff } from '../middleware/auth.js';

export const alertsRouter = Router();

alertsRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    let query = supabaseAdmin
      .from('alerts')
      .select('id, alert_type, title, body, is_read, created_at, consumer_id, is_system_wide')
      .order('created_at', { ascending: false })
      .limit(50);

    if (req.profile.role === 'consumer') {
      if (!req.consumer?.id) {
        res.json([]);
        return;
      }
      query = query.or(`consumer_id.eq.${req.consumer.id},is_system_wide.eq.true`);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(
      (data ?? []).map((a) => ({
        id: a.id,
        type: a.alert_type,
        title: a.title,
        time: formatRelative(a.created_at),
        read: a.is_read,
      })),
    );
  } catch (err) {
    next(err);
  }
});

alertsRouter.patch('/:id/read', requireAuth, async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin
      .from('alerts')
      .update({ is_read: true })
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

function formatRelative(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
