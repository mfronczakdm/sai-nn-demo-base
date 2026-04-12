'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';

import {
  DEMO_AUTH_STORAGE_KEY,
  getDemoPersonaForEmail,
  getDemoUserEmail,
  refreshDemoAuthSubscribers,
  subscribeDemoAuth,
  type DemoPersona,
} from '@/lib/demo-auth';

export type UseDemoPersonaResult = {
  email: string | null;
  persona: DemoPersona;
  isStudent: boolean;
  /** Notify subscribers without changing storage (devtools / tests). */
  refresh: () => void;
};

export function useDemoPersona(): UseDemoPersonaResult {
  const email = useSyncExternalStore(subscribeDemoAuth, getDemoUserEmail, () => null);
  const persona = getDemoPersonaForEmail(email);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === DEMO_AUTH_STORAGE_KEY) {
        refreshDemoAuthSubscribers();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const refresh = useCallback(() => {
    refreshDemoAuthSubscribers();
  }, []);

  return {
    email,
    persona,
    isStudent: persona === 'student',
    refresh,
  };
}
