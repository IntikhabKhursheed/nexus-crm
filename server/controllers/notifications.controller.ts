import { Notification } from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";
import { markNotificationRead } from "../services/notification.service.js";

export const listNotifications = asyncHandler(async (req, res) => {
  if (!req.organization || !req.auth?.userId) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const notifications = await Notification.find({
    organizationId: req.organization.id,
    userId: req.auth.userId
  })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return sendResponse(res, 200, "Notifications loaded successfully.", { notifications });
});

export const getUnreadNotificationCount = asyncHandler(async (req, res) => {
  if (!req.organization || !req.auth?.userId) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const unreadCount = await Notification.countDocuments({
    organizationId: req.organization.id,
    userId: req.auth.userId,
    isRead: false
  });

  return sendResponse(res, 200, "Unread notification count loaded successfully.", { unreadCount });
});

export const markNotificationAsRead = asyncHandler(async (req, res) => {
  if (!req.organization || !req.auth?.userId) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  const notificationId = String(req.params.notificationId);
  const notification = await markNotificationRead(notificationId, req.auth.userId, req.organization.id);

  if (!notification) {
    return sendResponse(res, 404, "Notification not found.", {});
  }

  return sendResponse(res, 200, "Notification marked as read.", { notification });
});

export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  if (!req.organization || !req.auth?.userId) {
    return sendResponse(res, 400, "Organization context is missing.", {});
  }

  await Notification.updateMany(
    {
      organizationId: req.organization.id,
      userId: req.auth.userId,
      isRead: false
    },
    { $set: { isRead: true } }
  );

  return sendResponse(res, 200, "All notifications marked as read.", {});
});

