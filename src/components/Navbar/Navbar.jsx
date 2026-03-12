import styles from "./Navbar.module.css";
import { useNavigate } from "react-router-dom";
import { IoIosLogOut } from "react-icons/io";

const Navbar = ({ onLoginClick, onSignUpClick }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  if (user?.role === "vendor") return null;

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarLogo} onClick={() => navigate("/")}>
        Stay<span>Ease</span>
      </div>

      <div className={styles.navbarLinks}>
        <button className={styles.navLinks} onClick={() => navigate("/")}>
          Home
        </button>

        {(!user || user.role === "user") && (
          <>
            <button
              className={styles.navLinks}
              onClick={() => navigate("/hotels")}
            >
              Hotels
            </button>

            {user?.role === "user" && (
              <button
                className={styles.navLinks}
                onClick={() => navigate("/my-bookings")}
              >
                My Bookings
              </button>
            )}
          </>
        )}

        {user?.role === "admin" && (
          <button
            className={styles.navLinks}
            onClick={() => navigate("/admin")}
          >
            Admin Dashboard
          </button>
        )}

        <button className={styles.navLinks} onClick={() => navigate("/about")}>
          About Us
        </button>

        <button
          className={styles.navLinks}
          onClick={() => navigate("/contact")}
        >
          Contact Us
        </button>
      </div>

      <div className={styles.navbarActions}>
        {user ? (
          <button className={styles.btnLogout} onClick={handleLogout}>
            <IoIosLogOut size={18} /> Logout
          </button>
        ) : (
          <>
            <button className={styles.btnLogin} onClick={onLoginClick}>
              Log in
            </button>
            <button className={styles.btnSignup} onClick={onSignUpClick}>
              Sign Up
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;