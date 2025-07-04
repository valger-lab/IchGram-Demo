import { useState, useEffect } from "react";
import styles from "./EditPostModal.module.css";
import axios from "../../api/axiosInstance";
import { usePostEvents } from "../../context/PostEventsContext";

export default function EditPostModal({ post, onClose, onPostUpdated }) {
  const [description, setDescription] = useState(post.description);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(post.imageUrl || null);
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(post.description.length);

  const [imageUrl, setImageUrl] = useState(post.imageUrl || "");
  const [imagePublicId, setImagePublicId] = useState(post.imagePublicId || "");
  const [uploading, setUploading] = useState(false);

  const { notifyPostUpdated } = usePostEvents();

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

  // Загрузка изображения на сервер
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

      setImageUrl(uploadRes.data.url);
      setImagePublicId(uploadRes.data.public_id);
    } catch (err) {
      console.error("Ошибка загрузки изображения", err);
    } finally {
      setUploading(false);
    }
  };

  // Обработчик изменения изображения
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    handleImageUpload(file); // загружаем сразу
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedImageUrl = imageUrl || post.imageUrl;
      const updatedImagePublicId = imagePublicId || post.imagePublicId;

      const response = await axios.put(
        `/posts/${post._id}`,
        {
          description,
          image: updatedImageUrl,
          imagePublicId: updatedImagePublicId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      notifyPostUpdated(response.data);

      onPostUpdated(response.data);
      onClose();
    } catch (err) {
      alert("Diese Funktion ist in der Demo-Version deaktiviert.");
      console.error("Ошибка при обновлении поста:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.header}>
          <button type="button" onClick={onClose} className={styles.cancel}>
            Cancel
          </button>
          <h2>Edit post</h2>
          <button
            type="submit"
            form="edit-post-form"
            disabled={loading || uploading || charCount > maxChars}
            className={styles.saveButton}
          >
            {loading
              ? "Saving..."
              : uploading
              ? "Uploading image..."
              : "Save Changes"}
          </button>
        </div>

        <form
          id="edit-post-form"
          onSubmit={handleSubmit}
          className={styles.form}
        >
          <div className={styles.imageSection}>
            {preview ? (
              <img src={preview} alt="Preview" className={styles.preview} />
            ) : post.image ? (
              <img
                src={post.image}
                alt="Current"
                className={styles.preview}
                style={{ opacity: 0.5 }}
              />
            ) : (
              <div className={styles.uploadPlaceholder}>
                <p>No image selected</p>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={styles.fileInput}
              id="post-image"
            />
            <label htmlFor="post-image" className={styles.uploadButton}>
              Change Image
            </label>
          </div>

          <div className={styles.descriptionSection}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
              rows={6}
              placeholder="Edit your description..."
              maxLength={maxChars}
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
