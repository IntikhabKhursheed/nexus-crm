import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { billingRouter } from "./billing.routes.js";
import { organizationRouter } from "./organization.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/billing", billingRouter);
apiRouter.use("/organizations", organizationRouter);
