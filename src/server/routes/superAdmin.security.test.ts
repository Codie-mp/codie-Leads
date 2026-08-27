import express from "express";
import jwt from "jsonwebtoken";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import superAdminRouter from "./superAdmin";

const app = express();
app.use(express.json());
app.use("/api/super-admin", superAdminRouter);

let server: ReturnType<typeof app.listen>;
let baseUrl = "";
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

function token(overrides: Record<string, unknown> = {}) {
  return jwt.sign({
    id: "u1",
    companyId: "c1",
    email: "user@example.com",
    role: "admin",
    isSuperAdmin: false,
    ...overrides,
  }, JWT_SECRET, { expiresIn: "5m" });
}

beforeAll(async () => {
  server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", () => resolve()));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server failed to bind");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(() => server.close());

describe("SuperAdmin route security boundary", () => {
  it("rejects unauthenticated access", async () => {
    const response = await fetch(`${baseUrl}/api/super-admin/stats`);
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
  });

  it("rejects ordinary admins even when they request platform stats", async () => {
    const response = await fetch(`${baseUrl}/api/super-admin/stats`, {
      headers: { authorization: `Bearer ${token()}` },
    });
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "Forbidden: requires super admin privileges" });
  });

  it("allows a super-admin token through the authorization boundary", async () => {
    const response = await fetch(`${baseUrl}/api/super-admin/stats`, {
      headers: { authorization: `Bearer ${token({ id: "sa1", isSuperAdmin: true })}` },
    });
    // The request reaches the database boundary; the response may be 200 or a controlled 500
    // depending on whether the test environment has a configured database.
    expect([200, 500]).toContain(response.status);
  });
});
