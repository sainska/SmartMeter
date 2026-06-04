'use client';

import { PageHeader } from '@/components/layout/AppShell';
import { Card, ListItem, Badge } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import { IconAlert } from '@/components/icons';

const TYPE_VARIANT = { high: 'warning', fault: 'danger', tamper: 'danger' };

export default function ConsumerAlertsPage() {
  const { data: alerts, loading, error, reload } = useLiveData(() => api.alerts(), []);

  if (loading) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;

  return (
    <>
      <PageHeader title="Alerts" description="Usage, billing, and meter notifications" />
      <Card title="Your alerts">
        {(alerts ?? []).length === 0 ? (
          <p className="text-sm text-muted">No alerts at this time.</p>
        ) : (
          alerts.map((a) => (
            <ListItem
              key={a.id}
              icon={IconAlert}
              title={a.title}
              subtitle={a.time}
              meta={
                <div style={{ marginTop: 6 }}>
                  <Badge variant={TYPE_VARIANT[a.type] || 'info'}>{a.type}</Badge>
                </div>
              }
              action={!a.read && <Badge variant="info">New</Badge>}
            />
          ))
        )}
      </Card>
    </>
  );
}
