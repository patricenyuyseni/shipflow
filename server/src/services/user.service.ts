import type { Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/errors";

const select = { id: true, name: true, email: true, role: true, createdAt: true } as const;

export const listUsers = () => prisma.user.findMany({ select, orderBy: { createdAt: "asc" }, take: 200 });

export async function changeRole(id: string, role: Role, actorId: string) {
  if (id === actorId) throw new AppError(400, "CANNOT_CHANGE_OWN_ROLE", "You can't change your own role. Ask another administrator.");
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id }, select });
    if (!user) throw new AppError(404, "USER_NOT_FOUND", "User not found");
    if (user.role === role) return user;
    if (user.role === "ADMIN" && role === "USER" && (await tx.user.count({ where: { role: "ADMIN" } })) <= 1) {
      throw new AppError(409, "LAST_ADMIN", "There must always be at least one administrator.");
    }
    // Force a fresh sign-in so the new role takes effect as soon as the short-lived access token expires.
    await tx.refreshToken.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } });
    return tx.user.update({ where: { id }, data: { role }, select });
  });
}
