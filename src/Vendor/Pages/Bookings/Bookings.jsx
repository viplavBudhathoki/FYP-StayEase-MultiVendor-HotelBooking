import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Search, FileDown } from "lucide-react";
import { baseUrl } from "../../../constant";
import styles from "./Bookings.module.css";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

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
      if (!token) throw new Error("Vendor token missing");

      const form = new FormData();
      form.append("token", token);

      const res = await fetch(`${baseUrl}/bookings/getVendorBookings.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

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

  const updateBookingStatus = async (bookingId, status) => {
    try {
      setUpdatingId(bookingId);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vendor token missing");

      const form = new FormData();
      form.append("token", token);
      form.append("booking_id", bookingId);
      form.append("status", status);

      const res = await fetch(`${baseUrl}/bookings/updateBookingStatus.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Booking status updated");
        fetchBookings();
      } else {
        toast.error(data.message || "Failed to update booking");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update booking");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExportPdf = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Vendor token missing");
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
      `${baseUrl}/bookings/exportVendorBookingsPdf.php?${params.toString()}`,
      "_blank"
    );
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    const q = search.trim().toLowerCase();

  const handleExportPdf = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    toast.error("Vendor token missing");
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
    `${baseUrl}/bookings/exportVendorBookingsPdf.php?${params.toString()}`,
    "_blank"
  );
};

    return bookings.filter((booking) => {
      const statusMatch =
        statusFilter === "all"
          ? true
          : String(booking.status || "").toLowerCase() === statusFilter;

      const searchMatch =
        !q ||
        String(booking.customer_name || "").toLowerCase().includes(q) ||
        String(booking.customer_email || "").toLowerCase().includes(q) ||
        String(booking.hotel_name || "").toLowerCase().includes(q) ||
        String(booking.room_name || "").toLowerCase().includes(q) ||
        String(booking.room_type || "").toLowerCase().includes(q);

      return statusMatch && searchMatch;
    });
  }, [bookings, statusFilter, search]);

  const filterButtons = [
    { label: "All", value: "all" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Checked In", value: "checked_in" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  if (loading) {
    return <div className={styles.stateText}>Loading bookings...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1>Booking Management</h1>
        <p>Monitor customer reservations for our hotel rooms.</p>
        <p className={styles.countText}>
          Total Bookings: {filteredBookings.length}
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
            placeholder="Search by customer, hotel, or room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.exportToolbar}>
        <div className={styles.dateFilters}>
          <div className={styles.dateField}>
            <label>From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className={styles.dateField}>
            <label>To Date</label>
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

      {filteredBookings.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No bookings found</h3>
          <p>Customer bookings will appear here once rooms are reserved.</p>
        </div>
      ) : (
        <div className={styles.bookingsList}>
          {filteredBookings.map((booking) => (
            <div key={booking.booking_id} className={styles.bookingCard}>
              <img
                src={getRoomImage(booking.room_image)}
                alt={booking.room_name}
                className={styles.roomImage}
                onError={(e) => {
                  e.currentTarget.src = `${baseUrl}/uploads/rooms/placeholder.png`;
                }}
              />

              <div className={styles.bookingInfo}>
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

                <div className={styles.customerBox}>
                  <p className={styles.customerTitle}>Customer Details</p>
                  <p className={styles.customerText}>
                    <strong>Name:</strong> {booking.customer_name}
                  </p>
                  <p className={styles.customerText}>
                    <strong>Email:</strong> {booking.customer_email}
                  </p>
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

                <div className={styles.actions}>
                  {booking.status === "confirmed" && (
                    <>
                      <button
                        className={styles.completeBtn}
                        onClick={() =>
                          updateBookingStatus(booking.booking_id, "checked_in")
                        }
                        disabled={updatingId === booking.booking_id}
                        type="button"
                      >
                        {updatingId === booking.booking_id
                          ? "Updating..."
                          : "Check In Guest"}
                      </button>

                      <button
                        className={styles.cancelBtn}
                        onClick={() =>
                          updateBookingStatus(booking.booking_id, "cancelled")
                        }
                        disabled={updatingId === booking.booking_id}
                        type="button"
                      >
                        {updatingId === booking.booking_id
                          ? "Updating..."
                          : "Cancel Booking"}
                      </button>
                    </>
                  )}

                  {booking.status === "checked_in" && (
                    <button
                      className={styles.completeBtn}
                      onClick={() =>
                        updateBookingStatus(booking.booking_id, "completed")
                      }
                      disabled={updatingId === booking.booking_id}
                      type="button"
                    >
                      {updatingId === booking.booking_id
                        ? "Updating..."
                        : "Complete Stay"}
                    </button>
                  )}

                  {booking.status === "completed" && (
                    <button className={styles.disabledBtn} disabled type="button">
                      Stay Completed
                    </button>
                  )}

                  {booking.status === "cancelled" && (
                    <button className={styles.disabledBtn} disabled type="button">
                      Booking Cancelled
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;