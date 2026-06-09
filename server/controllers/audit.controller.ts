import { AuditLog } from "../models/AuditLog.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";

export const listAuditLogs = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const auditLogs = await AuditLog.find({ organizationId: req.organization.id }).sort({ createdAt: -1 }).limit(200).lean();
  return sendResponse(res, 200, "Audit logs loaded successfully.", { auditLogs });
});

