import nodemailer from "nodemailer";
import { env } from "../config/env.js";

type SendEmailArgs = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

function getTransporter() {
  if (!env.gmailUser || !env.gmailAppPassword) {
    throw new Error("Email delivery is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD.");
  }

  console.info("[AI][Email] Transport config", {
    provider: "gmail",
    from: env.weeklyDigestFrom || env.gmailUser,
    configured: true
  });

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.gmailUser,
      pass: env.gmailAppPassword
    }
  });
}

export async function sendEmailMessage({ to, subject, text, html }: SendEmailArgs) {
  const transporter = getTransporter();

  console.info("[AI][Email] Send request", {
    to,
    subject,
    from: env.weeklyDigestFrom || env.gmailUser
  });

  const result = await transporter.sendMail({
    from: env.weeklyDigestFrom || env.gmailUser,
    to,
    subject,
    text,
    html
  });

  console.info("[AI][Email] Send result", {
    messageId: result.messageId,
    accepted: result.accepted,
    rejected: result.rejected
  });

  return result;
}

export function isEmailConfigured() {
  return Boolean(env.gmailUser && env.gmailAppPassword);
}
