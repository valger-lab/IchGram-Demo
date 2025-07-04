import styles from "./AuthLayout.module.css";

const AuthLayout = ({
  children,
  footerText,
  footerLinkText,
  footerLinkPath,
}) => {
  return (
    <div className={styles.authLayout}>
      <div className={styles.container}>
        <div className={styles.card}>{children}</div>
      </div>
      <div className={styles.footer}>
        <span className={styles.footerText}>{footerText} </span>
        <a href={footerLinkPath} className={styles.footerLink}>
          {footerLinkText}
        </a>
      </div>
    </div>
  );
};

export default AuthLayout;
