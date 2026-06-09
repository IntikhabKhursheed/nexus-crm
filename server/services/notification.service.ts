import { Notification } from "../models/Notification.js";
import { Membership } from "../models/Membership.js";
import { emitOrganizationEvent } from "./realtime.service.js";

export async function createOrganizationNotifications(params: {
  organizationId: string;
  type: string;
  title: string;
  message: string;
  metadata?: unknown;
  excludeUserId?: string;
}) {
  const memberships = await Membership.find({
    organizationId: params.organizationId,
    status: "active",
    ...(params.excludeUserId ? { userId: { $ne: params.excludeUserId } } : {})
  })
    .select("userId")
    .lean();

  if (memberships.length === 0) {
    return [];
  }

  const notifications = await Notification.insertMany(
    memberships.map((membership) => ({
      organizationId: params.organizationId,
      userId: membership.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      metadata: params.metadata ?? null
    }))
  );

  notifications.forEach((notification) => {
    emitOrganizationEvent(params.organizationId, "notification:new", {
      notification
    });
  });

  return notifications;
}

export async function markNotificationRead(notificationId: string, userId: string, organizationId: string) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, userId, organizationId },
    { $set: { isRead: true } },
    { new: true }
  );
}
