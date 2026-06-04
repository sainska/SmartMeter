'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BackLink } from '@/components/layout/BackLink';
import { PageHeader } from '@/components/layout/AppShell';
import { Card, Button, Badge, InputGroup, Textarea } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/routes';

const STATUS_VARIANT = { pending: 'warning', accepted: 'info', completed: 'success' };

export default function WorkOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = decodeURIComponent(params.id);
  const { data: order, loading, error, reload } = useLiveData(() => api.workOrder(id), [id]);
  const [status, setStatus] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentStatus = status ?? order?.status;

  const handleStatus = async (next) => {
    setSaving(true);
    try {
      await api.updateWorkOrder(id, { status: next });
      setStatus(next);
      if (next === 'completed') router.push(ROUTES.technician.maintenance);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;
  if (!order) return null;

  return (
    <>
      <BackLink href={ROUTES.technician.workOrders} label="Back to work orders" />
      <PageHeader
        title={order.task}
        description={order.id}
        action={<Badge variant={STATUS_VARIANT[currentStatus]}>{currentStatus}</Badge>}
      />

      <Card title="Job details">
        <Detail label="Location" value={order.location} />
        <Detail label="Meter" value={order.meterId} />
        <Detail label="Priority" value={order.priority} />
        <Detail label="Scheduled" value={order.scheduled} />
        <p className="text-sm" style={{ marginTop: 12 }}>{order.description}</p>
      </Card>

      <div style={{ marginTop: 16 }} className="grid-2">
        <Card title="Actions">
          {currentStatus === 'pending' && (
            <Button block disabled={saving} onClick={() => handleStatus('accepted')}>Accept task</Button>
          )}
          {currentStatus === 'accepted' && (
            <Button block disabled={saving} onClick={() => handleStatus('completed')}>Mark complete</Button>
          )}
          {order.meterId && (
            <Button href={ROUTES.admin.meter(order.meterId)} variant="secondary" sm style={{ marginTop: 10 }}>
              View meter diagnostics
            </Button>
          )}
        </Card>

        <Card title="Evidence upload">
          <InputGroup label="Field notes" id="notes">
            <Textarea id="notes" rows={3} placeholder="Site observations..." />
          </InputGroup>
          <Button variant="secondary" sm style={{ marginTop: 12 }} onClick={() => setUploaded(true)}>
            Upload photo
          </Button>
          {uploaded && <Badge variant="success" style={{ marginTop: 8 }}>Photo queued for sync</Badge>}
        </Card>
      </div>
    </>
  );
}

function Detail({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)', fontSize: '0.875rem' }}>
      <span className="text-muted">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
