import { useEffect, useState } from "react";
import {
  Building2,
  Hotel,
  Users,
  CalendarCheck,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { baseUrl } from "../../../constant";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalVendors: 0,
    totalHotels: 0,
    totalUsers: 0,
    totalBookings: 0,
    revenue: 0,
  });

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Admin token missing");

      const form = new FormData();
      form.append("token", token);

      // FIXED PATH: admin -> hotels
      const res = await fetch(`${baseUrl}/hotels/getCounts.php`, {
        method: "POST",
        body: form,
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Counts API did not return JSON. Check backend path / PHP errors.");
      }

      if (data.success) {
        setStats((prev) => ({ ...prev, ...(data.data || {}) }));
      } else {
        toast.error(data.message || "Failed to load dashboard stats");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className={styles.dashboardPage}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Admin Dashboard</h1>
          <p>Monitor platform performance and activity</p>
        </div>
      </div>

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
          value={`Rs.${stats.revenue}`}
          color="dark"
        />
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  return (
    <div className={styles.statCard}>
      <div className={`${styles.statIcon} ${styles[color]}`}>{icon}</div>
      <div className={styles.statInfo}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statValue}>{value}</span>
      </div>
    </div>
  );
};

export default AdminDashboard;