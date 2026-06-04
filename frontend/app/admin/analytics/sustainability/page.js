'use client';

import { BackLink } from '@/components/layout/BackLink';
import { PageHeader } from '@/components/layout/AppShell';
import { Card, Kpi } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/routes';

export default function SustainabilityPage() {
  const { data, loading, error, reload } = useLiveData(() => api.analyticsSummary(), []);

  if (loading) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;

  return (
    <>
      <BackLink href={ROUTES.admin.analytics} label="Back to analytics" />
      <PageHeader title="Sustainability metrics" description="Energy and estimated carbon impact" />
      <div className="grid-3">
        <Kpi label="Total consumption (kWh)" value={String(data.totalKwh)} />
        <Kpi label="Est. CO₂ reduction (kg)" value={String(data.carbonReductionKg)} />
        <Kpi label="Digital billing" value="Active" delta="Paperless invoices" />
      </div>
      <div style={{ marginTop: 16 }}>
        <Card title="Notes">
          <p className="text-sm text-muted">
            Metrics derived from live meter readings in the database. Transparent billing reduces disputes and supports efficient utility use.
          </p>
        </Card>
      </div>
    </>
  );
}
