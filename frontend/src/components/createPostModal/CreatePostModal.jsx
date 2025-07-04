import styles from "./CreatePostModal.module.css";
import { useState, useEffect } from "react";
import axios from "../../api/axiosInstance";
import { usePostEvents } from "../../context/PostEventsContext";

export default function CreatePostModal({ post = {}, onClose, onPostCreated }) {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState(post?.description || "");
  const [preview, setPreview] = useState(post?.imageUrl || null);
  const [charCount, setCharCount] = useState(post?.description?.length);
  const [mode, setMode] = useState("upload");
  const [videoLink, setVideoLink] = useState("");

  const { notifyPostCreated } = usePostEvents();

  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(post?.imageUrl || "");
  const [imagePublicId, setImagePublicId] = useState(post?.imagePublicId || "");

  const maxChars = 200;
  // Счетчик символов
  useEffect(() => {
    setCharCount(description.length);
  }, [description]);

  // Превью изображения
  useEffect(() => {
    if (image) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(image);
    }
  }, [image]);

  // загружает изображение сразу после выбора
  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const uploadRes = await axios.post("/posts/upload-image-temp", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const { url, public_id } = uploadRes.data;

      setImageUrl(url);
      setImagePublicId(public_id);
    } catch (err) {
      console.error("Ошибка загрузки изображения", err);
    } finally {
      setUploading(false);
    }
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    const reader = new FileReader();

    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    handleImageUpload(file); // Загружаем изображение сразу после выбора
  };

  // Отправляем форму — картинка уже загружена, просто отправляем URL
  const handleSubmit = async (e) => {
    alert("Diese Funktion ist in der Demo-Version deaktiviert.");
    e.preventDefault();

    // подождать, пока загрузится изображение
    if (!imageUrl || !imagePublicId) {
      return;
    }
    if (uploading) {
      return;
    }

    try {
      const postRes = await axios.post(
        "/posts",
        {
          description,
          image: imageUrl,
          imagePublicId,
          videoUrl: mode === "link" ? videoLink : null,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (onPostCreated) onPostCreated(postRes.data);

      // уведомляем о создании поста
      notifyPostCreated(postRes.data);

      onClose();
    } catch (err) {
      console.error("error:", err);

      if (err.response) {
        console.error("Server response:", err.response.data);
      }
    }
  };

  function getYouTubeEmbedUrl(url) {
    try {
      const videoId = url.includes("watch?v=")
        ? url.split("watch?v=")[1].split("&")[0]
        : url.includes("youtu.be/")
        ? url.split("youtu.be/")[1].split("?")[0]
        : null;
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch (error) {
      console.error("Error parsing YouTube URL:", error);
      return null;
    }
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.header}>
          <button type="button" onClick={onClose} className={styles.cancel}>
            Cancel
          </button>
          <h2>Create Post</h2>

          <button
            type="button"
            disabled={uploading || (mode === "upload" ? !image : !videoLink)}
            onClick={handleSubmit}
            className={styles.post}
          >
            {uploading ? "Uploading..." : "Post"}
          </button>
        </div>
        <div className={styles.modeSwitch}>
          <button
            type="button"
            className={mode === "link" ? styles.activeMode : ""}
            onClick={() => setMode("link")}
          >
            Add Link
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === "upload" && (
            <div className={styles.imageSection}>
              {preview ? (
                image?.type.startsWith("video/") ? (
                  <video src={preview} controls className={styles.preview} />
                ) : (
                  <img src={preview} alt="Preview" className={styles.preview} />
                )
              ) : (
                <div className={styles.uploadPlaceholder}>
                  <p>No media selected</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaChange}
                className={styles.fileInput}
                id="post-media"
              />

              <label htmlFor="post-media" className={styles.uploadButton}>
                Add Media
              </label>
            </div>
          )}
          {mode === "link" && (
            <div className={styles.linkSection}>
              <input
                type="url"
                placeholder="Paste video link (e.g., YouTube)"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                className={styles.linkInput}
              />
              {videoLink && (
                <div className={styles.preview}>
                  <iframe
                    src={getYouTubeEmbedUrl(videoLink)}
                    width="100%"
                    height="315"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="YouTube video"
                  />
                </div>
              )}
            </div>
          )}

          <div className={styles.descriptionSection}>
            <textarea
              placeholder="Write a description..."
              className={styles.textarea}
              maxLength={maxChars}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className={styles.charCounter}>
              {charCount}/{maxChars}
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
