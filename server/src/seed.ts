import bcrypt from "bcryptjs";
import "./config/env";
import { prisma } from "./config/prisma";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 10) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (min 10 chars) in .env to create the first admin.");
  }
  const user = await prisma.user.upsert({
    where: { email },
    create: { name: "Administrator", email, passwordHash: await bcrypt.hash(password, 12), role: "ADMIN" },
    update: { role: "ADMIN" },
  });
  console.log(`Admin ready: ${user.email}`);
}

main().finally(() => prisma.$disconnect());
