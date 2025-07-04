import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "../../components/authLayout/AuthLayout";
import InputField from "../../components/inputField/InputField";
import styles from "../forgotPasswordPage/ForgotPasswordPage.module.css";
import axios from "axios";
import sch from "../../assets/icons/sch.svg";
import logo from "../../assets/icons/logo_qw.jpeg";

const ChangePasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Получаем email, переданный через navigate
  const email = location.state?.email || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Email not provided. Please start from Forgot Password page.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await axios.post("http://localhost:3000/api/auth/change-password", {
        email,
        password: newPassword,
      });
      setMessage("Password changed successfully.");
      setTimeout(() => navigate("/"), 3000); //  на логин через 3 секунды
    } catch (error) {
      setError("Failed to reset password. Try again. " + error.message);
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
            <h2 className={styles.subtitle}>Reset your password</h2>
            <p className={styles.description}>
              Enter a new password for your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <p className={styles.error}>{error}</p>}
            {message && <p className={styles.success}>{message}</p>}

            <InputField
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <InputField
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button type="submit" className={styles.submitButton}>
              Change Password
            </button>
          </form>
        </AuthLayout>
      </div>
    </>
  );
};

export default ChangePasswordPage;
