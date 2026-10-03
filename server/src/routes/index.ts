import { Router } from "express";
import rateLimit from "express-rate-limit";
import { prisma } from "../config/prisma";
import { authenticate, requireAdmin } from "../middleware/auth";
import * as c from "../controllers";

const limiter = (windowMs: number, limit: number) =>
  rateLimit({ windowMs, limit, standardHeaders: true, legacyHeaders: false, message: { success: false, error: { code: "RATE_LIMITED", message: "Too many requests. Please try again shortly." } } });

export const router = Router();

router.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected", timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: "degraded", database: "unavailable", timestamp: new Date().toISOString() });
  }
});

router.post("/auth/register", limiter(15 * 60_000, 20), c.register);
router.post("/auth/login", limiter(15 * 60_000, 30), c.login);
router.post("/auth/refresh", limiter(15 * 60_000, 120), c.refresh);
router.post("/auth/logout", limiter(15 * 60_000, 60), c.logout);
router.get("/auth/me", authenticate, c.me);

router.get("/track/:trackingNumber", limiter(60_000, 60), c.publicTrack);

const admin = Router();
admin.use(authenticate, requireAdmin);
admin.post("/", c.createShipment);
admin.get("/", c.listShipments);
admin.get("/stats", c.shipmentStats); // must stay above "/:id"
admin.get("/:id", c.getShipment);
admin.patch("/:id", c.updateShipment);
admin.delete("/:id", c.deleteShipment);
admin.patch("/:id/status", c.changeStatus);
admin.get("/:id/history", c.getHistory);
router.use("/shipments", admin);

router.get("/users", authenticate, requireAdmin, c.listUsers);
router.patch("/users/:id/role", authenticate, requireAdmin, c.changeUserRole);

router.get("/providers", authenticate, requireAdmin, c.providerList);
