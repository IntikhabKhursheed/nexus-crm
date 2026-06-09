import type { NextFunction, Request, Response } from "express";
import { RateLimiterMemory } from "rate-limiter-flexible";

type RateLimitOptions = {
  points: number;
  duration: number;
  keyPrefix: string;
  message: string;
};

function sanitizeValue(value: unknown): unknown {
  if (typeof value === "string") {
    return value.replace(/\u0000/g, "").trim();
  }

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeValue(entry));
  }

  if (value && typeof value === "object" && !Buffer.isBuffer(value)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [key, sanitizeValue(entry)])
    );
  }

  return value;
}

export function sanitizeRequestPayload(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body) as typeof req.body;
  }

  if (req.query && typeof req.query === "object") {
    req.query = sanitizeValue(req.query) as typeof req.query;
  }

  if (req.params && typeof req.params === "object") {
    req.params = sanitizeValue(req.params) as typeof req.params;
  }

  return next();
}

export function createRateLimitMiddleware({ points, duration, keyPrefix, message }: RateLimitOptions) {
  const limiter = new RateLimiterMemory({
    points,
    duration,
    keyPrefix
  });

  return async function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
    const key = String(req.auth?.userId ? `${req.auth.userId}:${req.ip ?? "anonymous"}` : req.ip ?? "anonymous");

    try {
      const result = await limiter.consume(key);

      res.setHeader("X-RateLimit-Limit", String(points));
      res.setHeader("X-RateLimit-Remaining", String(result.remainingPoints));
      res.setHeader("X-RateLimit-Reset", String(Math.ceil((Date.now() + result.msBeforeNext) / 1000)));
      return next();
    } catch (error) {
      const retryAfterSeconds = Math.ceil((Number((error as { msBeforeNext?: number }).msBeforeNext ?? 0) || 0) / 1000);
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        success: false,
        message,
        data: {}
      });
    }
  };
}

export const authRateLimit = createRateLimitMiddleware({
  points: 20,
  duration: 60,
  keyPrefix: "auth",
  message: "Too many authentication attempts. Please try again in a minute."
});

export const aiRateLimit = createRateLimitMiddleware({
  points: 15,
  duration: 60,
  keyPrefix: "ai",
  message: "Too many AI requests. Please slow down and try again shortly."
});
