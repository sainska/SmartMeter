'use client';

import { BackLink } from '@/components/layout/BackLink';
import { PageHeader } from '@/components/layout/AppShell';
import { Card, DataTable, Badge, Button } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/routes';

const STATUS_VARIANT = { under_review: 'warning', confirmed: 'danger', cleared: 'success' };

export default function TamperPage() {
  const { data: events, loading, error, reload } = useLiveData(() => api.tamper(), []);

  if (loading) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;

  const rows = (events ?? []).map((t) => ({
    id: t.id,
    meter: t.meter,
    type: t.type,
    status: <Badge variant={STATUS_VARIANT[t.status] || 'neutral'}>{t.status}</Badge>,
    actions: (
      <Button href={ROUTES.admin.meter(t.meter)} sm variant="ghost">
        Investigate
      </Button>
    ),
  }));

  return (
    <>
      <BackLink href={ROUTES.admin.operations} label="Back to operations center" />
      <PageHeader title="Tamper detection" description="Bypass attempts and illegal connections" />
      <Card>
        <DataTable
          columns={[
            { key: 'id', label: 'Incident' },
            { key: 'meter', label: 'Meter' },
            { key: 'type', label: 'Type' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: '' },
          ]}
          rows={rows}
        />
      </Card>
    </>
  );
}
