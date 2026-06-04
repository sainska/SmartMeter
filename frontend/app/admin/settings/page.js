'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/AppShell';
import { Card, Input, InputGroup, Select, Button, Toggle } from '@/components/ui';
import { DataLoading } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import styles from '@/components/layout/layout.module.css';
import { ROUTES } from '@/lib/routes';

export default function SettingsPage() {
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const { data: settings, loading } = useLiveData(() => api.settings(), []);

  const regional = settings?.regional ?? {};

  return (
    <>
      <PageHeader
        title="Settings & security"
        description="Profile policies, security, and accessibility"
      />

      {loading ? (
        <DataLoading message="Loading system settings..." />
      ) : (
        <Card title="Regional settings">
          <p className="text-sm text-muted" style={{ marginBottom: 12 }}>
            App version {settings?.version ?? '2.4.1'} · loaded from database
          </p>
          <InputGroup label="Region" id="region">
            <Select id="region" defaultValue={regional.region ?? 'Central Kenya'}>
              <option>Central Kenya</option>
              <option>Nyanza</option>
            </Select>
          </InputGroup>
          <div style={{ marginTop: 12 }}>
            <InputGroup label="Currency" id="currency">
              <Select id="currency" defaultValue={regional.currency ?? 'KES'}>
                <option>KES</option>
              </Select>
            </InputGroup>
          </div>
          <div style={{ marginTop: 12 }}>
            <InputGroup label="Time zone" id="tz">
              <Select id="tz" defaultValue={regional.timezone ?? 'Africa/Nairobi (EAT)'}>
                <option>Africa/Nairobi (EAT)</option>
              </Select>
            </InputGroup>
          </div>
          <Button style={{ marginTop: 16 }}>Save regional settings</Button>
        </Card>
      )}

      <div className={styles.moduleGrid} style={{ marginTop: 16 }}>
        <Link href={ROUTES.admin.security} className={styles.moduleLink}>
          <h3>Security policies</h3>
          <p className="text-sm text-muted">MFA, passwords, sessions</p>
        </Link>
        <Link href={ROUTES.admin.alerts} className={styles.moduleLink}>
          <h3>Notification preferences</h3>
          <p className="text-sm text-muted">SMS, email, push channels</p>
        </Link>
        <Link href={ROUTES.roleSelection} className={styles.moduleLink}>
          <h3>Switch role</h3>
          <p className="text-sm text-muted">Return to role selection</p>
        </Link>
      </div>

      <div style={{ marginTop: 16 }}>
        <Card title="Accessibility options">
          <Toggle label="Larger text" on={largeText} onToggle={() => setLargeText(!largeText)} />
          <Toggle label="High contrast mode" on={highContrast} onToggle={() => setHighContrast(!highContrast)} />
        </Card>
      </div>
    </>
  );
}
