import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";
import { getAnalyticsOverview } from "../services/analytics.service.js";

export const getAnalyticsDashboard = asyncHandler(async (req, res) => {
  if (!req.organization) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const analytics = await getAnalyticsOverview(req.organization.id);
  return sendResponse(res, 200, "Analytics dashboard loaded successfully.", { analytics });
});

