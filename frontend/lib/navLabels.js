import { ROUTES } from './routes';

const LABELS = [
  [ROUTES.consumer.home, 'Dashboard'],
  [ROUTES.consumer.usage, 'Usage'],
  [ROUTES.consumer.bills, 'Bills'],
  [ROUTES.consumer.payments, 'Payments'],
  [ROUTES.consumer.alerts, 'Alerts'],
  [ROUTES.consumer.profile, 'Profile'],
  [ROUTES.admin.home, 'Admin dashboard'],
  [ROUTES.admin.meters, 'Meter fleet'],
  [ROUTES.admin.consumers, 'Consumers'],
  [ROUTES.admin.consumerNew, 'New consumer'],
  [ROUTES.admin.monitoring, 'Monitoring'],
  [ROUTES.admin.billing, 'Billing'],
  [ROUTES.admin.tariffs, 'Tariffs'],
  [ROUTES.admin.invoices, 'Invoices'],
  [ROUTES.admin.revenue, 'Revenue'],
  [ROUTES.admin.operations, 'Operations'],
  [ROUTES.admin.faults, 'Faults'],
  [ROUTES.admin.tamper, 'Tamper'],
  [ROUTES.admin.incidents, 'Incidents'],
  [ROUTES.admin.communication, 'Communication'],
  [ROUTES.admin.commAnalytics, 'Comm analytics'],
  [ROUTES.admin.commLogs, 'Comm logs'],
  [ROUTES.admin.analytics, 'Analytics'],
  [ROUTES.admin.forecasting, 'Forecasting'],
  [ROUTES.admin.sustainability, 'Sustainability'],
  [ROUTES.admin.alerts, 'Alerts'],
  [ROUTES.admin.settings, 'Settings'],
  [ROUTES.admin.security, 'Security'],
  [ROUTES.admin.more, 'All modules'],
  [ROUTES.technician.home, 'Technician'],
  [ROUTES.technician.workOrders, 'Work orders'],
  [ROUTES.technician.maintenance, 'Maintenance'],
  [ROUTES.technician.profile, 'Profile'],
  [ROUTES.billingOfficer.home, 'Billing'],
  [ROUTES.billingOfficer.tariffs, 'Tariffs'],
  [ROUTES.billingOfficer.invoices, 'Invoices'],
  [ROUTES.billingOfficer.revenue, 'Revenue'],
  [ROUTES.billingOfficer.profile, 'Profile'],
  [ROUTES.manager.home, 'Manager'],
  [ROUTES.manager.analytics, 'Analytics'],
  [ROUTES.manager.operations, 'Operations'],
  [ROUTES.manager.communication, 'Network'],
  [ROUTES.manager.profile, 'Profile'],
  [ROUTES.admin.users, 'User management'],
  [ROUTES.admin.audit, 'Audit logs'],
  [ROUTES.admin.systemHealth, 'System health'],
];

export function getPageLabel(pathname) {
  if (!pathname) return '';
  const sorted = [...LABELS].sort((a, b) => b[0].length - a[0].length);
  for (const [path, label] of sorted) {
    if (pathname === path || pathname.startsWith(`${path}/`)) return label;
  }
  const parts = pathname.split('/').filter(Boolean);
  const last = parts[parts.length - 1];
  if (last && /^[a-f0-9-]{8,}$/i.test(last)) return 'Details';
  return last ? last.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '';
}
