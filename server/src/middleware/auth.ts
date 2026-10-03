import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";
import { verifyToken } from "../utils/jwt";

declare module "express-serve-static-core" {
  interface Request {
    user?: { id: string; role: "ADMIN" | "USER" };
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return next(new AppError(401, "UNAUTHENTICATED", "Authentication required"));
  try {
    const p = verifyToken(header.slice(7));
    req.user = { id: p.sub, role: p.role };
    next();
  } catch {
    next(new AppError(401, "INVALID_TOKEN", "Your session is invalid or has expired"));
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role !== "ADMIN") return next(new AppError(403, "FORBIDDEN", "Administrator access required"));
  next();
}
