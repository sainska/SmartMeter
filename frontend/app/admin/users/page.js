'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/layout/AppShell';
import { Card, Button, DataTable, Badge } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import styles from '@/components/layout/layout.module.css';
import { ROUTES } from '@/lib/routes';

export default function UserManagementPage() {
  const { data: users, loading, error, reload } = useLiveData(() => api.profiles(), []);

  if (loading) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;

  const rows = (users ?? []).map((u) => ({
    id: u.id,
    name: u.name,
    role: u.role,
    status: <Badge variant={u.status === 'active' ? 'success' : 'neutral'}>{u.status}</Badge>,
  }));

  return (
    <>
      <PageHeader
        title="User management"
        description="Staff accounts, roles, and permissions"
        action={<Button sm>Create user</Button>}
      />

      <div className={styles.moduleGrid} style={{ marginBottom: 16 }}>
        <Link href={ROUTES.admin.audit} className={styles.moduleLink}>
          <h3>Audit logs</h3>
          <p className="text-sm text-muted">Login and system changes</p>
        </Link>
        <Link href={ROUTES.admin.systemHealth} className={styles.moduleLink}>
          <h3>System health</h3>
          <p className="text-sm text-muted">API and database status</p>
        </Link>
        <Link href={ROUTES.admin.settings} className={styles.moduleLink}>
          <h3>Settings</h3>
          <p className="text-sm text-muted">Security and accessibility</p>
        </Link>
      </div>

      <Card>
        <DataTable
          columns={[
            { key: 'name', label: 'User' },
            { key: 'role', label: 'Role' },
            { key: 'status', label: 'Status' },
          ]}
          rows={rows}
        />
      </Card>
    </>
  );
}
