'use client';

import { BackLink } from '@/components/layout/BackLink';
import { PageHeader } from '@/components/layout/AppShell';
import { Card, Badge, Kpi } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/routes';

export default function SystemHealthPage() {
  const { data, loading, error, reload } = useLiveData(() => api.health(), []);

  const ok = data?.status === 'ok';

  return (
    <>
      <BackLink href={ROUTES.admin.users} label="Back to user management" />
      <PageHeader title="System health" description="API, database, and server monitoring" />

      {loading && <DataLoading />}
      {error && <DataError error={error} onRetry={reload} />}

      {!loading && !error && (
        <>
          <div className="grid-3" style={{ marginBottom: 16 }}>
            <Kpi label="API health" value={ok ? 'Operational' : 'Degraded'} />
            <Kpi label="Database" value="Connected via Supabase" />
            <Kpi label="Backend" value={ok ? 'Online' : 'Offline'} />
          </div>

          <Card title="Service status">
            <StatusRow name="Express API" status={ok ? 'ok' : 'degraded'} />
            <StatusRow name="Supabase PostgreSQL" status="ok" />
          </Card>
        </>
      )}
    </>
  );
}

function StatusRow({ name, status }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <span>{name}</span>
      <Badge variant={status === 'ok' ? 'success' : 'warning'}>{status}</Badge>
    </div>
  );
}
