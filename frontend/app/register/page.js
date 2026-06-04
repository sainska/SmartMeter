'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button, Input, InputGroup, Select } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/lib/routes';
import { PROJECT_TOPIC } from '@/lib/config';
import { getRoleHome } from '@/lib/roles';

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'consumer',
    regType: 'consumer',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const roleMap = { consumer: 'consumer', staff: 'admin', installer: 'technician' };
      const role = roleMap[form.regType] || 'consumer';
      const me = await signUp({
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        role,
      });
      router.replace(getRoleHome(me?.profile?.role ?? role));
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Register" subtitle={`Create your account — ${PROJECT_TOPIC}`}>
      <form onSubmit={handleSubmit}>
        <InputGroup label="Registration type" id="reg-type">
          <Select
            id="reg-type"
            value={form.regType}
            onChange={(e) => setForm({ ...form, regType: e.target.value })}
          >
            <option value="consumer">Consumer</option>
            <option value="staff">Utility staff</option>
            <option value="installer">Meter installer</option>
          </Select>
        </InputGroup>

        <div style={{ marginTop: 12 }}>
          <InputGroup label="Full name" id="name">
            <Input id="name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          </InputGroup>
        </div>
        <div style={{ marginTop: 12 }}>
          <InputGroup label="Email" id="email">
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </InputGroup>
        </div>
        <div style={{ marginTop: 12 }}>
          <InputGroup label="Phone" id="phone">
            <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </InputGroup>
        </div>
        <div style={{ marginTop: 12 }}>
          <InputGroup label="Password" id="password">
            <Input id="password" type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </InputGroup>
        </div>

        {error && <p className="text-sm" style={{ color: '#f28b82', marginTop: 12 }}>{error}</p>}

        <div style={{ marginTop: '1.25rem' }}>
          <Button type="submit" block disabled={submitting}>
            {submitting ? 'Creating account...' : 'Register'}
          </Button>
        </div>
      </form>

      <p className="text-sm text-muted" style={{ textAlign: 'center', marginTop: 16 }}>
        Already registered? <Link href={ROUTES.login}>Sign in</Link>
      </p>
    </AuthLayout>
  );
}
