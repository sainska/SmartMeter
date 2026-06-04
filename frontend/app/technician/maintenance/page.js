'use client';

import { PageHeader } from '@/components/layout/AppShell';
import { Card, DataTable, Button } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/routes';

export default function MaintenancePage() {
  const { data: records, loading, error, reload } = useLiveData(() => api.maintenance(), []);

  if (loading) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;

  const rows = (records ?? []).map((r) => ({
    id: r.id,
    date: r.date?.slice?.(0, 10) ?? r.date,
    meter: r.meter,
    type: r.type,
    notes: r.notes,
    link: r.work_order_id ? (
      <Button href={ROUTES.technician.workOrder(r.work_order_id)} sm variant="ghost">Job</Button>
    ) : (
      <Button href={ROUTES.admin.meter(r.meter)} sm variant="ghost">Meter</Button>
    ),
  }));

  return (
    <>
      <PageHeader
        title="Maintenance records"
        description="Repairs, replacements, and inspections"
        action={<Button href={ROUTES.technician.workOrders} variant="secondary" sm>Work orders</Button>}
      />
      <Card>
        <DataTable
          columns={[
            { key: 'date', label: 'Date' },
            { key: 'meter', label: 'Meter' },
            { key: 'type', label: 'Type' },
            { key: 'notes', label: 'Notes' },
            { key: 'link', label: '' },
          ]}
          rows={rows}
        />
      </Card>
    </>
  );
}
