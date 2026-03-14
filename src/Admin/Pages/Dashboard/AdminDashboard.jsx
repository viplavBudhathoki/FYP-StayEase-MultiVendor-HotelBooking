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

  const [recentBookings, setRecentBookings] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Admin token missing");

      const form = new FormData();
      form.append("token", token);

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

  const fetchRecentBookings = async () => {
    setLoadingRecent(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Admin token missing");

      const form = new FormData();
      form.append("token", token);

      const res = await fetch(`${baseUrl}/bookings/getAdminRecentBookings.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        setRecentBookings(Array.isArray(data.data) ? data.data : []);
      } else {
        toast.error(data.message || "Failed to load recent bookings");
        setRecentBookings([]);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load recent bookings");
      setRecentBookings([]);
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchRecentBookings();
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
          value={`Rs. ${Number(stats.revenue).toFixed(0)}`}
          color="dark"
        />
      </div>

      <div className={styles.dashboardContent}>
        <div className={styles.card}>
          <h3>Recent Platform Bookings</h3>

          {loadingRecent ? (
            <div className={styles.emptyState}>Loading recent bookings...</div>
          ) : recentBookings.length === 0 ? (
            <div className={styles.emptyState}>No recent bookings found.</div>
          ) : (
            <div className={styles.recentList}>
              {recentBookings.map((booking) => (
                <div key={booking.booking_id} className={styles.recentItem}>
                  <div>
                    <p className={styles.recentTitle}>
                      {booking.customer_name} booked {booking.room_name}
                    </p>
                    <p className={styles.recentSub}>
                      {booking.hotel_name} • Vendor: {booking.vendor_name}
                    </p>
                  </div>

                  <span
                    className={`${styles.statusBadge} ${
                      styles[booking.status?.toLowerCase()] || ""
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.card}>
          <h3>Quick Overview</h3>
          <div className={styles.overviewList}>
            <div className={styles.overviewItem}>
              <span>Total Vendors</span>
              <strong>{stats.totalVendors}</strong>
            </div>
            <div className={styles.overviewItem}>
              <span>Total Hotels</span>
              <strong>{stats.totalHotels}</strong>
            </div>
            <div className={styles.overviewItem}>
              <span>Total Users</span>
              <strong>{stats.totalUsers}</strong>
            </div>
            <div className={styles.overviewItem}>
              <span>Total Bookings</span>
              <strong>{stats.totalBookings}</strong>
            </div>
          </div>
        </div>
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