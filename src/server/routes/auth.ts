import { Router } from "express";
import { AuthService } from "../services/authService.js";
import { strictLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/login", strictLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const tokens = await AuthService.login(email, password);
    res.json(tokens);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
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
    res.status(400).json({ error: err.message });
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
    res.status(400).json({ error: err.message });
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
    res.status(400).json({ error: err.message });
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
    res.status(400).json({ error: err.message });
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
    res.status(400).json({ error: err.message });
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
    res.status(400).json({ error: err.message });
  }
});

export default router;
