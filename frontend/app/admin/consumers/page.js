'use client';

import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/AppShell';
import { Card, Button, DataTable, Badge, InputGroup, Select } from '@/components/ui';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/routes';

export default function ConsumersPage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (query.trim()) p.set('q', query.trim());
    if (statusFilter !== 'all') p.set('status', statusFilter);
    return p.toString();
  }, [query, statusFilter]);

  const { data: consumers, loading, error, reload } = useLiveData(
    () => api.consumers(params),
    [params],
  );

  const filtered = consumers ?? [];

  const rows = filtered.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    meter: c.meter ?? '—',
    ward: c.ward,
    status: <Badge variant={c.status === 'active' ? 'success' : 'warning'}>{c.status}</Badge>,
    actions: c.meter ? (
      <Button href={ROUTES.admin.meter(c.meter)} sm variant="ghost">
        View meter
      </Button>
    ) : null,
  }));

  if (loading && !consumers) return <DataLoading />;

  return (
    <>
      <PageHeader
        title="Consumer management"
        description="Searchable directory of users and account statuses"
        action={<Button href={ROUTES.admin.consumerNew}>Add consumer</Button>}
      />

      {error && <DataError error={error} onRetry={reload} />}

      <Card>
        <div className="grid-2" style={{ marginBottom: 16 }}>
          <InputGroup label="Search consumers" id="search">
            <SearchInput
              id="search"
              value={query}
              onChange={setQuery}
              placeholder="Name, ID, phone, meter, ward..."
            />
          </InputGroup>
          <InputGroup label="Account status" id="status">
            <Select id="status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </Select>
          </InputGroup>
        </div>

        <p className="text-sm text-muted" style={{ marginBottom: 12 }}>
          {filtered.length} consumers
        </p>

        <DataTable
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'name', label: 'Name' },
            { key: 'phone', label: 'Contact' },
            { key: 'meter', label: 'Meter' },
            { key: 'ward', label: 'Ward' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: '' },
          ]}
          rows={rows}
        />
      </Card>
    </>
  );
}
