import nodemailer from "nodemailer";

export class EmailDeliveryError extends Error {
  code = "EMAIL_DELIVERY_FAILED";
  statusCode = 503;

  constructor(message = "We could not send the email right now. Please try again later.") {
    super(message);
    this.name = "EmailDeliveryError";
  }
}

const smtpUser = (process.env.SMTP_USER || process.env.GMAIL_USER)?.trim();
const smtpPassword = (process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD)?.trim();
const smtpFrom = (process.env.SMTP_FROM || smtpUser)?.trim();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
  auth: smtpUser && smtpPassword ? { user: smtpUser, pass: smtpPassword } : undefined,
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 15_000,
});

export class EmailService {
  static async sendOTP(email: string, otp: string, purpose: 'verification' | 'reset'): Promise<void> {
    if (!smtpUser || !smtpPassword || !smtpFrom) {
      console.error("OTP email delivery is not configured: set SMTP_USER/SMTP_PASSWORD/SMTP_FROM or GMAIL_USER/GMAIL_APP_PASSWORD.");
      throw new EmailDeliveryError("Email delivery is not configured. Please contact the administrator.");
    }

    const isReset = purpose === 'reset';
    const subject = isReset ? "Reset Your Codie Leads Password" : "Verify Your Codie Leads Account";
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 8px;">
        <h2 style="color: #1e3a8a;">${isReset ? 'Password Reset Request' : 'Welcome to Codie Leads!'}</h2>
        <p style="color: #374151; font-size: 16px;">
          ${isReset 
            ? "We received a request to reset your password. Use the code below to complete the process:" 
            : "Thanks for signing up. Please verify your email address using the code below:"}
        </p>
        <div style="background-color: #f3f4f6; padding: 16px; text-align: center; border-radius: 6px; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1f2937;">${otp}</span>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          This code will expire in 15 minutes. If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `;

    try {
      const result = await transporter.sendMail({
        from: smtpFrom.includes("<") ? smtpFrom : `"Codie Leads" <${smtpFrom}>`,
        to: email,
        subject,
        html,
      });

      if (!result.accepted?.length) {
        throw new Error("SMTP server did not accept the OTP message");
      }

      console.info("OTP email accepted by SMTP", { purpose, messageId: result.messageId });
    } catch (error: any) {
      console.error("OTP email delivery failed", {
        purpose,
        code: error?.code,
        responseCode: error?.responseCode,
        message: error?.message,
      });
      throw new EmailDeliveryError();
    }
  }
}
