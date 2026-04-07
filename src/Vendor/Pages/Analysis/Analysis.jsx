import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  AlertCircle,
  Hotel,
  BedDouble,
  CalendarCheck,
  Percent,
  Clock3,
  Building2,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { baseUrl } from "../../../constant";
import styles from "./Analysis.module.css";

const DEFAULT_SUMMARY = {
  total_hotels: 0,
  total_room_types: 0,
  total_room_inventory: 0,
  total_bookings: 0,
  confirmed_bookings: 0,
  checked_in_bookings: 0,
  completed_bookings: 0,
  cancelled_bookings: 0,
  gross_revenue: 0,
  completed_revenue: 0,
  bookings_last_7_days: 0,
  bookings_last_30_days: 0,
  occupied_room_units: 0,
  occupancy_rate: 0,
};

const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const StatCard = ({ icon, label, value, helper, tone = "blue" }) => {
  return (
    <div className={styles.statCard}>
      <div className={`${styles.statIcon} ${styles[`tone${tone}`]}`}>{icon}</div>
      <div className={styles.statInfo}>
        <span className={styles.statLabel}>{label}</span>
        <strong className={styles.statValue}>{value}</strong>
        {helper ? <small className={styles.statHelper}>{helper}</small> : null}
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload || !payload.length) return null;

  const displayLabel = payload[0]?.payload?.fullName || label;

  return (
    <div className={styles.chartTooltip}>
      <p className={styles.tooltipLabel}>{displayLabel}</p>
      {payload.map((entry, index) => (
        <p key={index} className={styles.tooltipValue}>
          {entry.name}: {formatter ? formatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
};

const Analysis = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [hotelPerformance, setHotelPerformance] = useState([]);

  const fetchAnalysis = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Vendor token missing");
      }

      const form = new FormData();
      form.append("token", token);

      const res = await fetch(`${baseUrl}/bookings/getVendorAnalysis.php`, {
        method: "POST",
        body: form,
      });

      const rawText = await res.text();

      let data;
      try {
        data = JSON.parse(rawText);
      } catch (parseError) {
        console.error("Analysis raw response:", rawText);
        throw new Error("Invalid server response from analysis API");
      }

      if (data.success) {
        setSummary(data.data?.summary || DEFAULT_SUMMARY);
        setHotelPerformance(
          Array.isArray(data.data?.hotel_performance)
            ? data.data.hotel_performance
            : []
        );
      } else {
        toast.error(data.message || "Failed to load business analysis");
        setSummary(DEFAULT_SUMMARY);
        setHotelPerformance([]);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load business analysis");
      setSummary(DEFAULT_SUMMARY);
      setHotelPerformance([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const noData =
    Number(summary.total_hotels || 0) === 0 &&
    Number(summary.total_room_types || 0) === 0 &&
    Number(summary.total_bookings || 0) === 0;

  const topHotel = useMemo(() => {
    if (!hotelPerformance.length) return null;
    return [...hotelPerformance].sort(
      (a, b) => Number(b.revenue || 0) - Number(a.revenue || 0)
    )[0];
  }, [hotelPerformance]);

  const revenueChartData = useMemo(() => {
    return hotelPerformance.map((hotel) => ({
      hotel_id: hotel.hotel_id,
      name:
        hotel.hotel_name?.length > 18
          ? `${hotel.hotel_name.slice(0, 18)}...`
          : hotel.hotel_name,
      fullName: hotel.hotel_name,
      revenue: Number(hotel.revenue || 0),
    }));
  }, [hotelPerformance]);

  const bookingChartData = useMemo(() => {
    return hotelPerformance.map((hotel) => ({
      hotel_id: hotel.hotel_id,
      name:
        hotel.hotel_name?.length > 18
          ? `${hotel.hotel_name.slice(0, 18)}...`
          : hotel.hotel_name,
      fullName: hotel.hotel_name,
      bookings: Number(hotel.total_bookings || 0),
    }));
  }, [hotelPerformance]);

  const bookingStatusData = useMemo(() => {
    return [
      {
        name: "Confirmed",
        value: Number(summary.confirmed_bookings || 0),
      },
      {
        name: "Checked In",
        value: Number(summary.checked_in_bookings || 0),
      },
      {
        name: "Completed",
        value: Number(summary.completed_bookings || 0),
      },
      {
        name: "Cancelled",
        value: Number(summary.cancelled_bookings || 0),
      },
    ];
  }, [summary]);

  const pieColors = ["#facc15", "#14b8a6", "#22c55e", "#ef4444"];

  if (loading) {
    return (
      <div className={styles.analysisPage}>
        <div className={styles.pageHeader}>
          <div>
            <h1>Business Analysis</h1>
            <p>Detailed insights into your property performance</p>
          </div>
        </div>

        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.analysisPage}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Business Analysis</h1>
          <p>Detailed insights into your property performance</p>
        </div>

        <button
          type="button"
          className={styles.refreshBtn}
          onClick={fetchAnalysis}
        >
          Refresh
        </button>
      </div>

      {noData ? (
        <div className={styles.emptyState}>
          <AlertCircle size={48} />
          <h3>No Analysis Data</h3>
          <p>
            Add hotels, rooms, and bookings to see your business performance
            here.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.statsGrid}>
            <StatCard
              icon={<Hotel size={22} />}
              label="Total Hotels"
              value={summary.total_hotels || 0}
              helper="Active vendor hotels"
              tone="blue"
            />

            <StatCard
              icon={<BedDouble size={22} />}
              label="Room Types"
              value={summary.total_room_types || 0}
              helper={`Inventory: ${summary.total_room_inventory || 0} rooms`}
              tone="purple"
            />

            <StatCard
              icon={<CalendarCheck size={22} />}
              label="Total Bookings"
              value={summary.total_bookings || 0}
              helper={`${summary.bookings_last_7_days || 0} in last 7 days`}
              tone="green"
            />

            <StatCard
              icon={<span className={styles.currencyIcon}>Rs</span>}
              label="Gross Revenue"
              value={formatCurrency(summary.gross_revenue)}
              helper={`Completed: ${formatCurrency(summary.completed_revenue)}`}
              tone="orange"
            />

            <StatCard
              icon={<Percent size={22} />}
              label="Current Occupancy"
              value={`${Number(summary.occupancy_rate || 0).toFixed(2)}%`}
              helper={`${summary.occupied_room_units || 0} occupied room unit(s)`}
              tone="indigo"
            />

            <StatCard
              icon={<Clock3 size={22} />}
              label="Checked-in Bookings"
              value={summary.checked_in_bookings || 0}
              helper="Active stays now"
              tone="teal"
            />
          </div>

          <div className={styles.secondaryGrid}>
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h3>Quick Insights</h3>
                <p>Simple vendor performance snapshot</p>
              </div>

              <div className={styles.insightList}>
                <div className={styles.insightItem}>
                  <span>Bookings in last 7 days</span>
                  <strong>{summary.bookings_last_7_days || 0}</strong>
                </div>

                <div className={styles.insightItem}>
                  <span>Bookings in last 30 days</span>
                  <strong>{summary.bookings_last_30_days || 0}</strong>
                </div>

                <div className={styles.insightItem}>
                  <span>Top performing hotel</span>
                  <strong>{topHotel ? topHotel.hotel_name : "N/A"}</strong>
                </div>

                <div className={styles.insightItem}>
                  <span>Total room inventory</span>
                  <strong>{summary.total_room_inventory || 0}</strong>
                </div>
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h3>Booking Status Chart</h3>
                <p>Dynamic booking lifecycle overview</p>
              </div>

              <div className={styles.chartBox}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bookingStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      innerRadius={50}
                      paddingAngle={3}
                    >
                      {bookingStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={pieColors[index % pieColors.length]}
                        />
                      ))}
                    </Pie>

                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className={styles.chartGrid}>
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h3>Hotel-wise Revenue</h3>
                <p>Compare revenue across assigned hotels</p>
              </div>

              {revenueChartData.length === 0 ? (
                <div className={styles.emptyMini}>No revenue data yet.</div>
              ) : (
                <div className={styles.chartBox}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueChartData} barCategoryGap="25%">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-20}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis />
                      <Tooltip
                        content={
                          <CustomTooltip
                            formatter={(value) => formatCurrency(value)}
                          />
                        }
                      />
                      <Bar
                        dataKey="revenue"
                        name="Revenue"
                        radius={[8, 8, 0, 0]}
                        barSize={30}
                        cursor="pointer"
                        onClick={(data) => {
                          const hotelId = data?.payload?.hotel_id;
                          if (hotelId) {
                            navigate(`/vendor/hotels/${hotelId}/rooms`);
                          }
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h3>Hotel-wise Bookings</h3>
                <p>Compare booking volume across assigned hotels</p>
              </div>

              {bookingChartData.length === 0 ? (
                <div className={styles.emptyMini}>No booking data yet.</div>
              ) : (
                <div className={styles.chartBox}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bookingChartData} barCategoryGap="25%">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-20}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis allowDecimals={false} />
                      <Tooltip
                        content={<CustomTooltip formatter={(value) => value} />}
                      />
                      <Bar
                        dataKey="bookings"
                        name="Bookings"
                        radius={[8, 8, 0, 0]}
                        barSize={30}
                        cursor="pointer"
                        onClick={(data) => {
                          const hotelId = data?.payload?.hotel_id;
                          if (hotelId) {
                            navigate(`/vendor/hotels/${hotelId}/rooms`);
                          }
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3>Performance Highlights</h3>
              <p>Important business indicators for quick review</p>
            </div>

            <div className={styles.highlightGrid}>
              <div className={styles.highlightCard}>
                <div className={styles.highlightIcon}>
                  <TrendingUp size={20} />
                </div>
                <div>
                  <span>Best Revenue</span>
                  <strong>
                    {topHotel
                      ? `${topHotel.hotel_name} (${formatCurrency(topHotel.revenue)})`
                      : "N/A"}
                  </strong>
                </div>
              </div>

              <div className={styles.highlightCard}>
                <div className={styles.highlightIcon}>
                  <Building2 size={20} />
                </div>
                <div>
                  <span>Completed Bookings</span>
                  <strong>{summary.completed_bookings || 0}</strong>
                </div>
              </div>

              <div className={styles.highlightCard}>
                <div className={styles.highlightIcon}>
                  <Clock3 size={20} />
                </div>
                <div>
                  <span>Active Checked-in Stays</span>
                  <strong>{summary.checked_in_bookings || 0}</strong>
                </div>
              </div>

              <div className={styles.highlightCard}>
                <div className={styles.highlightIcon}>
                  <span className={styles.highlightCurrencyIcon}>Rs</span>
                </div>
                <div>
                  <span>Completed Revenue</span>
                  <strong>{formatCurrency(summary.completed_revenue)}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h3>Hotel-wise Performance</h3>
                <p>Revenue and booking activity by hotel</p>
              </div>
            </div>

            {hotelPerformance.length === 0 ? (
              <div className={styles.emptyMini}>
                No hotel performance data yet.
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Hotel</th>
                      <th>Location</th>
                      <th>Room Types</th>
                      <th>Total Rooms</th>
                      <th>Bookings</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hotelPerformance.map((hotel) => (
                      <tr key={hotel.hotel_id}>
                        <td>{hotel.hotel_name}</td>
                        <td>{hotel.location || "-"}</td>
                        <td>{hotel.room_types}</td>
                        <td>{hotel.total_rooms}</td>
                        <td>{hotel.total_bookings}</td>
                        <td>{formatCurrency(hotel.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Analysis;