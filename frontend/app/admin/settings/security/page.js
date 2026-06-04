'use client';

import { BackLink } from '@/components/layout/BackLink';
import { PageHeader } from '@/components/layout/AppShell';
import { Card, Badge, Button } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/routes';

export default function SecuritySettingsPage() {
  const { data, loading, error, reload } = useLiveData(() => api.me(), []);

  if (loading) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;

  return (
    <>
      <BackLink href={ROUTES.admin.settings} label="Back to settings" />
      <PageHeader title="Security policies" description="Authentication and access control" />
      <Card title="Current session">
        <p className="text-sm"><strong>User:</strong> {data.profile?.email}</p>
        <p className="text-sm" style={{ marginTop: 4 }}><strong>Role:</strong> {data.profile?.role}</p>
        <div style={{ marginTop: 12 }}>
          <Badge variant="success">Supabase JWT active</Badge>
        </div>
        <p className="text-sm text-muted" style={{ marginTop: 12 }}>
          Row-level security on PostgreSQL enforces role-based data access. API uses service role on the server only.
          Sessions end automatically after 10 minutes of inactivity.
        </p>
        <Button href={ROUTES.forgotPassword} variant="secondary" style={{ marginTop: 16 }}>Change password</Button>
      </Card>
    </>
  );
}
