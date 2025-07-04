import styles from "./NotificationItem.module.css";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext.jsx";
import axios from "../../api/axiosInstance";
import { useEffect, useState } from "react";

import { usePostModal } from "../../context/PostModalContext.jsx";

const API_BASE = "http://localhost:3000";

export default function NotificationItem({
  notification,
  onClosePanel,
  onMarkAsReadLocally,
}) {
  const { sender, post, type, createdAt, _id } = notification;
  const [isRead, setIsRead] = useState(notification.isRead);

  const navigate = useNavigate();
  const { openPostModal } = usePostModal();
  const { user: currentUser } = useUser();

  useEffect(() => {
    setIsRead(notification.isRead);
  }, [notification.isRead]);

  const handleClick = async () => {
    if (!sender) {
      console.warn("author is undefined");
      return;
    }
    await markAsRead();
    if (currentUser && sender._id === currentUser._id) {
      navigate("/profile");
    } else {
      navigate(`/users/${sender._id}`);
    }
  };

  const markAsRead = async () => {
    if (!isRead) {
      setIsRead(true);
      onMarkAsReadLocally && onMarkAsReadLocally(_id);
      try {
        await axios.patch(`/notifications/${_id}/read`);
      } catch (err) {
        console.error("Ошибка при пометке уведомления как прочитанного", err);
      }
    }
  };

  const handlePostClick = async () => {
    if (!post?._id) return;

    try {
      await markAsRead(); // сначала пометить как прочитанное
      onMarkAsReadLocally && onMarkAsReadLocally(_id); // сразу локально обновляем
      onClosePanel && onClosePanel(); // потом закрываем панель
      const res = await axios.get(`/posts/${post._id}`);
      const fullPost = res.data;
      openPostModal(fullPost); // открываем модалку
    } catch (err) {
      console.error("Не удалось загрузить пост:", err);
    }
  };

  let message = "";

  switch (type) {
    case "like":
      message = `${sender.username} liked your post`;
      break;
    case "comment":
      message = `${sender.username} commented on your post`;
      break;
    case "likeComment":
      message = `${sender.username} liked your comment`;
      break;
    case "follow":
      message = `${sender.username} followed you`;
      break;
    default:
      message = `${sender.username} сделал действие`;
  }

  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  const avatarUrl = sender.avatar.startsWith("http")
    ? sender.avatar
    : `${API_BASE}/${sender.avatar}`;

  function getYouTubeVideoId(url) {
    try {
      const urlObj = new URL(url);

      if (urlObj.hostname.includes("youtu.be")) {
        return urlObj.pathname.slice(1);
      } else if (urlObj.hostname.includes("youtube.com")) {
        return urlObj.searchParams.get("v");
      }
    } catch {
      return null;
    }
  }

  function getYouTubeThumbnail(url) {
    const id = getYouTubeVideoId(url);
    return id ? `https://img.youtube.com/vi/${id}/0.jpg` : "";
  }

  return (
    <div
      className={`${styles.notificationItem} ${!isRead ? styles.unread : ""}`}
    >
      <img
        src={avatarUrl}
        alt={sender.username}
        className={styles.avatar}
        onClick={handleClick}
      />

      <div
        className={styles.content}
        onClick={async () => {
          await markAsRead();
        }}
      >
        <p className={styles.message}>
          {!isRead && <span className={styles.dot} />} {message}
        </p>
        <span className={styles.time}>{timeAgo}</span>
      </div>

      {post?._id && (
        <img
          src={
            post.image
              ? post.image.startsWith("http")
                ? post.image
                : `${API_BASE}/${post.image.replace(/^\/+/, "")}`
              : post.videoUrl
              ? getYouTubeThumbnail(post.videoUrl)
              : null
          }
          alt="Post thumbnail"
          className={styles.postThumbnail}
          onClick={handlePostClick}
        />
      )}
    </div>
  );
}
