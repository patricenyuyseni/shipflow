import { describe, expect, it } from "vitest";
import { createShipmentSchema, registerSchema, statusUpdateSchema, trackingNumberSchema } from "./index";

const valid = {
  senderName: "Acme Ltd", recipientName: "Jo Smith", origin: "Hong Kong", destination: "Berlin",
  packageWeight: "1.2", packageLength: 20, packageWidth: 15, packageHeight: 10,
};

describe("validators", () => {
  it("accepts a valid shipment and coerces numbers", () => {
    const r = createShipmentSchema.parse(valid);
    expect(r.packageWeight).toBe(1.2);
  });
  it("rejects non-positive dimensions and bad emails", () => {
    expect(createShipmentSchema.safeParse({ ...valid, packageHeight: 0 }).success).toBe(false);
    expect(createShipmentSchema.safeParse({ ...valid, senderEmail: "nope" }).success).toBe(false);
  });
  it("treats empty optional strings as undefined", () => {
    expect(createShipmentSchema.parse({ ...valid, senderEmail: "" }).senderEmail).toBeUndefined();
  });
  it("normalises tracking numbers and rejects junk", () => {
    expect(trackingNumberSchema.parse("exo-2026-000001")).toBe("EXO-2026-000001");
    expect(trackingNumberSchema.safeParse("a b;drop").success).toBe(false);
  });
  it("rejects unknown statuses", () => {
    expect(statusUpdateSchema.safeParse({ status: "LOST" }).success).toBe(false);
    expect(statusUpdateSchema.safeParse({ status: "IN_TRANSIT", location: "Leipzig" }).success).toBe(true);
  });
  it("requires a long password and lowercases email on register", () => {
    expect(registerSchema.safeParse({ name: "A", email: "a@b.co", password: "short" }).success).toBe(false);
    expect(registerSchema.parse({ name: "A", email: "A@B.CO", password: "longenough1" }).email).toBe("a@b.co");
  });
});
