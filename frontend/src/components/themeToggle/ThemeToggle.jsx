import { useTheme } from "../../context/ThemeContext.jsx";
import styles from "./ThemeToggle.module.css";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className={styles.button}>
      {theme === "light" ? "🌙" : "🌞"}
    </button>
  );
}
