import { Router } from "express";
import { AuthService } from "../services/authService.js";
import { strictLimiter } from "../middleware/rateLimiter.js";

const router = Router();

function sendAuthError(res: any, error: any, fallbackStatus: number) {
  const status = Number.isInteger(error?.statusCode) ? error.statusCode : fallbackStatus;
  if (error?.retryAfterSeconds) {
    res.setHeader("Retry-After", String(error.retryAfterSeconds));
  }
  return res.status(status).json({
    error: error?.message || "Authentication request failed",
    ...(error?.retryAfterSeconds ? { retryAfterSeconds: error.retryAfterSeconds } : {}),
  });
}

router.post("/login", strictLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const tokens = await AuthService.login(email, password);
    res.json(tokens);
  } catch (err: any) {
    sendAuthError(res, err, 401);
  }
});

router.post("/register", strictLimiter, async (req, res) => {
  try {
    const { email, password, companyName } = req.body;
    if (!email || !password || !companyName) {
      return res.status(400).json({ error: "Email, password, and companyName are required" });
    }

    const result = await AuthService.register(email, password, companyName);
    res.json(result);
  } catch (err: any) {
    sendAuthError(res, err, 400);
  }
});

router.post("/verify-otp", strictLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const tokens = await AuthService.verifyOTP(email, otp);
    res.json(tokens);
  } catch (err: any) {
    sendAuthError(res, err, 400);
  }
});

router.post("/resend-otp", strictLimiter, async (req, res) => {
  try {
    const { email, purpose } = req.body; // purpose = 'verification' or 'reset'
    if (!email || !purpose) {
      return res.status(400).json({ error: "Email and purpose are required" });
    }

    const result = await AuthService.resendOTP(email, purpose);
    res.json(result);
  } catch (err: any) {
    sendAuthError(res, err, 400);
  }
});

router.post("/forgot-password", strictLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const result = await AuthService.forgotPassword(email);
    res.json(result);
  } catch (err: any) {
    sendAuthError(res, err, 400);
  }
});

router.post("/reset-password", strictLimiter, async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "Email, OTP, and newPassword are required" });
    }

    const tokens = await AuthService.resetPassword(email, otp, newPassword);
    res.json(tokens);
  } catch (err: any) {
    sendAuthError(res, err, 400);
  }
});

router.post("/accept-invite", strictLimiter, async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required" });
    }

    const tokens = await AuthService.acceptInvite(token, password);
    res.json(tokens);
  } catch (err: any) {
    sendAuthError(res, err, 400);
  }
});

export default router;
