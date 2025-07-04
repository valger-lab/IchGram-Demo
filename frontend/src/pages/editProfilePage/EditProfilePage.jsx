import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./EditProfilePage.module.css";
import { useUser } from "../../context/UserContext";

export default function EditProfilePage() {
  const [form, setForm] = useState({
    username: "",
    bio: "",
    avatar: null,
    website: "",
    style: {
      bgColor: "",
      textColor: "",
      headerImage: "",
    },
  });
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const API_BASE = "http://localhost:3000";

  // Валидация URL
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Применение стилей профиля (цвета, фон)
  useEffect(() => {
    const { bgColor, textColor, headerImage } = form.style;

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

    if (headerImage && headerImage.trim() !== "") {
      document.documentElement.style.setProperty(
        "--header-image",
        `url(${headerImage})`
      );
    } else {
      document.documentElement.style.removeProperty("--header-image");
    }
  }, [form.style]);

  // Загрузка данных пользователя при монтировании
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get(`${API_BASE}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const u = res.data;
        setUser(u);
        setForm({
          username: u.username || "",
          bio: u.bio || "",
          avatar: null,
          website: u.website || "",
          style: {
            bgColor: u.profileStyle?.bgColor ?? "",
            textColor: u.profileStyle?.textColor ?? "",
            headerImage: u.profileStyle?.headerImage ?? "",
          },
        });
      })
      .catch((err) => {
        console.error(err);
        navigate("/login");
      });
  }, []);

  // Функция сохранения профиля
  const onSave = async () => {
    console.log(form);

    if (!form.username.trim()) {
      return;
    }

    if (
      form.style.headerImage &&
      form.style.headerImage.trim() !== "" &&
      !isValidUrl(form.style.headerImage)
    ) {
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("username", form.username);
      fd.append("bio", form.bio);
      fd.append("website", form.website);

      const cleanStyle = {};

      if (form.style.bgColor && form.style.bgColor.trim() !== "")
        cleanStyle.bgColor = form.style.bgColor;
      if (form.style.textColor && form.style.textColor.trim() !== "")
        cleanStyle.textColor = form.style.textColor;
      if (form.style.headerImage && form.style.headerImage.trim() !== "")
        cleanStyle.headerImage = form.style.headerImage;

      if (Object.keys(cleanStyle).length === 0) {
        fd.append("profileStyle", "null");
      } else {
        fd.append("profileStyle", JSON.stringify(cleanStyle));
      }

      if (form.avatar) fd.append("avatar", form.avatar);

      const res = await axios.patch(`${API_BASE}/api/users/me`, fd, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setUser(res.data);

      setForm({
        username: res.data.username,
        bio: res.data.bio || "",
        avatar: null,
        website: res.data.website || "",
        style: {
          bgColor: res.data.profileStyle?.bgColor ?? "",
          textColor: res.data.profileStyle?.textColor ?? "",
          headerImage: res.data.profileStyle?.headerImage ?? "",
        },
      });

      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert(
        "Failed to update profile: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Сброс стилей к дефолтным пустым значениям
  function resetStyle() {
    setForm((prev) => ({
      ...prev,
      style: {
        bgColor: "",
        textColor: "",
        headerImage: "",
      },
    }));
  }

  if (!user) {
    return (
      <div className={styles.loading}>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <h2>Edit Profile</h2>

        <div className={styles.avatarSection}>
          <img
            src={
              form.avatar
                ? URL.createObjectURL(form.avatar)
                : user.avatar
                ? user.avatar.startsWith("http")
                  ? user.avatar
                  : `${API_BASE}${user.avatar}`
                : "/default-avatar.png"
            }
            alt="avatar"
            className={styles.avatar}
          />
          <label htmlFor="avatarUpload" className={styles.changePhoto}>
            Change Photo
          </label>
          <input
            id="avatarUpload"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, avatar: e.target.files[0] }))
            }
          />
        </div>

        <label className={styles.label}>
          Username
          <input
            value={form.username}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, username: e.target.value }));
            }}
            className={styles.input}
          />
        </label>

        <label className={styles.label}>
          Website
          <input
            value={form.website}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, website: e.target.value }))
            }
            className={styles.input}
          />
        </label>

        <label className={styles.label}>
          About
          <textarea
            value={form.bio}
            maxLength={150}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, bio: e.target.value }))
            }
            className={styles.textarea}
          />
          <div className={styles.counter}>{form.bio.length} / 150</div>
        </label>

        <label className={styles.label}>
          Background Color
          <input
            type="color"
            value={form.style.bgColor || "#ffffff"}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                style: { ...prev.style, bgColor: e.target.value },
              }))
            }
          />
        </label>

        <label className={styles.label}>
          Text Color
          <input
            type="color"
            value={form.style.textColor || "#000000"}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                style: { ...prev.style, textColor: e.target.value },
              }))
            }
          />
        </label>

        <label className={styles.label}>
          Header Image URL
          <input
            type="url"
            value={form.style.headerImage}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                style: { ...prev.style, headerImage: e.target.value },
              }))
            }
            className={styles.input}
          />
        </label>

        <button
          onClick={onSave}
          disabled={loading}
          className={styles.saveBtn}
          type="button"
        >
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => navigate("/profile")}
          className={styles.cancelBtn}
          type="button"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={resetStyle}
          className={styles.resetBtn}
          disabled={loading}
        >
          Reset
        </button>
      </main>
    </div>
  );
}
