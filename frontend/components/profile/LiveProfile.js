'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/AppShell';
import { Card, Button, Input, InputGroup, Toggle } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/routes';

export function LiveProfile({ title = 'Profile', showMeter = false }) {
  const { refreshProfile } = useAuth();
  const { data, loading, error, reload } = useLiveData(() => api.me(), []);
  const { data: meters } = useLiveData(() => (showMeter ? api.meters() : Promise.resolve([])), [showMeter]);
  const [sms, setSms] = useState(true);
  const [emailPref, setEmailPref] = useState(false);
  const [push, setPush] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  if (loading) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;

  const profile = data?.profile;
  const consumer = data?.consumer;

  const handleSave = async (e) => {
    e.preventDefault();
    const form = e.target;
    setSaving(true);
    setSaveMsg('');
    try {
      await api.updateProfile({
        full_name: form.full_name?.value,
        phone: form.phone?.value,
      });
      await refreshProfile();
      setSaveMsg('Profile saved.');
    } catch (err) {
      setSaveMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title={title} description="Account and notification settings" />

      <form onSubmit={handleSave}>
        <Card title="Personal information">
          <InputGroup label="Full name" id="name">
            <Input id="name" name="full_name" defaultValue={profile?.full_name ?? ''} />
          </InputGroup>
          <div style={{ marginTop: 12 }}>
            <InputGroup label="Phone" id="phone">
              <Input id="phone" name="phone" type="tel" defaultValue={profile?.phone ?? consumer?.phone ?? ''} />
            </InputGroup>
          </div>
          <div style={{ marginTop: 12 }}>
            <InputGroup label="Email" id="email">
              <Input id="email" defaultValue={profile?.email ?? ''} readOnly />
            </InputGroup>
          </div>
          <div style={{ marginTop: 12 }}>
            <InputGroup label="Role" id="role">
              <Input id="role" defaultValue={profile?.role ?? ''} readOnly />
            </InputGroup>
          </div>
          <Button type="submit" style={{ marginTop: 16 }} disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
          {saveMsg && <p className="text-sm text-muted" style={{ marginTop: 8 }}>{saveMsg}</p>}
        </Card>
      </form>

      {showMeter && consumer && (
        <div style={{ marginTop: 16 }}>
          <Card title="Meter & account">
            <p className="text-sm"><strong>Consumer ID:</strong> {consumer.id}</p>
            <p className="text-sm text-muted" style={{ marginTop: 4 }}>
              Outstanding: KES {Number(consumer.outstanding_balance ?? 0).toLocaleString()}
            </p>
            {meters?.[0] && (
              <p className="text-sm" style={{ marginTop: 8 }}>
                <strong>Meter:</strong> {meters[0].id} — {meters[0].location} ({meters[0].status})
              </p>
            )}
          </Card>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <Card title="Notification preferences">
          <Toggle label="SMS notifications" on={sms} onToggle={() => setSms(!sms)} />
          <Toggle label="Email notifications" on={emailPref} onToggle={() => setEmailPref(!emailPref)} />
          <Toggle label="Push notifications" on={push} onToggle={() => setPush(!push)} />
        </Card>
      </div>

      <div style={{ marginTop: 16 }}>
        <Card title="Security">
          <Button href={ROUTES.forgotPassword} variant="secondary">Change password</Button>
          <Button href={ROUTES.roleSelection} variant="ghost" sm style={{ marginTop: 8 }}>Switch role</Button>
        </Card>
      </div>
    </>
  );
}
