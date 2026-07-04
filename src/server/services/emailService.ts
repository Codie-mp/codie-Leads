import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export class EmailService {
  static async sendOTP(email: string, otp: string, purpose: 'verification' | 'reset') {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.warn("Gmail SMTP credentials missing. Skipping email send for:", email, "OTP:", otp);
      return;
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

    await transporter.sendMail({
      from: `"Codie Leads" <${process.env.GMAIL_USER}>`,
      to: email,
      subject,
      html,
    });
  }
}
