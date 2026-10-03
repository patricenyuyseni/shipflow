import { Prisma, type ShipmentStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/errors";

// Allowed forward transitions. DELIVERED and CANCELLED are terminal.
const TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  CREATED: ["PICKED_UP", "CANCELLED"],
  PICKED_UP: ["IN_TRANSIT", "CANCELLED"],
  IN_TRANSIT: ["OUT_FOR_DELIVERY", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "IN_TRANSIT", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

// EXO-<year>-<6-digit sequence>. The counter row is incremented atomically inside the caller's transaction.
async function nextTrackingNumber(tx: Prisma.TransactionClient) {
  const year = new Date().getFullYear();
  const row = await tx.trackingCounter.upsert({
    where: { year },
    create: { year, value: 1 },
    update: { value: { increment: 1 } },
  });
  return `EXO-${year}-${String(row.value).padStart(6, "0")}`;
}

export async function createShipment(data: Omit<Prisma.ShipmentUncheckedCreateInput, "trackingNumber">, userId: string) {
  return prisma.$transaction(async (tx) => {
    const trackingNumber = await nextTrackingNumber(tx);
    return tx.shipment.create({
      data: {
        ...data,
        trackingNumber,
        status: "CREATED",
        createdById: userId,
        history: {
          create: { previousStatus: null, newStatus: "CREATED", location: data.currentLocation ?? data.origin, description: "Shipment created", createdById: userId },
        },
      },
    });
  });
}

export async function listShipments(q: { page: number; limit: number; status?: ShipmentStatus; search?: string }) {
  const where: Prisma.ShipmentWhereInput = {
    ...(q.status ? { status: q.status } : {}),
    ...(q.search
      ? { OR: [
          { trackingNumber: { contains: q.search, mode: "insensitive" } },
          { senderName: { contains: q.search, mode: "insensitive" } },
          { recipientName: { contains: q.search, mode: "insensitive" } },
        ] }
      : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.shipment.findMany({ where, orderBy: { createdAt: "desc" }, skip: (q.page - 1) * q.limit, take: q.limit }),
    prisma.shipment.count({ where }),
  ]);
  return { items, page: q.page, limit: q.limit, total, totalPages: Math.ceil(total / q.limit) };
}

export async function getShipment(id: string) {
  const s = await prisma.shipment.findUnique({ where: { id } });
  if (!s) throw new AppError(404, "SHIPMENT_NOT_FOUND", "Shipment not found");
  return s;
}

export async function updateShipment(id: string, data: Prisma.ShipmentUpdateInput) {
  await getShipment(id);
  return prisma.shipment.update({ where: { id }, data });
}

export async function deleteShipment(id: string) {
  await getShipment(id);
  await prisma.shipment.delete({ where: { id } });
}

export async function getHistory(id: string) {
  await getShipment(id);
  return prisma.trackingHistory.findMany({
    where: { shipmentId: id },
    orderBy: { createdAt: "asc" },
    include: { createdBy: { select: { id: true, name: true } } },
  });
}

export async function changeStatus(id: string, input: { status: ShipmentStatus; location?: string; description?: string }, userId: string) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.shipment.findUnique({ where: { id } });
    if (!current) throw new AppError(404, "SHIPMENT_NOT_FOUND", "Shipment not found");
    if (!TRANSITIONS[current.status].includes(input.status)) {
      throw new AppError(409, "INVALID_STATUS_TRANSITION", `Cannot change status from ${current.status} to ${input.status}`);
    }
    // Guard against concurrent updates: only update if the status is still what we read.
    const updated = await tx.shipment.updateMany({
      where: { id, status: current.status },
      data: { status: input.status, ...(input.location ? { currentLocation: input.location } : {}) },
    });
    if (updated.count !== 1) throw new AppError(409, "CONFLICT", "Shipment was updated by someone else. Reload and try again.");
    await tx.trackingHistory.create({
      data: { shipmentId: id, previousStatus: current.status, newStatus: input.status, location: input.location ?? current.currentLocation, description: input.description, createdById: userId },
    });
    return tx.shipment.findUniqueOrThrow({ where: { id } });
  });
}

// Public view: only fields safe to show anyone holding the tracking number.
export async function publicTracking(trackingNumber: string) {
  const s = await prisma.shipment.findUnique({
    where: { trackingNumber },
    select: {
      trackingNumber: true, status: true, origin: true, destination: true, currentLocation: true, estimatedDelivery: true,
      packageWeight: true, packageLength: true, packageWidth: true, packageHeight: true,
      history: { orderBy: { createdAt: "asc" }, select: { previousStatus: true, newStatus: true, location: true, description: true, createdAt: true } },
    },
  });
  if (!s) throw new AppError(404, "TRACKING_NOT_FOUND", "No shipment found for that tracking number");
  const { packageWeight, packageLength, packageWidth, packageHeight, ...rest } = s;
  return { ...rest, package: { weight: packageWeight, length: packageLength, width: packageWidth, height: packageHeight } };
}

const ALL_STATUSES: ShipmentStatus[] = ["CREATED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

export async function getStats() {
  const [counts, recent] = await Promise.all([
    Promise.all(ALL_STATUSES.map((status) => prisma.shipment.count({ where: { status } }))),
    prisma.shipment.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  const byStatus = Object.fromEntries(ALL_STATUSES.map((s, i) => [s, counts[i]])) as Record<ShipmentStatus, number>;
  return { total: counts.reduce((a, b) => a + b, 0), byStatus, recent };
}
