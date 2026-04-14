import { useEffect, useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import {
  Bell,
  CheckCheck,
  Megaphone,
  CalendarCheck2,
  BadgePercent,
  Star,
  Settings,
} from "lucide-react";
import { baseUrl } from "../../../constant";
import { useNavigate } from "react-router-dom";
import styles from "./VendorNotifications.module.css";

const VendorNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const unreadCount = useMemo(() => {
    return notifications.filter((item) => !Number(item.is_read)).length;
  }, [notifications]);

  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${baseUrl}/notifications/getNotifications.php?token=${encodeURIComponent(
          token
        )}&limit=50`
      );

      const data = await res.json();

      if (data.success) {
        setNotifications(Array.isArray(data.data) ? data.data : []);
      } else {
        toast.error(data.message || "Failed to load notifications");
        setNotifications([]);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Failed to load notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId) => {
    if (!token) return false;

    try {
      setMarkingId(notificationId);

      const res = await fetch(`${baseUrl}/notifications/markNotificationRead.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          notification_id: notificationId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setNotifications((prev) =>
          prev.map((item) =>
            item.notification_id === notificationId
              ? { ...item, is_read: 1 }
              : item
          )
        );
        window.dispatchEvent(new Event("notificationsUpdated"));
        return true;
      } else {
        toast.error(data.message || "Failed to mark notification as read");
        return false;
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast.error("Failed to mark notification as read");
      return false;
    } finally {
      setMarkingId(null);
    }
  };

  const markAllAsRead = async () => {
    if (!token || unreadCount === 0) return;

    try {
      setMarkingAll(true);

      const res = await fetch(
        `${baseUrl}/notifications/markAllNotificationsRead.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setNotifications((prev) =>
          prev.map((item) => ({
            ...item,
            is_read: 1,
          }))
        );
        window.dispatchEvent(new Event("notificationsUpdated"));
        toast.success(data.message || "All notifications marked as read");
      } else {
        toast.error(data.message || "Failed to mark all notifications as read");
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    } finally {
      setMarkingAll(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);

    return date.toLocaleString([], {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeIcon = (type) => {
    const normalized = String(type || "").toLowerCase();

    if (
      [
        "booking",
        "booking_update",
        "booking_cancel",
        "check_in",
        "check_out",
        "payment",
      ].includes(normalized)
    ) {
      return <CalendarCheck2 size={16} />;
    }

    if (normalized === "offer") {
      return <BadgePercent size={16} />;
    }

    if (normalized === "review") {
      return <Star size={16} />;
    }

    if (normalized === "system") {
      return <Settings size={16} />;
    }

    return <Megaphone size={16} />;
  };

const getNotificationTarget = (item) => {
  const type = String(item?.type || "").toLowerCase();
  const relatedId = Number(item?.related_id || 0);

  if (
    [
      "booking",
      "booking_update",
      "booking_cancel",
      "check_in",
      "check_out",
      "payment",
      "system",
    ].includes(type)
  ) {
    return relatedId > 0
      ? `/vendor/bookings?booking_id=${relatedId}`
      : "/vendor/bookings";
  }

  if (type === "offer") {
    return "/vendor/offers";
  }

  if (type === "review") {
    return "/vendor/hotels";
  }

  return "/vendor/notifications";
};

const handleNotificationClick = (item) => {
  const isUnread = !Number(item.is_read);

  if (isUnread && markingId !== item.notification_id) {
    markAsRead(item.notification_id);
  }

  navigate(getNotificationTarget(item));
};

  if (loading) {
    return <div className={styles.stateText}>Loading notifications...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div className={styles.headerLeft}>
            <h2 className={styles.heading}>Notifications</h2>
            <span className={styles.countBadge}>{unreadCount}</span>
          </div>

          <button
            type="button"
            className={styles.markAllBtn}
            onClick={markAllAsRead}
            disabled={markingAll || unreadCount === 0}
          >
            <CheckCheck size={16} />
            {markingAll ? "Marking..." : "Mark all as read"}
          </button>
        </div>

        {notifications.length === 0 ? (
          <div className={styles.emptyState}>
            <Bell size={34} />
            <h3>No notifications yet</h3>
            <p>New booking and review updates will appear here.</p>
          </div>
        ) : (
          <div className={styles.list}>
            {notifications.map((item) => {
              const isUnread = !Number(item.is_read);

              return (
                <div
                  key={item.notification_id}
                  className={`${styles.item} ${
                    isUnread ? styles.unreadItem : styles.readItem
                  }`}
                  onClick={() => handleNotificationClick(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleNotificationClick(item);
                    }
                  }}
                >
                  <div className={styles.iconWrap}>{getTypeIcon(item.type)}</div>

                  <div className={styles.content}>
                    <p className={styles.message}>{item.message}</p>
                    <p className={styles.date}>{formatDate(item.created_at)}</p>
                  </div>

                  <div className={styles.rightArea}>
                    {isUnread && <span className={styles.unreadDot} />}

                    {isUnread && (
                      <button
                        type="button"
                        className={styles.singleReadBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(item.notification_id);
                        }}
                        disabled={markingId === item.notification_id}
                      >
                        {markingId === item.notification_id
                          ? "Marking..."
                          : "Mark read"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorNotifications;