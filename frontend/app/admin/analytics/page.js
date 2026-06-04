'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/layout/AppShell';
import { Card, BarChart, Button, Kpi } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import styles from '@/components/layout/layout.module.css';
import { ROUTES } from '@/lib/routes';

export default function AnalyticsPage() {
  const { data, loading, error, reload } = useLiveData(() => api.analyticsSummary(), []);

  if (loading) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;

  return (
    <>
      <PageHeader
        title="Analytics & forecasting hub"
        description="Demand prediction, sustainability, revenue forecasting"
      />

      <div className="grid-3" style={{ marginBottom: 16 }}>
        <Kpi label="Fleet kWh (sample)" value={String(data.totalKwh)} />
        <Kpi label="Avg daily kWh" value={String(data.avgDaily)} />
        <Kpi label="Forecast next period" value={`${data.forecastNextMonth} kWh`} />
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <Card title="Usage trends (kWh)">
          <BarChart data={data.usageChart} labels={data.usageLabels} />
        </Card>
        <Card title="Revenue trends (KES thousands)">
          <BarChart data={data.revenueChart} labels={data.revenueLabels} />
        </Card>
      </div>

      <div className={styles.moduleGrid}>
        <Link href={ROUTES.admin.sustainability} className={styles.moduleLink}>
          <h3>Sustainability metrics</h3>
          <p className="text-sm text-muted">Carbon reduction from fleet readings</p>
        </Link>
        <Link href={ROUTES.admin.forecasting} className={styles.moduleLink}>
          <h3>Demand & revenue forecast</h3>
          <p className="text-sm text-muted">Projected {data.forecastNextMonth} kWh</p>
        </Link>
        <Link href={ROUTES.admin.revenue} className={styles.moduleLink}>
          <h3>Financial reporting</h3>
          <p className="text-sm text-muted">Revenue and outstanding balances</p>
        </Link>
      </div>
    </>
  );
}
