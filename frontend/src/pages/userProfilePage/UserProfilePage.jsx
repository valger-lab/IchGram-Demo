import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "../../api/axiosInstance";
import { usePostModal } from "../../context/PostModalContext.jsx";
import styles from "./UserProfilePage.module.css";
import { useNavigate } from "react-router-dom";
import FollowPopover from "../../components/followListModal/FollowPopover.jsx";

import { FaCheck } from "react-icons/fa";

const API_BASE = "http://localhost:3000";

export default function UserProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  const [anchorEl, setAnchorEl] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverType, setPopoverType] = useState("followers");

  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { openPostModal } = usePostModal();

  const [isFollowing, setIsFollowing] = useState(false);

  const limit = 6;

  const observer = useRef();

  useEffect(() => {
    if (!user || !user.profileStyle) return;

    const { bgColor, textColor } = user.profileStyle;

    const isValidColor = (c) => typeof c === "string" && c.trim() !== "";

    if (isValidColor(bgColor)) {
      document.documentElement.style.setProperty("--bg-color", bgColor);
    } else {
      document.documentElement.style.removeProperty("--bg-color");
    }

    if (isValidColor(textColor)) {
      document.documentElement.style.setProperty("--text-color", textColor);
    } else {
      document.documentElement.style.removeProperty("--text-color");
    }
  }, [user]);

  const lastPostElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const fetchUser = async () => {
    try {
      const res = await axios.get(`/users/${id}`);
      setUser(res.data);
    } catch (error) {
      console.error("Ошибка при загрузке пользователя:", error);
    }
  };

  const fetchUserPosts = useCallback(async (userId, page) => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `/posts?author=${userId}&limit=${limit}&page=${page}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = res.data;
      const newPosts = Array.isArray(data) ? data : data.posts;
      setUserPosts((prev) => {
        const ids = new Set(prev.map((p) => p._id));
        const filteredNewPosts = newPosts.filter((p) => !ids.has(p._id));
        const updatedPosts = [...prev, ...filteredNewPosts];

        if (data.total !== undefined) {
          setTotalPosts(data.total);
          if (updatedPosts.length >= data.total) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }
        }

        return updatedPosts;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // хук для проверки подписки
  const checkIfFollowing = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsFollowing(false);
        return;
      }

      // Получаем список подписчиков пользователя id
      const res = await axios.get(`/users/${id}/followers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const followers = res.data;
      // Получаем id текущего пользователя из токена
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentUserId = payload.id || payload._id;

      // Проверяем, есть ли текущий пользователь среди подписчиков
      const following = followers.some(
        (follower) => follower._id === currentUserId
      );
      setIsFollowing(following);
    } catch (error) {
      console.error("Ошибка при проверке подписки:", error);
      setIsFollowing(false);
    }
  };

  useEffect(() => {
    setUser(null);
    setUserPosts([]);
    setPage(1);
    setTotalPosts(0);
    setHasMore(true);
    fetchUser();
    checkIfFollowing();
  }, [id]);

  useEffect(() => {
    if (user?._id && hasMore) {
      fetchUserPosts(user._id, page);
    }
  }, [page, user?._id, hasMore, fetchUserPosts]);

  const toggleFollow = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Пожалуйста, войдите в систему, чтобы подписываться");
        return;
      }

      if (isFollowing) {
        await axios.delete(`/users/${id}/unfollow`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsFollowing(false);
        // обновить счетчик подписчиков
        setUser((prev) => ({
          ...prev,
          followersCount: prev.followersCount - 1,
        }));
      } else {
        await axios.post(`/users/${id}/follow`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsFollowing(true);
        setUser((prev) => ({
          ...prev,
          followersCount: prev.followersCount + 1,
        }));
      }
    } catch (error) {
      console.error("Ошибка при смене подписки:", error);
    }
  };

  const handlePostClick = (post) => {
    openPostModal(post);
  };

  const handleMessageClick = () => {
    navigate(`/messages?userId=${user._id}`);
  };

  function getYouTubeVideoId(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get("v");
    } catch {
      return null;
    }
  }

  function getYouTubeThumbnail(url) {
    const id = getYouTubeVideoId(url);
    return id ? `https://img.youtube.com/vi/${id}/0.jpg` : "";
  }

  if (!user) return <p>Loading user...</p>;

  const getImageUrl = (path) => {
    return path.startsWith("http")
      ? path
      : `${API_BASE}/${path.replace(/^\/+/, "")}`;
  };

  const handleOpenFollowers = async (event) => {
    try {
      const res = await axios.get(`/users/${user._id}/followers`);
      const data = res.data;
      setFollowers(data);
      setPopoverType("followers");
      setAnchorEl(event.currentTarget);
      setPopoverOpen(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setPopoverOpen(false);
  };

  const handleOpenFollowing = async (event) => {
    try {
      const res = await axios.get(`/users/${user._id}/following`);
      const data = res.data;
      setFollowing(data);
      setPopoverType("following");
      setAnchorEl(event.currentTarget);
      setPopoverOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.layout}>
      <div className={styles.headerImageWrapper}>
        {user.profileStyle?.headerImage && (
          <img
            src={user.profileStyle.headerImage}
            alt="header"
            className={styles.headerImage}
          />
        )}
      </div>
      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.avatarWrapper}>
            <img
              src={
                user.avatar.startsWith("http")
                  ? user.avatar
                  : `${API_BASE}${user.avatar}`
              }
              alt="avatar"
              className={styles.avatar}
            />
          </div>

          <div className={styles.info}>
            <div className={styles.username}>
              {user.username}

              <button
                onClick={toggleFollow}
                className={`${styles.followButton} ${
                  isFollowing ? styles.following : ""
                }`}
              >
                {isFollowing ? (
                  <>
                    <FaCheck style={{ marginRight: "0px" }} />
                    Following
                  </>
                ) : (
                  "Follow"
                )}
              </button>
              <button
                onClick={handleMessageClick}
                className={styles.messageBtn}
              >
                Message
              </button>
            </div>
            <div className={styles.stats}>
              <span>{totalPosts} posts</span>
              <span
                tabIndex={0}
                role="button"
                onClick={handleOpenFollowers}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    handleOpenFollowers(e);
                }}
                style={{ cursor: "pointer" }}
              >
                {user.followersCount} followers
              </span>

              <span
                tabIndex={0}
                role="button"
                onClick={handleOpenFollowing}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    handleOpenFollowing(e);
                }}
                style={{ cursor: "pointer" }}
              >
                {user.followingCount} following
              </span>

              <FollowPopover
                anchorEl={anchorEl}
                open={popoverOpen}
                onClose={handleClosePopover}
                title={popoverType === "followers" ? "Followers" : "Following"}
                users={popoverType === "followers" ? followers : following}
                PaperProps={{
                  sx: {
                    pointerEvents: "auto",
                    maxWidth: 300,
                  },
                }}
                disableEnforceFocus
                disableAutoFocus
              />
            </div>
            {user.website && (
              <a
                className={styles.website}
                href={
                  user.website.startsWith("http")
                    ? user.website
                    : `https://${user.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                {user.website}
              </a>
            )}
            <p className={styles.bio}>{user.bio}</p>
          </div>
        </div>

        <section className={styles.grid}>
          {userPosts.map((p, index) => {
            const isLast = userPosts.length === index + 1;

            return (
              <div key={p._id}>
                <div ref={isLast ? lastPostElementRef : null}>
                  {p.videoUrl ? (
                    <div
                      className={styles.videoPreviewWrapper}
                      onClick={() => handlePostClick(p)}
                    >
                      <img
                        src={getYouTubeThumbnail(p.videoUrl)}
                        alt="Video preview"
                        className={styles.videoPreview}
                      />
                      <div className={styles.playIconOverlay}>▶</div>
                    </div>
                  ) : (
                    <img
                      src={getImageUrl(p.image)}
                      alt=""
                      onClick={() => handlePostClick(p)}
                      style={{ cursor: "pointer" }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {loading && <p>Loading...</p>}
      </main>
    </div>
  );
}
