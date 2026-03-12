import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { baseUrl } from "../../constant";
import ReviewModal from "../../components/ReviewModal/ReviewModal";
import styles from "./MyBookings.module.css";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const token = localStorage.getItem("token");

  const getRoomImage = (img) => {
    if (!img) return `${baseUrl}/uploads/rooms/placeholder.png`;
    return `${baseUrl}/${img}`;
  };

  const fetchBookings = async () => {
    setLoading(true);

    try {
      if (!token) {
        toast.error("Please login first");
        setBookings([]);
        setLoading(false);
        return;
      }

      const form = new FormData();
      form.append("token", token);

      const res = await fetch(`${baseUrl}/bookings/getMyBookings.php`, {
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
    } catch {
      toast.error("Failed to load bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    const ok = window.confirm("Are you sure you want to cancel this booking?");
    if (!ok) return;

    try {
      const form = new FormData();
      form.append("token", token);
      form.append("booking_id", bookingId);

      const res = await fetch(`${baseUrl}/bookings/cancelBooking.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Booking cancelled successfully");
        fetchBookings();
      } else {
        toast.error(data.message || "Failed to cancel booking");
      }
    } catch {
      toast.error("Failed to cancel booking");
    }
  };

  const openReviewModal = (booking) => {
    setSelectedBooking(booking);
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setSelectedBooking(null);
    setIsReviewModalOpen(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) {
    return <div className={styles.stateText}>Loading bookings...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>My Bookings</h1>
        <p className={styles.subtitle}>
          Track your reservations, booking status, and completed stays.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No bookings found</h3>
          <p>Your booked rooms will appear here.</p>
        </div>
      ) : (
        <div className={styles.bookingsList}>
          {bookings.map((booking) => (
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
                    <button
                      className={styles.cancelBtn}
                      onClick={() => cancelBooking(booking.booking_id)}
                    >
                      Cancel Booking
                    </button>
                  )}

                  {booking.status === "completed" && (
                    <button
                      className={styles.reviewBtn}
                      onClick={() => openReviewModal(booking)}
                    >
                      Give Review
                    </button>
                  )}

                  {booking.status === "cancelled" && (
                    <button className={styles.disabledBtn} disabled>
                      Booking Cancelled
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isReviewModalOpen && selectedBooking && (
        <ReviewModal
          booking={selectedBooking}
          onClose={closeReviewModal}
          onSuccess={fetchBookings}
        />
      )}
    </div>
  );
};

export default MyBookings;