import { Router } from "express";
import { listAuditLogs } from "../controllers/audit.controller.js";

export const auditRouter = Router();

auditRouter.get("/", listAuditLogs);

