/** Same-origin /api in dev (Next rewrite); set NEXT_PUBLIC_API_URL for direct HTTPS API in production */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api';

async function getToken() {
  if (typeof window === 'undefined') return null;
  const { supabase } = await import('./supabase/client');
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function apiFetch(path, options = {}) {
  const token = await getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || res.statusText || 'Request failed');
  return body;
}

async function apiFetchBlob(path, filename) {
  const token = await getToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || res.statusText || 'Download failed');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const api = {
  health: () => apiFetch('/health'),
  me: () => apiFetch('/auth/me'),
  updateProfile: (data) => apiFetch('/auth/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  settings: () => apiFetch('/auth/settings'),
  setRole: (role) => apiFetch('/auth/role', { method: 'PATCH', body: JSON.stringify({ role }) }),

  navBadges: () => apiFetch('/dashboard/nav-badges'),
  consumerDashboard: () => apiFetch('/dashboard/consumer'),
  adminDashboard: () => apiFetch('/dashboard/admin'),
  billingSummary: () => apiFetch('/dashboard/billing-summary'),
  analyticsSummary: () => apiFetch('/dashboard/analytics'),
  communicationStats: () => apiFetch('/dashboard/communication'),
  usageTrends: () => apiFetch('/dashboard/usage-trends'),

  meters: () => apiFetch('/meters'),
  meter: (serial) => apiFetch(`/meters/${encodeURIComponent(serial)}`),
  meterReadings: (serial) => apiFetch(`/meters/${encodeURIComponent(serial)}/readings`),

  consumers: (params = '') => apiFetch(`/consumers${params ? `?${params}` : ''}`),
  createConsumer: (data) => apiFetch('/consumers', { method: 'POST', body: JSON.stringify(data) }),

  bills: () => apiFetch('/bills'),
  payments: () => apiFetch('/bills/payments'),
  payBill: (data) => apiFetch('/bills/payments', { method: 'POST', body: JSON.stringify(data) }),

  stkPush: (data) => apiFetch('/payments/stk-push', { method: 'POST', body: JSON.stringify(data) }),
  payManual: (data) => apiFetch('/payments/manual', { method: 'POST', body: JSON.stringify(data) }),
  paymentStatus: (id) => apiFetch(`/payments/${encodeURIComponent(id)}/status`),
  downloadInvoicePdf: (billId) =>
    apiFetchBlob(
      `/payments/bills/${encodeURIComponent(billId)}/invoice.pdf`,
      `invoice-${billId}.pdf`,
    ),
  downloadReceiptPdf: (paymentId) =>
    apiFetchBlob(
      `/payments/${encodeURIComponent(paymentId)}/receipt.pdf`,
      `receipt-${paymentId}.pdf`,
    ),

  tariffs: () => apiFetch('/bills/tariffs'),

  alerts: () => apiFetch('/alerts'),
  markAlertRead: (id) => apiFetch(`/alerts/${id}/read`, { method: 'PATCH' }),

  incidents: () => apiFetch('/operations/incidents'),
  tamper: () => apiFetch('/operations/tamper'),
  transmission: () => apiFetch('/operations/transmission'),
  faultSummary: () => apiFetch('/operations/fault-summary'),

  workOrders: () => apiFetch('/work-orders'),
  workOrder: (id) => apiFetch(`/work-orders/${encodeURIComponent(id)}`),
  updateWorkOrder: (id, data) =>
    apiFetch(`/work-orders/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(data) }),
  maintenance: () => apiFetch('/work-orders/records/maintenance'),

  auditLogs: () => apiFetch('/audit'),
  profiles: () => apiFetch('/audit/profiles'),
};
