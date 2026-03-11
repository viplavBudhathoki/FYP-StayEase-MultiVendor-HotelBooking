import { Search, Bell, User } from "lucide-react";
import styles from "./Header.module.css";

const Header = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <header className={styles.header}>
      <div className={styles.headerSearch}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search rooms, bookings, or guests..."
        />
      </div>

      <div className={styles.headerActions}>
        <button className={styles.iconBtn} type="button">
          <Bell size={20} />
          <span className={styles.dot}></span>
        </button>

        <div className={styles.userProfile}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {user?.full_name || "Vendor"}
            </span>
            <span className={styles.userRole}>
              {user?.role === "vendor" ? "Vendor" : "Hotel Manager"}
            </span>
          </div>

          <div className={styles.userAvatar}>
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;