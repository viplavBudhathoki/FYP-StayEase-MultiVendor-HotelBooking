import { useState } from "react";
import {
  Building2,
  Hotel,
  Users,
  CalendarCheck,
  TrendingUp,
} from "lucide-react";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  const [stats] = useState({
    totalVendors: 0,
    totalHotels: 0,
    totalUsers: 0,
    totalBookings: 0,
    revenue: 0,
  });

  return (
    <div className={styles.dashboardPage}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1>Admin Dashboard</h1>
          <p>Monitor platform performance and activity</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <StatCard
          icon={<Building2 size={22} />}
          label="Total Vendors"
          value={stats.totalVendors}
          color="blue"
        />

        <StatCard
          icon={<Hotel size={22} />}
          label="Total Hotels"
          value={stats.totalHotels}
          color="green"
        />

        <StatCard
          icon={<Users size={22} />}
          label="Total Users"
          value={stats.totalUsers}
          color="orange"
        />

        <StatCard
          icon={<CalendarCheck size={22} />}
          label="Total Bookings"
          value={stats.totalBookings}
          color="purple"
        />

        <StatCard
          icon={<TrendingUp size={22} />}
          label="Platform Revenue"
          value={`$${stats.revenue}`}
          color="dark"
        />
      </div>

      {/* Bottom Section */}
      <div className={styles.dashboardContent}>
        <div className={styles.card}>
          <h3>Recent Activity</h3>
          <div className={styles.emptyState}>
            No recent platform activity found.
          </div>
        </div>

        <div className={styles.card}>
          <h3>System Overview</h3>
          <div className={styles.emptyState}>
            System metrics will appear here.
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  return (
    <div className={styles.statCard}>
      <div className={`${styles.statIcon} ${styles[color]}`}>
        {icon}
      </div>
      <div className={styles.statInfo}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statValue}>{value}</span>
      </div>
    </div>
  );
};

export default AdminDashboard;
