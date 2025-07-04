import { useState, useEffect, useRef } from "react";
import styles from "./ChatWindow.module.css";
import axios from "../../api/axiosInstance.js";
import ConfirmModal from "../сonfirmModal/ConfirmModal.jsx";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3000";

export default function ChatWindow({
  currentUserId,
  otherUser,
  currentUser,
  messages,
  onSend,
  setMessages,
}) {
  const [text, setText] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentUserId, otherUser]);

  const handleSend = () => {
    if (text.trim()) {
      onSend(text);
      setText("");
    }
  };

  const handleAvatarClick = (sender) => {
    if (!sender) {
      console.warn("author is undefined");
      return;
    }

    if (currentUser && sender._id === currentUser._id) {
      navigate("/profile");
    } else {
      navigate(`/users/${sender._id}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = async () => {
    if (!otherUser?._id) return;

    try {
      await axios.delete(`/messages/${otherUser._id}`);
      setMessages([]);
      setShowConfirm(false);
    } catch (err) {
      console.error("Ошибка при очистке чата:", err);
    }
  };

  useEffect(() => {}, [currentUserId, messages]);

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img
          src={
            otherUser?.avatar?.startsWith("http")
              ? otherUser.avatar
              : `${API_BASE}${otherUser?.avatar}`
          }
          alt="avatar"
          className={styles.avatarHeader}
          onClick={() => handleAvatarClick(otherUser)}
        />
        <h3>{otherUser?.username}</h3>
      </div>

      <div className={styles.message}>
        {sortedMessages.length === 0 ? (
          <div></div>
        ) : (
          sortedMessages.map((msg) => {
            const senderId =
              typeof msg.sender === "string" ? msg.sender : msg.sender?._id;

            const isOwn = String(senderId) === String(currentUserId);

            const senderAvatar = isOwn
              ? currentUser?.avatar
              : msg.sender?.avatar;
            const senderName = isOwn ? "you" : msg.sender?.username;

            return (
              <div
                key={msg._id}
                className={`${styles.messageRow} ${
                  isOwn ? styles.sentRow : styles.receivedRow
                }`}
              >
                <img
                  src={
                    senderAvatar?.startsWith("http")
                      ? senderAvatar
                      : `${API_BASE}${senderAvatar}`
                  }
                  alt=""
                  className={styles.avatar}
                  onClick={() => handleAvatarClick(msg.sender)}
                />
                <div
                  className={`${styles.messageContent} ${
                    isOwn ? styles.sent : styles.received
                  }`}
                >
                  <div className={styles.text}>{msg.text}</div>
                  <div className={styles.meta}>
                    {senderName},{" "}
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputWrapper}>
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className={styles.input}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSend} className={styles.sendBtn}>
          send
        </button>
        <button onClick={() => setShowConfirm(true)} className={styles.sendBtn}>
          clear
        </button>
        {showConfirm && (
          <ConfirmModal
            title="Do you really want to clear the chat?"
            onConfirm={handleClearChat}
            onCancel={() => setShowConfirm(false)}
          />
        )}
      </div>
    </div>
  );
}
