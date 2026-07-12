import nodemailer from "nodemailer";

const globalForTransporter = globalThis as unknown as {
  transporter: nodemailer.Transporter | undefined;
};

function createTransporter(): nodemailer.Transporter {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export const transporter =
  globalForTransporter.transporter ?? createTransporter();

if (process.env.NODE_ENV !== "production") {
  globalForTransporter.transporter = transporter;
}
