import styles from "./NotificationPanel.module.css";
import NotificationItem from "../../components/notificationItem/NotificationItem.jsx";
import { useState, useEffect } from "react";

export default function NotificationPanel({
  notifications,
  onClose,
  onClearRead,
  onMarkAsRead,
}) {
  const [notificationsState, setNotifications] = useState([]);

  useEffect(() => {
    if (Array.isArray(notifications)) {
      setNotifications(notifications);
    }
  }, [notifications]);

  return (
    <div className={styles.panel}>
      <h3>
        Notifications
        <button
          className={styles.clearButton}
          onClick={onClearRead}
          disabled={notificationsState.every((n) => !n.isRead)}
        >
          сlear readed
        </button>
      </h3>
      {notificationsState.length === 0 ? (
        <p>No notifications yet</p>
      ) : (
        notificationsState.map((n) => (
          <NotificationItem
            key={n._id}
            notification={n}
            onClosePanel={onClose}
            onMarkAsReadLocally={() => onMarkAsRead(n._id)}
          />
        ))
      )}
    </div>
  );
}
