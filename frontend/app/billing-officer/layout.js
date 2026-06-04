'use client';

import { AppShell } from '@/components/layout/AppShell';
import { PortalGuard } from '@/components/layout/PortalGuard';
import { billingOfficerNavSections } from '@/components/layout/navConfig';

export default function BillingOfficerLayout({ children }) {
  return (
    <PortalGuard portal="billing-officer">
      <AppShell title="Billing officer" subtitle="Tariffs, invoices, and revenue" navSections={billingOfficerNavSections}>
        {children}
      </AppShell>
    </PortalGuard>
  );
}
