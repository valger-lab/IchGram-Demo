import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SearchPanel.module.css";
import axios from "../../api/axiosInstance";
import { X } from "lucide-react";
import { jwtDecode } from "jwt-decode";

const API_BASE = "https://ichgram-demo.onrender.com";

export default function SearchPanel({ onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const inputRef = useRef();

  useEffect(() => {
    inputRef.current.focus();
  }, []);

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

  const handleUserClick = (userId) => {
    if (userId === currentUserId) {
      navigate("/profile");
    } else {
      navigate(`/users/${userId}`);
    }
    onClose();
  };

  useEffect(() => {
    if (query.trim() === "") return setResults([]);

    const timeout = setTimeout(() => {
      axios
        .get(`/search?query=${query}`)
        .then((res) => setResults(res.data))
        .catch((err) => console.error(err));
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={onClose} className={styles.closeBtn}>
          <X size={15} />
        </button>
      </div>

      <div className={styles.results}>
        {results.map((user) => (
          <div
            key={user._id}
            className={styles.result}
            onClick={() => handleUserClick(user._id)}
          >
            <img
              src={
                user.avatar.startsWith("http")
                  ? user.avatar
                  : `${API_BASE}${user.avatar}`
              }
              alt={user.username}
            />
            <span>{user.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
