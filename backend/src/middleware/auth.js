import { supabaseAdmin } from '../lib/supabaseAdmin.js';

const STAFF_ROLES = new Set(['admin', 'manager', 'billing', 'technician']);

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const token = header.slice(7);
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: 'Invalid or expired session' });
      return;
    }

    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, phone, role, employee_id')
      .eq('id', user.id)
      .maybeSingle();

    if (profileErr) throw profileErr;

    let consumer = null;
    if (profile?.role === 'consumer' || !profile) {
      const { data: c } = await supabaseAdmin
        .from('consumers')
        .select('id, full_name, phone, status, outstanding_balance, currency')
        .eq('profile_id', user.id)
        .maybeSingle();
      consumer = c;
    }

    req.user = user;
    req.profile = profile ?? { id: user.id, email: user.email, role: 'consumer', full_name: user.email };
    req.consumer = consumer;
    req.isStaff = STAFF_ROLES.has(req.profile.role);

    next();
  } catch (err) {
    next(err);
  }
}

export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.profile || !roles.includes(req.profile.role)) {
      res.status(403).json({ error: 'Insufficient permissions for this action' });
      return;
    }
    next();
  };
}

export function requireStaff(req, res, next) {
  if (!req.isStaff) {
    res.status(403).json({ error: 'Staff access required' });
    return;
  }
  next();
}
