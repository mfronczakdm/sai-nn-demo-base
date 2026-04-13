/**
 * Client-only fake auth for Teradyne demos. Persists the signed-in demo email so
 * static experiences (search, preferences, downloads) can vary by persona.
 */
export const DEMO_AUTH_STORAGE_KEY = 'teradyne-demo-user-email';

type DemoAuthListener = () => void;
const demoAuthListeners = new Set<DemoAuthListener>();

function notifyDemoAuthListeners(): void {
  demoAuthListeners.forEach((listener) => listener());
}

/** Notify `useSyncExternalStore` subscribers (e.g. after manual localStorage edits in devtools). */
export function refreshDemoAuthSubscribers(): void {
  notifyDemoAuthListeners();
}

/** Subscribe to same-tab login changes (localStorage does not fire `storage` in-tab). */
export function subscribeDemoAuth(listener: DemoAuthListener): () => void {
  demoAuthListeners.add(listener);
  return () => {
    demoAuthListeners.delete(listener);
  };
}

/** Default demo — test engineering / enterprise portal persona. */
export const DEMO_LOGIN_EMAIL = 'demo@sitecore.com';

/** Second demo — university / student lab persona. */
export const DEMO2_LOGIN_EMAIL = 'demo2@sitecore.com';

export const DEMO_LOGIN_PASSWORD = 'password';

/** Demo session user surfaced in UI (auth header, etc.). */
export type DemoUser = {
  email: string;
  displayName: string;
};

export type DemoPersona = 'engineer' | 'student';

const DEMO_EMAILS = new Set([DEMO_LOGIN_EMAIL.toLowerCase(), DEMO2_LOGIN_EMAIL.toLowerCase()]);

export function isAllowedDemoEmail(email: string): boolean {
  return DEMO_EMAILS.has(email.trim().toLowerCase());
}

export function getDemoPersonaForEmail(email: string | null | undefined): DemoPersona {
  if (!email) return 'engineer';
  return email.trim().toLowerCase() === DEMO2_LOGIN_EMAIL.toLowerCase() ? 'student' : 'engineer';
}

export function getDemoUserEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(DEMO_AUTH_STORAGE_KEY);
}

/** Hardcoded friendly names for the two demo accounts. */
export function getDemoDisplayNameForEmail(email: string): string {
  const e = email.trim().toLowerCase();
  if (e === DEMO_LOGIN_EMAIL.toLowerCase()) return 'Demo User';
  if (e === DEMO2_LOGIN_EMAIL.toLowerCase()) return 'Demo User 2';
  const local = e.split('@')[0] || 'User';
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function readDemoUserFromStorage(): DemoUser | null {
  const email = getDemoUserEmail();
  if (!email) return null;
  return { email, displayName: getDemoDisplayNameForEmail(email) };
}

export function setDemoUserEmail(email: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DEMO_AUTH_STORAGE_KEY, email.trim().toLowerCase());
  notifyDemoAuthListeners();
}

export function clearDemoUser(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(DEMO_AUTH_STORAGE_KEY);
  notifyDemoAuthListeners();
}

/** True when password matches the shared demo password and email is an allowed demo account. */
export function validateDemoLogin(email: string, password: string): boolean {
  const e = email.trim().toLowerCase();
  return isAllowedDemoEmail(e) && password.trim() === DEMO_LOGIN_PASSWORD;
}

/**
 * Pre-selected Download Finder path per persona (indices into `TERADYNE_PORTFOLIO`).
 * Engineer: Semiconductor Test → Digital & Mixed-Signal SoC Test → UltraFLEX.
 * Student: Robotics → Universal Robots → UR5e.
 */
export function getDemoDownloadFinderSelection(persona: DemoPersona): {
  divisionIndex: number;
  categoryIndex: number;
  productIndex: number;
} {
  if (persona === 'student') {
    return { divisionIndex: 1, categoryIndex: 0, productIndex: 1 };
  }
  return { divisionIndex: 0, categoryIndex: 0, productIndex: 0 };
}
