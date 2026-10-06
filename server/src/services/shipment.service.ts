
import { Prisma, type ShipmentStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/errors";

// Allowed status transitions.
// DELIVERED and CANCELLED are terminal states.
const TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  CREATED: ["PICKED_UP", "CANCELLED"],
  PICKED_UP: ["IN_TRANSIT", "CANCELLED"],
  IN_TRANSIT: ["OUT_FOR_DELIVERY", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "IN_TRANSIT", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

// Generate a unique tracking number such as SF-7H3K9M2P.
async function nextTrackingNumber(tx: Prisma.TransactionClient) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  for (let attempt = 0; attempt < 10; attempt += 1) {
    let code = "";

    for (let i = 0; i < 8; i += 1) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    const trackingNumber = `SF-${code}`;

    const existing = await tx.shipment.findUnique({
      where: { trackingNumber },
      select: { id: true },
    });

    if (!existing) {
      return trackingNumber;
    }
  }

  throw new AppError(
    500,
    "TRACKING_NUMBER_GENERATION_FAILED",
    "Unable to generate a unique tracking number",
  );
}

// Generate a unique receipt number such as SF-REC-A7K92M4Q.
async function nextReceiptNumber(tx: Prisma.TransactionClient) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  for (let attempt = 0; attempt < 10; attempt += 1) {
    let code = "";

    for (let i = 0; i < 8; i += 1) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    const receiptNumber = `SF-REC-${code}`;

    const existing = await tx.shipment.findUnique({
      where: { receiptNumber },
      select: { id: true },
    });

    if (!existing) {
      return receiptNumber;
    }
  }

  throw new AppError(
    500,
    "RECEIPT_NUMBER_GENERATION_FAILED",
    "Unable to generate a unique receipt number",
  );
}

export async function createShipment(
  data: Omit<
    Prisma.ShipmentUncheckedCreateInput,
    "trackingNumber" | "receiptNumber"
  >,
  userId: string,
) {
  return prisma.$transaction(async (tx) => {
    const trackingNumber = await nextTrackingNumber(tx);
    const receiptNumber = await nextReceiptNumber(tx);

    return tx.shipment.create({
      data: {
        ...data,
        trackingNumber,
        receiptNumber,
        status: "CREATED",
        createdById: userId,

        history: {
          create: {
            previousStatus: null,
            newStatus: "CREATED",
            location: data.currentLocation ?? data.origin,
            description: "Shipment created",
            createdById: userId,
          },
        },
      },
    });
  });
}

export async function listShipments(q: {
  page: number;
  limit: number;
  status?: ShipmentStatus;
  search?: string;
}) {
  const where: Prisma.ShipmentWhereInput = {
    ...(q.status ? { status: q.status } : {}),
    ...(q.search
      ? {
          OR: [
            {
              trackingNumber: {
                contains: q.search,
                mode: "insensitive",
              },
            },
            {
              receiptNumber: {
                contains: q.search,
                mode: "insensitive",
              },
            },
            {
              senderName: {
                contains: q.search,
                mode: "insensitive",
              },
            },
            {
              recipientName: {
                contains: q.search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.shipment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (q.page - 1) * q.limit,
      take: q.limit,
    }),
    prisma.shipment.count({ where }),
  ]);

  return {
    items,
    page: q.page,
    limit: q.limit,
    total,
    totalPages: Math.ceil(total / q.limit),
  };
}

export async function getShipment(id: string) {
  const shipment = await prisma.shipment.findUnique({
    where: { id },
  });

  if (!shipment) {
    throw new AppError(
      404,
      "SHIPMENT_NOT_FOUND",
      "Shipment not found",
    );
  }

  return shipment;
}

export async function updateShipment(
  id: string,
  data: Prisma.ShipmentUpdateInput,
) {
  await getShipment(id);

  return prisma.shipment.update({
    where: { id },
    data,
  });
}

export async function deleteShipment(id: string) {
  await getShipment(id);

  await prisma.shipment.delete({
    where: { id },
  });
}

export async function getHistory(id: string) {
  await getShipment(id);

  return prisma.trackingHistory.findMany({
    where: { shipmentId: id },
    orderBy: { createdAt: "asc" },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function changeStatus(
  id: string,
  input: {
    status: ShipmentStatus;
    location?: string;
    description?: string;
  },
  userId: string,
) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.shipment.findUnique({
      where: { id },
    });

    if (!current) {
      throw new AppError(
        404,
        "SHIPMENT_NOT_FOUND",
        "Shipment not found",
      );
    }

    if (!TRANSITIONS[current.status].includes(input.status)) {
      throw new AppError(
        409,
        "INVALID_STATUS_TRANSITION",
        `Cannot change status from ${current.status} to ${input.status}`,
      );
    }

    // Prevent concurrent updates from overwriting one another.
    const updated = await tx.shipment.updateMany({
      where: {
        id,
        status: current.status,
      },
      data: {
        status: input.status,
        ...(input.location
          ? { currentLocation: input.location }
          : {}),
      },
    });

    if (updated.count !== 1) {
      throw new AppError(
        409,
        "CONFLICT",
        "Shipment was updated by someone else. Reload and try again.",
      );
    }

    await tx.trackingHistory.create({
      data: {
        shipmentId: id,
        previousStatus: current.status,
        newStatus: input.status,
        location:
          input.location ?? current.currentLocation,
        description: input.description,
        createdById: userId,
      },
    });

    return tx.shipment.findUniqueOrThrow({
      where: { id },
    });
  });
}

// Public tracking view.
// Only customer-safe shipment information is returned.
export async function publicTracking(
  trackingNumber: string,
) {
  const shipment = await prisma.shipment.findUnique({
    where: { trackingNumber },
    select: {
      trackingNumber: true,
      status: true,
      origin: true,
      destination: true,
      currentLocation: true,
      estimatedDelivery: true,

      serviceLevel: true,
      currency: true,

      packageWeight: true,
      packageLength: true,
      packageWidth: true,
      packageHeight: true,

      history: {
        orderBy: { createdAt: "asc" },
        select: {
          previousStatus: true,
          newStatus: true,
          location: true,
          description: true,
          createdAt: true,
        },
      },
    },
  });

  if (!shipment) {
    throw new AppError(
      404,
      "TRACKING_NOT_FOUND",
      "No shipment found for that tracking number",
    );
  }

  const {
    packageWeight,
    packageLength,
    packageWidth,
    packageHeight,
    ...rest
  } = shipment;

  return {
    ...rest,
    package: {
      weight: packageWeight,
      length: packageLength,
      width: packageWidth,
      height: packageHeight,
    },
  };
}

const ALL_STATUSES: ShipmentStatus[] = [
  "CREATED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

export async function getStats() {
  const [counts, recent] = await Promise.all([
    Promise.all(
      ALL_STATUSES.map((status) =>
        prisma.shipment.count({
          where: { status },
        }),
      ),
    ),

    prisma.shipment.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const byStatus = Object.fromEntries(
    ALL_STATUSES.map((status, index) => [
      status,
      counts[index],
    ]),
  ) as Record<ShipmentStatus, number>;

  return {
    total: counts.reduce((a, b) => a + b, 0),
    byStatus,
    recent,
  };
}
