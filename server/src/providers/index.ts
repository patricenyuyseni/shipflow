import { AppError } from "../utils/errors";

// Carrier adapters are optional and independent from ShipFlow's internal tracking.
export interface CarrierProvider {
  name: string;
  isConfigured(): boolean;
  getRates(request: unknown): Promise<unknown[]>;
  track(trackingNumber: string): Promise<unknown>;
}

function stub(name: string, envKey: string): CarrierProvider {
  const notConfigured = () =>
    new AppError(503, "PROVIDER_NOT_CONFIGURED", `${name} is not configured. Set ${envKey} on the server to enable it.`);
  return {
    name,
    isConfigured: () => !!process.env[envKey],
    // Real carrier calls plug in here once credentials exist; no fake data is ever returned.
    async getRates() { throw notConfigured(); },
    async track() { throw notConfigured(); },
  };
}

export const providers: CarrierProvider[] = [
  stub("DHL", "DHL_API_KEY"),
  stub("FedEx", "FEDEX_API_KEY"),
  stub("UPS", "UPS_API_KEY"),
  stub("USPS", "USPS_API_KEY"),
];

export const listProviders = () => providers.map((p) => ({ name: p.name, configured: p.isConfigured() }));
