import { api, toApiError } from "./client";

export interface User { id: string; name: string; email: string; role: "ADMIN" | "USER" }

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  try {
    return (await api.post("/auth/login", { email, password })).data.data;
  } catch (e) {
    const err = toApiError(e, "Unable to sign in right now. Please try again.");
    throw new Error(err.status === null ? "Unable to reach the server. Please try again." : err.message);
  }
}

export async function fetchMe(): Promise<User> {
  return (await api.get("/auth/me")).data.data;
}

export async function logoutRequest(): Promise<void> {
  try { await api.post("/auth/logout"); } catch { /* the local session is cleared regardless */ }
}
