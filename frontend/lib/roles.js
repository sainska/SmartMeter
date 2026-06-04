import { ROUTES } from './routes';

export const ROLES = {
  consumer: {
    id: 'consumer',
    title: 'Consumer',
    desc: 'View usage, pay bills, receive alerts',
    home: ROUTES.consumer.home,
    portal: 'consumer',
  },
  admin: {
    id: 'admin',
    title: 'Administrator',
    desc: 'Manage fleet, consumers, and operations',
    home: ROUTES.admin.home,
    portal: 'admin',
  },
  technician: {
    id: 'technician',
    title: 'Technician',
    desc: 'Install meters and resolve field faults',
    home: ROUTES.technician.home,
    portal: 'technician',
  },
  billing: {
    id: 'billing',
    title: 'Billing Officer',
    desc: 'Tariffs, invoices, and collections',
    home: ROUTES.billingOfficer.home,
    portal: 'billing-officer',
  },
  manager: {
    id: 'manager',
    title: 'Utility Manager',
    desc: 'Revenue, analytics, and regional oversight',
    home: ROUTES.manager.home,
    portal: 'manager',
  },
};

export const ROLE_LIST = Object.values(ROLES);

export function getRoleHome(roleId) {
  return ROLES[roleId]?.home ?? ROUTES.consumer.home;
}

export function getPortalGuard(portal, roleId) {
  const role = ROLES[roleId];
  if (!role) return portal === 'consumer';
  if (portal === 'admin' && roleId === 'admin') return true;
  return role.portal === portal;
}
