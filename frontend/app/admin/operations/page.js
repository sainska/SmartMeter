'use client';

import { PageHeader } from '@/components/layout/AppShell';
import { Card, DataTable, Badge, Button } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/routes';

const STATUS_VARIANT = { open: 'danger', investigating: 'warning', resolved: 'success' };

export default function OperationsPage() {
  const { data: incidents, loading, error, reload } = useLiveData(() => api.incidents(), []);

  if (loading) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;

  const openCount = (incidents ?? []).filter((i) => i.status !== 'resolved').length;
  const rows = (incidents ?? []).map((i) => ({
    id: i.id,
    type: i.type,
    meter: i.meter,
    assignee: i.assignee,
    status: <Badge variant={STATUS_VARIANT[i.status] || 'neutral'}>{i.status}</Badge>,
  }));

  return (
    <>
      <PageHeader
        title="Fault & incident center"
        description="Central operations for outages, tampering, and malfunctions"
        action={<Badge variant="danger">{openCount} open</Badge>}
      />

      <Card title="Active incidents">
        <DataTable
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'type', label: 'Type' },
            { key: 'meter', label: 'Meter' },
            { key: 'assignee', label: 'Assignee' },
            { key: 'status', label: 'Status' },
          ]}
          rows={rows}
        />
        <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
          <Button href={ROUTES.admin.tamper} variant="secondary">Tamper detection</Button>
          <Button href={ROUTES.admin.faults} variant="ghost">Fault summary</Button>
        </div>
      </Card>
    </>
  );
}
