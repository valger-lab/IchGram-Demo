import { useEffect, useState } from "react";
import PostCard from "../../components/postCard/PostCard.jsx";
import PostModal from "../../components/postModal/PostModal.jsx";
import CreatePostModal from "../../components/createPostModal/CreatePostModal.jsx";
import styles from "./HomePage.module.css";
import axios from "../../api/axiosInstance.js";
import logo_down from "../../assets/icons/logo_down.svg";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const [loading, setLoading] = useState(false);

  const handleNewPost = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const initialLoadPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/posts", {
        params: {
          limit: 10,
          random: true,
        },
      });

      const newPosts = res.data.posts || [];
      setPosts(newPosts);
    } catch (err) {
      console.error("Error loading initial posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initialLoadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/posts", {
        params: {
          limit: 10,
          random: true,
        },
      });

      const newPosts = res.data.posts || [];

      // Используем prevPosts внутри setPosts, чтобы избежать рассинхронизации
      setPosts((prevPosts) => {
        const uniqueNewPosts = newPosts.filter(
          (p) => !prevPosts.some((existing) => existing._id === p._id)
        );
        return [...prevPosts, ...uniqueNewPosts];
      });
    } catch (err) {
      console.error("Error loading more posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClosePostModal = () => {
    setSelectedPost(null);
  };

  return (
    <>
      <div className={styles.layout}>
        {showModal && (
          <CreatePostModal
            onClose={() => setShowModal(false)}
            onPostCreated={handleNewPost}
          />
        )}
        <main className={styles.main}>
          <div className={styles.feed}>
            {posts.map((p) => (
              <PostCard
                key={p._id}
                post={p}
                onViewComments={() => setSelectedPost(p)}
              />
            ))}
          </div>
          <button
            onClick={loadPosts}
            className={styles.loadMoreButton}
            disabled={loading}
          >
            Show more posts...
          </button>
          <div className={styles.logo_down}>
            <img src={logo_down} width={82} alt="check" />
            <h3>You’ve seen all the updates</h3>
            <p>You have viewed all new publications</p>
          </div>
        </main>

        {selectedPost && (
          <>
            <div className={styles.overlay} onClick={handleClosePostModal} />
            <PostModal
              post={selectedPost}
              onClose={() => setSelectedPost(null)}
            />
          </>
        )}
      </div>
    </>
  );
}
