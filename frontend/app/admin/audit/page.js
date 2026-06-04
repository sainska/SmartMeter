'use client';

import { PageHeader } from '@/components/layout/AppShell';
import { Card, DataTable } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';

export default function AuditLogsPage() {
  const { data: logs, loading, error, reload } = useLiveData(() => api.auditLogs(), []);

  if (loading) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;

  const rows = (logs ?? []).map((l) => ({
    id: l.id,
    time: l.time,
    user: l.user,
    action: l.action,
    detail: l.detail,
  }));

  return (
    <>
      <PageHeader title="Audit logs" description="Authentication and configuration changes" />
      <Card>
        <DataTable
          columns={[
            { key: 'time', label: 'Time' },
            { key: 'user', label: 'User' },
            { key: 'action', label: 'Action' },
            { key: 'detail', label: 'Detail' },
          ]}
          rows={rows}
        />
      </Card>
    </>
  );
}
