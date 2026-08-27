import jwt from "jsonwebtoken";
import { describe, expect, it, vi } from "vitest";
import {
  Permission,
  requireAuth,
  requirePermission,
  requireRole,
  requireSuperAdmin,
} from "./auth";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

function response() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  } as any;
  res.status.mockReturnValue(res);
  return res;
}

function request(user?: Record<string, unknown>, authorization?: string) {
  return { user, headers: authorization ? { authorization } : {} } as any;
}

describe("requireAuth", () => {
  it("rejects missing authorization", () => {
    const req = request();
    const res = response();
    const next = vi.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  it.each([
    ["Basic abc", { error: "Unauthorized" }],
    ["Bearer", { error: "Unauthorized" }],
    ["Bearer ", { error: "Invalid or expired token" }],
    ["Bearer not-a-jwt", { error: "Invalid or expired token" }],
  ])("rejects malformed authorization: %s", (authorization, expectedBody) => {
    const req = request(undefined, authorization as string);
    const res = response();
    const next = vi.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expectedBody);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects expired and forged tokens", () => {
    const expired = jwt.sign({ id: "u1" }, JWT_SECRET, { expiresIn: -1 });
    const forged = jwt.sign({ id: "u1", isSuperAdmin: true }, "attacker-secret");

    for (const token of [expired, forged]) {
      const req = request(undefined, `Bearer ${token}`);
      const res = response();
      const next = vi.fn();

      requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    }
  });

  it("attaches a valid token payload and continues", () => {
    const payload = {
      id: "u1",
      companyId: "c1",
      email: "user@example.com",
      role: "member",
      isSuperAdmin: false,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "5m" });
    const req = request(undefined, `Bearer ${token}`);
    const res = response();
    const next = vi.fn();

    requireAuth(req, res, next);

    expect(req.user).toMatchObject(payload);
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe("authorization guards", () => {
  it("returns 401 when a permission guard has no authenticated user", () => {
    const res = response();
    const next = vi.fn();
    requirePermission(Permission.SEARCH_LEADS)(request(), res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("allows member search but denies member billing management", () => {
    const member = { id: "u1", companyId: "c1", role: "member", isSuperAdmin: false };
    const searchRes = response();
    const searchNext = vi.fn();
    requirePermission(Permission.SEARCH_LEADS)(request(member), searchRes, searchNext);
    expect(searchNext).toHaveBeenCalledOnce();

    const billingRes = response();
    const billingNext = vi.fn();
    requirePermission(Permission.MANAGE_BILLING)(request(member), billingRes, billingNext);
    expect(billingRes.status).toHaveBeenCalledWith(403);
    expect(billingNext).not.toHaveBeenCalled();
  });

  it("allows super admins through role and permission guards", () => {
    const admin = { id: "a1", companyId: "platform", role: "member", isSuperAdmin: true };
    const permissionNext = vi.fn();
    const roleNext = vi.fn();

    requirePermission(Permission.MANAGE_BILLING)(request(admin), response(), permissionNext);
    requireRole(["admin"])(request(admin), response(), roleNext);

    expect(permissionNext).toHaveBeenCalledOnce();
    expect(roleNext).toHaveBeenCalledOnce();
  });

  it("requires super-admin status even when the user has an admin role", () => {
    const res = response();
    const next = vi.fn();
    requireSuperAdmin(
      request({ id: "u1", companyId: "c1", role: "admin", isSuperAdmin: false }),
      res,
      next,
    );
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
