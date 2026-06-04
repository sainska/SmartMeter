'use client';

import { BackLink } from '@/components/layout/BackLink';
import { PageHeader } from '@/components/layout/AppShell';
import { Card, Kpi, BarChart } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/routes';

export default function RevenuePage() {
  const { data, loading, error, reload } = useLiveData(() => api.billingSummary(), []);

  if (loading) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;

  const c = data.currency ?? 'KES';

  return (
    <>
      <BackLink href={ROUTES.admin.billing} label="Back to billing" />
      <PageHeader title="Revenue tracking" description="Collections and outstanding balances" />
      <div className="grid-4" style={{ marginBottom: 16 }}>
        <Kpi label="Monthly revenue" value={`${c} ${Number(data.monthlyRevenue).toLocaleString()}`} />
        <Kpi label="Outstanding" value={`${c} ${Number(data.outstanding).toLocaleString()}`} />
        <Kpi label="Collection rate" value={`${data.collectionRate}%`} deltaType="up" />
        <Kpi label="Unpaid bills" value={String(data.unpaidCount)} />
      </div>
      <Card title="Monthly revenue (KES thousands)">
        <BarChart data={data.revenueChart} labels={data.revenueLabels} />
      </Card>
    </>
  );
}
