import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  selectResults: [] as unknown[][],
  updates: [] as unknown[],
  inserts: [] as unknown[],
  sendOTP: vi.fn(),
}));

vi.mock("../../db/schema.js", () => ({
  users: { id: "users.id", email: "users.email", inviteToken: "users.inviteToken" },
  companies: { id: "companies.id" },
}));

vi.mock("../../db/index.js", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve(mocks.selectResults.shift() ?? [])),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn((values: unknown) => ({
        where: vi.fn(async () => {
          mocks.updates.push(values);
        }),
      })),
    })),
    insert: vi.fn((table: unknown) => ({
      values: vi.fn(async (values: unknown) => {
        mocks.inserts.push({ table, values });
      }),
    })),
  },
}));

vi.mock("./emailService.js", () => ({
  EmailService: { sendOTP: mocks.sendOTP },
}));

import { AuthService } from "./authService";

const verifiedUser = {
  id: "u1",
  companyId: "c1",
  email: "user@example.com",
  passwordHash: "",
  role: "member",
  isSuperAdmin: false,
  isVerified: true,
  otp: null,
  otpExpiresAt: null,
  otpLastSentAt: null,
  otpSendCount: 0,
  otpSendWindowStartedAt: null,
};

function queue(...results: unknown[][]) {
  mocks.selectResults.push(...results);
}

describe("AuthService", () => {
  beforeEach(async () => {
    mocks.selectResults.length = 0;
    mocks.updates.length = 0;
    mocks.inserts.length = 0;
    mocks.sendOTP.mockReset();
    mocks.sendOTP.mockResolvedValue(undefined);
    vi.stubEnv("SUPER_ADMIN_EMAIL", "admin@example.com");
  });

  it("registers a new company, stores a hashed password, and sends verification OTP", async () => {
    queue([]);

    const result = await AuthService.register("admin@example.com", "CorrectHorseBatteryStaple!", "Acme");

    expect(result).toMatchObject({ success: true, message: "Verification OTP sent" });
    expect(mocks.inserts).toHaveLength(2);
    const userInsert = mocks.inserts[1] as { values: Record<string, unknown> };
    expect(userInsert.values.email).toBe("admin@example.com");
    expect(userInsert.values.passwordHash).not.toBe("CorrectHorseBatteryStaple!");
    expect(userInsert.values.isSuperAdmin).toBe(true);
    expect(userInsert.values.otp).toMatch(/^\d{6}$/);
    expect(mocks.sendOTP).toHaveBeenCalledWith("admin@example.com", userInsert.values.otp, "verification");
  });

  it("rejects duplicate registration without mutating persistence", async () => {
    queue([{ id: "existing", email: "user@example.com" }]);

    await expect(AuthService.register("user@example.com", "password", "Acme"))
      .rejects.toThrow("Email already in use");
    expect(mocks.inserts).toHaveLength(0);
    expect(mocks.sendOTP).not.toHaveBeenCalled();
  });

  it("rejects incorrect credentials before checking verification or company status", async () => {
    const hash = await AuthService.hashPassword("correct-password");
    queue([{ ...verifiedUser, passwordHash: hash }]);

    await expect(AuthService.login("user@example.com", "wrong-password"))
      .rejects.toThrow("Invalid credentials");
    expect(mocks.selectResults).toHaveLength(0);
    expect(mocks.sendOTP).not.toHaveBeenCalled();
  });

  it("resends verification OTP for an unverified user and returns the sentinel error", async () => {
    const hash = await AuthService.hashPassword("password");
    queue([{ ...verifiedUser, passwordHash: hash, isVerified: false }]);

    await expect(AuthService.login("user@example.com", "password")).rejects.toThrow("UNVERIFIED");
    expect(mocks.sendOTP).toHaveBeenCalledOnce();
    expect(mocks.updates).toHaveLength(1);
  });

  it("blocks valid credentials when the company is missing or inactive", async () => {
    const hash = await AuthService.hashPassword("password");
    queue(
      [{ ...verifiedUser, passwordHash: hash }],
      [{ id: "c1", active: false }],
    );

    await expect(AuthService.login("user@example.com", "password"))
      .rejects.toThrow("Account is suspended or company inactive");
  });

  it("rejects incorrect and expired OTPs without updating the user", async () => {
    queue([{ ...verifiedUser, otp: "123456", otpExpiresAt: new Date(Date.now() - 1000) }]);
    await expect(AuthService.verifyOTP("user@example.com", "000000")).rejects.toThrow("Invalid OTP code");
    expect(mocks.updates).toHaveLength(0);

    queue([{ ...verifiedUser, otp: "123456", otpExpiresAt: new Date(Date.now() - 1000) }]);
    await expect(AuthService.verifyOTP("user@example.com", "123456")).rejects.toThrow("OTP code has expired");
    expect(mocks.updates).toHaveLength(0);
  });

  it("resets the password only with a valid unexpired OTP and clears it", async () => {
    queue([{ ...verifiedUser, otp: "123456", otpExpiresAt: new Date(Date.now() + 60_000) }]);

    const tokens = await AuthService.resetPassword("user@example.com", "123456", "NewSecurePassword!");

    expect(tokens.accessToken).toBeTypeOf("string");
    expect(tokens.refreshToken).toBeTypeOf("string");
    expect(mocks.updates).toHaveLength(1);
    expect(mocks.updates[0]).toMatchObject({ otp: null, otpExpiresAt: null, isVerified: true });
  });

  it("accepts an invite, clears the token, verifies the user, and returns tokens", async () => {
    queue(
      [{ ...verifiedUser, inviteToken: "invite-123", isVerified: false }],
      [{ ...verifiedUser, inviteToken: null, isVerified: true }],
    );

    const tokens = await AuthService.acceptInvite("invite-123", "NewSecurePassword!");

    expect(tokens.accessToken).toBeTypeOf("string");
    expect(mocks.updates[0]).toMatchObject({ inviteToken: null, isVerified: true });
  });

  it("consumes and persists the OTP throttle state before a delivery failure", async () => {
    queue([{ ...verifiedUser }]);
    mocks.sendOTP.mockRejectedValueOnce(new Error("SMTP unavailable"));

    await expect(AuthService.resendOTP("user@example.com", "verification"))
      .rejects.toThrow("SMTP unavailable");
    expect(mocks.updates).toHaveLength(1);
    expect(mocks.updates[0]).toMatchObject({ otpSendCount: 1 });
  });
});
