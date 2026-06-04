'use client';

import { useParams } from 'next/navigation';
import { BackLink } from '@/components/layout/BackLink';
import { PageHeader } from '@/components/layout/AppShell';
import { Card, Progress, Badge, Button } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/routes';

export default function MeterHealthPage() {
  const params = useParams();
  const id = decodeURIComponent(params.id);
  const { data: meter, loading, error, reload } = useLiveData(() => api.meter(id), [id]);

  if (loading) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;
  if (!meter) return null;

  const battery = Number(meter.battery) || 0;
  const uptime = meter.status === 'online' ? 99.2 : meter.status === 'offline' ? 72 : 45;

  return (
    <>
      <BackLink href={ROUTES.admin.meter(id)} label="Back to meter diagnostics" />
      <PageHeader title="Device health" description={`Diagnostics for ${id}`} />

      <div className="grid-2">
        <Card title="Uptime">
          <p className="font-display" style={{ fontSize: '1.5rem', fontWeight: 600 }}>{uptime}%</p>
          <p className="text-sm text-muted">Status: {meter.status}</p>
        </Card>
        <Card title="Battery status">
          <Progress value={battery} />
          <p className="text-sm text-muted" style={{ marginTop: 8 }}>{battery}%</p>
        </Card>
        <Card title="Firmware health">
          <Badge variant="success">{meter.firmware ?? 'Unknown'}</Badge>
          <Button href={ROUTES.admin.meterControls(id)} variant="ghost" sm style={{ marginTop: 12 }}>Remote controls</Button>
        </Card>
        <Card title="Diagnostics">
          <ul className="text-sm" style={{ lineHeight: 1.8 }}>
            <li>Signal strength: {meter.signal}/5</li>
            <li>Voltage: {meter.voltage ?? '—'} V</li>
            <li>Current: {meter.current ?? '—'} A</li>
            <li>Consumer: {meter.consumer ?? 'Unassigned'}</li>
          </ul>
        </Card>
      </div>
    </>
  );
}
