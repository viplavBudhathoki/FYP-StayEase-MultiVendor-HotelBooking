import { useEffect, useState } from "react";
import { Search, Bell, User } from "lucide-react";
import styles from "./AdminHeader.module.css";

const AdminHeader = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search users, vendors, reports..."
          />
        </div>
      </div>

      <div className={styles.rightSection}>
        <button className={styles.iconBtn} type="button">
          <Bell size={20} />
          <span className={styles.dot}></span>
        </button>

        <div className={styles.profile}>
          <div className={styles.profileInfo}>
            <span className={styles.name}>
              {user?.full_name || "Admin"}
            </span>
            <span className={styles.role}>
              {user?.role === "admin"
                ? "System Administrator"
                : user?.role || "Administrator"}
            </span>
          </div>

          <div className={styles.avatar}>
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;