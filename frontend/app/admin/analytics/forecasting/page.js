'use client';

import { BackLink } from '@/components/layout/BackLink';
import { PageHeader } from '@/components/layout/AppShell';
import { Card, BarChart, Kpi } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/routes';

export default function ForecastingPage() {
  const { data, loading, error, reload } = useLiveData(() => api.analyticsSummary(), []);

  if (loading) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;

  const forecast = [...data.usageChart, data.forecastNextMonth % 1000];
  const labels = [...data.usageLabels, 'Fcst'];

  return (
    <>
      <BackLink href={ROUTES.admin.analytics} label="Back to analytics" />
      <PageHeader title="Demand forecast" description="Projected consumption from historical readings" />
      <div className="grid-2" style={{ marginBottom: 16 }}>
        <Kpi label="Next period forecast" value={`${data.forecastNextMonth} kWh`} />
        <Kpi label="Avg daily" value={`${data.avgDaily} kWh`} />
      </div>
      <Card title="Usage trend + forecast">
        <BarChart data={forecast} labels={labels} />
      </Card>
    </>
  );
}
