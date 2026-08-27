export const OTP_RESEND_COOLDOWN_SECONDS = 60;
export const OTP_SEND_WINDOW_SECONDS = 15 * 60;
export const OTP_MAX_SENDS_PER_WINDOW = 3;

export class OtpRateLimitError extends Error {
  code = "OTP_RATE_LIMITED";
  statusCode = 429;
  retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super(`Please wait ${retryAfterSeconds} seconds before requesting another code.`);
    this.name = "OtpRateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

type OtpSendState = {
  lastSentAt?: Date | string | null;
  sendCount?: number | null;
  windowStartedAt?: Date | string | null;
};

const toTimestamp = (value?: Date | string | null) => {
  if (!value) return null;
  const timestamp = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
};

const ceilSeconds = (milliseconds: number) => Math.max(1, Math.ceil(milliseconds / 1000));

export function assertOtpSendAllowed(state: OtpSendState, now = new Date()) {
  const nowTimestamp = now.getTime();
  const lastSentTimestamp = toTimestamp(state.lastSentAt);
  if (lastSentTimestamp !== null) {
    const cooldownRemaining = OTP_RESEND_COOLDOWN_SECONDS * 1000 - (nowTimestamp - lastSentTimestamp);
    if (cooldownRemaining > 0) {
      throw new OtpRateLimitError(ceilSeconds(cooldownRemaining));
    }
  }

  const windowStartedTimestamp = toTimestamp(state.windowStartedAt);
  const windowExpired = windowStartedTimestamp === null
    || nowTimestamp - windowStartedTimestamp >= OTP_SEND_WINDOW_SECONDS * 1000;
  const sendCount = windowExpired ? 0 : Math.max(0, Number(state.sendCount || 0));

  if (sendCount >= OTP_MAX_SENDS_PER_WINDOW && windowStartedTimestamp !== null) {
    const windowRemaining = OTP_SEND_WINDOW_SECONDS * 1000 - (nowTimestamp - windowStartedTimestamp);
    throw new OtpRateLimitError(ceilSeconds(windowRemaining));
  }

  return {
    sendCount: sendCount + 1,
    windowStartedAt: windowExpired ? now : new Date(windowStartedTimestamp ?? nowTimestamp),
  };
}
