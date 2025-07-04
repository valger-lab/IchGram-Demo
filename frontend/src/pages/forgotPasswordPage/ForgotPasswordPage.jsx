import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/authLayout/AuthLayout";
import InputField from "../../components/inputField/InputField";
import styles from "./ForgotPasswordPage.module.css";
import axios from "axios";
import sch from "../../assets/icons/sch.svg";
import logo from "../../assets/icons/logo_qw_r.jpeg";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "https://ichgram-demo.onrender.com/api/auth/forgot-password",
        {
          email,
        }
      );
      navigate("/change-password", { state: { email } });
    } catch (err) {
      setError("Failed to send reset link. Please try again.", err);
    }
  };

  return (
    <>
      <div className={styles.logo}>
        <img src={logo} alt="Logo" />
      </div>
      <div className={styles.forgotPasswordContainer}>
        <AuthLayout
          footerText=""
          footerLinkText="Back to login"
          footerLinkPath="/"
        >
          <div className={styles.logoContainer}>
            <img src={sch} alt="Logo" className={styles.logoImage} />
          </div>
          <div className={styles.header}>
            <h2 className={styles.subtitle}>Trouble logging in?</h2>
            <p className={styles.description}>
              Enter your email, phone, or username and we'll send you a link to
              get back into your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <p className={styles.error}>{error}</p>}

            <InputField
              type="text"
              placeholder="Email or Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button type="submit" className={styles.submitButton}>
              Send Login Link
            </button>
          </form>

          <div className={styles.divider}>
            <div className={styles.line}></div>
            <span className={styles.dividerText}>OR</span>
            <div className={styles.line}></div>
          </div>

          <div className={styles.createAccount}>
            <a href="/register" className={styles.createAccountLink}>
              Create new account
            </a>
          </div>
        </AuthLayout>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
