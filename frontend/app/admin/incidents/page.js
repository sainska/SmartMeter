'use client';

import { PageHeader } from '@/components/layout/AppShell';
import { Card, DataTable, Badge } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';

const STATUS_VARIANT = { open: 'danger', investigating: 'warning', resolved: 'success' };

export default function IncidentsPage() {
  const { data: incidents, loading, error, reload } = useLiveData(() => api.incidents(), []);

  if (loading) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;

  const rows = (incidents ?? []).map((i) => ({
    id: i.id,
    type: i.type,
    meter: i.meter,
    assignee: i.assignee,
    status: <Badge variant={STATUS_VARIANT[i.status] || 'neutral'}>{i.status}</Badge>,
  }));

  return (
    <>
      <PageHeader title="Incident log" description="Tampering, outages, and meter faults" />
      <Card>
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
      </Card>
    </>
  );
}
