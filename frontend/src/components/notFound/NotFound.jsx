import styles from "./NotFound.module.css";

const NotFound = () => {
  return (
    <div className={styles.notFoundContainer}>
      <h1>Oops! Page Not Found (404 Error)</h1>
      <p>
        We're sorry, but the page you're looking for doesn't seem to exist. If
        you typed the URL manually, please double-check the spelling. If you
        clicked on a link, it may be outdated or broken.
      </p>
    </div>
  );
};

export default NotFound;
