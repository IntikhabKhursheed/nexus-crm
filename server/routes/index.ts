import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { billingRouter } from "./billing.routes.js";
import { organizationRouter } from "./organization.routes.js";
import { publicRouter } from "./public.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/billing", billingRouter);
apiRouter.use("/public", publicRouter);
apiRouter.use("/organizations", organizationRouter);
