import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FileDown } from "lucide-react";
import { baseUrl } from "../../constant";
import ReviewModal from "../../components/ReviewModal/ReviewModal";
import styles from "./MyBookings.module.css";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const [editDates, setEditDates] = useState({});
  const [updatingBookingId, setUpdatingBookingId] = useState(null);

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
        const bookingList = Array.isArray(data.data) ? data.data : [];
        setBookings(bookingList);

        const initialDates = {};
        bookingList.forEach((booking) => {
          initialDates[booking.booking_id] = {
            check_in: booking.check_in || "",
            check_out: booking.check_out || "",
          };
        });
        setEditDates(initialDates);
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

  const updateBookingDates = async (booking) => {
    const bookingDates = editDates[booking.booking_id] || {};
    const newCheckIn = bookingDates.check_in || "";
    const newCheckOut = bookingDates.check_out || "";

    if (!newCheckIn || !newCheckOut) {
      toast.error("Check-in and check-out are required");
      return;
    }

    if (newCheckIn !== booking.check_in) {
      toast.error("Check-in date cannot be changed");
      return;
    }

    if (newCheckOut <= newCheckIn) {
      toast.error("Check-out must be after check-in");
      return;
    }

    if (newCheckOut === booking.check_out) {
      toast.error("No date changes found");
      return;
    }

    try {
      setUpdatingBookingId(booking.booking_id);

      const form = new FormData();
      form.append("token", token);
      form.append("booking_id", booking.booking_id);
      form.append("check_out", newCheckOut);

      const res = await fetch(`${baseUrl}/bookings/updateMyBookingDates.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Booking updated successfully");
        fetchBookings();
      } else {
        toast.error(data.message || "Failed to update booking dates");
      }
    } catch {
      toast.error("Failed to update booking dates");
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const handleExportPdf = () => {
    if (!token) {
      toast.error("Please login first");
      return;
    }

    const params = new URLSearchParams();
    params.append("token", token);

    window.open(
      `${baseUrl}/bookings/exportMyBookingsPdf.php?${params.toString()}`,
      "_blank"
    );
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
        <div>
          <h1 className={styles.title}>My Bookings</h1>
          <p className={styles.subtitle}>
            Track your reservations, booking status, completed stays, and update your check-out date before check-in.
          </p>
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

      {bookings.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No bookings found</h3>
          <p>Your booked rooms will appear here.</p>
        </div>
      ) : (
        <div className={styles.bookingsList}>
          {bookings.map((booking) => {
            const dates = editDates[booking.booking_id] || {
              check_in: booking.check_in,
              check_out: booking.check_out,
            };

            const canModifyDates =
              booking.status === "confirmed" &&
              booking.can_modify_dates === 1;

            return (
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

                  {canModifyDates && (
                    <div className={styles.modifyBox}>
                      <h3 className={styles.modifyTitle}>Modify Stay Dates</h3>
                      <p className={styles.modifyText}>
                        You can change only the check-out date before the stay begins.
                      </p>

                      <div className={styles.modifyGrid}>
                        <div className={styles.inputGroup}>
                          <label>Check-in</label>
                          <input type="date" value={dates.check_in} disabled />
                        </div>

                        <div className={styles.inputGroup}>
                          <label>Check-out</label>
                          <input
                            type="date"
                            value={dates.check_out}
                            min={dates.check_in || booking.check_in}
                            onChange={(e) =>
                              setEditDates((prev) => ({
                                ...prev,
                                [booking.booking_id]: {
                                  ...prev[booking.booking_id],
                                  check_in: booking.check_in,
                                  check_out: e.target.value,
                                },
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className={styles.modifyActions}>
                        <button
                          type="button"
                          className={styles.updateBtn}
                          onClick={() => updateBookingDates(booking)}
                          disabled={updatingBookingId === booking.booking_id}
                        >
                          {updatingBookingId === booking.booking_id
                            ? "Updating..."
                            : "Update Checkout"}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className={styles.actions}>
                    {booking.status === "confirmed" && (
                      <button
                        className={styles.cancelBtn}
                        onClick={() => cancelBooking(booking.booking_id)}
                        type="button"
                      >
                        Cancel Booking
                      </button>
                    )}

                    {booking.status === "completed" && (
                      <div className={styles.completedNotice}>
                        <p className={styles.completedText}>
                          Your stay is completed. You can now rate your experience.
                        </p>

                        <button
                          className={styles.reviewBtn}
                          onClick={() => openReviewModal(booking)}
                          type="button"
                        >
                          Rate Your Stay
                        </button>
                      </div>
                    )}

                    {booking.status === "cancelled" && (
                      <button className={styles.disabledBtn} disabled type="button">
                        Booking Cancelled
                      </button>
                    )}

                    {booking.status === "checked_in" && (
                      <button className={styles.disabledBtn} disabled type="button">
                        Stay In Progress
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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