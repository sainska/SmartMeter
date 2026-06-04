'use client';

import { PageHeader } from '@/components/layout/AppShell';
import { Card, Badge, DataTable, SignalMeter } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/routes';
import { Button } from '@/components/ui';

const STATUS_VARIANT = { online: 'success', offline: 'warning', fault: 'danger' };

export default function MonitoringPage() {
  const { data: meters, loading, error, reload } = useLiveData(() => api.meters(), []);

  if (loading) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;

  const rows = (meters ?? []).map((m) => ({
    id: m.id,
    consumer: m.consumer,
    status: <Badge variant={STATUS_VARIANT[m.status]}>{m.status}</Badge>,
    signal: <SignalMeter strength={m.signal} />,
    link: <Button href={ROUTES.admin.meter(m.id)} sm variant="ghost">Details</Button>,
  }));

  return (
    <>
      <PageHeader title="Meter monitoring" description="Live fleet status and signal health" />
      <Card title="Active meters">
        <DataTable
          columns={[
            { key: 'id', label: 'Meter' },
            { key: 'consumer', label: 'Consumer' },
            { key: 'status', label: 'Status' },
            { key: 'signal', label: 'Signal' },
            { key: 'link', label: '' },
          ]}
          rows={rows}
        />
      </Card>
    </>
  );
}
