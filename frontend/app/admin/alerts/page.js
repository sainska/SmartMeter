'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/AppShell';
import { Card, Tabs, Toggle, ListItem, Badge } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import { IconAlert } from '@/components/icons';
import { ROUTES } from '@/lib/routes';

const CHANNELS = [
  { id: 'alerts', label: 'Alert feed' },
  { id: 'sms', label: 'SMS' },
  { id: 'email', label: 'Email' },
  { id: 'push', label: 'Push' },
];

const TYPE_VARIANT = { high: 'warning', fault: 'danger', tamper: 'danger' };

export default function NotificationAlertCenterPage() {
  const [channel, setChannel] = useState('alerts');
  const [bill, setBill] = useState(true);
  const [payment, setPayment] = useState(true);
  const [fault, setFault] = useState(true);
  const { data: alerts, loading, error, reload } = useLiveData(() => api.alerts(), []);

  return (
    <>
      <PageHeader
        title="Notification & alert center"
        description="Centralized SMS, email, push, and system alerts"
      />

      <Tabs tabs={CHANNELS} active={channel} onChange={setChannel} />

      <div style={{ marginTop: 16 }}>
        {channel === 'alerts' && (
          <Card title="System alerts">
            {loading && <DataLoading message="Loading alerts..." />}
            {error && <DataError error={error} onRetry={reload} />}
            {!loading && !error && (alerts ?? []).map((a) => (
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
            ))}
            <p className="text-sm text-muted" style={{ marginTop: 12 }}>
              <a href={ROUTES.admin.operations}>View fault & incident center</a>
            </p>
          </Card>
        )}

        {channel !== 'alerts' && (
          <Card title={`${channel.toUpperCase()} notification events`}>
            <Toggle label="New bill issued" on={bill} onToggle={() => setBill(!bill)} />
            <Toggle label="Payment received" on={payment} onToggle={() => setPayment(!payment)} />
            <Toggle label="Fault and tamper alerts" on={fault} onToggle={() => setFault(!fault)} />
            {channel === 'email' && <Toggle label="Monthly statements" on onToggle={() => {}} />}
            {channel === 'push' && <Toggle label="Connectivity warnings" on onToggle={() => {}} />}
          </Card>
        )}
      </div>
    </>
  );
}
