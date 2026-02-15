import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BedDouble,
  Calendar,
  Bell,
  Settings,
  LogOut,
  Hotel,
  BarChart3,
  Tag,
} from "lucide-react";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const navigate = useNavigate();

  // Function to handle user logout
  const handleSignOut = () => {
    // Remove user data from localStorage
    localStorage.removeItem("user");

    // Navigate back to the home page
    navigate("/");

    // Optional: reload the page to reset application state
    window.location.reload();
  };

  return (
    <aside className={styles.sidebar}>
      {/* Sidebar Logo */}
      <div className={styles.sidebarLogo}>
        <div className={styles.navbarLogo}>
          Stay<span>Ease</span>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className={styles.sidebarNav}>
        {/* Dashboard Link */}
        <NavLink 
          to="/vendor" 
          end 
          className={({ isActive }) => isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        {/* Room Status Link */}
        <NavLink 
          to="/vendor/rooms" 
          className={({ isActive }) => isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem}
        >
          <BedDouble size={20} />
          <span>Room Status</span>
        </NavLink>

        {/* Bookings Link */}
        <NavLink 
          to="/vendor/bookings" 
          className={({ isActive }) => isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem}
        >
          <Calendar size={20} />
          <span>Bookings</span>
        </NavLink>

        {/* Analysis Link */}
        <NavLink 
          to="/vendor/analysis" 
          className={({ isActive }) => isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem}
        >
          <BarChart3 size={20} />
          <span>Analysis</span>
        </NavLink>

        {/* Special Offers Link */}
        <NavLink 
          to="/vendor/offers" 
          className={({ isActive }) => isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem}
        >
          <Tag size={20} />
          <span>Special Offers</span>
        </NavLink>

        {/* Notifications Link */}
        <NavLink 
          to="/vendor/notifications" 
          className={({ isActive }) => isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem}
        >
          <Bell size={20} />
          <span>Notifications</span>
        </NavLink>
      </nav>

      {/* Sidebar Footer: Settings and Logout */}
      <div className={styles.sidebarFooter}>
        {/* Settings Link */}
        <NavLink 
          to="/vendor/settings" 
          className={({ isActive }) => isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem}
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>

        {/* Sign Out Button */}
        <button 
          className={`${styles.navItem} ${styles.btnLogout}`} 
          onClick={handleSignOut}
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
