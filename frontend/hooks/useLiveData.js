'use client';

import { useSWRFetch } from './useSWRFetch';

/**
 * Cached live API data. Pass a stable cache key as first dep string for faster reuse.
 * @example useLiveData(() => api.bills(), ['bills'])
 */
export function useLiveData(fetcher, deps = []) {
  const cacheKey =
    typeof deps[0] === 'string'
      ? `live:${deps[0]}`
      : `live:${deps[1] ?? fetcher.name ?? 'fetch'}`;
  const { data, loading, error, reload } = useSWRFetch(cacheKey, fetcher);
  return { data, loading, error, reload };
}
