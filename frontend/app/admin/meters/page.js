'use client';

import { PageHeader } from '@/components/layout/AppShell';
import { FleetMap } from '@/components/meters/FleetMap';
import { Card, Button, Badge, DataTable, SignalMeter } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/routes';

const STATUS_VARIANT = { online: 'success', offline: 'warning', fault: 'danger' };

export default function MetersPage() {
  const { data: meters, loading, error, reload } = useLiveData(() => api.meters(), []);

  if (loading) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;

  const list = meters ?? [];
  const rows = list.map((m) => ({
    id: m.id,
    consumer: m.consumer,
    location: m.location,
    status: <Badge variant={STATUS_VARIANT[m.status]}>{m.status}</Badge>,
    battery: `${m.battery ?? 0}%`,
    signal: <SignalMeter strength={m.signal} />,
    link: (
      <Button href={ROUTES.admin.meter(m.id)} sm variant="ghost">
        Diagnostics
      </Button>
    ),
  }));

  return (
    <>
      <PageHeader
        title="Meter fleet management"
        description="Regional grid view — status and signal strength"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button href={ROUTES.admin.monitoring} variant="secondary" sm>Monitoring</Button>
            <Button href={ROUTES.admin.consumerNew} variant="ghost" sm>Assign consumer</Button>
          </div>
        }
      />

      <Card title="Regional fleet map">
        <FleetMap meters={list} />
      </Card>

      <div style={{ marginTop: 16 }}>
        <Card title="Fleet directory">
          <DataTable
            columns={[
              { key: 'id', label: 'Meter ID' },
              { key: 'consumer', label: 'Consumer' },
              { key: 'location', label: 'Location' },
              { key: 'status', label: 'Status' },
              { key: 'battery', label: 'Battery' },
              { key: 'signal', label: 'Signal' },
              { key: 'link', label: '' },
            ]}
            rows={rows}
          />
        </Card>
      </div>
    </>
  );
}
