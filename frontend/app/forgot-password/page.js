'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button, Input, InputGroup } from '@/components/ui';
import { supabase } from '@/lib/supabase/client';
import { ROUTES } from '@/lib/routes';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });
      if (resetError) throw resetError;
      setMessage('Check your email for a password reset link.');
    } catch (err) {
      setError(err.message || 'Could not send reset email');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Reset password" subtitle="Recover access to your account">
      <form onSubmit={handleSubmit}>
        <InputGroup label="Email address" id="email">
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </InputGroup>

        {error && <p className="text-sm" style={{ color: '#f28b82', marginTop: 12 }}>{error}</p>}
        {message && <p className="text-sm" style={{ color: '#81c995', marginTop: 12 }}>{message}</p>}

        <div style={{ marginTop: '1.25rem' }}>
          <Button type="submit" block disabled={submitting}>
            {submitting ? 'Sending...' : 'Send reset link'}
          </Button>
        </div>
      </form>

      <p className="text-sm text-muted" style={{ textAlign: 'center', marginTop: 16 }}>
        <Link href={ROUTES.login}>Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}
