import {
  IconHome,
  IconChart,
  IconBill,
  IconAlert,
  IconUser,
  IconMeter,
  IconGrid,
  IconSettings,
  IconWifi,
  IconShield,
  IconTool,
  IconSignal,
} from '../icons';
import { ROUTES } from '@/lib/routes';

/** @typedef {{ href: string, label: string, icon: import('react').ComponentType, match?: string[], badge?: string }} NavItem */
/** @typedef {{ title: string, items: NavItem[] }} NavSection */

function item(href, label, icon, opts = {}) {
  return { href, label, icon, match: opts.match, badge: opts.badge };
}

export const consumerNavSections = [
  {
    title: 'MAIN MENU',
    items: [
      item(ROUTES.consumer.home, 'Dashboard', IconHome),
      item(ROUTES.consumer.usage, 'Usage analytics', IconChart),
      item(ROUTES.consumer.payments, 'Billing & payments', IconBill, {
        match: [ROUTES.consumer.payments, ROUTES.consumer.bills],
        badge: 'billing',
      }),
      item(ROUTES.consumer.alerts, 'Notifications', IconAlert, { badge: 'notifications' }),
    ],
  },
  {
    title: 'MY METER',
    items: [
      item(ROUTES.consumer.usage, 'Meter health', IconShield, { match: [ROUTES.consumer.usage] }),
      item(ROUTES.consumer.bills, 'Reports', IconChart, { match: [ROUTES.consumer.bills] }),
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      item(ROUTES.consumer.profile, 'Settings', IconSettings),
      item(ROUTES.consumer.alerts, 'Support', IconAlert),
    ],
  },
];

export const adminNavSections = [
  {
    title: 'CONTROL CENTER',
    items: [
      item(ROUTES.admin.home, 'Overview dashboard', IconHome),
      item(ROUTES.admin.consumers, 'Consumer directory', IconUser, {
        match: [ROUTES.admin.consumers, ROUTES.admin.consumerNew],
      }),
      item(ROUTES.admin.meters, 'Meter fleet', IconMeter, {
        match: [ROUTES.admin.meters],
        badge: 'meterFleet',
      }),
      item(ROUTES.admin.billing, 'Billing & tariffs', IconBill, {
        match: [ROUTES.admin.billing, ROUTES.admin.tariffs, ROUTES.admin.invoices, ROUTES.admin.revenue],
      }),
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      item(ROUTES.admin.communication, 'Comms monitor', IconWifi, {
        match: [ROUTES.admin.communication, ROUTES.admin.commAnalytics, ROUTES.admin.commLogs],
      }),
      item(ROUTES.admin.faults, 'Fault detection', IconTool, {
        match: [ROUTES.admin.faults, ROUTES.admin.operations, ROUTES.admin.incidents],
        badge: 'faults',
      }),
      item(ROUTES.technician.home, 'Technician tasks', IconTool),
      item(ROUTES.admin.analytics, 'Analytics & forecast', IconChart, {
        match: [ROUTES.admin.analytics, ROUTES.admin.forecasting, ROUTES.admin.sustainability],
      }),
    ],
  },
  {
    title: 'FLEET & MONITORING',
    items: [
      item(ROUTES.admin.monitoring, 'Live monitoring', IconSignal),
      item(ROUTES.admin.tamper, 'Tamper detection', IconShield),
      item(ROUTES.admin.more, 'All modules', IconGrid),
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      item(ROUTES.admin.alerts, 'Notifications', IconAlert, {
        match: [ROUTES.admin.alerts, ROUTES.admin.notifications],
        badge: 'notifications',
      }),
      item(ROUTES.admin.users, 'User management', IconUser, {
        match: [ROUTES.admin.users, ROUTES.admin.audit, ROUTES.admin.systemHealth],
      }),
      item(ROUTES.admin.settings, 'Settings', IconSettings, {
        match: [ROUTES.admin.settings, ROUTES.admin.security],
      }),
    ],
  },
];

export const technicianNavSections = [
  {
    title: 'FIELD OPS',
    items: [
      item(ROUTES.technician.home, 'Dashboard', IconHome),
      item(ROUTES.technician.workOrders, 'Work orders', IconTool, {
        match: [ROUTES.technician.workOrders],
      }),
      item(ROUTES.technician.maintenance, 'Maintenance', IconChart),
    ],
  },
  {
    title: 'ACCOUNT',
    items: [item(ROUTES.technician.profile, 'Profile', IconUser)],
  },
];

export const billingOfficerNavSections = [
  {
    title: 'BILLING',
    items: [
      item(ROUTES.billingOfficer.home, 'Overview', IconHome),
      item(ROUTES.billingOfficer.tariffs, 'Tariffs', IconBill),
      item(ROUTES.billingOfficer.invoices, 'Invoices', IconChart),
      item(ROUTES.billingOfficer.revenue, 'Revenue', IconGrid),
    ],
  },
  {
    title: 'ACCOUNT',
    items: [item(ROUTES.billingOfficer.profile, 'Profile', IconUser)],
  },
];

export const managerNavSections = [
  {
    title: 'INSIGHTS',
    items: [
      item(ROUTES.manager.home, 'Overview', IconHome),
      item(ROUTES.manager.analytics, 'Analytics', IconChart),
      item(ROUTES.manager.operations, 'Operations', IconAlert, { badge: 'faults' }),
      item(ROUTES.manager.communication, 'Network status', IconWifi),
    ],
  },
  {
    title: 'ACCOUNT',
    items: [item(ROUTES.manager.profile, 'Profile', IconUser)],
  },
];

/** @deprecated use navSections per layout */
export function navSectionsToGroups(sections) {
  return sections.map((s, i) => ({
    id: `section-${i}`,
    label: s.title,
    icon: s.items[0]?.icon,
    items: s.items,
  }));
}
