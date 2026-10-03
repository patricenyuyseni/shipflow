import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { env } from "../config/env";
import { AppError } from "../utils/errors";

const body = (code: string, message: string, details?: unknown) => ({ success: false, error: { code, message, ...(details ? { details } : {}) } });

export function notFound(_req: Request, res: Response) {
  res.status(404).json(body("NOT_FOUND", "Route not found"));
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) return res.status(err.status).json(body(err.code, err.message, err.details));
  if (err instanceof SyntaxError && "body" in err) return res.status(400).json(body("INVALID_JSON", "Request body is not valid JSON"));
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") return res.status(409).json(body("CONFLICT", "A record with these details already exists"));
    if (err.code === "P2025") return res.status(404).json(body("NOT_FOUND", "Record not found"));
  }
  // Log server-side only; never leak internals to the client.
  console.error(`[error] ${req.method} ${req.path}:`, env.NODE_ENV === "production" ? (err as Error)?.message : err);
  res.status(500).json(body("INTERNAL_ERROR", "Something went wrong. Please try again."));
}
