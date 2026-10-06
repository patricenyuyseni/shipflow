
import { z } from "zod";

const optStr = z
  .string()
  .trim()
  .max(200)
  .optional()
  .or(z.literal("").transform(() => undefined));

const optEmail = z
  .string()
  .trim()
  .email()
  .max(200)
  .optional()
  .or(z.literal("").transform(() => undefined));

const req = (max = 200) =>
  z.string().trim().min(1, "Required").max(max);

const dim = z.coerce.number().positive().max(100000);

const shippingCost = z.coerce
  .number()
  .min(0, "Shipping cost cannot be negative")
  .max(1000000, "Shipping cost is too high");

export const registerSchema = z.object({
  name: req(100),
  email: z.string().trim().toLowerCase().email(),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(128),
});

export const shipmentBase = z.object({
  senderName: req(),
  senderEmail: optEmail,
  senderPhone: optStr,

  recipientName: req(),
  recipientEmail: optEmail,
  recipientPhone: optStr,

  origin: req(),
  destination: req(),

  packageWeight: dim,
  packageLength: dim,
  packageWidth: dim,
  packageHeight: dim,

  currentLocation: optStr,
  estimatedDelivery: z.coerce.date().optional(),

  serviceLevel: z
    .enum(["STANDARD", "EXPRESS", "PRIORITY"])
    .default("STANDARD"),

  shippingCost,

  currency: z
    .enum(["USD", "EUR"])
    .default("USD"),

  paymentStatus: z
    .enum(["PENDING", "PAID", "UNPAID"])
    .default("PENDING"),
});

export const createShipmentSchema = shipmentBase;

export const updateShipmentSchema = shipmentBase
  .partial()
  .refine(
    (v) => Object.keys(v).length > 0,
    "No fields to update",
  );

export const statusEnum = z.enum([
  "CREATED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
]);

export const statusUpdateSchema = z.object({
  status: statusEnum,
  location: optStr,
  description: z.string().trim().max(500).optional(),
});

export const trackingNumberSchema = z
  .string()
  .trim()
  .regex(
    /^[A-Za-z0-9-]{6,40}$/,
    "Invalid tracking number",
  )
  .transform((s) => s.toUpperCase());

export const idSchema = z.string().uuid("Invalid id");

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: statusEnum.optional(),
  search: z.string().trim().max(100).optional(),
});

export const roleUpdateSchema = z.object({
  role: z.enum(["ADMIN", "USER"]),
});
