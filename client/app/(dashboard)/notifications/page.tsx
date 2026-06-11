"use client";

import { useEffect, useState } from "react";
import { WorkspaceShell } from "@/components/workspace-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { Badge, PageHeader, Panel } from "@/components/ui/chrome";
import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationRecord
} from "@/lib/notifications";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { pushToast } = useToast();

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [notificationsResponse, unreadResponse] = await Promise.all([
        listNotifications(),
        getUnreadNotificationCount()
      ]);
      setNotifications(notificationsResponse.notifications);
      setUnreadCount(unreadResponse.unreadCount);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Unable to load notifications.";
      setError(message);
      pushToast({ type: "error", title: "Notifications failed to load", description: message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleMarkRead(notificationId: string) {
    try {
      await markNotificationRead(notificationId);
      await loadData();
    } catch {
      // Ignore mark-read failures for now.
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead();
      pushToast({ type: "success", title: "Notifications cleared", description: "All notifications marked as read." });
      await loadData();
    } catch {
      // Ignore bulk mark-read failures for now.
    }
  }

  return (
    <WorkspaceShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Notifications"
          title="Notification history"
          description="Review activity in a calmer inbox-style layout with unread counts and bulk actions."
          actions={
            <button onClick={() => void handleMarkAllRead()} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted">
              Mark all read
            </button>
          }
        />

        <Badge tone="rose">Unread: {unreadCount}</Badge>
        {error && <ErrorState description={error} onRetry={() => void loadData()} />}

        <Panel className="space-y-3">
          {loading ? (
            <LoadingState label="Loading notifications..." />
          ) : notifications.length === 0 ? (
            <EmptyState title="No notifications yet" description="Activity from your organization will show up here in real time." />
          ) : (
            notifications.map((notification) => (
              <button
                key={notification._id}
                type="button"
                onClick={() => void handleMarkRead(notification._id)}
                className={`block w-full rounded-3xl border p-4 text-left transition ${
                  notification.isRead ? "border-border bg-card" : "border-slate-400/40 bg-muted"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{notification.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{notification.message}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>
              </button>
            ))
          )}
        </Panel>
      </div>
    </WorkspaceShell>
  );
}
