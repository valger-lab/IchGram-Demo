import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/authLayout/AuthLayout";
import InputField from "../../components/inputField/InputField";
import styles from "./RegisterPage.module.css";
import logo from "../../assets/icons/logo_qw_r.jpeg";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/api/auth/register", {
        fullName,
        username,
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/home");
    } catch (err) {
      setError("Registration failed. Please try again.", err);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <AuthLayout
        footerText="Have an account?"
        footerLinkText="Log in"
        footerLinkPath="/"
      >
        <div className={styles.logoContainer}>
          <img src={logo} alt="Logo" className={styles.logo} />
        </div>
        <div className={styles.description}>
          <p>Sign up to see photos and videos from your friends.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <p className={styles.error}>{error}</p>}

          <InputField
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <InputField
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <InputField
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <InputField
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className={styles.learnMore}>
            People who use our service may have uploaded your contact
            information to Ichgram.{" "}
            <a href="#" className={styles.link}>
              Learn More
            </a>
          </p>
          <p className={styles.terms}>
            By signing up, you agree to our{" "}
            <span className={styles.link}>Terms</span>,{" "}
            <span className={styles.link}>Privacy Policy</span> and{" "}
            <span className={styles.link}>Cookies Policy</span>
          </p>

          <button type="submit" className={styles.submitButton}>
            Sign up
          </button>
        </form>
      </AuthLayout>
    </div>
  );
};

export default RegisterPage;
