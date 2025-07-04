import styles from "./PostCard.module.css";
import { Heart, MessageCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import axios from "../../api/axiosInstance";
import { usePostModal } from "../../context/PostModalContext";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const API_BASE = "http://localhost:3000";

export default function PostCard({ post, onViewComments }) {
  const { openPostModal } = usePostModal();

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);

  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const res = await axios.get(`/likes/status/${post._id}`, { headers });
        setLiked(res.data.liked);
      } catch (err) {
        console.error("Ошибка при проверке лайка:", err.message);
      }
    };

    const fetchLikesCount = async () => {
      try {
        const res = await axios.get(`/likes/${post._id}`, { headers });
        setLikesCount(res.data.likes);
      } catch (err) {
        console.error("Ошибка при загрузке количества лайков:", err.message);
      }
    };

    if (post._id && currentUserId) {
      fetchLikeStatus();
      fetchLikesCount();
    }
  }, [currentUserId, post._id]);

  useEffect(() => {
    if (token && token.split(".").length === 3) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded.id);
      } catch (error) {
        console.error("JWT decode error:", error.message);
      }
    }
  }, [token]);

  const navigate = useNavigate();

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/follow/${currentUserId}/following`,
          { headers }
        );
        const isFollow = res.data.some((user) => user._id === post.author._id);
        setIsFollowing(isFollow);
      } catch (err) {
        console.error("Ошибка при проверке подписки:", err);
      }
    };

    if (post?.author?._id && currentUserId) {
      checkSubscription();
    }
  }, [post, currentUserId]);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`/comments/${post._id}`, {
        headers,
      });

      setCommentsCount(res.data.length);
    } catch (err) {
      console.error("Ошибка при загрузке комментариев:", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleFollow = async () => {
    try {
      if (!isFollowing) {
        await axios.post(`/users/${post.author._id}/follow`, { headers });
        setIsFollowing(true);
      } else {
        await axios.delete(`/users/${post.author._id}/unfollow`, { headers });
        setIsFollowing(false);
      }
    } catch (err) {
      console.error("Ошибка при подписке/отписке:", err);
    }
  };

  const handleLike = async () => {
    try {
      const res = await axios.post(`/likes/${post._id}`, {}, { headers });
      const { liked, likesCount } = res.data;
      setLiked(liked); // true — если лайк поставлен, false — убрали
      setLikesCount(likesCount);
    } catch (err) {
      console.error("Ошибка при лайке:", err.response?.data || err.message);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await axios.post(
        `/comments/${post._id}`,
        { text: newComment },
        { headers }
      );
      setNewComment("");
      fetchComments();
      setCommentsCount((prev) => prev + 1);
      setShowComments(false);
    } catch (err) {
      console.error("Ошибка при отправке комментария:", err);
    }
  };
  const handleClick = (userId) => {
    if (!currentUserId) return;
    if (userId === currentUserId) {
      navigate("/profile");
    } else {
      navigate(`/users/${userId}`);
    }
  };

  function getYouTubeEmbedUrl(url) {
    try {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get("v");
      return videoId
        ? `https://www.youtube-nocookie.com/embed/${videoId}`
        : null;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [showComments]);

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          {post.author.avatar && (
            <img
              src={
                post.author.avatar.startsWith("http")
                  ? post.author.avatar
                  : `${API_BASE}${post.author.avatar}`
              }
              alt={post.author.username}
              className={styles.avatar}
              onClick={() => handleClick(post.author._id)}
            />
          )}
          <div>
            <span
              className={styles.username}
              onClick={() => handleClick(post.author._id)}
            >
              {post.author.username}
            </span>
            <span> • </span>
            <span className={styles.time}>
              {" "}
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>

        {currentUserId !== post.author._id && (
          <button className={styles.followBtn} onClick={handleFollow}>
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}
      </header>

      {post.videoUrl ? (
        <div
          className={styles.videoWrapper}
          onClick={() => openPostModal(post)}
          style={{ cursor: "pointer" }}
        >
          <iframe
            src={getYouTubeEmbedUrl(post.videoUrl)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Post video"
            width="100%"
            height="100%"
          />
        </div>
      ) : (
        <img
          src={
            post.image && typeof post.image === "string"
              ? post.image.startsWith("http")
                ? post.image
                : `${API_BASE}/${post.image.replace(/^\/+/, "")}`
              : "/placeholder-image.png"
          }
          alt=""
          onClick={() => openPostModal(post)}
          style={{ cursor: "pointer" }}
          className={styles.image}
        />
      )}

      <section className={styles.actions}>
        <Heart
          size={20}
          onClick={handleLike}
          style={{ cursor: "pointer" }}
          color={liked ? "red" : "gray"}
          fill={liked ? "red" : "none"}
        />
        <MessageCircle
          size={20}
          onClick={() => setShowComments((prev) => !prev)}
          style={{ cursor: "pointer" }}
          color={showComments ? "blue" : "gray"}
        />
      </section>

      <p className={styles.likes}>{likesCount} likes</p>

      <p className={styles.caption}>
        <strong>{post.author.username}</strong> <i>{post.description}</i>
      </p>

      <button className={styles.comments} onClick={onViewComments}>
        View all comments ({commentsCount})
      </button>

      {showComments && (
        <form onSubmit={handleSubmitComment} className={styles.commentForm}>
          <input
            ref={inputRef}
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className={styles.commentInput}
          />
          <button type="submit" className={styles.commentBtn}>
            Post
          </button>
        </form>
      )}
    </article>
  );
}
