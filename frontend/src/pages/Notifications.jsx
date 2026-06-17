import { useEffect, useState } from "react";
import {
  Ticket,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Archive,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  archiveNotification,
} from "../api/api";

function getNotificationIcon(message) {
  const text = message.toLowerCase();

  if (text.includes("comment")) return MessageSquare;
  if (text.includes("resolved") || text.includes("closed"))
    return CheckCircle;
  if (text.includes("critical")) return AlertCircle;

  return Ticket;
}

function getIconStyle(message) {
  const text = message.toLowerCase();

  if (text.includes("comment")) {
    return {
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    };
  }

  if (text.includes("resolved") || text.includes("closed")) {
    return {
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    };
  }

  if (text.includes("critical")) {
    return {
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    };
  }

  return {
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
  };
}

function formatDate(value) {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadNotifications() {
    try {
      const response = await getNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error("Could not load notifications", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function handleMarkAsRead(id) {
    await markNotificationAsRead(id);
    await loadNotifications();
  }

  async function handleMarkAllAsRead() {
    await markAllNotificationsAsRead();
    await loadNotifications();
  }

  async function handleArchive(id) {
    await archiveNotification(id);
    await loadNotifications();
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <h1 className="text-3xl font-semibold">Notifications</h1>

            <p className="text-muted-foreground mt-1">
              {unreadCount} unread notification
              {unreadCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <button
          onClick={handleMarkAllAsRead}
          className="px-4 py-2 text-sm text-primary hover:bg-accent rounded-lg transition-colors"
        >
          Mark all as read
        </button>
      </div>

      {loading ? (
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12">
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-muted rounded-full mb-4">
              <CheckCircle className="w-12 h-12 text-muted-foreground" />
            </div>

            <h3 className="text-xl font-semibold mb-2">
              All caught up!
            </h3>

            <p className="text-muted-foreground">
              You do not have any notifications at the moment.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
          {notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.message);
            const style = getIconStyle(notification.message);

            return (
              <div
                key={notification.id}
                className={
                  "flex gap-4 p-5 hover:bg-accent/50 transition-colors " +
                  (!notification.isRead ? "bg-accent/30" : "")
                }
              >
                <div
                  className={
                    "p-3 rounded-full shrink-0 " + style.bgColor
                  }
                >
                  <Icon className={"w-5 h-5 " + style.color} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h3 className="font-medium">
                      {notification.message}
                    </h3>

                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-2" />
                    )}
                  </div>

                  {notification.ticketId && (
                    <p className="text-sm text-muted-foreground mb-1">
                      Related ticket: TKT-{notification.ticketId}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground">
                    {formatDate(notification.createdAt)}
                  </p>

                  <div className="flex gap-2 mt-3">
                    {!notification.isRead && (
                      <button
                        onClick={() =>
                          handleMarkAsRead(notification.id)
                        }
                        className="text-xs px-3 py-1 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Mark Read
                      </button>
                    )}

                    <button
                      onClick={() =>
                        handleArchive(notification.id)
                      }
                      className="flex items-center gap-1 text-xs px-3 py-1 border border-border rounded-lg hover:bg-accent transition-colors"
                    >
                      <Archive className="w-3 h-3" />
                      Archive
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}