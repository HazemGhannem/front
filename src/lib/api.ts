import type { PcSummary } from "./protocol/messages";

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function request<T>(serverUrl: string, path: string, init: { method?: string; body?: unknown; token?: string } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${serverUrl}${path}`, {
      method: init.method ?? (init.body ? "POST" : "GET"),
      headers: {
        "Content-Type": "application/json",
        ...(init.token ? { Authorization: `Bearer ${init.token}` } : {}),
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection or the server address.", 0);
  }
  const text = await res.text();
  const data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  if (!res.ok) throw new ApiError(typeof data.error === "string" ? data.error : `Request failed (${res.status})`, res.status);
  return data as T;
}

export interface AuthResult {
  token: string;
  user: { id: string; email: string };
}

/** A friendly label for this sign-in, shown if we later list active sessions. */
function describeBrowser(): string {
  if (typeof navigator === "undefined") return "Browser";
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "Mac" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Linux/.test(ua) ? "Linux" : "";
  return os ? `${browser} on ${os}` : browser;
}

export const api = {
  register: (serverUrl: string, email: string, password: string) =>
    request<AuthResult>(serverUrl, "/api/auth/register", { body: { email, password, deviceName: describeBrowser() } }),
  login: (serverUrl: string, email: string, password: string) =>
    request<AuthResult>(serverUrl, "/api/auth/login", { body: { email, password, deviceName: describeBrowser() } }),
  logout: (serverUrl: string, token: string) =>
    request<void>(serverUrl, "/api/auth/logout", { method: "POST", token }),
  linkPc: (serverUrl: string, token: string, code: string) =>
    request<{ pc: { id: string; name: string } }>(serverUrl, "/api/pairing/claim", { body: { code }, token }),
  unlinkPc: (serverUrl: string, token: string, pcId: string) =>
    request<void>(serverUrl, `/api/pcs/${encodeURIComponent(pcId)}`, { method: "DELETE", token }),
  listPcs: (serverUrl: string, token: string) => request<{ pcs: PcSummary[] }>(serverUrl, "/api/pcs", { token }),
};
