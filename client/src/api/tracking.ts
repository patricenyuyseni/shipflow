import { api, toApiError } from "./client";

export type ShipmentStatus = "CREATED" | "PICKED_UP" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";

export interface TrackingEvent {
  newStatus: ShipmentStatus;
  location: string | null;
  description: string | null;
  createdAt: string;
}

export interface TrackingResult {
  trackingNumber: string;
  status: ShipmentStatus;
  origin: string;
  destination: string;
  currentLocation: string | null;
  estimatedDelivery: string | null;
  history: TrackingEvent[];
}

export async function getTracking(trackingNumber: string): Promise<TrackingResult> {
  try {
    const res = await api.get(`/track/${encodeURIComponent(trackingNumber)}`);
    return (res.data?.data ?? res.data) as TrackingResult;
  } catch (err) {
    const e = toApiError(err, "Tracking information is temporarily unavailable.");
    if (e.status === 404) throw new Error("We couldn't find a shipment with that tracking number.");
    throw new Error(e.status === null ? "Tracking information is temporarily unavailable." : e.message);
  }
}
