'use client';

import { useAuth } from './AuthContext';
import { ROLES } from '@/lib/roles';

/** @deprecated Use useAuth — kept for components still importing useRole */
export function useRole() {
  const { role, setRole } = useAuth();
  return {
    role,
    setRole,
    roleInfo: ROLES[role] ?? ROLES.consumer,
  };
}

export function RoleProvider({ children }) {
  return children;
}
