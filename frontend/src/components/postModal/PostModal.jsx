import { useEffect, useState } from "react";
import styles from "./PostModal.module.css";
import { Heart, MessageCircle, X, MoreHorizontal } from "lucide-react";
import axios from "../../api/axiosInstance";
import { formatDistanceToNow } from "date-fns";

import PostActionsModal from "../postActionsModal/PostActionsModal";
import EditPostModal from "../editPostModal/EditPostModal";
import { useNavigate } from "react-router-dom";

import useCurrentUserId from "../../hooks/useCurrentUserId.js";

import { usePostEvents } from "../../context/PostEventsContext";

const API_BASE = "https://ichgram-demo.onrender.com";

export default function PostModal({ post, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [commentLikes, setCommentLikes] = useState({});
  const [showOptions, setShowOptions] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [subscribed, setSubscribed] = useState(false);

  const { subscribeToUpdated } = usePostEvents();
  const { subscribeToDeleted } = usePostEvents();
  const { notifyPostDeleted } = usePostEvents();

  const currentUserId = useCurrentUserId();

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = subscribeToUpdated((updatedPost) => {
      if (updatedPost._id === post._id) {
        onClose(); // Закрываем модалку, если редактируемый пост был обновлён
      }
    });

    return () => unsubscribe();
  }, [post._id, subscribeToUpdated, onClose]);

  useEffect(() => {
    const unsubscribe = subscribeToDeleted(() => {});

    return () => unsubscribe();
  }, [post._id, subscribeToDeleted, onClose]);

  useEffect(() => {
    if (!post._id) return;

    const fetchPostData = async () => {
      try {
        const likesRes = await axios.get(`/likes/${post._id}`, { headers });
        setLikesCount(likesRes.data.likes);

        const commentsRes = await axios.get(
          `${API_BASE}/api/comments/${post._id}`,
          { headers }
        );
        setComments(commentsRes.data);
        const likesMap = {};
        commentsRes.data.forEach((c) => {
          likesMap[c._id] = c.likesCount || 0;
        });
        setCommentLikes(likesMap);
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err.message);
      }
    };

    fetchPostData();
  }, [post._id]);

  useEffect(() => {
    if (!post._id || !currentUserId) return;

    // Проверка был ли лайкнут пост
    const fetchLikeStatus = async () => {
      try {
        const likeStatusRes = await axios.get(`/likes/status/${post._id}`, {
          headers,
        });
        setLiked(likeStatusRes.data.liked);

        const followRes = await axios.get(
          `${API_BASE}/api/follow/${currentUserId}/following`,
          {
            headers,
          }
        );
        setSubscribed(followRes.data.some((u) => u._id === post.author._id));
      } catch (err) {
        console.error("Ошибка при проверке лайка или подписки:", err.message);
      }
    };

    fetchLikeStatus();
  }, [post._id, currentUserId]);

  const handleLike = async () => {
    try {
      const res = await axios.post(`/likes/${post._id}`, {}, { headers });
      setLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
    } catch (err) {
      console.error("Ошибка при лайке поста:", err.message);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const res = await axios.post(
        `${API_BASE}/api/comments/${commentId}/like`,
        {},
        { headers }
      );

      setCommentLikes((prev) => ({
        ...prev,
        [commentId]: res.data.likesCount,
      }));

      setComments((prevComments) =>
        prevComments.map((c) =>
          c._id === commentId
            ? { ...c, liked: res.data.liked, likesCount: res.data.likesCount }
            : c
        )
      );
    } catch (err) {
      console.error("Ошибка при лайке комментария:", err.message);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await axios.post(
        `${API_BASE}/api/comments/${post._id}`,
        { text: newComment },
        { headers }
      );
      setNewComment("");

      // Перезагружаем комментарии
      const res = await axios.get(`${API_BASE}/api/comments/${post._id}`, {
        headers,
      });

      setComments(res.data);
      const likesMap = {};
      res.data.forEach((c) => {
        likesMap[c._id] = c.likesCount || 0;
      });
      setCommentLikes(likesMap);
    } catch (err) {
      console.error("Ошибка при добавлении комментария:", err.message);
    }
  };

  const handleSubscribe = async () => {
    try {
      await axios.post(
        `${API_BASE}/api/follow/${post.author._id}/follow`,
        {},
        { headers }
      );
      setSubscribed(true);
    } catch (err) {
      console.error("Ошибка при подписке:", err.message);
    }
  };

  const handleDeletePost = async () => {
    try {
      await axios.delete(`/posts/${post._id}`, { headers });
      // if (onDelete) onDelete(post._id);

      notifyPostDeleted(post);
      onClose();
    } catch (err) {
      alert("Diese Funktion ist in der Demo-Version deaktiviert.");
      console.error("Ошибка при удалении поста:", err.message);
    }
  };

  const goToUserProfile = (userId) => {
    navigate(userId === currentUserId ? "/profile" : `/users/${userId}`);
    onClose();
  };

  const getYouTubeEmbedUrl = (url) => {
    try {
      const videoId = new URL(url).searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch {
      return null;
    }
  };

  const getImageUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `${API_BASE}/${path}`;
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.imageSection}>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
          {post.videoUrl ? (
            <div className={styles.videoWrapper}>
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
              src={getImageUrl(post.image)}
              alt="Post"
              className={styles.postImage}
            />
          )}
        </div>

        <div className={styles.content}>
          <header className={styles.header}>
            <div className={styles.author}>
              {post.author.avatar && (
                <img
                  src={getImageUrl(post.author.avatar)}
                  alt={post.author.username}
                  className={styles.avatar}
                  onClick={() => goToUserProfile(post.author._id)}
                />
              )}
              <div>
                <strong>{post.author.username}</strong>
                {post.description && (
                  <p className={styles.postDescription}>{post.description}</p>
                )}
              </div>
            </div>

            {post.author._id === currentUserId ? (
              <>
                <MoreHorizontal
                  className={styles.moreIcon}
                  onClick={() => setShowOptions(true)}
                />
                {showOptions && (
                  <PostActionsModal
                    isOpen={showOptions}
                    onClose={() => setShowOptions(false)}
                    onEdit={() => {
                      setShowOptions(false);
                      setShowEditModal(true);
                    }}
                    onDelete={handleDeletePost}
                  />
                )}
                {showEditModal && (
                  <EditPostModal
                    post={post}
                    onClose={() => setShowEditModal(false)}
                    onPostUpdated={() => setShowEditModal(false)}
                  />
                )}
              </>
            ) : !subscribed ? (
              <button className={styles.subscribeBtn} onClick={handleSubscribe}>
                Follow
              </button>
            ) : (
              <span className={styles.subscribed}>Following</span>
            )}
          </header>

          <div className={styles.comments}>
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment._id} className={styles.comment}>
                  <img
                    src={getImageUrl(comment.author.avatar)}
                    alt={comment.author.username}
                    className={styles.commentAvatar}
                    onClick={() => goToUserProfile(comment.author._id)}
                  />
                  <div className={styles.commentContent}>
                    <strong onClick={() => goToUserProfile(comment.author._id)}>
                      {comment.author.username}
                    </strong>
                    <p>{comment.text}</p>
                    <small className={styles.commentTime}>
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </small>
                    <div className={styles.commentActions}>
                      <Heart
                        size={10}
                        fill={comment.liked ? "red" : "none"}
                        color={comment.liked ? "red" : "gray"}
                        onClick={() => handleLikeComment(comment._id)}
                      />
                      <span>{commentLikes[comment._id] || 0}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noComments}>No comments yet.</div>
            )}
          </div>

          <div className={styles.actions}>
            <Heart
              size={20}
              fill={liked ? "red" : "none"}
              color={liked ? "red" : "gray"}
              onClick={handleLike}
              style={{ cursor: "pointer" }}
            />
            <MessageCircle size={20} color="gray" />
            <span>{likesCount} likes</span>
          </div>

          <form onSubmit={handleAddComment} className={styles.commentForm}>
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className={styles.input}
            />
            <button type="submit" className={styles.postBtn}>
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
