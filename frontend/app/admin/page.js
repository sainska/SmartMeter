'use client';

import { PageHeader } from '@/components/layout/AppShell';
import { Card, Kpi, BarChart, Badge, Button } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/routes';
import styles from '@/components/layout/layout.module.css';

export default function AdminDashboard() {
  const { data, loading, error, reload } = useLiveData(() => api.adminDashboard(), [
    'admin-dashboard',
  ]);
  const { data: incidents } = useLiveData(() => api.incidents(), ['admin-incidents']);
  const { data: billing } = useLiveData(() => api.billingSummary(), ['billing-summary']);

  if (loading && !data) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;

  const adminKpis = data?.kpis ?? [];
  const openFaults = (incidents ?? []).filter((i) => i.status !== 'resolved').length;

  return (
    <>
      <PageHeader
        title="Admin overview dashboard"
        description="Regional KPIs — meters, revenue, faults, and system health"
        live
        action={<Button href={ROUTES.admin.more} variant="secondary" sm>All modules</Button>}
      />

      <div className="grid-4" style={{ marginBottom: 16 }}>
        {adminKpis.map((k) => (
          <Kpi key={k.label} label={k.label} value={k.value} delta={k.delta} deltaType={k.deltaType} />
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <Card title="Revenue & collection trend">
          <BarChart data={billing?.revenueChart ?? [3.2, 3.5, 3.8, 4, 4.2]} labels={billing?.revenueLabels ?? []} />
          <Button href={ROUTES.admin.revenue} variant="ghost" sm style={{ marginTop: 12 }}>
            Revenue reporting
          </Button>
        </Card>
        <Card title="System health">
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div className="font-display" style={{ fontSize: '2.5rem', color: 'var(--color-primary)' }}>
              {billing?.collectionRate ?? 94}%
            </div>
            <p className="text-sm text-muted">Collection rate</p>
          </div>
          <Button href={ROUTES.admin.systemHealth} variant="ghost" sm block>
            System health
          </Button>
        </Card>
      </div>

      <div className="grid-2">
        <Card title="Regional breakdown">
          <p className="text-sm text-muted" style={{ marginBottom: 8 }}>
            Outstanding: KES {Number(billing?.outstanding ?? 0).toLocaleString()}
          </p>
          <p className="text-sm">
            Paid invoices: {billing?.paidCount ?? 0} · Unpaid: {billing?.unpaidCount ?? 0}
          </p>
          <Button href={ROUTES.admin.consumers} variant="ghost" sm style={{ marginTop: 12 }}>
            Consumer directory
          </Button>
        </Card>
        <Card title="Active alerts & faults">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            <Badge variant="danger">{openFaults} open faults</Badge>
            <Badge variant="success">API operational</Badge>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button href={ROUTES.admin.faults}>Fault detection</Button>
            <Button href={ROUTES.admin.operations} variant="secondary">
              Operations
            </Button>
            <Button href={ROUTES.admin.monitoring} variant="ghost">
              Live monitoring
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
