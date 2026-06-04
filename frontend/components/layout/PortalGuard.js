'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getPortalGuard, getRoleHome } from '@/lib/roles';

export function PortalGuard({ portal, children }) {
  const { role, loading } = useAuth();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (getPortalGuard(portal, role)) {
      setAllowed(true);
    } else {
      router.replace(getRoleHome(role));
    }
  }, [portal, role, router, loading]);

  if (loading || !allowed) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }} className="text-muted">
        Redirecting to your portal...
      </div>
    );
  }

  return children;
}
