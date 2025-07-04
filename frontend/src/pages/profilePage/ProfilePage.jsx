import { useState, useEffect, useRef, useCallback } from "react";
import { usePostModal } from "../../context/PostModalContext.jsx";
import axios from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import FollowPopover from "../../components/followListModal/FollowPopover.jsx";
import styles from "./ProfilePage.module.css";
import { usePostEvents } from "../../context/PostEventsContext";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [anchorEl, setAnchorEl] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverType, setPopoverType] = useState("followers");

  const { subscribeToCreated } = usePostEvents();
  const { subscribeToUpdated } = usePostEvents();
  const { subscribeToDeleted } = usePostEvents();

  const limit = 6;
  const navigate = useNavigate();
  const { openPostModal } = usePostModal();

  const observer = useRef();

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

  useEffect(() => {
    const unsubscribe = subscribeToCreated((newPost) => {
      if (
        (typeof newPost.author === "string" && newPost.author === user?._id) ||
        (typeof newPost.author === "object" && newPost.author._id === user?._id)
      ) {
        setUserPosts((prev) => [newPost, ...prev]);
        setTotalPosts((prev) => prev + 1);
      }
    });

    return unsubscribe;
  }, [subscribeToCreated, user]);

  useEffect(() => {
    const unsubscribe = subscribeToUpdated(async (updatedPost) => {
      try {
        // Получаем полный пост с populated author с сервера
        const res = await axios.get(`/posts/${updatedPost._id}`);
        const fullPost = res.data;

        setUserPosts((prev) =>
          prev.map((post) => (post._id === fullPost._id ? fullPost : post))
        );
      } catch (err) {
        console.error("Error fetching updated post:", err);

        setUserPosts((prev) =>
          prev.map((post) =>
            post._id === updatedPost._id ? updatedPost : post
          )
        );
      }
    });

    return unsubscribe;
  }, [subscribeToUpdated]);

  useEffect(() => {
    const unsubscribe = subscribeToDeleted((deletedPost) => {
      setUserPosts((prev) =>
        prev.filter((post) => post._id !== deletedPost._id)
      );
      setTotalPosts((prev) => prev - 1);
    });

    return unsubscribe;
  }, [subscribeToDeleted]);

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
        if (entries[0].isIntersecting) {
          if (hasMore) {
            setPage((prevPage) => prevPage + 1);
          }
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

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

  useEffect(() => {
    if (user?._id && hasMore) {
      fetchUserPosts(user._id, page);
    }
  }, [page, user, hasMore, fetchUserPosts]);

  const handlePostClick = (post) => {
    openPostModal(post);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })

      .then((res) => {
        setUser(res.data);
      })

      .catch(console.error);
  }, []);

  const getImageUrl = (image, imagePublicId) => {
    if (image) {
      return image.startsWith("http")
        ? image
        : `${API_BASE}/${image.replace(/^\/+/, "")}`;
    }

    if (imagePublicId) {
      return `https://res.cloudinary.com/dpmgvfdta/image/upload/${imagePublicId}`;
    }

    return null;
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

  if (!user) return null;

  const API_BASE = "https://ichgram-demo.onrender.com";

  return (
    <div>
      <div>
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
                    onClick={() => navigate("/profile/edit")}
                    className={styles.editButton}
                  >
                    Edit profile
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
                    title={
                      popoverType === "followers" ? "Followers" : "Following"
                    }
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

                const isVideo = Boolean(p.videoUrl);
                const thumbnail = isVideo
                  ? getYouTubeThumbnail(p.videoUrl)
                  : getImageUrl(p.image || p.imagePublicId);

                if (!thumbnail) return null;

                return (
                  <div key={p._id}>
                    <div ref={isLast ? lastPostElementRef : null}>
                      {isVideo ? (
                        <div
                          className={styles.videoPreviewWrapper}
                          onClick={() => handlePostClick(p)}
                        >
                          <img
                            src={thumbnail}
                            alt="Video preview"
                            className={styles.videoPreview}
                          />
                          <div className={styles.playIconOverlay}>▶</div>
                        </div>
                      ) : (
                        <img
                          src={thumbnail}
                          alt="Post"
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
      </div>
    </div>
  );
}
