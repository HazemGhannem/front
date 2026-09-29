// What this browser remembers after signing in. The session token is a
// random per-browser credential issued by the backend at login (not your
// password, and not shared with any other device), so signing out here or
// from another device revokes only this browser.
const STORAGE_KEY = "home-relay-auth";

// The server address is baked in at build time (it isn't a secret), and can
// be overridden from the sign-in screen's "Server" field.
export const DEFAULT_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:8080";

export interface StoredAuth {
  serverUrl: string;
  sessionToken: string;
  email: string;
}

export function loadAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<StoredAuth> | null;
    if (!parsed || typeof parsed.serverUrl !== "string" || typeof parsed.sessionToken !== "string") return null;
    return { serverUrl: parsed.serverUrl, sessionToken: parsed.sessionToken, email: String(parsed.email ?? "") };
  } catch {
    return null;
  }
}

export function saveAuth(auth: StoredAuth): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  } catch {
    // private mode etc. — stays signed in for this tab only
  }
}

export function clearAuth(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Accepts "example.com", "https://example.com", or "wss://example.com". */
export function normalizeServerUrl(input: string): string {
  let url = input.trim().replace(/\/+$/, "");
  if (!/^[a-z]+:\/\//i.test(url)) url = `${/^(localhost|\d+\.\d+\.\d+\.\d+)(:|$)/.test(url) ? "http" : "https"}://${url}`;
  return url.replace(/^ws(s?):\/\//i, "http$1://");
}

export function toWebSocketUrl(serverUrl: string): string {
  return serverUrl.replace(/^http(s?):\/\//i, "ws$1://");
}
