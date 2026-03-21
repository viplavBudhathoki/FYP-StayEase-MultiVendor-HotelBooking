import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BedDouble, Users, CheckCircle, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import { baseUrl } from "../../../constant";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalRooms: 0,
    occupied: 0,
    maintenance: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    revenue: 0,
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [historyRange, setHistoryRange] = useState("7days");

  const occupancyRate =
    stats.totalRooms > 0
      ? Math.round((Number(stats.occupied || 0) / Number(stats.totalRooms || 0)) * 100)
      : 0;

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vendor token missing");

      const form = new FormData();
      form.append("token", token);

      const res = await fetch(`${baseUrl}/bookings/getVendorDashboardStats.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        setStats((prev) => ({ ...prev, ...(data.data || {}) }));
      } else {
        toast.error(data.message || "Failed to load dashboard stats");
      }
    } catch (err) {
      toast.error(err.message || "Failed to load dashboard stats");
    }
  };

  const fetchRecentBookings = async () => {
    setLoadingRecent(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vendor token missing");

      const form = new FormData();
      form.append("token", token);
      form.append("range", historyRange);

      const res = await fetch(`${baseUrl}/bookings/getVendorRecentBookings.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        setRecentBookings(Array.isArray(data.data) ? data.data : []);
      } else {
        toast.error(data.message || "Failed to load booking history");
        setRecentBookings([]);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load booking history");
      setRecentBookings([]);
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchRecentBookings();
  }, [historyRange]);

  const historyButtons = [
    { label: "Last 7 Days", value: "7days" },
    { label: "Last 30 Days", value: "30days" },
    { label: "All", value: "all" },
  ];

  return (
    <div className={styles.dashboardPage}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Welcome Back, Manager</h1>
          <p>Here&apos;s what&apos;s happening today at your properties</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <button
          type="button"
          className={`${styles.statCard} ${styles.clickableCard}`}
          onClick={() => navigate("/vendor/rooms")}
        >
          <div className={`${styles.statIcon} ${styles.iconBlue}`}>
            <BedDouble size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Rooms</span>
            <span className={styles.statValue}>{stats.totalRooms}</span>
          </div>
        </button>

        <button
          type="button"
          className={`${styles.statCard} ${styles.clickableCard}`}
          onClick={() => navigate("/vendor/bookings?status=confirmed")}
        >
          <div className={`${styles.statIcon} ${styles.iconGreen}`}>
            <Users size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Confirmed Bookings</span>
            <span className={styles.statValue}>{stats.confirmedBookings}</span>
          </div>
        </button>

        <button
          type="button"
          className={`${styles.statCard} ${styles.clickableCard}`}
          onClick={() => navigate("/vendor/bookings?status=checked_in")}
        >
          <div className={`${styles.statIcon} ${styles.iconOrange}`}>
            <CheckCircle size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Occupancy Rate</span>
            <span className={styles.statValue}>{occupancyRate}%</span>
          </div>
        </button>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconPurple}`}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Revenue</span>
            <span className={styles.statValue}>
              Rs. {Number(stats.revenue || 0).toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.dashboardContent}>
        <div className={`${styles.recentActivity} ${styles.card}`}>
          <div className={styles.sectionTop}>
            <h3>Booking History</h3>

            <div className={styles.historyFilters}>
              {historyButtons.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`${styles.historyBtn} ${
                    historyRange === item.value ? styles.historyBtnActive : ""
                  }`}
                  onClick={() => setHistoryRange(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.activityList}>
            {loadingRecent ? (
              <div className={styles.activityEmpty}>
                <p>Loading booking history...</p>
              </div>
            ) : recentBookings.length === 0 ? (
              <div className={styles.activityEmpty}>
                <p>No booking history found.</p>
              </div>
            ) : (
              recentBookings.map((booking) => (
                <div key={booking.booking_id} className={styles.activityItem}>
                  <div>
                    <p className={styles.activityTitle}>
                      {booking.customer_name} booked {booking.room_name}
                    </p>
                    <p className={styles.activitySub}>
                      {booking.hotel_name} • {booking.check_in} to {booking.check_out}
                    </p>
                    <p className={styles.activityMeta}>
                      Rs. {booking.total_price}
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
              ))
            )}
          </div>
        </div>

        <div className={`${styles.quickStats} ${styles.card} ${styles.quickStatsCompact}`}>
          <h3>Booking Summary</h3>

          <div className={styles.summaryList}>
            <button
              type="button"
              className={styles.summaryItem}
              onClick={() => navigate("/vendor/bookings?status=completed")}
            >
              <span>Completed Stays</span>
              <strong>{stats.completedBookings}</strong>
            </button>

            <button
              type="button"
              className={styles.summaryItem}
              onClick={() => navigate("/vendor/bookings?status=cancelled")}
            >
              <span>Cancelled Bookings</span>
              <strong>{stats.cancelledBookings}</strong>
            </button>

            <button
              type="button"
              className={styles.summaryItem}
              onClick={() => navigate("/vendor/rooms")}
            >
              <span>Rooms Under Maintenance</span>
              <strong>{stats.maintenance}</strong>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;