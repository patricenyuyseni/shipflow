// Integration tests. They need a migrated PostgreSQL database and are skipped otherwise:
//   TEST_DATABASE_URL=postgresql://... npm test
import bcrypt from "bcryptjs";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const url = process.env.TEST_DATABASE_URL;
const tag = `it${Date.now()}`;
const shipment = { senderName: "Acme", recipientName: "Jo", senderEmail: "private@example.com", origin: "Hong Kong", destination: "Berlin", packageWeight: 1.2, packageLength: 20, packageWidth: 15, packageHeight: 10 };

describe.skipIf(!url)("API (database)", () => {
  let app: import("express").Express;
  let prisma: typeof import("./config/prisma").prisma;
  let adminToken = "";
  let userToken = "";
  const created: string[] = [];

  beforeAll(async () => {
    process.env.DATABASE_URL = url!;
    process.env.JWT_SECRET = "test-secret-test-secret-test-secret-123";
    ({ app } = await import("./app"));
    ({ prisma } = await import("./config/prisma"));
    await prisma.user.create({ data: { name: "Admin", email: `${tag}-admin@test.dev`, passwordHash: await bcrypt.hash("password-12345", 4), role: "ADMIN" } });
    adminToken = (await request(app).post("/api/auth/login").send({ email: `${tag}-admin@test.dev`, password: "password-12345" })).body.data.token;
    userToken = (await request(app).post("/api/auth/register").send({ name: "U", email: `${tag}-user@test.dev`, password: "password-12345" })).body.data.token;
  });

  afterAll(async () => {
    await prisma.shipment.deleteMany({ where: { id: { in: created } } });
    await prisma.user.deleteMany({ where: { email: { startsWith: tag } } });
    await prisma.$disconnect();
  });

  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });

  it("reports health", async () => {
    const r = await request(app).get("/api/health");
    expect(r.status).toBe(200);
    expect(r.body.database).toBe("connected");
  });

  it("rejects wrong passwords and never leaks the hash", async () => {
    const bad = await request(app).post("/api/auth/login").send({ email: `${tag}-admin@test.dev`, password: "nope-nope-nope" });
    expect(bad.status).toBe(401);
    const me = await request(app).get("/api/auth/me").set(auth(adminToken));
    expect(JSON.stringify(me.body)).not.toContain("passwordHash");
  });

  it("blocks unauthenticated and non-admin shipment access", async () => {
    expect((await request(app).get("/api/shipments")).status).toBe(401);
    expect((await request(app).post("/api/shipments").set(auth(userToken)).send(shipment)).status).toBe(403);
  });

  it("validates shipment input", async () => {
    const r = await request(app).post("/api/shipments").set(auth(adminToken)).send({ ...shipment, packageWeight: -1 });
    expect(r.status).toBe(400);
    expect(r.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("creates shipments with unique sequential tracking numbers", async () => {
    const a = (await request(app).post("/api/shipments").set(auth(adminToken)).send(shipment)).body.data;
    const b = (await request(app).post("/api/shipments").set(auth(adminToken)).send(shipment)).body.data;
    created.push(a.id, b.id);
    expect(a.trackingNumber).toMatch(/^EXO-\d{4}-\d{6}$/);
    expect(b.trackingNumber).not.toBe(a.trackingNumber);
  });

  it("serves public tracking without personal data", async () => {
    const s = (await request(app).post("/api/shipments").set(auth(adminToken)).send(shipment)).body.data;
    created.push(s.id);
    const r = await request(app).get(`/api/track/${s.trackingNumber.toLowerCase()}`);
    expect(r.status).toBe(200);
    expect(r.body.data.history).toHaveLength(1);
    expect(JSON.stringify(r.body)).not.toContain("private@example.com");
    expect((await request(app).get("/api/track/EXO-1999-000000")).status).toBe(404);
  });

  it("records history on status change and enforces transitions", async () => {
    const s = (await request(app).post("/api/shipments").set(auth(adminToken)).send(shipment)).body.data;
    created.push(s.id);
    const ok = await request(app).patch(`/api/shipments/${s.id}/status`).set(auth(adminToken)).send({ status: "PICKED_UP", location: "HK hub" });
    expect(ok.status).toBe(200);
    const bad = await request(app).patch(`/api/shipments/${s.id}/status`).set(auth(adminToken)).send({ status: "DELIVERED" });
    expect(bad.status).toBe(409);
    expect(bad.body.error.code).toBe("INVALID_STATUS_TRANSITION");
    const h = (await request(app).get(`/api/shipments/${s.id}/history`).set(auth(adminToken))).body.data;
    expect(h).toHaveLength(2);
    expect(h[1]).toMatchObject({ previousStatus: "CREATED", newStatus: "PICKED_UP", location: "HK hub" });
  });

  it("returns stats", async () => {
    const r = await request(app).get("/api/shipments/stats").set(auth(adminToken));
    expect(r.status).toBe(200);
    expect(r.body.data.byStatus).toHaveProperty("IN_TRANSIT");
  });

  it("manages user roles with safeguards", async () => {
    expect((await request(app).get("/api/users").set(auth(userToken))).status).toBe(403);
    const list = (await request(app).get("/api/users").set(auth(adminToken))).body.data as { id: string; email: string }[];
    expect(JSON.stringify(list)).not.toContain("passwordHash");
    const admin = list.find((u) => u.email === `${tag}-admin@test.dev`)!;
    const user = list.find((u) => u.email === `${tag}-user@test.dev`)!;
    const self = await request(app).patch(`/api/users/${admin.id}/role`).set(auth(adminToken)).send({ role: "USER" });
    expect(self.body.error.code).toBe("CANNOT_CHANGE_OWN_ROLE");
    const up = await request(app).patch(`/api/users/${user.id}/role`).set(auth(adminToken)).send({ role: "ADMIN" });
    expect(up.body.data.role).toBe("ADMIN");
    const down = await request(app).patch(`/api/users/${user.id}/role`).set(auth(adminToken)).send({ role: "USER" });
    expect(down.body.data.role).toBe("USER");
    expect((await request(app).patch(`/api/users/${user.id}/role`).set(auth(adminToken)).send({ role: "OWNER" })).status).toBe(400);
  });

  it("sets an httpOnly refresh cookie, rotates it, and detects reuse", async () => {
    const login = await request(app).post("/api/auth/login").send({ email: `${tag}-admin@test.dev`, password: "password-12345" });
    const cookie1 = (login.headers["set-cookie"] as unknown as string[])[0];
    expect(cookie1).toMatch(/sf_refresh=/);
    expect(cookie1).toMatch(/HttpOnly/i);
    expect(JSON.stringify(login.body)).not.toContain("refreshToken");

    const r1 = await request(app).post("/api/auth/refresh").set("Cookie", cookie1.split(";")[0]);
    expect(r1.status).toBe(200);
    expect(r1.body.data.token).toBeTruthy();
    const cookie2 = (r1.headers["set-cookie"] as unknown as string[])[0];
    expect(cookie2.split(";")[0]).not.toBe(cookie1.split(";")[0]);

    // Replaying the old token fails and revokes the whole chain.
    expect((await request(app).post("/api/auth/refresh").set("Cookie", cookie1.split(";")[0])).status).toBe(401);
    expect((await request(app).post("/api/auth/refresh").set("Cookie", cookie2.split(";")[0])).status).toBe(401);
    expect((await request(app).post("/api/auth/refresh")).status).toBe(401);
  });

  it("logout revokes the refresh token", async () => {
    const login = await request(app).post("/api/auth/login").send({ email: `${tag}-user@test.dev`, password: "password-12345" });
    const c = (login.headers["set-cookie"] as unknown as string[])[0].split(";")[0];
    expect((await request(app).post("/api/auth/logout").set("Cookie", c)).status).toBe(200);
    expect((await request(app).post("/api/auth/refresh").set("Cookie", c)).status).toBe(401);
  });
});
