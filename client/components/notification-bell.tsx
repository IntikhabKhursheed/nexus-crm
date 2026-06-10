"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationRecord
} from "@/lib/notifications";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { BellIcon } from "./ui/icons";

export function NotificationBell({ organizationId }: { organizationId?: string }) {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  async function refreshNotifications() {
    try {
      const [listResult, countResult] = await Promise.all([listNotifications(), getUnreadNotificationCount()]);
      setNotifications(listResult.notifications);
      setUnreadCount(countResult.unreadCount);
    } catch {
      // Keep existing state if refresh fails.
    }
  }

  useEffect(() => {
    void refreshNotifications();

    const socket = connectSocket();
    socket?.on("notification:new", (payload: { notification?: NotificationRecord }) => {
      if (payload.notification) {
        setNotifications((current) => [payload.notification!, ...current]);
        setUnreadCount((current) => current + 1);
      }
    });

    return () => {
      socket?.off("notification:new");
      disconnectSocket();
    };
  }, [organizationId]);

  async function handleMarkRead(notificationId: string) {
    try {
      await markNotificationRead(notificationId);
      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId ? { ...notification, isRead: true } : notification
        )
      );
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch {
      // Ignore single-item failures.
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead();
      setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Ignore bulk failure.
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 hover:bg-muted"
      >
        <BellIcon className="h-4 w-4" />
        Alerts
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-lg">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-40 w-96 rounded-[28px] border border-border bg-card p-4 shadow-[0_28px_80px_rgba(15,23,42,0.18)]">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <button type="button" onClick={() => void handleMarkAllRead()} className="text-xs underline">
              Mark all read
            </button>
          </div>

          <div className="max-h-96 space-y-3 overflow-y-auto">
            {notifications.slice(0, 8).map((notification) => (
              <button
                key={notification._id}
                type="button"
                onClick={() => void handleMarkRead(notification._id)}
                className={`block w-full rounded-2xl border px-4 py-3 text-left transition hover:-translate-y-0.5 ${
                  notification.isRead ? "border-border bg-background" : "border-slate-400/40 bg-muted"
                }`}
              >
                <p className="text-sm font-semibold">{notification.title}</p>
                <p className="mt-1 text-xs text-slate-500">{notification.message}</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </button>
            ))}
            {notifications.length === 0 && <p className="text-sm text-slate-500">No notifications yet.</p>}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Link href="/notifications" className="text-sm font-medium underline">
              View history
            </Link>
            <button type="button" onClick={() => void refreshNotifications()} className="text-sm font-medium underline">
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
