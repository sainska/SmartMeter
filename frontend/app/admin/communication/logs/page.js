'use client';

import { PageHeader } from '@/components/layout/AppShell';
import { Card, DataTable, Badge } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';

const STATUS_VARIANT = { success: 'success', failed: 'danger', pending: 'warning' };

export default function TransmissionLogsPage() {
  const { data: logs, loading, error, reload } = useLiveData(() => api.transmission(), []);

  if (loading) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;

  const rows = (logs ?? []).map((l) => ({
    id: l.id,
    device: l.device,
    time: l.time,
    tech: l.tech,
    status: <Badge variant={STATUS_VARIANT[l.status] || 'neutral'}>{l.status}</Badge>,
  }));

  return (
    <>
      <PageHeader title="Transmission logs" description="GSM, LoRa, and sync event history" />
      <Card>
        <DataTable
          columns={[
            { key: 'device', label: 'Device' },
            { key: 'time', label: 'Time' },
            { key: 'tech', label: 'Technology' },
            { key: 'status', label: 'Status' },
          ]}
          rows={rows}
        />
      </Card>
    </>
  );
}
