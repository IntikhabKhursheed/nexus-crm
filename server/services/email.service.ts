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

  return transporter.sendMail({
    from: env.weeklyDigestFrom || env.gmailUser,
    to,
    subject,
    text,
    html
  });
}

export function isEmailConfigured() {
  return Boolean(env.gmailUser && env.gmailAppPassword);
}
