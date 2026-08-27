import express from "express";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
  verifyOTP: vi.fn(),
  resendOTP: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  acceptInvite: vi.fn(),
}));

vi.mock("../services/authService.js", () => ({ AuthService: mocks }));
vi.mock("../middleware/rateLimiter.js", () => ({ strictLimiter: (_req: unknown, _res: unknown, next: () => void) => next() }));

import authRouter from "./auth";

const app = express();
app.use(express.json());
app.use("/api/auth", authRouter);

let server: ReturnType<typeof app.listen>;
let baseUrl = "";

async function post(path: string, body: Record<string, unknown>) {
  return fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeAll(async () => {
  server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", () => resolve()));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server failed to bind");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(() => server.close());

describe("auth route integration", () => {
  it("rejects incomplete login payloads before invoking the service", async () => {
    const response = await post("/api/auth/login", { email: "user@example.com" });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Email and password are required" });
    expect(mocks.login).not.toHaveBeenCalled();
  });

  it("returns service tokens for valid login requests", async () => {
    mocks.login.mockResolvedValueOnce({ accessToken: "access", refreshToken: "refresh" });
    const response = await post("/api/auth/login", { email: "user@example.com", password: "secret" });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ accessToken: "access", refreshToken: "refresh" });
  });

  it("maps authentication failures to a safe status and message", async () => {
    mocks.login.mockRejectedValueOnce(new Error("Invalid credentials"));
    const response = await post("/api/auth/login", { email: "user@example.com", password: "wrong" });
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Invalid credentials" });
  });

  it("preserves Retry-After metadata for throttled OTP requests", async () => {
    const error = Object.assign(new Error("Please wait before requesting another OTP"), {
      statusCode: 429,
      retryAfterSeconds: 60,
    });
    mocks.resendOTP.mockRejectedValueOnce(error);

    const response = await post("/api/auth/resend-otp", { email: "user@example.com", purpose: "verification" });
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("60");
    expect(await response.json()).toEqual({
      error: "Please wait before requesting another OTP",
      retryAfterSeconds: 60,
    });
  });

  it("validates each route’s required fields at the HTTP boundary", async () => {
    const cases = [
      ["/api/auth/register", {}, "Email, password, and companyName are required"],
      ["/api/auth/verify-otp", { email: "user@example.com" }, "Email and OTP are required"],
      ["/api/auth/resend-otp", { email: "user@example.com" }, "Email and purpose are required"],
      ["/api/auth/forgot-password", {}, "Email is required"],
      ["/api/auth/reset-password", { email: "user@example.com", otp: "123456" }, "Email, OTP, and newPassword are required"],
      ["/api/auth/accept-invite", { token: "invite" }, "Token and password are required"],
    ] as const;

    for (const [path, body, message] of cases) {
      const response = await post(path, body);
      expect(response.status, path).toBe(400);
      expect(await response.json(), path).toEqual({ error: message });
    }
  });
});
