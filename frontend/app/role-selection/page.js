'use client';

import { useState, useEffect } from 'react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui';
import { ROLE_LIST } from '@/lib/roles';
import { useAuth } from '@/context/AuthContext';
import styles from '@/components/layout/layout.module.css';

export default function RoleSelectionPage() {
  const [selected, setSelected] = useState('consumer');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { setRole, profile, isAuthenticated } = useAuth();

  useEffect(() => {
    if (profile?.role) setSelected(profile.role);
  }, [profile?.role]);

  const handleEnter = async () => {
    if (!isAuthenticated) return;
    setSubmitting(true);
    setError('');
    try {
      await setRole(selected);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Select your role" subtitle={`Signed in as ${profile?.email ?? 'user'}`}>
      {ROLE_LIST.map((role) => (
        <button
          key={role.id}
          type="button"
          className={`${styles.roleCard} ${styles.roleCardDark} ${selected === role.id ? styles.roleCardSelected : ''}`}
          onClick={() => setSelected(role.id)}
        >
          <h3>{role.title}</h3>
          <p className="text-sm text-muted">{role.desc}</p>
        </button>
      ))}

      {error && <p className="text-sm" style={{ color: '#f28b82', marginTop: 12 }}>{error}</p>}

      <div style={{ marginTop: '1.25rem' }}>
        <Button block onClick={handleEnter} disabled={submitting || !isAuthenticated}>
          {submitting ? 'Loading portal...' : 'Enter platform'}
        </Button>
      </div>
    </AuthLayout>
  );
}
