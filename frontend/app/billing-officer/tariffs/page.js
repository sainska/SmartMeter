'use client';

import { PageHeader } from '@/components/layout/AppShell';
import { Card, DataTable } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';

export default function BillingTariffsPage() {
  const { data: tariffs, loading, error, reload } = useLiveData(() => api.tariffs(), []);

  if (loading) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;

  const rows = (tariffs ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    rate: t.tiers ?? '—',
    tier: t.subsidy ?? '—',
  }));

  return (
    <>
      <PageHeader title="Tariffs" description="Billing rates and tier structures" />
      <Card>
        <DataTable
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Tariff' },
            { key: 'rate', label: 'Rate' },
            { key: 'tier', label: 'Tier' },
          ]}
          rows={rows}
        />
      </Card>
    </>
  );
}
