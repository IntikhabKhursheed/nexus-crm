import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
dotenv.config({ path: path.join(serverRoot, ".env") });

const isProduction = (process.env.NODE_ENV ?? "development") === "production";

function required(name: string, devFallback?: string) {
  const value = process.env[name] ?? devFallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function secret(name: string, devFallback: string) {
  const value = process.env[name];
  if (value) {
    return value;
  }
  if (isProduction) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return devFallback;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  mongoUri: required("MONGODB_URI", process.env.MONGODB_URL),
  clientOrigin: required("CLIENT_ORIGIN", "http://localhost:3000"),
  grokApiKey: process.env.GROK_API ?? process.env.GROK_API_KEY ?? process.env.XAI_API_KEY ?? "",
  grokBaseUrl: process.env.GROK_BASE_URL ?? "https://api.x.ai/v1",
  grokModel: process.env.GROK_MODEL ?? "llama-3.3-70b-versatile",
  aiRequestTimeoutMs: Number(process.env.AI_REQUEST_TIMEOUT_MS ?? 60000),
  jwtAccessSecret: secret("JWT_ACCESS_SECRET", "nexuscrm-dev-access-secret"),
  jwtRefreshSecret: secret("JWT_REFRESH_SECRET", "nexuscrm-dev-refresh-secret"),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "30d",
  stripeSecretKey: secret("STRIPE_SECRET_KEY", "sk_test_nexuscrm_dev"),
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  stripeFreePriceId: process.env.STRIPE_FREE_PRICE_ID ?? "",
  stripeProPriceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
  stripeEnterprisePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? "",
  gmailUser: process.env.GMAIL_USER ?? "",
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD ?? "",
  weeklyDigestFrom: process.env.WEEKLY_DIGEST_FROM ?? process.env.GMAIL_USER ?? ""
};
