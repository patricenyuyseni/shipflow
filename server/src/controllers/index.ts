import type { Request, Response } from "express";
import { env } from "../config/env";
import { parse } from "../middleware/validate";
import { asyncHandler } from "../utils/errors";
import * as auth from "../services/auth.service";
import { REFRESH_TTL_MS } from "../services/auth.service";
import * as shipments from "../services/shipment.service";
import * as users from "../services/user.service";
import { listProviders } from "../providers";
import {
  createShipmentSchema, idSchema, listQuerySchema, loginSchema, registerSchema,
  roleUpdateSchema, statusUpdateSchema, trackingNumberSchema, updateShipmentSchema,
} from "../validators";

const ok = (res: Response, data: unknown, status = 200) => res.status(status).json({ success: true, data });
const id = (req: Request) => parse(idSchema, req.params.id);

const COOKIE = "sf_refresh";
const cookieOpts = { httpOnly: true, secure: env.NODE_ENV === "production", sameSite: "strict" as const, path: "/api/auth" };

function readCookie(req: Request, name: string): string | undefined {
  for (const part of (req.headers.cookie ?? "").split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return undefined;
}

// The refresh token travels only in an httpOnly cookie; the JSON body carries just the short-lived access token.
function sendSession(res: Response, s: { token: string; refreshToken: string; user: unknown }, status = 200) {
  res.cookie(COOKIE, s.refreshToken, { ...cookieOpts, maxAge: REFRESH_TTL_MS });
  return ok(res, { token: s.token, user: s.user }, status);
}

export const register = asyncHandler(async (req, res) => sendSession(res, await auth.register(parse(registerSchema, req.body)), 201));
export const login = asyncHandler(async (req, res) => sendSession(res, await auth.login(parse(loginSchema, req.body))));
export const refresh = asyncHandler(async (req, res) => {
  try {
    sendSession(res, await auth.refresh(readCookie(req, COOKIE)));
  } catch (e) {
    res.clearCookie(COOKIE, cookieOpts);
    throw e;
  }
});
export const logout = asyncHandler(async (req, res) => {
  await auth.logout(readCookie(req, COOKIE));
  res.clearCookie(COOKIE, cookieOpts);
  ok(res, { loggedOut: true });
});
export const me = asyncHandler(async (req, res) => ok(res, await auth.me(req.user!.id)));

export const createShipment = asyncHandler(async (req, res) => ok(res, await shipments.createShipment(parse(createShipmentSchema, req.body), req.user!.id), 201));
export const listShipments = asyncHandler(async (req, res) => ok(res, await shipments.listShipments(parse(listQuerySchema, req.query))));
export const getShipment = asyncHandler(async (req, res) => ok(res, await shipments.getShipment(id(req))));
export const updateShipment = asyncHandler(async (req, res) => ok(res, await shipments.updateShipment(id(req), parse(updateShipmentSchema, req.body))));
export const deleteShipment = asyncHandler(async (req, res) => { await shipments.deleteShipment(id(req)); ok(res, { deleted: true }); });
export const changeStatus = asyncHandler(async (req, res) => ok(res, await shipments.changeStatus(id(req), parse(statusUpdateSchema, req.body), req.user!.id)));
export const getHistory = asyncHandler(async (req, res) => ok(res, await shipments.getHistory(id(req))));
export const publicTrack = asyncHandler(async (req, res) => ok(res, await shipments.publicTracking(parse(trackingNumberSchema, req.params.trackingNumber))));
export const shipmentStats = asyncHandler(async (_req, res) => ok(res, await shipments.getStats()));
export const listUsers = asyncHandler(async (_req, res) => ok(res, await users.listUsers()));
export const changeUserRole = asyncHandler(async (req, res) => ok(res, await users.changeRole(id(req), parse(roleUpdateSchema, req.body).role, req.user!.id)));
export const providerList = asyncHandler(async (_req, res) => ok(res, listProviders()));
