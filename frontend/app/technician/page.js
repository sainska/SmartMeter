'use client';

import { PageHeader } from '@/components/layout/AppShell';
import { QuickLinks } from '@/components/layout/QuickLinks';
import { Card, ListItem, Badge, Button } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/routes';

const STATUS_VARIANT = { pending: 'warning', accepted: 'info', completed: 'success' };

const LINKS = [
  { label: 'Work orders', href: ROUTES.technician.workOrders },
  { label: 'Maintenance', href: ROUTES.technician.maintenance },
  { label: 'Profile', href: ROUTES.technician.profile },
];

export default function TechnicianDashboard() {
  const { data: workOrders, loading, error, reload } = useLiveData(() => api.workOrders(), []);

  if (loading) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;

  const pending = (workOrders ?? []).filter((w) => w.status !== 'completed');

  return (
    <>
      <PageHeader title="Technician portal" description="Field jobs, maintenance, and meter diagnostics" />
      <QuickLinks links={LINKS} />
      <Card title="Today's assignments">
        {pending.length === 0 ? (
          <p className="text-sm text-muted">No pending work orders.</p>
        ) : (
          pending.map((w) => (
            <ListItem
              key={w.id}
              title={w.task}
              subtitle={`${w.location} · ${w.scheduled}`}
              meta={<Badge variant={STATUS_VARIANT[w.status] || 'neutral'}>{w.status}</Badge>}
              action={<Button href={ROUTES.technician.workOrder(w.id)} sm>Open</Button>}
            />
          ))
        )}
        <Button href={ROUTES.technician.workOrders} variant="ghost" sm style={{ marginTop: 12 }}>
          View all work orders
        </Button>
      </Card>
    </>
  );
}
