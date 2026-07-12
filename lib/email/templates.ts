import { transporter } from "./transporter";

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const MAIL_FROM = process.env.MAIL_FROM || "AuthNext <noreply@authnext.com>";

function baseTemplate(title: string, content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <div style="max-width:560px;margin:40px auto;background-color:#111111;border-radius:16px;overflow:hidden;border:1px solid #222;">
        <!-- Header -->
        <div style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid #222;">
          <h1 style="margin:0;color:#22c55e;font-size:24px;font-weight:700;letter-spacing:-0.5px;">🔐 AuthNext</h1>
        </div>

        <!-- Content -->
        <div style="padding:40px;">
          ${content}
        </div>

        <!-- Footer -->
        <div style="padding:24px 40px;background-color:#0a0a0a;text-align:center;border-top:1px solid #222;">
          <p style="margin:0;color:#555;font-size:12px;">This email was sent by AuthNext. If you didn't request this, please ignore it.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  const content = `
    <h2 style="margin:0 0 8px;color:#f5f5f5;font-size:20px;font-weight:600;">Verify your email</h2>
    <p style="margin:0 0 24px;color:#999;font-size:14px;line-height:1.6;">
      Thanks for signing up! Click the button below to verify your email address and activate your account.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${verifyUrl}" style="display:inline-block;padding:14px 32px;background-color:#22c55e;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;letter-spacing:0.3px;">Verify Email Address</a>
    </div>
    <p style="margin:0 0 8px;color:#666;font-size:13px;">Or copy this link into your browser:</p>
    <p style="margin:0;color:#22c55e;font-size:12px;word-break:break-all;background:#0a0a0a;padding:12px;border-radius:8px;">${verifyUrl}</p>
    <p style="margin:24px 0 0;color:#555;font-size:12px;">This link expires in 24 hours.</p>
  `;

  await transporter.sendMail({
    from: MAIL_FROM,
    to: email,
    subject: "Verify your email - AuthNext",
    html: baseTemplate("Verify Your Email", content),
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  const content = `
    <h2 style="margin:0 0 8px;color:#f5f5f5;font-size:20px;font-weight:600;">Reset your password</h2>
    <p style="margin:0 0 24px;color:#999;font-size:14px;line-height:1.6;">
      We received a request to reset your password. Click the button below to choose a new password.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background-color:#22c55e;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;letter-spacing:0.3px;">Reset Password</a>
    </div>
    <p style="margin:0 0 8px;color:#666;font-size:13px;">Or copy this link into your browser:</p>
    <p style="margin:0;color:#22c55e;font-size:12px;word-break:break-all;background:#0a0a0a;padding:12px;border-radius:8px;">${resetUrl}</p>
    <p style="margin:24px 0 0;color:#555;font-size:12px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
  `;

  await transporter.sendMail({
    from: MAIL_FROM,
    to: email,
    subject: "Reset your password - AuthNext",
    html: baseTemplate("Reset Your Password", content),
  });
}
