import type { NextFunction, Request, Response } from "express";
import { User } from "../models/User.js";
import { verifyAccessToken, verifyRefreshToken } from "../utils/jwt.js";
import { sendResponse } from "../utils/apiResponse.js";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        email: string;
      };
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

function extractBearerToken(headerValue?: string) {
  if (!headerValue) return null;
  const [scheme, token] = headerValue.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return sendResponse(res, 401, "Access token is required.", {});
  }

  try {
    const payload = verifyAccessToken(token);
    req.auth = payload;
    req.user = { id: payload.userId, email: payload.email };
    return next();
  } catch {
    return sendResponse(res, 401, "Invalid or expired access token.", {});
  }
}

export async function requireRefreshToken(req: Request, res: Response, next: NextFunction) {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return sendResponse(res, 401, "Refresh token is required.", {});
  }

  try {
    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.userId).lean();

    if (!user || !user.isActive) {
      return sendResponse(res, 401, "User is inactive or missing.", {});
    }

    req.auth = payload;
    req.user = { id: String(user._id), email: user.email };
    return next();
  } catch {
    return sendResponse(res, 401, "Invalid or expired refresh token.", {});
  }
}
