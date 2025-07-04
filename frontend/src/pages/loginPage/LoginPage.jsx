import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/authLayout/AuthLayout";
import InputField from "../../components/inputField/InputField";
import styles from "./LoginPage.module.css";
import axios from "axios";
import phoneImage from "../../assets/img/ichgram.png";
import logo from "../../assets/icons/logo_qw_r.jpeg";
import video from "../../assets/video/video.mp4";

import { useUser } from "../../context/UserContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setToken } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "https://ichgram-demo.onrender.com/api/auth/login",
        {
          email,
          password,
        }
      );

      const token = res.data.token;
      localStorage.setItem("token", token);
      setToken(token);

      navigate("/home");
    } catch (error) {
      setError("Invalid username or password", error);
    }
  };

  const handleDemoLogin = async () => {
    try {
      const res = await axios.post(
        "https://ichgram-demo.onrender.com/api/auth/login",
        {
          email: import.meta.env.VITE_DEMO_EMAIL,
          password: import.meta.env.VITE_DEMO_PASSWORD,
        }
      );

      const token = res.data.token;
      localStorage.setItem("token", token);
      setToken(token);
      navigate("/home");
    } catch {
      setError("Demo login failed");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.phoneImageContainer}>
        <img
          src={phoneImage}
          alt="Phone with Ichgram"
          className={styles.phoneImage}
        />
        <img
          src={phoneImage}
          alt="Phone with Ichgram"
          className={styles.phoneImageT}
        />
        <video
          src={video}
          autoPlay
          muted
          loop
          playsInline
          className={styles.videoBackground}
        />
      </div>

      <div className={styles.formContainer}>
        <AuthLayout
          footerText="Don’t have an account?"
          footerLinkText="Sign up"
          footerLinkPath="/register"
        >
          <div className={styles.logoContainer}>
            <img src={logo} alt="Logo" className={styles.logo} />
          </div>
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <p className={styles.error}>{error}</p>}
            <InputField
              type="text"
              placeholder="Username or email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <InputField
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              className={styles.submitButton}
              onClick={handleDemoLogin}
            >
              Login as Guest
            </button>
          </form>

          <div className={styles.divider}>
            <div className={styles.line}></div>
            <span className={styles.dividerText}>OR</span>
            <div className={styles.line}></div>
          </div>

          <div className={styles.forgotPassword}>
            <a href="/forgot-password" className={styles.forgotPasswordLink}>
              Forgot password?
            </a>
          </div>
        </AuthLayout>
      </div>
    </div>
  );
};

export default LoginPage;
