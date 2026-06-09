import { Router } from "express";
import { login, me, refresh, register } from "../controllers/auth.controller.js";
import { requireAuth, requireRefreshToken } from "../middleware/auth.middleware.js";
import { authRateLimit } from "../middleware/security.middleware.js";

export const authRouter = Router();

authRouter.post("/register", authRateLimit, register);
authRouter.post("/login", authRateLimit, login);
authRouter.post("/refresh", requireRefreshToken, refresh);
authRouter.get("/me", requireAuth, me);
