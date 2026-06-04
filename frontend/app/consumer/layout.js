'use client';

import { AppShell } from '@/components/layout/AppShell';
import { PortalGuard } from '@/components/layout/PortalGuard';
import { consumerNavSections } from '@/components/layout/navConfig';

export default function ConsumerLayout({ children }) {
  return (
    <PortalGuard portal="consumer">
      <AppShell title="Consumer portal" subtitle="Usage, billing, and alerts" navSections={consumerNavSections}>
        {children}
      </AppShell>
    </PortalGuard>
  );
}
