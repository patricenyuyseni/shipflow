import { api, toApiError } from "./client";

export interface ProviderInfo { name: string; configured: boolean }

export async function listProviders(): Promise<ProviderInfo[]> {
  try { return (await api.get("/providers")).data.data; }
  catch (e) { throw new Error(toApiError(e, "Unable to load carriers.").message); }
}
