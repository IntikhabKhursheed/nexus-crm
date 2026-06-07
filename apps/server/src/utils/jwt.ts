import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type TokenType = "access" | "refresh";

export type JwtUserPayload = {
  userId: string;
  email: string;
};

export function signAccessToken(payload: JwtUserPayload) {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn
  });
}

export function signRefreshToken(payload: JwtUserPayload) {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.jwtAccessSecret) as JwtUserPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.jwtRefreshSecret) as JwtUserPayload;
}
