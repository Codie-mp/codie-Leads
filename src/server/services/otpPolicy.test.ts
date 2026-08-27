import { describe, expect, it } from "vitest";
import {
  assertOtpSendAllowed,
  OTP_MAX_SENDS_PER_WINDOW,
  OTP_RESEND_COOLDOWN_SECONDS,
} from "./otpPolicy";

const at = (seconds: number) => new Date(Date.UTC(2026, 0, 1, 0, 0, seconds));

describe("OTP send policy", () => {
  it("allows the first code request", () => {
    const now = at(0);
    expect(assertOtpSendAllowed({}, now)).toEqual({
      sendCount: 1,
      windowStartedAt: now,
    });
  });

  it("enforces the resend cooldown", () => {
    expect(() => assertOtpSendAllowed({
      lastSentAt: at(0),
      sendCount: 1,
      windowStartedAt: at(0),
    }, at(30))).toThrow(`Please wait ${OTP_RESEND_COOLDOWN_SECONDS - 30} seconds`);
  });

  it("limits sends within the fifteen-minute window and resets after expiry", () => {
    const windowStart = at(0);
    expect(() => assertOtpSendAllowed({
      lastSentAt: at(0),
      sendCount: OTP_MAX_SENDS_PER_WINDOW,
      windowStartedAt: windowStart,
    }, at(60))).toThrow("Please wait 840 seconds");

    expect(assertOtpSendAllowed({
      lastSentAt: at(0),
      sendCount: OTP_MAX_SENDS_PER_WINDOW,
      windowStartedAt: windowStart,
    }, at(901))).toEqual({
      sendCount: 1,
      windowStartedAt: at(901),
    });
  });
});
