'use client';

import { useParams } from 'next/navigation';
import { BackLink } from '@/components/layout/BackLink';
import { PageHeader } from '@/components/layout/AppShell';
import { Card, Badge, Button, BarChart, SignalMeter } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import styles from '@/components/layout/layout.module.css';
import { ROUTES } from '@/lib/routes';

const STATUS_VARIANT = { online: 'success', offline: 'warning', fault: 'danger' };

export default function MeterDetailsPage() {
  const params = useParams();
  const id = decodeURIComponent(params.id);
  const { data: meter, loading, error, reload } = useLiveData(() => api.meter(id), [id]);
  const { data: readings } = useLiveData(() => api.meterReadings(id), [id]);

  if (loading) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;
  if (!meter) return null;

  const chartData = (readings ?? []).slice(0, 7).map((r) => Number(r.kwh)).reverse();

  return (
    <>
      <BackLink href={ROUTES.admin.meters} label="Back to fleet map" />
      <PageHeader
        title={`Meter diagnostics — ${id}`}
        description={meter.location}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button href={ROUTES.admin.meterHealth(id)} variant="secondary" sm>Device health</Button>
            <Button href={ROUTES.admin.meterControls(id)} sm>Remote controls</Button>
          </div>
        }
      />

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <Card title="Device information">
          <Info label="Consumer" value={meter.consumer ?? '—'} />
          <Info label="Region" value={meter.region} />
          <Info label="Installation" value={meter.installation_date ?? '—'} />
          <Info label="Firmware" value={meter.firmware ?? '—'} />
          <Info label="Status" value={<Badge variant={STATUS_VARIANT[meter.status] || 'neutral'}>{meter.status}</Badge>} />
        </Card>
        <Card title="Live metrics">
          <div className={styles.metricGrid}>
            <div className={styles.metricBox}><span>Voltage</span><strong>{meter.voltage ?? '—'} V</strong></div>
            <div className={styles.metricBox}><span>Current</span><strong>{meter.current ?? '—'} A</strong></div>
            <div className={styles.metricBox}><span>Battery</span><strong>{meter.battery}%</strong></div>
          </div>
          <div style={{ marginTop: 12 }}>
            <span className="text-sm text-muted">Signal strength</span>
            <SignalMeter strength={meter.signal} />
          </div>
        </Card>
      </div>

      <Card title="Consumption trend">
        <BarChart data={chartData.length ? chartData : [2, 3, 2.5, 4, 3.8, 3.2, 3.5]} labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']} />
      </Card>

      <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Button href={ROUTES.admin.monitoring}>Live monitoring</Button>
        <Button href={ROUTES.admin.operations} variant="secondary">Report incident</Button>
      </div>
    </>
  );
}

function Info({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)', fontSize: '0.875rem' }}>
      <span className="text-muted">{label}</span>
      <span>{value}</span>
    </div>
  );
}
