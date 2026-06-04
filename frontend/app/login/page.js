'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button, Input, InputGroup } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { PROJECT_TOPIC } from '@/lib/config';
import { ROUTES } from '@/lib/routes';
import { getRoleHome } from '@/lib/roles';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signIn, profile, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated && profile?.role) {
      router.replace(getRoleHome(profile.role));
    }
  }, [loading, isAuthenticated, profile?.role, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const me = await signIn(email.trim(), password);
      const role = me?.profile?.role ?? 'consumer';
      router.replace(getRoleHome(role));
    } catch (err) {
      setError(err.message || 'Sign in failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Sign in" subtitle={`${PROJECT_TOPIC} — sign in with email and password`}>
      <form onSubmit={handleSubmit}>
        <InputGroup label="Email address" id="email">
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </InputGroup>
        <div style={{ marginTop: 12 }}>
          <InputGroup label="Password" id="password">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputGroup>
        </div>

        {error && <p className="text-sm" style={{ color: 'var(--color-danger)', marginTop: 12 }}>{error}</p>}

        <div style={{ marginTop: '1.25rem' }}>
          <Button type="submit" block disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </div>
      </form>

      <p className="text-sm text-muted" style={{ textAlign: 'center', marginTop: 16 }}>
        <Link href={ROUTES.forgotPassword}>Forgot password?</Link>
        {' · '}
        <Link href={ROUTES.register}>Create account</Link>
      </p>
    </AuthLayout>
  );
}
