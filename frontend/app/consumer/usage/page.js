'use client';

import { PageHeader } from '@/components/layout/AppShell';
import { Card, Tabs, BarChart } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import { useState } from 'react';

const TABS = [
  { id: 'hourly', label: 'Hourly' },
  { id: 'daily', label: 'Daily' },
  { id: 'monthly', label: 'Monthly' },
];

export default function UsageAnalyticsPage() {
  const [tab, setTab] = useState('daily');
  const { data, loading, error, reload } = useLiveData(() => api.usageTrends(), []);

  if (loading) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;

  const chartData = data?.[tab] ?? [];

  return (
    <>
      <PageHeader title="Usage analytics" description="Hourly, daily, and monthly consumption trends" />
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      <div style={{ marginTop: 16 }}>
        <Card title={`${tab.charAt(0).toUpperCase() + tab.slice(1)} consumption (kWh)`}>
          <BarChart data={chartData} />
        </Card>
      </div>
    </>
  );
}
