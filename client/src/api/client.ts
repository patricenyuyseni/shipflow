import axios from "axios";

// The short-lived access token lives in memory only (never in web storage), so scripts can't steal a long-lived credential.
// A rotating httpOnly cookie, which JavaScript can't read, lets the app get a new access token when needed.
let accessToken: string | null = null;
const HINT_KEY = "shipflow.hasSession"; // non-secret hint so signed-out visitors don't trigger needless refresh calls
export const tokenStore = {
  get: () => accessToken,
  set: (t: string) => { accessToken = t; localStorage.setItem(HINT_KEY, "1"); },
  clear: () => { accessToken = null; localStorage.removeItem(HINT_KEY); },
  hasSessionHint: () => localStorage.getItem(HINT_KEY) === "1",
};

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "/api";

// Only a public base URL lives in the client. Secrets stay on the server.
export const api = axios.create({ baseURL, timeout: 15000, withCredentials: true });

export interface SessionData { token: string; user: { id: string; name: string; email: string; role: "ADMIN" | "USER" } }

let refreshing: Promise<SessionData | null> | null = null;
// One in-flight refresh is shared by every request that needs it (the server rotates the cookie on each call).
export function refreshSession(): Promise<SessionData | null> {
  refreshing ??= axios
    .post(`${baseURL}/auth/refresh`, {}, { withCredentials: true, timeout: 15000 })
    .then((r) => { const d = r.data.data as SessionData; tokenStore.set(d.token); return d; })
    .catch(() => { tokenStore.clear(); return null; })
    .finally(() => { refreshing = null; });
  return refreshing;
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(undefined, async (error) => {
  const cfg = error.config as (typeof error.config & { _retried?: boolean }) | undefined;
  const isAuthCall = cfg?.url?.startsWith("/auth/login") || cfg?.url?.startsWith("/auth/register");
  if (error.response?.status === 401 && cfg && !cfg._retried && !isAuthCall) {
    cfg._retried = true;
    const session = await refreshSession();
    if (session) {
      cfg.headers.Authorization = `Bearer ${session.token}`;
      return api(cfg);
    }
  }
  return Promise.reject(error);
});

export class ApiError extends Error {
  status: number | null;
  code?: string;
  constructor(status: number | null, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function toApiError(err: unknown, fallback: string): ApiError {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status ?? null;
    const e = (err.response?.data as { error?: { message?: string; code?: string } } | undefined)?.error;
    return new ApiError(status, e?.message ?? fallback, e?.code);
  }
  return new ApiError(null, fallback);
}
