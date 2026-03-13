import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { baseUrl } from "../../../constant";
import styles from "./AdminBookings.module.css";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Bookings</h1>
        <p>Monitor all customer bookings across vendors and hotels</p>
        <p className={styles.countText}>
          Total Bookings: {loading ? "..." : bookings.length}
        </p>
      </div>

      {loading ? (
        <div className={styles.empty}>Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className={styles.empty}>No bookings found.</div>
      ) : (
        <div className={styles.list}>
          {bookings.map((booking) => (
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
                    <p><strong>Name:</strong> {booking.customer_name}</p>
                    <p><strong>Email:</strong> {booking.customer_email}</p>
                  </div>

                  <div className={styles.infoBox}>
                    <h4>Vendor</h4>
                    <p><strong>Name:</strong> {booking.vendor_name}</p>
                    <p><strong>Email:</strong> {booking.vendor_email}</p>
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
                    <span className={styles.detailLabel}>Total Price</span>
                    <span className={styles.detailValue}>Rs. {booking.total_price}</span>
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
                  <span><strong>Booking ID:</strong> {booking.booking_id}</span>
                  <span><strong>Hotel ID:</strong> {booking.hotel_id}</span>
                  <span><strong>Room ID:</strong> {booking.room_id}</span>
                  <span><strong>Vendor ID:</strong> {booking.vendor_id}</span>
                  <span><strong>Customer ID:</strong> {booking.customer_id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBookings;