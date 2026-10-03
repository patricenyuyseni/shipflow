import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/errors";
import { signToken } from "../utils/jwt";

export const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type DbUser = { id: string; name: string; email: string; role: "ADMIN" | "USER" };
const publicUser = (u: DbUser) => ({ id: u.id, name: u.name, email: u.email, role: u.role });
const hash = (raw: string) => crypto.createHash("sha256").update(raw).digest("hex");

async function issueSession(user: DbUser) {
  const refreshToken = crypto.randomBytes(48).toString("base64url");
  await prisma.refreshToken.deleteMany({ where: { userId: user.id, expiresAt: { lt: new Date() } } }); // tidy this user's expired rows
  await prisma.refreshToken.create({ data: { userId: user.id, tokenHash: hash(refreshToken), expiresAt: new Date(Date.now() + REFRESH_TTL_MS) } });
  return { token: signToken({ sub: user.id, role: user.role }), refreshToken, user: publicUser(user) };
}

export async function register(input: { name: string; email: string; password: string }) {
  if (await prisma.user.findUnique({ where: { email: input.email } })) {
    throw new AppError(409, "EMAIL_IN_USE", "An account with this email already exists");
  }
  // Public sign-up always creates a USER. Admins are created via `npm run seed`.
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash: await bcrypt.hash(input.password, 12), role: "USER" },
  });
  return issueSession(user);
}

export async function login(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const ok = user ? await bcrypt.compare(input.password, user.passwordHash) : false;
  if (!user || !ok) throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect");
  return issueSession(user);
}

// Rotates the refresh token. Presenting an already-used token means it may have been stolen, so every session for that user is revoked.
export async function refresh(raw: string | undefined) {
  const invalid = new AppError(401, "INVALID_REFRESH_TOKEN", "Your session has expired. Please sign in again.");
  if (!raw) throw invalid;
  const rec = await prisma.refreshToken.findUnique({ where: { tokenHash: hash(raw) }, include: { user: true } });
  if (!rec) throw invalid;
  if (rec.revokedAt) {
    await prisma.refreshToken.updateMany({ where: { userId: rec.userId, revokedAt: null }, data: { revokedAt: new Date() } });
    throw invalid;
  }
  if (rec.expiresAt < new Date()) throw invalid;
  const claimed = await prisma.refreshToken.updateMany({ where: { id: rec.id, revokedAt: null }, data: { revokedAt: new Date() } });
  if (claimed.count !== 1) throw invalid;
  return issueSession(rec.user);
}

export async function logout(raw: string | undefined) {
  if (!raw) return;
  await prisma.refreshToken.updateMany({ where: { tokenHash: hash(raw), revokedAt: null }, data: { revokedAt: new Date() } });
}

export async function me(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError(401, "INVALID_TOKEN", "Account no longer exists");
  return publicUser(user);
}
