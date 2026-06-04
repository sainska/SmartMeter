'use client';

import { PageHeader } from '@/components/layout/AppShell';
import { Card, ListItem, Badge, Button } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/routes';

const STATUS_VARIANT = { pending: 'warning', accepted: 'info', completed: 'success' };

export default function WorkOrdersPage() {
  const { data: workOrders, loading, error, reload } = useLiveData(() => api.workOrders(), []);

  if (loading) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;

  return (
    <>
      <PageHeader title="Work orders" description="Installation, repair, and inspection tasks" />
      <Card>
        {(workOrders ?? []).map((w) => (
          <ListItem
            key={w.id}
            title={w.task}
            subtitle={`${w.location} · Meter ${w.meterId ?? '—'}`}
            meta={
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <Badge variant={STATUS_VARIANT[w.status] || 'neutral'}>{w.status}</Badge>
                <Badge variant="info">{w.priority}</Badge>
              </div>
            }
            action={<Button href={ROUTES.technician.workOrder(w.id)} sm>Open</Button>}
          />
        ))}
      </Card>
    </>
  );
}
