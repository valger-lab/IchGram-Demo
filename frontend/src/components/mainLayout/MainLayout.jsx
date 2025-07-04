import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar.jsx";
import NotificationPanel from "../../pages/notificationPanel/NotificationPanel.jsx";
import axios from "../../api/axiosInstance";
import styles from "./MainLayout.module.css";
import CreatePostModal from "../createPostModal/CreatePostModal.jsx";
import SearchPanel from "../searchPanel/SearchPanel.jsx";
import Footer from "../footer/Footer.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";

export default function MainLayout() {
  const [notifications, setNotifications] = useState([]);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);

  const { theme } = useTheme();
  const location = useLocation();

  const isCustomTheme =
    (location.pathname === "/profile" ||
      location.pathname.startsWith("/users")) &&
    location.pathname !== "/profile/edit";

  useEffect(() => {
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(theme);

    return () => {
      document.documentElement.classList.remove("dark", "light");
    };
  }, [theme]);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setNotifications(res.data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchNotifications();
  }, []);

  // Закрытие панелей при переходе по маршрутам
  useEffect(() => {
    if (isNotificationPanelOpen) setIsNotificationPanelOpen(false);
    if (isSearchPanelOpen) setIsSearchPanelOpen(false);
    if (isCreateModalOpen) setIsCreateModalOpen(false);
  }, [location]); //

  const handleClearRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete("/notifications/clearRead", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // После успешного удаления обновляем локальный стейт — удаляем прочитанные уведомления
      setNotifications((prev) => prev.filter((n) => !n.isRead));
    } catch (err) {
      console.error("Ошибка при очистке прочитанных уведомлений", err);
    }
  };

  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <div className={styles.layoutWrapper}>
      <Sidebar
        onNotificationClick={() => {
          setIsNotificationPanelOpen((prev) => {
            const next = !prev;
            if (next) {
              setIsSearchPanelOpen(false);
              setIsCreateModalOpen(false);
            }
            return next;
          });
        }}
        onSearchClick={() => {
          setIsSearchPanelOpen((prev) => {
            const next = !prev;
            if (next) {
              setIsNotificationPanelOpen(false);
              setIsCreateModalOpen(false);
            }
            return next;
          });
        }}
        onCreateClick={() => {
          setIsCreateModalOpen((prev) => {
            const next = !prev;
            if (next) {
              setIsNotificationPanelOpen(false);
              setIsSearchPanelOpen(false);
            }
            return next;
          });
        }}
      />

      <div className={styles.contentWrapper}>
        {(isNotificationPanelOpen || isSearchPanelOpen) && (
          <div
            className={styles.overlay}
            onClick={() => {
              if (isNotificationPanelOpen) setIsNotificationPanelOpen(false);
              if (isSearchPanelOpen) setIsSearchPanelOpen(false);
              if (isCreateModalOpen) setIsCreateModalOpen(false);
            }}
          />
        )}

        {isNotificationPanelOpen && (
          <div className={styles.notificationPanel}>
            <NotificationPanel
              notifications={notifications}
              onClose={() => setIsNotificationPanelOpen(false)}
              onClearRead={handleClearRead}
              onMarkAsRead={markNotificationAsRead}
            />
          </div>
        )}

        {isSearchPanelOpen && (
          <div className={styles.searchPanel}>
            <SearchPanel onClose={() => setIsSearchPanelOpen(false)} />
          </div>
        )}

        {isCreateModalOpen && (
          <CreatePostModal onClose={() => setIsCreateModalOpen(false)} />
        )}

        <Outlet />
        <Footer
          onNotificationClick={() => setIsNotificationPanelOpen(true)}
          onCreateClick={() => setIsCreateModalOpen(true)}
          onSearchClick={() => setIsSearchPanelOpen((prev) => !prev)}
          isCustomTheme={isCustomTheme}
        />
      </div>
    </div>
  );
}
