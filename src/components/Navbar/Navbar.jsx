import styles from "./Navbar.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import { IoIosLogOut } from "react-icons/io";
import {
  Bell,
  ChevronDown,
  User,
  Settings,
  MessageSquare,
} from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { baseUrl } from "../../constant";

const Navbar = ({ onLoginClick, onSignUpClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const token = localStorage.getItem("token");

  const getProfileImage = (photo) => {
    if (!photo) return "";
    return `${baseUrl}/${photo}`;
  };

  const getDisplayName = (fullName) => {
    if (!fullName) return "User";
    const trimmed = String(fullName).trim();
    if (!trimmed) return "User";
    return trimmed;
  };

  const getInitials = (fullName) => {
    const name = getDisplayName(fullName);
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  };

  const isActive = (path) => location.pathname === path;
  const isStartsWithActive = (path) => location.pathname.startsWith(path);

  const fetchUnreadCount = useCallback(async () => {
    if (!token || !user || user.role !== "user") {
      setUnreadCount(0);
      return;
    }

    try {
      const res = await fetch(
        `${baseUrl}/notifications/getNotifications.php?token=${encodeURIComponent(
          token
        )}&limit=10`
      );

      const data = await res.json();

      if (data.success) {
        setUnreadCount(Number(data.unread_count || 0));
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [token, user]);

  const fetchMessageCount = useCallback(async () => {
    if (!token || !user) {
      setMessageCount(0);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("token", token);

      const endpoint =
        user.role === "admin"
          ? `${baseUrl}/contact/getAdminMessageCount.php`
          : user.role === "user"
          ? `${baseUrl}/contact/getUserMessageCount.php`
          : null;

      if (!endpoint) {
        setMessageCount(0);
        return;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMessageCount(Number(data.count || 0));
      } else {
        setMessageCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch message count:", error);
      setMessageCount(0);
    }
  }, [token, user]);

  useEffect(() => {
    fetchUnreadCount();
    fetchMessageCount();

    if (!token || !user) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchMessageCount();
    }, 10000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchUnreadCount();
        fetchMessageCount();
      }
    };

    window.addEventListener("focus", handleVisibilityChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("notificationsUpdated", fetchUnreadCount);
    window.addEventListener("messagesUpdated", fetchMessageCount);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleVisibilityChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("notificationsUpdated", fetchUnreadCount);
      window.removeEventListener("messagesUpdated", fetchMessageCount);
    };
  }, [fetchUnreadCount, fetchMessageCount, token, user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  const handleNotificationClick = () => {
    navigate("/notifications");
  };

  const handleMyProfile = () => {
    setMenuOpen(false);
    navigate("/profile");
  };

  const handleMyMessages = () => {
    setMenuOpen(false);
    navigate(user?.role === "admin" ? "/admin/contact-messages" : "/my-messages");
  };

  const handleSecurity = () => {
    setMenuOpen(false);
    navigate("/profile?tab=security");
  };

  if (user?.role === "vendor") return null;

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarLogo} onClick={() => navigate("/")}>
        Stay<span>Ease</span>
      </div>

      <div className={styles.navbarLinks}>
        <button
          className={`${styles.navLinks} ${isActive("/") ? styles.active : ""}`}
          onClick={() => navigate("/")}
          type="button"
        >
          Home
        </button>

        {(!user || user.role === "user") && (
          <>
            <button
              className={`${styles.navLinks} ${
                isStartsWithActive("/hotels") ? styles.active : ""
              }`}
              onClick={() => navigate("/hotels")}
              type="button"
            >
              Hotels
            </button>

            {user?.role === "user" && (
              <button
                className={`${styles.navLinks} ${
                  isActive("/my-bookings") ? styles.active : ""
                }`}
                onClick={() => navigate("/my-bookings")}
                type="button"
              >
                My Bookings
              </button>
            )}
          </>
        )}

        {user?.role === "admin" && (
          <button
            className={`${styles.navLinks} ${
              isStartsWithActive("/admin") ? styles.active : ""
            }`}
            onClick={() => navigate("/admin")}
            type="button"
          >
            Admin Dashboard
          </button>
        )}

        <button
          className={`${styles.navLinks} ${isActive("/about") ? styles.active : ""}`}
          onClick={() => navigate("/about")}
          type="button"
        >
          About Us
        </button>

        <button
          className={`${styles.navLinks} ${
            isActive("/contact") ? styles.active : ""
          }`}
          onClick={() => navigate("/contact")}
          type="button"
        >
          Contact Us
        </button>
      </div>

      <div className={styles.navbarActions}>
        {user ? (
          <>
            {user.role === "user" && (
              <button
                className={styles.notificationBtn}
                onClick={handleNotificationClick}
                type="button"
                aria-label="Notifications"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className={styles.notificationBadge}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
            )}

            <div className={styles.profileMenuWrapper} ref={menuRef}>
              <button
                type="button"
                className={styles.profileTrigger}
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                {user?.profile_photo ? (
                  <img
                    src={getProfileImage(user.profile_photo)}
                    alt={getDisplayName(user.full_name)}
                    className={styles.profileImage}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className={styles.profileFallback}>
                    {getInitials(user.full_name)}
                  </div>
                )}

                <div className={styles.profileText}>
                  <span className={styles.profileName}>
                    {getDisplayName(user.full_name)}
                  </span>
                  <span className={styles.profileRole}>
                    {user.role === "admin" ? "Admin" : "Customer"}
                  </span>
                </div>

                <ChevronDown size={16} className={styles.profileChevron} />
              </button>

              {menuOpen && (
                <div className={styles.profileDropdown}>
                  {user.role === "user" && (
                    <button
                      type="button"
                      className={styles.dropdownItem}
                      onClick={handleMyProfile}
                    >
                      <User size={16} />
                      My Profile
                    </button>
                  )}

                  <button
                    type="button"
                    className={styles.dropdownItem}
                    onClick={handleMyMessages}
                  >
                    <div className={styles.messageItemWrap}>
                      <MessageSquare size={16} />
                      {messageCount > 0 && (
                        <span className={styles.messageBadge}>
                          {messageCount > 99 ? "99+" : messageCount}
                        </span>
                      )}
                    </div>
                    {user.role === "admin" ? "Contact Messages" : "My Messages"}
                  </button>

                  {user.role === "user" && (
                    <button
                      type="button"
                      className={styles.dropdownItem}
                      onClick={handleSecurity}
                    >
                      <Settings size={16} />
                      Security
                    </button>
                  )}

                  <button
                    type="button"
                    className={`${styles.dropdownItem} ${styles.logoutItem}`}
                    onClick={handleLogout}
                  >
                    <IoIosLogOut size={18} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <button className={styles.btnLogin} onClick={onLoginClick} type="button">
              Log in
            </button>
            <button className={styles.btnSignup} onClick={onSignUpClick} type="button">
              Sign Up
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;