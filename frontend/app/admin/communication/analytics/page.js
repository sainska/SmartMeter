'use client';

import { BackLink } from '@/components/layout/BackLink';
import { PageHeader } from '@/components/layout/AppShell';
import { Card, Badge, Button } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import styles from '@/components/layout/layout.module.css';
import { ROUTES } from '@/lib/routes';

export default function ConnectivityAnalyticsPage() {
  const { data: comm, loading, error, reload } = useLiveData(() => api.communicationStats(), []);
  const { data: meters } = useLiveData(() => api.meters(), []);

  if (loading) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;

  const lowSignal = (meters ?? []).filter((m) => Number(m.signal) < 2);

  return (
    <>
      <BackLink href={ROUTES.admin.communication} label="Back to communication monitor" />
      <PageHeader title="Connectivity analytics" description="Coverage and uptime from live fleet data" />
      <Card title="Fleet coverage">
        <div className={styles.mapPlaceholder}>
          {meters?.length ?? 0} meters monitored · {lowSignal.length} below 2/5 signal
        </div>
        <Button href={ROUTES.admin.meters} variant="ghost" sm style={{ marginTop: 12 }}>View fleet map</Button>
      </Card>
      <div className="grid-2" style={{ marginTop: 16 }}>
        <Card title="Low signal sectors">
          <p className="text-sm">{comm.deadZones} devices need attention</p>
          <div style={{ marginTop: 8 }}><Badge variant="warning">Action required</Badge></div>
        </Card>
        <Card title="Uptime report">
          <p className="text-sm">Fleet uptime: {comm.fleetUptime} (from transmission logs)</p>
        </Card>
      </div>
    </>
  );
}
