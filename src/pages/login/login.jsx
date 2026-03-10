import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { IoCloseCircle } from "react-icons/io5";
import { baseUrl } from "../../constant";
import styles from "./Login.module.css";

const Login = ({ onClose, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || "/";

  const handleClose = () => {
    if (onClose) onClose();
    else navigate(redirectPath);
  };

  const handleSwitchToRegister = (e) => {
    e.stopPropagation();
    if (onSwitchToRegister) onSwitchToRegister();
  };

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData();
      form.append("email", formData.email);
      form.append("password", formData.password);

      const res = await fetch(`${baseUrl}/auth/login.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Login successful");

        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);

        if (data.user.role === "admin") {
          navigate("/admin", { replace: true });
        } else if (data.user.role === "vendor") {
          navigate("/vendor", { replace: true });
        } else {
          navigate(redirectPath, { replace: true });
        }

        if (onClose) onClose();
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong. Try again later");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div
        className={styles.loginContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <IoCloseCircle className={styles.closeIcon} onClick={handleClose} />

        <form onSubmit={login} className={styles.loginForm}>
          <h1 className={styles.loginTitle}>Login</h1>
          <span className={styles.loginSubtitle}>
            Enter your details to login
          </span>

          <input
            required
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className={styles.loginInput}
          />

          <input
            required
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className={styles.loginInput}
          />

          <div style={{ textAlign: "right", marginBottom: "10px" }}>
            <span
              style={{
                color: "#000000",
                cursor: "pointer",
                fontSize: "0.9rem",
                textDecoration: "underline",
              }}
            >
              Forgot Password?
            </span>
          </div>

          <button
            type="submit"
            className={styles.loginButton}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <span className={styles.loginFooter}>
            Don’t have an account?{" "}
            <span
              onClick={handleSwitchToRegister}
              style={{ color: "#f8740f", cursor: "pointer" }}
            >
              Register
            </span>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Login;