'use client';

import { useState } from 'react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui';
import { onboardingSlides, PROJECT_TOPIC } from '@/lib/config';
import { ROUTES } from '@/lib/routes';
import { IconMeter, IconWifi, IconBill } from '@/components/icons';
import styles from '@/components/layout/layout.module.css';
import ui from '@/components/ui/ui.module.css';

const icons = [IconMeter, IconWifi, IconBill];

export default function OnboardingPage() {
  const [slide, setSlide] = useState(0);
  const current = onboardingSlides[slide];
  const Icon = icons[slide];

  return (
    <AuthLayout title="Welcome" subtitle={PROJECT_TOPIC}>
      <div className={styles.onboardSlide}>
        <div className={styles.onboardIllustration}>
          <Icon size={48} />
        </div>
        <h2 style={{ marginBottom: 8 }}>{current.title}</h2>
        <p className="text-muted">{current.body}</p>
      </div>

      <div className={ui.slideDots}>
        {onboardingSlides.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`${ui.slideDot} ${slide === i ? ui.slideDotActive : ''}`}
            onClick={() => setSlide(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: 10 }}>
        {slide > 0 && (
          <Button variant="secondary" onClick={() => setSlide(slide - 1)}>
            Back
          </Button>
        )}
        {slide < onboardingSlides.length - 1 ? (
          <Button block onClick={() => setSlide(slide + 1)}>
            Next
          </Button>
        ) : (
          <Button href={ROUTES.login} block>
            Get started
          </Button>
        )}
      </div>
      <p style={{ textAlign: 'center', marginTop: 12 }}>
        <Button href={ROUTES.login} variant="ghost" sm>
          Skip introduction
        </Button>
      </p>
    </AuthLayout>
  );
}
