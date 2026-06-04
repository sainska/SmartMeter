'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BackLink } from '@/components/layout/BackLink';
import { PageHeader } from '@/components/layout/AppShell';
import { Card, Button, Input, InputGroup, Select } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/routes';

export default function NewConsumerPage() {
  const router = useRouter();
  const { data: meters, loading, error, reload } = useLiveData(() => api.unassignedMeters(), []);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    const fd = new FormData(e.target);
    try {
      await api.createConsumer({
        full_name: fd.get('full_name'),
        phone: fd.get('phone'),
        email: fd.get('email'),
        ward: fd.get('ward'),
        meter_serial: fd.get('meter_serial') || undefined,
      });
      router.push(ROUTES.admin.consumers);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DataLoading />;

  return (
    <>
      <BackLink href={ROUTES.admin.consumers} label="Back to consumer directory" />
      <PageHeader title="Add consumer" description="Register a new consumer account" />

      {error && <DataError error={error} onRetry={reload} />}

      <Card>
        <form onSubmit={handleSubmit}>
          <InputGroup label="Full name" id="name">
            <Input id="name" name="full_name" required />
          </InputGroup>
          <div style={{ marginTop: 12 }}>
            <InputGroup label="Phone" id="phone">
              <Input id="phone" name="phone" type="tel" required />
            </InputGroup>
          </div>
          <div style={{ marginTop: 12 }}>
            <InputGroup label="Email" id="email">
              <Input id="email" name="email" type="email" />
            </InputGroup>
          </div>
          <div style={{ marginTop: 12 }}>
            <InputGroup label="Ward" id="ward">
              <Input id="ward" name="ward" />
            </InputGroup>
          </div>
          <div style={{ marginTop: 12 }}>
            <InputGroup label="Assign meter" id="meter">
              <Select id="meter" name="meter_serial" defaultValue="">
                <option value="">Select meter...</option>
                {(meters ?? []).map((m) => (
                  <option key={m.id} value={m.id}>{m.id} — {m.location}</option>
                ))}
              </Select>
            </InputGroup>
          </div>
          {formError && <p className="text-sm" style={{ color: '#f28b82', marginTop: 12 }}>{formError}</p>}
          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save consumer'}</Button>
            <Button href={ROUTES.admin.consumers} variant="secondary">Cancel</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
