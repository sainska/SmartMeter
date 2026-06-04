'use client';

import { useEffect, useState } from 'react';
import { AuthBackground } from '@/components/auth/AuthBackground';
import { IconMeter, IconCheck } from '@/components/icons';
import { APP_VERSION, PROJECT_TOPIC, PROJECT_TAGLINE } from '@/lib/config';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/routes';
import styles from '@/components/layout/layout.module.css';
import { Button } from '@/components/ui';

export default function SplashPage() {
  const [version, setVersion] = useState(APP_VERSION);
  const [checks, setChecks] = useState([
    { label: 'Checking connectivity', done: false },
    { label: 'Validating app version', done: false },
    { label: 'Loading configuration', done: false },
  ]);

  useEffect(() => {
    api.settings().then((s) => setVersion(s.version ?? APP_VERSION)).catch(() => {});
  }, []);

  useEffect(() => {
    const timers = [0, 1, 2].map((i) =>
      setTimeout(() => {
        setChecks((prev) =>
          prev.map((c, j) => (j <= i ? { ...c, done: true } : c)),
        );
      }, (i + 1) * 600),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const allDone = checks.every((c) => c.done);

  return (
    <div className={styles.splashScreenFuturistic}>
      <AuthBackground />
      <div className={styles.splashContent}>
        <div className={styles.splashLogo}>
          <IconMeter size={40} />
        </div>
        <h1 className={styles.splashTitle}>{PROJECT_TOPIC}</h1>
        <p className={styles.splashTagline}>{PROJECT_TAGLINE}</p>
        <p className="text-sm" style={{ marginTop: 8, opacity: 0.7 }}>
          Version {version}
        </p>

        <div className={styles.splashChecks}>
          {checks.map((c) => (
            <div key={c.label} className={styles.splashCheck}>
              {c.done ? <IconCheck size={18} /> : <span style={{ width: 18 }} />}
              {c.label}
            </div>
          ))}
        </div>

        {allDone && (
          <div style={{ marginTop: '2rem', width: '100%', maxWidth: 280 }}>
            <Button href={ROUTES.onboarding} block>
              Continue
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
