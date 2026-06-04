'use client';

import { AppShell } from '@/components/layout/AppShell';
import { PortalGuard } from '@/components/layout/PortalGuard';
import { managerNavSections } from '@/components/layout/navConfig';

export default function ManagerLayout({ children }) {
  return (
    <PortalGuard portal="manager">
      <AppShell title="Utility manager" subtitle="Analytics and regional oversight" navSections={managerNavSections}>
        {children}
      </AppShell>
    </PortalGuard>
  );
}
