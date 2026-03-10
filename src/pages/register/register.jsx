import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { baseUrl } from "../../constant";
import toast from "react-hot-toast";
import { IoCloseCircle } from "react-icons/io5";
import styles from "./Register.module.css";

const Register = ({ onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || "/";

  const handleClose = () => {
    if (onClose) onClose();
    else navigate(redirectPath);
  };

  const handleSwitchToLogin = () => {
    if (onSwitchToLogin) onSwitchToLogin();
  };

  async function register(e) {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const form = new FormData();
      form.append("full_name", formData.fullName);
      form.append("email", formData.email);
      form.append("password", formData.password);

      const response = await fetch(`${baseUrl}/auth/register.php`, {
        method: "POST",
        body: form,
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || "Registration successful");

        navigate("/login", {
          state: { from: redirectPath },
          replace: true,
        });
      } else {
        toast.error(data.message ?? "Registration failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div
        className={styles.loginContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <IoCloseCircle className={styles.closeIcon} onClick={handleClose} />

        <form onSubmit={register} className={styles.loginForm}>
          <h1 className={styles.loginTitle}>Register</h1>
          <span className={styles.loginSubtitle}>Enter your details</span>

          <input
            required
            type="text"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            className={styles.loginInput}
          />

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

          <input
            required
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            className={styles.loginInput}
          />

          <button
            type="submit"
            className={styles.loginButton}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>

          <span className={styles.loginFooter}>
            Already have an account?{" "}
            <span
              onClick={handleSwitchToLogin}
              style={{ color: "#f8740f", cursor: "pointer" }}
            >
              Login
            </span>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Register;