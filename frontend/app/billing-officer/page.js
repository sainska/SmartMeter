'use client';

import { PageHeader } from '@/components/layout/AppShell';
import { QuickLinks } from '@/components/layout/QuickLinks';
import { Card, Kpi, Button } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/routes';

const LINKS = [
  { label: 'Tariff management', href: ROUTES.billingOfficer.tariffs },
  { label: 'Invoices', href: ROUTES.billingOfficer.invoices },
  { label: 'Revenue', href: ROUTES.billingOfficer.revenue },
];

export default function BillingOfficerDashboard() {
  const { data, loading, error, reload } = useLiveData(() => api.billingSummary(), []);

  if (loading) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;

  const c = data?.currency ?? 'KES';

  return (
    <>
      <PageHeader title="Billing overview" description="Tariffs, invoicing, and collections" />
      <QuickLinks links={LINKS} />
      <div className="grid-3" style={{ marginBottom: 16 }}>
        <Kpi label="Monthly revenue" value={`${c} ${Number(data.monthlyRevenue).toLocaleString()}`} deltaType="up" />
        <Kpi label="Outstanding" value={`${c} ${Number(data.outstanding).toLocaleString()}`} />
        <Kpi label="Collection rate" value={`${data.collectionRate}%`} deltaType="up" />
      </div>
      <Card title="Quick actions">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button href={ROUTES.billingOfficer.invoices}>View invoices ({data.totalBills})</Button>
          <Button href={ROUTES.billingOfficer.tariffs} variant="secondary">Edit tariffs</Button>
          <Button href={ROUTES.billingOfficer.revenue} variant="ghost">Financial report</Button>
        </div>
      </Card>
    </>
  );
}
