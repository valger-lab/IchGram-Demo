import { useEffect, useState, useCallback, useRef } from "react";
import axios from "../../api/axiosInstance";
import { usePostModal } from "../../context/PostModalContext.jsx";
import styles from "./ExplorePage.module.css";
import Masonry from "react-masonry-css";

const API_BASE = "http://localhost:3000";

export default function ExplorePage() {
  const [posts, setPosts] = useState([]);
  const [postIds, setPostIds] = useState(new Set());

  const { openPostModal } = usePostModal();

  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observer = useRef();

  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    axios
      .get(`/explore?page=${page}&limit=10`)
      .then((res) => {
        if (isCancelled) return;

        const newPosts = res.data.posts.filter(
          (post) => !postIds.has(post._id)
        );

        setPostIds((prevIds) => {
          const updated = new Set(prevIds);
          newPosts.forEach((p) => updated.add(p._id));
          return updated;
        });

        setPosts((prev) => shuffleArray([...prev, ...newPosts]));
        setHasMore(res.data.hasMore);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Ошибка загрузки explore:", err);
        setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [page]);

  // Клик по превью — дозагружаем полный пост
  const handleClick = (post) => {
    axios
      .get(`/posts/${post._id}`)
      .then((res) => openPostModal(res.data))
      .catch(console.error);
  };

  // Наблюдатель для инфинит скролла
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

  const getImageUrl = (path) => {
    return path.startsWith("http")
      ? path
      : `${API_BASE}/${path.replace(/^\/+/, "")}`;
  };

  // Настройки breakpoint для Masonry
  const breakpointColumnsObj = {
    default: 4,
    1600: 3,
    1300: 2,
    1000: 2,
    768: 2,
    633: 1,
  };

  return (
    <div className={styles.container}>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className={styles.masonryGrid}
        columnClassName={styles.masonryGridColumn}
      >
        {posts.map((post, index) => {
          const isLast = posts.length === index + 1;
          return (
            <div key={post._id} className={styles.card}>
              <div ref={isLast ? lastPostElementRef : undefined}>
                {post.videoUrl ? (
                  <div
                    className={styles.videoPreviewWrapper}
                    onClick={() => handleClick(post)}
                  >
                    <img
                      src={getYouTubeThumbnail(post.videoUrl)}
                      alt="Video preview"
                      className={styles.videoPreview}
                    />
                    <div className={styles.playIconOverlay}>▶</div>
                  </div>
                ) : (
                  <img
                    src={getImageUrl(post.image)}
                    alt=""
                    onClick={() => handleClick(post)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </Masonry>
    </div>
  );
}
