import { Router } from "express";
import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead
} from "../controllers/notifications.controller.js";

export const notificationsRouter = Router();

notificationsRouter.get("/", listNotifications);
notificationsRouter.get("/unread-count", getUnreadNotificationCount);
notificationsRouter.patch("/:notificationId/read", markNotificationAsRead);
notificationsRouter.patch("/read-all", markAllNotificationsAsRead);

