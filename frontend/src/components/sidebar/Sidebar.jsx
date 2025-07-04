import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Link } from "react-router-dom";
import styles from "./Sidebar.module.css";
import logoLight from "../../assets/icons/logo_qw_r.jpeg";
import logoDark from "../../assets/icons/logo_dw_r.jpeg";
import MiniLogoLight from "../../assets/icons/mini_logo_w.jpeg";
import MiniLogoDark from "../../assets/icons/mini_logo_d.jpeg";
import axios from "../../api/axiosInstance";
import { useUser } from "../../context/UserContext";
import ThemeToggle from "../themeToggle/ThemeToggle.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";

import {
  Home,
  Search,
  Compass,
  MessageSquare,
  Heart,
  PlusCircle,
  User,
} from "lucide-react";

const links = [
  { to: "/home", label: "Home", icon: <Home size={20} /> },
  { to: "/search", label: "Search", icon: <Search size={20} /> },
  { to: "/explore", label: "Explore", icon: <Compass size={20} /> },
  { to: "/messages", label: "Messages", icon: <MessageSquare size={20} /> },
  { to: "/notifications", label: "Notifications", icon: <Heart size={20} /> },
  { to: "/create", label: "Create", icon: <PlusCircle size={20} /> },
  { to: "/profile", label: "Profile", icon: <User size={20} /> },
];
const API_BASE = "https://ichgram-demo.onrender.com";

export default function Sidebar({
  onNotificationClick,
  onCreateClick,
  onSearchClick,
}) {
  const [user, setUser] = useState();
  const { logout } = useUser();
  const { theme } = useTheme();
  const [src, setSrc] = useState(theme === "dark" ? logoDark : logoLight);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const updateLogo = () => {
      const isMobile = mediaQuery.matches;
      setIsMobile(isMobile);
      setSrc(
        isMobile
          ? theme === "dark"
            ? MiniLogoDark
            : MiniLogoLight
          : theme === "dark"
          ? logoDark
          : logoLight
      );
    };

    mediaQuery.addListener(updateLogo);
    updateLogo();

    return () => mediaQuery.removeListener(updateLogo);
  }, [theme, isMobile]);

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Link to="/">
          <img src={src} alt="Logo" onClick={handleLogout} />
        </Link>
      </div>
      <nav className={styles.nav}>
        {links.map((l) => {
          const { label, icon, to } = l;

          if (label === "Create") {
            return (
              <div
                key={label}
                className={styles.link}
                onClick={onCreateClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onCreateClick?.()}
              >
                {icon}
                <span>{label}</span>
              </div>
            );
          }

          if (label === "Notifications") {
            return (
              <div
                key={label}
                className={styles.link}
                onClick={onNotificationClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onNotificationClick?.()}
              >
                {icon}
                <span>{label}</span>
              </div>
            );
          }

          if (label === "Search") {
            return (
              <div
                key={label}
                className={styles.link}
                onClick={onSearchClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onSearchClick?.()}
              >
                {icon}
                <span>{label}</span>
              </div>
            );
          }

          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ""}`
              }
            >
              {label === "Profile" && user?.avatar ? (
                <>
                  <img
                    src={
                      user.avatar.startsWith("http")
                        ? user.avatar
                        : `${API_BASE}${user.avatar}`
                    }
                    alt="avatar"
                    className={styles.avatar}
                  />
                  <span>{label}</span>
                </>
              ) : (
                <>
                  {icon}
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
      <div className={styles.themeToggle}>
        <ThemeToggle />
      </div>
    </aside>
  );
}
