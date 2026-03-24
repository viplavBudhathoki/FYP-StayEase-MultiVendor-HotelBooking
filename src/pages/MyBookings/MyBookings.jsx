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
    if (!token) {
      toast.error("Please login first");
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();
      form.append("token", token);

      const res = await fetch(`${baseUrl}/bookings/getMyBookings.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        const bookingData = Array.isArray(data.data) ? data.data : [];
        setBookings(bookingData);

        const initialEditDates = {};
        bookingData.forEach((booking) => {
          initialEditDates[booking.booking_id] = {
            check_in: booking.check_in || "",
            check_out: booking.check_out || "",
          };
        });
        setEditDates(initialEditDates);
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

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleDateChange = (bookingId, field, value) => {
    setEditDates((prev) => {
      const current = prev[bookingId] || { check_in: "", check_out: "" };
      const updated = {
        ...current,
        [field]: value,
      };

      if (field === "check_in" && updated.check_out && updated.check_out <= value) {
        updated.check_out = "";
      }

      return {
        ...prev,
        [bookingId]: updated,
      };
    });
  };

  const handleUpdateDates = async (booking) => {
    const currentEdit = editDates[booking.booking_id] || {};
    const checkIn = currentEdit.check_in || "";
    const checkOut = currentEdit.check_out || "";

    if (!checkIn || !checkOut) {
      toast.error("Please select both check-in and check-out dates");
      return;
    }

    if (checkOut <= checkIn) {
      toast.error("Check-out must be after check-in");
      return;
    }

    try {
      setUpdatingBookingId(booking.booking_id);

      const form = new FormData();
      form.append("token", token);
      form.append("booking_id", booking.booking_id);
      form.append("check_in", checkIn);
      form.append("check_out", checkOut);

      const res = await fetch(`${baseUrl}/bookings/updateMyBookingStay.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Booking dates updated successfully");
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

  const handleDownloadPdf = (bookingId) => {
    if (!token) {
      toast.error("Please login first");
      return;
    }

    const url = `${baseUrl}/bookings/exportMyBookingsPdf.php?token=${encodeURIComponent(token)}`;
    window.open(url, "_blank");
  };

  const openReviewModal = (booking) => {
    setSelectedBooking(booking);
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setSelectedBooking(null);
    setIsReviewModalOpen(false);
  };

  const getStatusClass = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "confirmed") return styles.confirmed;
    if (normalized === "checked_in") return styles.checkedIn;
    if (normalized === "completed") return styles.completed;
    if (normalized === "cancelled") return styles.cancelled;
    return styles.defaultStatus;
  };

  if (loading) {
    return <div className={styles.stateText}>Loading bookings...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>My Bookings</h1>
          <p>Track our reservations, stay details, and booking updates.</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No bookings found</h3>
          <p>We have not made any bookings yet.</p>
        </div>
      ) : (
        <div className={styles.bookingList}>
          {bookings.map((booking) => {
            const currentEdit = editDates[booking.booking_id] || {
              check_in: booking.check_in || "",
              check_out: booking.check_out || "",
            };

            const rooms = Array.isArray(booking.rooms) ? booking.rooms : [];
            const displayRoomImage =
              booking.room_image || (rooms.length > 0 ? rooms[0].room_image : "");
            const displayRoomNames =
              booking.room_name ||
              rooms.map((room) => room.room_name).filter(Boolean).join(", ");
            const displayRoomTypes =
              booking.room_type ||
              [...new Set(rooms.map((room) => room.room_type).filter(Boolean))].join(", ");

            return (
              <div key={booking.booking_id} className={styles.bookingCard}>
                <div className={styles.imageWrap}>
                  <img
                    src={getRoomImage(displayRoomImage)}
                    alt={displayRoomNames || "Booked room"}
                    className={styles.roomImage}
                    onError={(e) => {
                      e.currentTarget.src = `${baseUrl}/uploads/rooms/placeholder.png`;
                    }}
                  />
                </div>

                <div className={styles.bookingContent}>
                  <div className={styles.topRow}>
                    <div>
                      <h2 className={styles.hotelName}>{booking.hotel_name}</h2>
                      <p className={styles.location}>{booking.hotel_location}</p>
                      <p className={styles.roomName}>
                        {displayRoomNames} • {displayRoomTypes}
                      </p>
                    </div>

                    <span className={`${styles.statusBadge} ${getStatusClass(booking.status)}`}>
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
                      <span className={styles.detailLabel}>Guests</span>
                      <span className={styles.detailValue}>
                        {booking.adults || 1} Adults, {booking.children || 0} Children
                      </span>
                    </div>

                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Rooms</span>
                      <span className={styles.detailValue}>
                        {booking.rooms_requested || 1}
                      </span>
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

                  {rooms.length > 1 && (
                    <div className={styles.multiRoomBox}>
                      <h4 className={styles.sectionHeading}>Selected Rooms</h4>
                      <ul className={styles.roomList}>
                        {rooms.map((room) => (
                          <li key={room.room_id} className={styles.roomListItem}>
                            {room.room_name} ({room.room_type}) - Rs.{" "}
                            {Number(room.price_per_night || 0).toFixed(2)} / night
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Number(booking.can_modify_dates) === 1 && (
                    <div className={styles.editDatesBox}>
                      <h4 className={styles.sectionHeading}>Update Stay Dates</h4>

                      <div className={styles.dateRow}>
                        <div className={styles.dateField}>
                          <label>Check-in</label>
                          <input
                            type="date"
                            value={currentEdit.check_in}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) =>
                              handleDateChange(booking.booking_id, "check_in", e.target.value)
                            }
                          />
                        </div>

                        <div className={styles.dateField}>
                          <label>Check-out</label>
                          <input
                            type="date"
                            value={currentEdit.check_out}
                            min={currentEdit.check_in || new Date().toISOString().split("T")[0]}
                            onChange={(e) =>
                              handleDateChange(booking.booking_id, "check_out", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <button
                        className={styles.saveBtn}
                        type="button"
                        onClick={() => handleUpdateDates(booking)}
                        disabled={updatingBookingId === booking.booking_id}
                      >
                        {updatingBookingId === booking.booking_id
                          ? "Updating..."
                          : "Save Dates"}
                      </button>
                    </div>
                  )}

                  <div className={styles.actionRow}>
                    <button
                      type="button"
                      className={styles.pdfBtn}
                      onClick={() => handleDownloadPdf(booking.booking_id)}
                    >
                      <FileDown size={16} />
                      Download PDF
                    </button>

                    {String(booking.status).toLowerCase() === "completed" &&
                      new Date() > new Date(booking.check_out) && (
                        <button
                          type="button"
                          className={styles.reviewBtn}
                          onClick={() => openReviewModal(booking)}
                        >
                          Rate & Review
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