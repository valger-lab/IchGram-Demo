import styles from "./Footer.module.css";
import { Link } from "react-router-dom";

export default function Footer({
  onNotificationClick,
  onCreateClick,
  onSearchClick,
  isCustomTheme,
}) {
  return (
    <footer className={isCustomTheme ? styles.footerCustom : styles.footer}>
      <nav className={styles.nav}>
        <Link to="/home">Home</Link>
        <span onClick={onSearchClick}>Search </span>
        <Link to="/explore">Explore</Link>
        <Link to="/messages">Messages</Link>
        <span onClick={onNotificationClick}>Notifications</span>
        <span onClick={onCreateClick}>Create</span>
      </nav>
      <p className={styles.copyright}>© 2024 ICHgram</p>
    </footer>
  );
}
