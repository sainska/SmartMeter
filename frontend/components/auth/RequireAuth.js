'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/lib/routes';
import { getPortalGuard, getRoleHome } from '@/lib/roles';
import { DataLoading } from '@/components/ui/DataState';

const PUBLIC_PATHS = [
  ROUTES.splash,
  ROUTES.onboarding,
  ROUTES.login,
  ROUTES.register,
  ROUTES.otp,
  ROUTES.forgotPassword,
];

const AUTH_ENTRY_PATHS = [ROUTES.login, ROUTES.register];

export function RequireAuth({ children, portal }) {
  const { loading, isAuthenticated, role, profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const isPublic = PUBLIC_PATHS.some((p) => pathname?.startsWith(p));
    const isRoleSelection = pathname?.startsWith(ROUTES.roleSelection);

    if (!isAuthenticated && !isPublic && !isRoleSelection) {
      router.replace(ROUTES.login);
      return;
    }

    if (isAuthenticated && profile?.role) {
      if (AUTH_ENTRY_PATHS.some((p) => pathname?.startsWith(p))) {
        router.replace(getRoleHome(profile.role));
        return;
      }
      if (portal && !getPortalGuard(portal, role)) {
        router.replace(getRoleHome(role));
      }
    }
  }, [loading, isAuthenticated, portal, role, profile?.role, router, pathname]);

  if (loading) return <DataLoading />;
  if (!isAuthenticated && !PUBLIC_PATHS.some((p) => pathname?.startsWith(p)) && !pathname?.startsWith(ROUTES.roleSelection)) {
    return <DataLoading message="Redirecting to login..." />;
  }

  return children;
}
