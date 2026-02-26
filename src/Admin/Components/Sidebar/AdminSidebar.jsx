import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Hotel,
  Building2,
  CalendarCheck,
  BarChart3,
  Tag,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import styles from "./AdminSidebar.module.css";

const AdminSidebar = () => {
  const navigate = useNavigate();

const handleSignOut = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  navigate("/", { replace: true });
};


  return (
    <aside className={styles.sidebar}>
      
      {/* Logo */}
      <div className={styles.sidebarLogo}>
        <ShieldCheck size={28} />
        <div className={styles.logoText}>
          Stay<span>Ease</span> Admin
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.sidebarNav}>

        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            isActive
              ? `${styles.navItem} ${styles.navItemActive}`
              : styles.navItem
          }
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/vendors"
          className={({ isActive }) =>
            isActive
              ? `${styles.navItem} ${styles.navItemActive}`
              : styles.navItem
          }
        >
          <Building2 size={20} />
          <span>Vendors</span>
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            isActive
              ? `${styles.navItem} ${styles.navItemActive}`
              : styles.navItem
          }
        >
          <Users size={20} />
          <span>Users</span>
        </NavLink>

        <NavLink
          to="/admin/hotels"
          className={({ isActive }) =>
            isActive
              ? `${styles.navItem} ${styles.navItemActive}`
              : styles.navItem
          }
        >
          <Hotel size={20} />
          <span>Hotels</span>
        </NavLink>

        <NavLink
          to="/admin/bookings"
          className={({ isActive }) =>
            isActive
              ? `${styles.navItem} ${styles.navItemActive}`
              : styles.navItem
          }
        >
          <CalendarCheck size={20} />
          <span>Bookings</span>
        </NavLink>

        <NavLink
          to="/admin/analytics"
          className={({ isActive }) =>
            isActive
              ? `${styles.navItem} ${styles.navItemActive}`
              : styles.navItem
          }
        >
          <BarChart3 size={20} />
          <span>Analytics</span>
        </NavLink>

        <NavLink
          to="/admin/offers"
          className={({ isActive }) =>
            isActive
              ? `${styles.navItem} ${styles.navItemActive}`
              : styles.navItem
          }
        >
          <Tag size={20} />
          <span>Offers</span>
        </NavLink>

      </nav>

      {/* Footer */}
      <div className={styles.sidebarFooter}>

        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            isActive
              ? `${styles.navItem} ${styles.navItemActive}`
              : styles.navItem
          }
        >
          <Settings size={20} />
          <span>System Settings</span>
        </NavLink>

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

export default AdminSidebar;
