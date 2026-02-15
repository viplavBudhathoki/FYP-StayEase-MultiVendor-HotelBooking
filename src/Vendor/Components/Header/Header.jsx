// Import icons used in the header (search, notifications, user profile)
import { Search, Bell, User } from 'lucide-react';

// Import scoped CSS module for header styling
import styles from './Header.module.css';

// Header component for the dashboard top bar
const Header = () => {
  return (
    // Main header container
    <header className={styles.header}>

      {/* Search section */}
      <div className={styles.headerSearch}>
        {/* Search icon */}
        <Search size={18} className={styles.searchIcon} />

        {/* Search input field */}
        <input
          type="text"
          placeholder="Search rooms, bookings, or guests..."
        />
      </div>

      {/* Right-side action buttons */}
      <div className={styles.headerActions}>

        {/* Notification button */}
        <button className={styles.iconBtn}>
          <Bell size={20} />

          {/* Notification indicator dot */}
          <span className={styles.dot}></span>
        </button>

        {/* User profile section */}
        <div className={styles.userProfile}>

          {/* User name and role */}
          <div className={styles.userInfo}>
            <span className={styles.userName}>Viplav</span>
            <span className={styles.userRole}>Hotel Manager</span>
          </div>

          {/* User avatar icon */}
          <div className={styles.userAvatar}>
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

// Export Header component for use in other files
export default Header;
