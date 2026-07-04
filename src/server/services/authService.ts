import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { db } from "../../db/index.js";
import { users, companies } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { EmailService } from "./emailService.js";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret";
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "12");

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateTokens(user: any) {
    const payload = {
      id: user.id,
      companyId: user.companyId,
      email: user.email,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin,
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
    const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: "30d" });

    return { accessToken, refreshToken };
  }

  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async login(email: string, password: string) {
    const userRecords = await db.select().from(users).where(eq(users.email, email));
    if (userRecords.length === 0) {
      throw new Error("Invalid credentials");
    }

    const user = userRecords[0];
    const valid = await this.verifyPassword(password, user.passwordHash);
    if (!valid) {
      throw new Error("Invalid credentials");
    }

    if (!user.isVerified) {
      // Auto resend OTP
      const otp = this.generateOTP();
      const expires = new Date(Date.now() + 15 * 60000);
      await db.update(users)
        .set({ otp, otpExpiresAt: expires })
        .where(eq(users.id, user.id));
      
      await EmailService.sendOTP(email, otp, 'verification');
      throw new Error("UNVERIFIED"); // Special string we can catch on the frontend
    }

    // Verify company is active
    const companyRecords = await db.select().from(companies).where(eq(companies.id, user.companyId));
    if (companyRecords.length === 0 || !companyRecords[0].active) {
      throw new Error("Account is suspended or company inactive");
    }

    return this.generateTokens(user);
  }

  static async register(email: string, password: string, companyName: string) {
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      throw new Error("Email already in use");
    }

    const companyId = crypto.randomUUID();
    const userId = crypto.randomUUID();
    const passwordHash = await this.hashPassword(password);
    
    const isSuperAdmin: boolean = !!(process.env.SUPER_ADMIN_EMAIL && email.toLowerCase() === process.env.SUPER_ADMIN_EMAIL.toLowerCase());

    const otp = this.generateOTP();
    const expires = new Date(Date.now() + 15 * 60000); // 15 mins

    await db.insert(companies).values({
      id: companyId,
      name: companyName,
      subscriptionTier: 'starter',
      creditsBalance: 50,
      active: true,
    });

    await db.insert(users).values({
      id: userId,
      companyId: companyId,
      email: email,
      passwordHash: passwordHash,
      role: isSuperAdmin ? 'admin' : 'admin',
      isSuperAdmin: isSuperAdmin ?? false,
      isVerified: false,
      otp: otp,
      otpExpiresAt: expires
    });

    await EmailService.sendOTP(email, otp, 'verification');

    return { success: true, message: "Verification OTP sent" };
  }

  static async verifyOTP(email: string, otp: string) {
    const userRecords = await db.select().from(users).where(eq(users.email, email));
    if (userRecords.length === 0) throw new Error("User not found");

    const user = userRecords[0];

    if (!user.otp || user.otp !== otp) {
      throw new Error("Invalid OTP code");
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new Error("OTP code has expired");
    }

    await db.update(users)
      .set({ isVerified: true, otp: null, otpExpiresAt: null })
      .where(eq(users.id, user.id));

    return this.generateTokens(user);
  }

  static async resendOTP(email: string, purpose: 'verification' | 'reset') {
    const userRecords = await db.select().from(users).where(eq(users.email, email));
    if (userRecords.length === 0) throw new Error("User not found");

    const user = userRecords[0];
    const otp = this.generateOTP();
    const expires = new Date(Date.now() + 15 * 60000);

    await db.update(users)
      .set({ otp, otpExpiresAt: expires })
      .where(eq(users.id, user.id));

    await EmailService.sendOTP(email, otp, purpose);
    return { success: true };
  }

  static async forgotPassword(email: string) {
    // Generate an OTP for password reset
    return this.resendOTP(email, 'reset');
  }

  static async resetPassword(email: string, otp: string, newPassword: string) {
    const userRecords = await db.select().from(users).where(eq(users.email, email));
    if (userRecords.length === 0) throw new Error("User not found");

    const user = userRecords[0];

    if (!user.otp || user.otp !== otp) {
      throw new Error("Invalid OTP code");
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new Error("OTP code has expired");
    }

    const passwordHash = await this.hashPassword(newPassword);

    await db.update(users)
      .set({ 
        passwordHash, 
        otp: null, 
        otpExpiresAt: null,
        isVerified: true // resetting password implicitly verifies email
      })
      .where(eq(users.id, user.id));

    return this.generateTokens(user);
  }

  static async acceptInvite(token: string, newPassword: string) {
    const userRecords = await db.select().from(users).where(eq(users.inviteToken, token));
    if (userRecords.length === 0) throw new Error("Invalid or expired invite link");

    const user = userRecords[0];
    const passwordHash = await this.hashPassword(newPassword);

    await db.update(users)
      .set({ 
        passwordHash, 
        inviteToken: null, 
        isVerified: true 
      })
      .where(eq(users.id, user.id));

    // Refetch the user so we can generate tokens
    const updatedUserRecords = await db.select().from(users).where(eq(users.id, user.id));
    return this.generateTokens(updatedUserRecords[0]);
  }
}
