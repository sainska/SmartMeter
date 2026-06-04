'use client';

import { useEffect, useRef, useCallback } from 'react';

const EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

/**
 * Signs user out after period of inactivity (security).
 */
export function useIdleLogout({ enabled, onIdle, timeoutMs = 10 * 60 * 1000 }) {
  const timerRef = useRef(null);
  const onIdleRef = useRef(onIdle);

  onIdleRef.current = onIdle;

  const resetTimer = useCallback(() => {
    if (!enabled) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onIdleRef.current?.();
    }, timeoutMs);
  }, [enabled, timeoutMs]);

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return undefined;
    }

    resetTimer();

    const handler = () => resetTimer();
    EVENTS.forEach((e) => window.addEventListener(e, handler, { passive: true }));

    const onVisibility = () => {
      if (document.visibilityState === 'visible') resetTimer();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      EVENTS.forEach((e) => window.removeEventListener(e, handler));
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, resetTimer]);
}
