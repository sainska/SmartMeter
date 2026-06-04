'use client';

import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui';
import ui from '@/components/ui/ui.module.css';
import { ROUTES } from '@/lib/routes';

export default function OtpPage() {
  const router = useRouter();

  const handleVerify = (e) => {
    e.preventDefault();
    router.push(ROUTES.roleSelection);
  };

  return (
    <AuthLayout title="Verify OTP" subtitle="Enter the code sent via SMS or email">
      <form onSubmit={handleVerify}>
        <div className={ui.otpInputs}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <input
              key={i}
              className={ui.otpInput}
              maxLength={1}
              inputMode="numeric"
              pattern="[0-9]"
              required
              aria-label={`Digit ${i + 1}`}
              style={{
                background: 'rgba(6, 14, 12, 0.6)',
                borderColor: 'rgba(72, 187, 140, 0.3)',
                color: '#e8f2ef',
              }}
            />
          ))}
        </div>

        <p className="text-sm text-muted" style={{ textAlign: 'center', marginTop: 16 }}>
          SMS or email OTP. Offline verification completes on next sync.
        </p>

        <div style={{ marginTop: '1.25rem' }}>
          <Button type="submit" block>
            Verify and continue
          </Button>
        </div>
      </form>

      <p className="text-sm text-muted" style={{ textAlign: 'center', marginTop: 12 }}>
        <Button type="button" variant="ghost" sm onClick={() => router.push(ROUTES.roleSelection)}>
          Use offline fallback
        </Button>
      </p>
    </AuthLayout>
  );
}
