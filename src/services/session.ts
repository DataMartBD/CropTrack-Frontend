import { jwtDecode } from "jwt-decode";

export const TOKEN_KEY = "jwtToken";
const USERNAME_KEY = "username";
const USER_KEY = "currentUser";

/** Treat a token as dead slightly before its real exp, to cover clock skew. */
const EXPIRY_SKEW_MS = 5_000;

/** setTimeout is 32-bit: anything past this fires immediately. */
const MAX_TIMEOUT_MS = 2_147_483_647;

type SessionPayload = {
  exp?: number;
  username?: string;
  user_role?: string;
};

export type ExpiryReason =
  | "expired" // the exp claim passed while the tab was open
  | "rejected"; // the server refused the token (401)

export function decodeToken(token: string): SessionPayload | null {
  try {
    return jwtDecode<SessionPayload>(token);
  } catch {
    return null;
  }
}

/**
 * Absolute expiry in ms, or null when the token carries no exp claim (in which
 * case only a server 401 can tell us it is dead).
 */
export function getTokenExpiryMs(token: string): number | null {
  const payload = decodeToken(token);
  if (!payload) return 0; // undecodable => already useless
  if (typeof payload.exp !== "number") return null;
  return payload.exp * 1000;
}

export function isTokenExpired(token: string): boolean {
  const expiresAt = getTokenExpiryMs(token);
  if (expiresAt === null) return false;
  return Date.now() >= expiresAt - EXPIRY_SKEW_MS;
}

/**
 * Evaluated once, at import time — before anything gets a chance to clear the
 * token — so the app can tell the user *why* it dropped them on the sign-in
 * page after a reload.
 */
export const bootedWithExpiredSession = (() => {
  const token = window.localStorage.getItem(TOKEN_KEY);
  return !!token && isTokenExpired(token);
})();

/** Reads the stored token, dropping it if it is already expired or unreadable. */
export function readStoredToken(): string | null {
  const token = window.localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  if (isTokenExpired(token)) {
    clearSession();
    return null;
  }
  return token;
}

export function storeToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
  hasBroadcast = false; // a fresh session may expire again later
}

export function clearSession(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USERNAME_KEY);
  window.localStorage.removeItem(USER_KEY);
}

/*
 * Cached profile. The backend has no "fetch me" endpoint — /api/user/ exposes
 * only login/, token/refresh/ and token/verify/ — so the user object handed
 * back at login is the only copy we ever get. Persist it or a reload loses it.
 */

export function storeUser(user: unknown): void {
  try {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // Quota or a non-serialisable payload: the session is still usable.
  }
}

/** Returns the cached profile, but only while a live token backs it. */
export function readStoredUser<T>(): T | null {
  if (!readStoredToken()) return null;

  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    window.localStorage.removeItem(USER_KEY);
    return null;
  }
}

/**
 * Chunked timer: schedules `onExpiry` for when the token dies, re-arming in
 * <=24 day slices so long-lived tokens do not overflow setTimeout and fire at
 * once. Returns a cancel function.
 */
export function scheduleExpiry(token: string, onExpiry: () => void): () => void {
  const expiresAt = getTokenExpiryMs(token);
  if (expiresAt === null) return () => {};

  let timer: ReturnType<typeof setTimeout>;

  const tick = () => {
    const msLeft = expiresAt - EXPIRY_SKEW_MS - Date.now();
    if (msLeft <= 0) {
      onExpiry();
      return;
    }
    timer = setTimeout(tick, Math.min(msLeft, MAX_TIMEOUT_MS));
  };

  tick();
  return () => clearTimeout(timer);
}

/*
 * Expiry broadcast — lets non-React modules (the axios interceptor) tell the
 * React tree that the session is gone, without importing a context.
 */

type ExpiryListener = (reason: ExpiryReason) => void;

const listeners = new Set<ExpiryListener>();
// A page firing five parallel requests gets five 401s; log out once.
let hasBroadcast = false;

export function onSessionExpired(listener: ExpiryListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function expireSession(reason: ExpiryReason): void {
  clearSession();
  if (hasBroadcast) return;
  hasBroadcast = true;
  listeners.forEach((listener) => listener(reason));
}
