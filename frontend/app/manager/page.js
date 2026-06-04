'use client';

import { PageHeader } from '@/components/layout/AppShell';
import { QuickLinks } from '@/components/layout/QuickLinks';
import { Card, Kpi, BarChart, Button } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/routes';

const LINKS = [
  { label: 'Analytics', href: ROUTES.manager.analytics },
  { label: 'Operations', href: ROUTES.manager.operations },
  { label: 'Communication', href: ROUTES.manager.communication },
  { label: 'Profile', href: ROUTES.manager.profile },
];

export default function ManagerDashboard() {
  const { data, loading, error, reload } = useLiveData(() => api.adminDashboard(), []);

  if (loading) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;

  const kpis = data?.kpis ?? [];

  return (
    <>
      <PageHeader title="Utility manager" description="Revenue, analytics, and regional oversight" />
      <QuickLinks links={LINKS} />
      <div className="grid-4" style={{ marginBottom: 16 }}>
        {kpis.map((k) => (
          <Kpi key={k.label} label={k.label} value={k.value} delta={k.delta} deltaType={k.deltaType} />
        ))}
      </div>
      <Card title="Regional usage (MWh)">
        <BarChart data={[820, 845, 880, 910, 935]} labels={['Jan', 'Feb', 'Mar', 'Apr', 'May']} />
        <Button href={ROUTES.manager.analytics} variant="ghost" sm style={{ marginTop: 12 }}>Full analytics</Button>
      </Card>
    </>
  );
}
