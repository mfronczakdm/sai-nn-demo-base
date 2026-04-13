'use client';

import type React from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  clearDemoUser,
  readDemoUserFromStorage,
  setDemoUserEmail,
  subscribeDemoAuth,
  type DemoUser,
} from '@/lib/demo-auth';

export type AuthContextValue = {
  user: DemoUser | null;
  /** False until client has read localStorage (avoids login/logged-in flicker). */
  isReady: boolean;
  login: (email: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getHomeHrefFromWindow(): string {
  if (typeof window === 'undefined') return '/';
  const segments = window.location.pathname.split('/').filter(Boolean);
  if (segments.length >= 2) return `/${segments[0]}/${segments[1]}`;
  return '/';
}

export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactNode {
  const router = useRouter();
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  const syncFromStorage = useCallback(() => {
    setUser(readDemoUserFromStorage());
  }, []);

  useEffect(() => {
    syncFromStorage();
    setIsReady(true);
  }, [syncFromStorage]);

  useEffect(() => subscribeDemoAuth(syncFromStorage), [syncFromStorage]);

  const login = useCallback((email: string) => {
    setDemoUserEmail(email);
  }, []);

  const logout = useCallback(() => {
    clearDemoUser();
    router.push(getHomeHrefFromWindow());
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isReady,
      login,
      logout,
    }),
    [user, isReady, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
