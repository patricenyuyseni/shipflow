
import { api, toApiError } from "./client";
import type { ShipmentStatus } from "./tracking";

export type ServiceLevel = "STANDARD" | "EXPRESS" | "PRIORITY";
export type Currency = "USD" | "EUR";
export type PaymentStatus = "PENDING" | "PAID" | "UNPAID";

export interface Shipment {
  id: string;
  trackingNumber: string;
  receiptNumber: string | null;

  status: ShipmentStatus;

  senderName: string;
  senderEmail: string | null;
  senderPhone: string | null;

  recipientName: string;
  recipientEmail: string | null;
  recipientPhone: string | null;

  origin: string;
  destination: string;

  currentLocation: string | null;
  estimatedDelivery: string | null;

  packageWeight: number;
  packageLength: number;
  packageWidth: number;
  packageHeight: number;

  serviceLevel: ServiceLevel;
  shippingCost: number;
  currency: Currency;
  paymentStatus: PaymentStatus;

  createdAt: string;
  updatedAt: string;
}

export interface HistoryEntry {
  id: string;
  previousStatus: ShipmentStatus | null;
  newStatus: ShipmentStatus;
  location: string | null;
  description: string | null;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
  } | null;
}

export interface ShipmentPage {
  items: Shipment[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type NewShipment = Pick<
  Shipment,
  | "senderName"
  | "recipientName"
  | "origin"
  | "destination"
  | "packageWeight"
  | "packageLength"
  | "packageWidth"
  | "packageHeight"
  | "serviceLevel"
  | "shippingCost"
  | "currency"
  | "paymentStatus"
> &
  Partial<
    Pick<
      Shipment,
      | "senderEmail"
      | "senderPhone"
      | "recipientEmail"
      | "recipientPhone"
      | "currentLocation"
    >
  > & {
    estimatedDelivery?: string;
  };

async function call<T>(
  fn: () => Promise<{ data: { data: T } }>,
  fallback: string,
): Promise<T> {
  try {
    return (await fn()).data.data;
  } catch (e) {
    throw new Error(toApiError(e, fallback).message);
  }
}

export const listShipments = (p: {
  page: number;
  limit?: number;
  status?: string;
  search?: string;
}) =>
  call<ShipmentPage>(
    () =>
      api.get("/shipments", {
        params: {
          ...p,
          status: p.status || undefined,
          search: p.search || undefined,
        },
      }),
    "Unable to load shipments.",
  );

export interface Stats {
  total: number;
  byStatus: Record<ShipmentStatus, number>;
  recent: Shipment[];
}

export const getStats = () =>
  call<Stats>(
    () => api.get("/shipments/stats"),
    "Unable to load the overview.",
  );

export const getShipment = (id: string) =>
  call<Shipment>(
    () => api.get(`/shipments/${id}`),
    "Unable to load this shipment.",
  );

export const getHistory = (id: string) =>
  call<HistoryEntry[]>(
    () => api.get(`/shipments/${id}/history`),
    "Unable to load shipment history.",
  );

export const createShipment = (data: NewShipment) =>
  call<Shipment>(
    () => api.post("/shipments", data),
    "Shipment could not be created.",
  );

export const updateShipment = (
  id: string,
  data: Partial<NewShipment>,
) =>
  call<Shipment>(
    () => api.patch(`/shipments/${id}`, data),
    "Changes could not be saved.",
  );

export const changeStatus = (
  id: string,
  data: {
    status: ShipmentStatus;
    location?: string;
    description?: string;
  },
) =>
  call<Shipment>(
    () => api.patch(`/shipments/${id}/status`, data),
    "Status could not be updated.",
  );

export const deleteShipment = (id: string) =>
  call<{ deleted: boolean }>(
    () => api.delete(`/shipments/${id}`),
    "Shipment could not be deleted.",
  );

export const NEXT_STATUSES: Record<
  ShipmentStatus,
  ShipmentStatus[]
> = {
  CREATED: ["PICKED_UP", "CANCELLED"],
  PICKED_UP: ["IN_TRANSIT", "CANCELLED"],
  IN_TRANSIT: ["OUT_FOR_DELIVERY", "CANCELLED"],
  OUT_FOR_DELIVERY: [
    "DELIVERED",
    "IN_TRANSIT",
    "CANCELLED",
  ],
  DELIVERED: [],
  CANCELLED: [],
};

const EXPORT_PAGE_SIZE = 100;
const EXPORT_MAX_PAGES = 50;

export async function fetchAllShipments(filter: {
  status?: string;
  search?: string;
}): Promise<{
  rows: Shipment[];
  truncated: boolean;
}> {
  const rows: Shipment[] = [];

  let page = 1;
  let totalPages = 1;

  do {
    const result = await listShipments({
      ...filter,
      page,
      limit: EXPORT_PAGE_SIZE,
    });

    rows.push(...result.items);
    totalPages = result.totalPages;
    page += 1;
  } while (
    page <= totalPages &&
    page <= EXPORT_MAX_PAGES
  );

  return {
    rows,
    truncated: totalPages > EXPORT_MAX_PAGES,
  };
}
