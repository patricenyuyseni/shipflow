import { api, toApiError } from "./client";
import type { User } from "./auth";

export interface AccountUser extends User { createdAt: string }

export async function listUsers(): Promise<AccountUser[]> {
  try { return (await api.get("/users")).data.data; }
  catch (e) { throw new Error(toApiError(e, "Unable to load users.").message); }
}

export async function setRole(id: string, role: "ADMIN" | "USER"): Promise<AccountUser> {
  try { return (await api.patch(`/users/${id}/role`, { role })).data.data; }
  catch (e) { throw new Error(toApiError(e, "Role could not be updated.").message); }
}
