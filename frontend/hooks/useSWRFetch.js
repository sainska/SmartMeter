'use client';

import useSWR from 'swr';

const defaultOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 10_000,
  keepPreviousData: true,
  errorRetryCount: 2,
};

export function useSWRFetch(key, fetcher, options = {}) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key ? key : null,
    key ? fetcher : null,
    { ...defaultOptions, ...options },
  );

  return {
    data: data ?? null,
    loading: isLoading && data === undefined,
    validating: isValidating,
    error: error?.message ?? null,
    reload: mutate,
  };
}
