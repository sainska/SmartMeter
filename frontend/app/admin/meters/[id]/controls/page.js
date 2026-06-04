'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { BackLink } from '@/components/layout/BackLink';
import { PageHeader } from '@/components/layout/AppShell';
import { Card, Button, Badge } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import styles from '@/components/layout/layout.module.css';
import { ROUTES } from '@/lib/routes';

const ACTIONS = [
  { label: 'Restart meter', desc: 'Soft reboot — readings pause ~30s', variant: 'secondary' },
  { label: 'Update firmware', desc: 'OTA update when connectivity allows', variant: 'secondary' },
  { label: 'Re-sync data', desc: 'Force upload of queued readings', variant: 'secondary' },
  { label: 'Disconnect service', desc: 'Remote disconnect — authorized only', variant: 'danger' },
  { label: 'Reconnect service', desc: 'Restore supply after payment', variant: 'primary' },
];

export default function RemoteControlsPage() {
  const params = useParams();
  const id = decodeURIComponent(params.id);
  const [lastAction, setLastAction] = useState(null);
  const { data: meter, loading, error, reload } = useLiveData(() => api.meter(id), [id]);

  if (loading) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;

  return (
    <>
      <BackLink href={ROUTES.admin.meter(id)} label="Back to meter diagnostics" />
      <PageHeader
        title="Remote controls"
        description={`${id} · ${meter?.consumer ?? 'Unassigned'} · ${meter?.status}`}
      />

      {lastAction && (
        <div style={{ marginBottom: 12 }}>
          <Badge variant="success">{lastAction} queued — logged to audit trail</Badge>
        </div>
      )}

      <Card>
        <p className="text-sm text-muted" style={{ marginBottom: 16 }}>
          All actions are logged in the audit trail.
        </p>
        <div className={styles.actionGrid}>
          {ACTIONS.map((a) => (
            <div key={a.label} style={{ padding: 12, border: '1px solid var(--color-border)', borderRadius: 10 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{a.label}</div>
              <p className="text-xs text-muted" style={{ marginBottom: 10 }}>{a.desc}</p>
              <Button variant={a.variant} sm block onClick={() => setLastAction(a.label)}>
                Execute
              </Button>
            </div>
          ))}
        </div>
        <Button href={ROUTES.admin.audit} variant="ghost" sm style={{ marginTop: 16 }}>View audit log</Button>
      </Card>
    </>
  );
}
