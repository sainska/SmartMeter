'use client';

import { useAuth } from '@/context/AuthContext';
import { useIdleLogout } from '@/hooks/useIdleLogout';
import { IDLE_TIMEOUT_MS } from '@/lib/config';

export function IdleGuard({ children }) {
  const { isAuthenticated, signOut, loading } = useAuth();

  useIdleLogout({
    enabled: isAuthenticated && !loading,
    timeoutMs: IDLE_TIMEOUT_MS,
    onIdle: () => {
      signOut();
    },
  });

  return children;
}
