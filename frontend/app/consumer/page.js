'use client';

import { PageHeader } from '@/components/layout/AppShell';
import { Card, Kpi, Badge, BarChart, SignalMeter, Button } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/routes';
import styles from '@/components/layout/layout.module.css';

export default function ConsumerDashboard() {
  const { data: d, loading, error, reload } = useLiveData(() => api.consumerDashboard(), [
    'consumer-dashboard',
  ]);

  if (loading && !d) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;
  if (!d) return null;

  const dailyChart = d.readings?.slice(0, 7).map((r) => Number(r.kwh)).reverse() ?? [];

  return (
    <>
      <PageHeader
        title="Consumer dashboard"
        description="Real-time consumption, billing, and meter status"
        live
        action={
          <Badge variant={d.connectivity === 'online' ? 'success' : 'warning'}>
            {d.connectivity}
          </Badge>
        }
      />

      {Number(d.alertCount) > 0 && (
        <div className={styles.alertBanner}>
          You have {d.alertCount} unread notification{d.alertCount > 1 ? 's' : ''}.{' '}
          <Button href={ROUTES.consumer.alerts} variant="ghost" sm>
            View alerts
          </Button>
        </div>
      )}

      <div className="grid-4" style={{ marginBottom: 16 }}>
        <Kpi
          label="Real-time consumption"
          value={`${d.consumption.current} ${d.consumption.unit}`}
          delta="+4% vs yesterday"
          deltaType="up"
        />
        <Kpi
          label="Bill estimate"
          value={`${d.currency} ${Number(d.billEstimate).toLocaleString()}`}
        />
        <Kpi
          label="Outstanding"
          value={`${d.currency} ${Number(d.balance).toLocaleString()}`}
          delta="Due soon"
          deltaType="down"
        />
        <Kpi label="Active alerts" value={String(d.alertCount ?? 0)} />
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <Card title="Daily consumption — this week">
          <BarChart
            data={dailyChart.length ? dailyChart : [0, 0, 0, 0, 0, 0, 0]}
            labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
          />
          <Button href={ROUTES.consumer.usage} variant="ghost" sm style={{ marginTop: 12 }}>
            Usage analytics
          </Button>
        </Card>
        <Card title="Billing summary">
          <p className="text-sm" style={{ marginBottom: 8 }}>
            Estimated: {d.currency} {Number(d.billEstimate).toLocaleString()}
          </p>
          <Button href={ROUTES.consumer.payments} block>
            Pay with M-Pesa STK
          </Button>
          <Button href={ROUTES.consumer.bills} variant="ghost" sm style={{ marginTop: 8 }}>
            View invoices
          </Button>
        </Card>
      </div>

      <div className="grid-3">
        <Card title="Meter health">
          <Badge variant="success">Healthy</Badge>
          <p className="text-sm text-muted" style={{ marginTop: 8 }}>
            Latest reading from live database
          </p>
        </Card>
        <Card title="Connectivity">
          <SignalMeter strength={d.signal} />
          <p className="text-sm text-muted" style={{ marginTop: 8 }}>
            {d.connectivity}
          </p>
        </Card>
        <Card title="Quick links">
          <Button href={ROUTES.consumer.usage} variant="secondary" sm block>
            Meter health
          </Button>
          <Button href={ROUTES.consumer.payments} variant="ghost" sm block style={{ marginTop: 6 }}>
            Billing & payments
          </Button>
        </Card>
      </div>
    </>
  );
}
