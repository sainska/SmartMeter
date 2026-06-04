'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { IdleGuard } from '@/components/auth/IdleGuard';

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <IdleGuard>
          <RequireAuth>{children}</RequireAuth>
        </IdleGuard>
      </AuthProvider>
    </ThemeProvider>
  );
}
