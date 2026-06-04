export const APP_VERSION = '2.4.1';

/** Auto sign-out after inactivity (milliseconds) */
export const IDLE_TIMEOUT_MS = 10 * 60 * 1000;

/** Sidebar breakpoint (px) */
export const SIDEBAR_BREAKPOINT = 768;

/** Official senior project topic (INSY492) */
export const PROJECT_TOPIC = 'Automating Consumer Electric Power Consumption';

/** Display title (same topic, formatted for UI and reports) */
export const PROJECT_TITLE = PROJECT_TOPIC;

export const PROJECT_TAGLINE =
  'Automated electric power consumption reading, transparent billing, and role-based utility management';

export const onboardingSlides = [
  {
    title: 'Automated power consumption',
    body: 'Meter readings are captured and stored automatically—replacing manual visits and billing guesswork.',
  },
  {
    title: 'See what you use',
    body: 'Consumers view kWh usage, trends, and bills in one place so charges are clear and fair.',
  },
  {
    title: 'Pay and stay informed',
    body: 'Invoices, alerts, and M-Pesa or bank payments keep accounts up to date.',
  },
];

/** Mirrors admin sidebar groups for the “All modules” grid page */
export const adminModuleGroups = [
  {
    title: 'Fleet & consumers',
    modules: [
      { title: 'Meter fleet', href: '/admin/meters', desc: 'Regional grid, status, signal' },
      { title: 'Consumers', href: '/admin/consumers', desc: 'Search users and account status' },
      { title: 'Register consumer', href: '/admin/consumers/new', desc: 'Onboard a new account' },
      { title: 'Live monitoring', href: '/admin/monitoring', desc: 'Real-time consumption readings' },
    ],
  },
  {
    title: 'Billing & revenue',
    modules: [
      { title: 'Billing hub', href: '/admin/billing', desc: 'Overview and workflows' },
      { title: 'Tariffs', href: '/admin/billing/tariffs', desc: 'Rate schedules' },
      { title: 'Invoices', href: '/admin/billing/invoices', desc: 'Issued bills' },
      { title: 'Revenue', href: '/admin/billing/revenue', desc: 'Collections and KPIs' },
    ],
  },
  {
    title: 'Operations & network',
    modules: [
      { title: 'Operations center', href: '/admin/operations', desc: 'Outages and response' },
      { title: 'Faults', href: '/admin/faults', desc: 'Field faults' },
      { title: 'Tamper detection', href: '/admin/tamper', desc: 'Security events' },
      { title: 'Incidents', href: '/admin/incidents', desc: 'Incident log' },
      { title: 'Communication', href: '/admin/communication', desc: 'GSM, LoRa, MQTT logs' },
      { title: 'Technician portal', href: '/technician', desc: 'Jobs and maintenance' },
    ],
  },
  {
    title: 'Analytics & system',
    modules: [
      { title: 'Analytics', href: '/admin/analytics', desc: 'Demand insights' },
      { title: 'Forecasting', href: '/admin/analytics/forecasting', desc: 'Load forecasts' },
      { title: 'Sustainability', href: '/admin/analytics/sustainability', desc: 'Green metrics' },
      { title: 'Alerts', href: '/admin/alerts', desc: 'SMS, email, push' },
      { title: 'Settings', href: '/admin/settings', desc: 'Policies' },
      { title: 'User management', href: '/admin/users', desc: 'Staff accounts and roles' },
      { title: 'Audit logs', href: '/admin/audit', desc: 'Authentication and changes' },
      { title: 'System health', href: '/admin/system-health', desc: 'API and database status' },
    ],
  },
];
