'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/layout/AppShell';
import { Card, Kpi, Badge, Button } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import styles from '@/components/layout/layout.module.css';
import { ROUTES } from '@/lib/routes';

export default function CommunicationPage() {
  const { data, loading, error, reload } = useLiveData(() => api.communicationStats(), []);

  if (loading) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;

  return (
    <>
      <PageHeader
        title="Communication performance"
        description="GSM, LoRa analytics — latency, packet loss, uptime"
      />

      <div className="grid-4" style={{ marginBottom: 16 }}>
        <Kpi label="Avg signal" value={data.avgSignal} />
        <Kpi label="Latency" value={`${data.latencyMs} ms`} />
        <Kpi label="Packet loss" value={data.packetLoss} deltaType="down" />
        <Kpi label="Uptime" value={data.uptime} deltaType="up" />
      </div>

      <Card title="Technologies in use">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {(data.technologies ?? []).map((t) => (
            <Badge key={t} variant="info">{t}</Badge>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button href={ROUTES.admin.commAnalytics}>Coverage analytics</Button>
          <Button href={ROUTES.admin.commLogs} variant="secondary">Transmission logs</Button>
        </div>
      </Card>

      <div className={styles.moduleGrid} style={{ marginTop: 16 }}>
        <Link href={ROUTES.admin.commAnalytics} className={styles.moduleLink}>
          <h3>Connectivity analytics</h3>
          <p className="text-sm text-muted">{data.deadZones} meters with low signal</p>
        </Link>
        <Link href={ROUTES.admin.commLogs} className={styles.moduleLink}>
          <h3>Transmission logs</h3>
          <p className="text-sm text-muted">Per-device success and errors</p>
        </Link>
      </div>
    </>
  );
}
