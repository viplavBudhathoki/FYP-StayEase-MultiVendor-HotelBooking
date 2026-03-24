import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Search, FileDown } from "lucide-react";
import { baseUrl } from "../../../constant";
import styles from "./AdminBookings.module.css";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const getRoomImage = (img) => {
    if (!img) return `${baseUrl}/uploads/rooms/placeholder.png`;
    return `${baseUrl}/${img}`;
  };

  const fetchBookings = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Admin token missing");

      const form = new FormData();
      form.append("token", token);

      const res = await fetch(`${baseUrl}/bookings/getAdminBookings.php`, {
        method: "POST",
        body: form,
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Admin bookings API did not return JSON.");
      }

      if (data.success) {
        setBookings(Array.isArray(data.data) ? data.data : []);
      } else {
        toast.error(data.message || "Failed to load bookings");
        setBookings([]);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Admin token missing");
      return;
    }

    if (!fromDate || !toDate) {
      toast.error("Please select both from date and to date");
      return;
    }

    if (toDate < fromDate) {
      toast.error("To date must be same or after from date");
      return;
    }

    const params = new URLSearchParams();
    params.append("token", token);
    params.append("from_date", fromDate);
    params.append("to_date", toDate);

    if (statusFilter && statusFilter !== "all") {
      params.append("status", statusFilter);
    }

    window.open(
      `${baseUrl}/bookings/exportAdminBookingsPdf.php?${params.toString()}`,
      "_blank"
    );
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    const q = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const statusMatch =
        statusFilter === "all"
          ? true
          : String(booking.status || "").toLowerCase() === statusFilter;

      const searchMatch =
        !q ||
        String(booking.customer_name || "").toLowerCase().includes(q) ||
        String(booking.customer_email || "").toLowerCase().includes(q) ||
        String(booking.vendor_name || "").toLowerCase().includes(q) ||
        String(booking.vendor_email || "").toLowerCase().includes(q) ||
        String(booking.hotel_name || "").toLowerCase().includes(q) ||
        String(booking.room_name || "").toLowerCase().includes(q);

      const bookingCheckIn = String(booking.check_in || "");
      const bookingCheckOut = String(booking.check_out || "");

      const fromMatch = !fromDate || bookingCheckIn >= fromDate;
      const toMatch = !toDate || bookingCheckOut <= toDate;

      return statusMatch && searchMatch && fromMatch && toMatch;
    });
  }, [bookings, statusFilter, search, fromDate, toDate]);

  const filterButtons = [
    { label: "All", value: "all" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Checked In", value: "checked_in" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1>Bookings</h1>
        <p>Monitor all customer bookings across vendors and hotels</p>
        <p className={styles.countText}>
          Total Bookings: {loading ? "..." : filteredBookings.length}
        </p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>
          {filterButtons.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`${styles.filterBtn} ${
                statusFilter === item.value ? styles.filterBtnActive : ""
              }`}
              onClick={() => setStatusFilter(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by customer, vendor, hotel, or room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.exportToolbar}>
        <div className={styles.dateFilters}>
          <div className={styles.dateField}>
            <label>From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className={styles.dateField}>
            <label>To</label>
            <input
              type="date"
              value={toDate}
              min={fromDate || ""}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>

        <button
          type="button"
          className={styles.exportBtn}
          onClick={handleExportPdf}
        >
          <FileDown size={18} />
          Export PDF
        </button>
      </div>

      {loading ? (
        <div className={styles.emptyState}>Loading bookings...</div>
      ) : filteredBookings.length === 0 ? (
        <div className={styles.emptyState}>No bookings found.</div>
      ) : (
        <div className={styles.list}>
          {filteredBookings.map((booking) => {
            const roomsRequested = Number(booking.rooms_requested || 1);

            return (
              <div key={booking.booking_id} className={styles.card}>
                <img
                  src={getRoomImage(booking.room_image)}
                  alt={booking.room_name}
                  className={styles.image}
                  onError={(e) => {
                    e.currentTarget.src = `${baseUrl}/uploads/rooms/placeholder.png`;
                  }}
                />

                <div className={styles.content}>
                  <div className={styles.topRow}>
                    <div>
                      <p className={styles.hotelName}>{booking.hotel_name}</p>
                      <h2 className={styles.roomName}>{booking.room_name}</h2>
                      <p className={styles.roomType}>{booking.room_type}</p>
                      <p className={styles.location}>{booking.hotel_location}</p>
                    </div>

                    <span
                      className={`${styles.statusBadge} ${
                        styles[booking.status?.toLowerCase()] || ""
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className={styles.infoGrid}>
                    <div className={styles.infoBox}>
                      <h4>Customer</h4>
                      <p>
                        <strong>Name:</strong> {booking.customer_name}
                      </p>
                      <p>
                        <strong>Email:</strong> {booking.customer_email}
                      </p>
                    </div>

                    <div className={styles.infoBox}>
                      <h4>Vendor</h4>
                      <p>
                        <strong>Name:</strong> {booking.vendor_name}
                      </p>
                      <p>
                        <strong>Email:</strong> {booking.vendor_email}
                      </p>
                    </div>
                  </div>

                  <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Check-in</span>
                      <span className={styles.detailValue}>{booking.check_in}</span>
                    </div>

                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Check-out</span>
                      <span className={styles.detailValue}>{booking.check_out}</span>
                    </div>

                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Rooms</span>
                      <span className={styles.detailValue}>{roomsRequested}</span>
                    </div>

                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Total Price</span>
                      <span className={styles.detailValue}>
                        Rs. {booking.total_price}
                      </span>
                    </div>

                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Booked On</span>
                      <span className={styles.detailValue}>
                        {booking.created_at
                          ? new Date(booking.created_at).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>
                  </div>

                  <div className={styles.metaRow}>
                    <span>
                      <strong>Booking ID:</strong> {booking.booking_id}
                    </span>
                    <span>
                      <strong>Hotel ID:</strong> {booking.hotel_id}
                    </span>
                    <span>
                      <strong>Vendor ID:</strong> {booking.vendor_id}
                    </span>
                    <span>
                      <strong>Customer ID:</strong>{" "}
                      {booking.customer_id || booking.user_id}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminBookings;