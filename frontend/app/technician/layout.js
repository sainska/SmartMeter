'use client';

import { AppShell } from '@/components/layout/AppShell';
import { PortalGuard } from '@/components/layout/PortalGuard';
import { technicianNavSections } from '@/components/layout/navConfig';

export default function TechnicianLayout({ children }) {
  return (
    <PortalGuard portal="technician">
      <AppShell title="Field technician" subtitle="Jobs and maintenance" navSections={technicianNavSections}>
        {children}
      </AppShell>
    </PortalGuard>
  );
}
