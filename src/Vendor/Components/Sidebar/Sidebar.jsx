import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Hotel,
  BedDouble,
  Calendar,
  Bell,
  Settings,
  LogOut,
  BarChart3,
  Tag,
} from "lucide-react";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  const linkClass = ({ isActive }) =>
    isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem;

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.sidebarLogo}>
        <div className={styles.navbarLogo}>
          Stay<span>Ease</span>
        </div>
      </div>

      {/* Main nav */}
      <nav className={styles.sidebarNav}>
        <NavLink to="/vendor" end className={linkClass}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        {/* My Hotels */}
        <NavLink to="/vendor/hotels" className={linkClass}>
          <Hotel size={20} />
          <span>My Hotels</span>
        </NavLink>

        <NavLink to="/vendor/rooms" className={linkClass}>
          <BedDouble size={20} />
          <span>Room Status</span>
        </NavLink>

        <NavLink to="/vendor/bookings" className={linkClass}>
          <Calendar size={20} />
          <span>Bookings</span>
        </NavLink>

        <NavLink to="/vendor/analysis" className={linkClass}>
          <BarChart3 size={20} />
          <span>Analysis</span>
        </NavLink>

        <NavLink to="/vendor/offers" className={linkClass}>
          <Tag size={20} />
          <span>Special Offers</span>
        </NavLink>

        <NavLink to="/vendor/notifications" className={linkClass}>
          <Bell size={20} />
          <span>Notifications</span>
        </NavLink>
      </nav>

      {/* Footer */}
      <div className={styles.sidebarFooter}>
        <NavLink to="/vendor/settings" className={linkClass}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>

        <button
          type="button"
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