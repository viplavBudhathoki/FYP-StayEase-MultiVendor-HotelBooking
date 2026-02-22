// Import icons
import { Search, Bell, User, LogOut, Settings } from "lucide-react";

// Import CSS module
import styles from "./AdminHeader.module.css";

const AdminHeader = () => {
  return (
    <header className={styles.header}>
      
      {/* Left Section */}
      <div className={styles.leftSection}>

        {/* Search */}
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search users, vendors, reports..."
          />
        </div>
      </div>

      {/* Right Section */}
      <div className={styles.rightSection}>
        
        {/* Notification */}
        <button className={styles.iconBtn}>
          <Bell size={20} />
          <span className={styles.dot}></span>
        </button>

        {/* Profile */}
        <div className={styles.profile}>
          <div className={styles.profileInfo}>
            <span className={styles.name}>Admin</span>
            <span className={styles.role}>System Administrator</span>
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
