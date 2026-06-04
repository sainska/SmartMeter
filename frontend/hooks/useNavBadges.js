'use client';

import { useSWRFetch } from './useSWRFetch';
import { api } from '@/lib/api';

export function useNavBadges(enabled = true) {
  return useSWRFetch(enabled ? 'nav-badges' : null, () => api.navBadges(), {
    dedupingInterval: 15_000,
    refreshInterval: 30_000,
  });
}
