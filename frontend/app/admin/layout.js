'use client';

import { AppShell } from '@/components/layout/AppShell';
import { PortalGuard } from '@/components/layout/PortalGuard';
import { adminNavSections } from '@/components/layout/navConfig';

export default function AdminLayout({ children }) {
  return (
    <PortalGuard portal="admin">
      <AppShell title="Utility admin" subtitle="Fleet and operations management" navSections={adminNavSections}>
        {children}
      </AppShell>
    </PortalGuard>
  );
}
