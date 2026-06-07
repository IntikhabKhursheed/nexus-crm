import { Router } from "express";
import { login, me, refresh, register } from "../controllers/auth.controller.js";
import { requireAuth, requireRefreshToken } from "../middleware/auth.middleware.js";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/refresh", requireRefreshToken, refresh);
authRouter.get("/me", requireAuth, me);
