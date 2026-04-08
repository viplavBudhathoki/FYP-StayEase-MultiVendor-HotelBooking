import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FileDown } from "lucide-react";
import { baseUrl } from "../../constant";
import ReviewModal from "../../components/ReviewModal/ReviewModal";
import styles from "./MyBookings.module.css";

const BOOKINGS_PER_PAGE = 5;

const MyBookings = () => {
  const [searchParams] = useSearchParams();
  const targetBookingId = Number(searchParams.get("booking_id") || 0);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const [editDates, setEditDates] = useState({});
  const [updatingBookingId, setUpdatingBookingId] = useState(null);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [highlightedBookingId, setHighlightedBookingId] = useState(targetBookingId);

  const bookingRefs = useRef({});

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

        const sortedBookings = [...bookingData].sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;

          if (dateB !== dateA) return dateB - dateA;
          return Number(b.booking_id || 0) - Number(a.booking_id || 0);
        });

        setBookings(sortedBookings);

        const initialEditDates = {};
        sortedBookings.forEach((booking) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const checkOut = currentEdit.check_out || "";

    if (!checkOut) {
      toast.error("Please select check-out date");
      return;
    }

    if (checkOut === booking.check_out) {
      toast.error("Please select a new check-out date to update stay");
      return;
    }

    if (checkOut <= booking.check_in) {
      toast.error("Check-out must be after check-in");
      return;
    }

    try {
      setUpdatingBookingId(booking.booking_id);

      const form = new FormData();
      form.append("token", token);
      form.append("booking_id", booking.booking_id);
      form.append("check_out", checkOut);

      const res = await fetch(`${baseUrl}/bookings/updateMyBookingStay.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Booking stay updated successfully");
        fetchBookings();
      } else {
        toast.error(data.message || "Failed to update booking stay");
      }
    } catch {
      toast.error("Failed to update booking stay");
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!token) {
      toast.error("Please login first");
      return;
    }

    const ok = window.confirm("Are you sure you want to cancel this booking?");
    if (!ok) return;

    try {
      setCancellingBookingId(bookingId);

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
    } finally {
      setCancellingBookingId(null);
    }
  };

  const handleExportPdf = () => {
    if (!token) {
      toast.error("Please login first");
      return;
    }

    const url = `${baseUrl}/bookings/exportMyBookingsPdf.php?token=${encodeURIComponent(
      token
    )}`;
    window.open(url, "_blank");
  };

  const handleDownloadSinglePdf = (bookingId) => {
    if (!token) {
      toast.error("Please login first");
      return;
    }

    const url = `${baseUrl}/bookings/exportSingleBookingPdf.php?token=${encodeURIComponent(
      token
    )}&booking_id=${encodeURIComponent(bookingId)}`;

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

  const getNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const diff = end - start;
    if (Number.isNaN(diff) || diff <= 0) return 0;

    return Math.round(diff / (1000 * 60 * 60 * 24));
  };

  const totalPages = Math.max(1, Math.ceil(bookings.length / BOOKINGS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (targetBookingId > 0 && bookings.length > 0) {
      const index = bookings.findIndex(
        (booking) => Number(booking.booking_id) === targetBookingId
      );

      if (index >= 0) {
        const page = Math.floor(index / BOOKINGS_PER_PAGE) + 1;
        setCurrentPage(page);
        setHighlightedBookingId(targetBookingId);

        setTimeout(() => {
          bookingRefs.current[targetBookingId]?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 250);

        setTimeout(() => {
          setHighlightedBookingId(0);
        }, 3500);
      }
    }
  }, [targetBookingId, bookings]);

  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * BOOKINGS_PER_PAGE;
    const endIndex = startIndex + BOOKINGS_PER_PAGE;
    return bookings.slice(startIndex, endIndex);
  }, [bookings, currentPage]);

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
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

        <button type="button" className={styles.pdfBtn} onClick={handleExportPdf}>
          <FileDown size={16} />
          Export PDF
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No bookings found</h3>
          <p>We have not made any bookings yet.</p>
        </div>
      ) : (
        <>
          <div className={styles.bookingList}>
            {paginatedBookings.map((booking) => {
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

              const normalizedStatus = String(booking.status || "").toLowerCase();
              const canCancel = Number(booking.can_cancel_booking) === 1;
              const canUpdateStay = Number(booking.can_modify_dates) === 1;
              const nights = getNights(booking.check_in, booking.check_out);
              const isHighlighted =
                Number(booking.booking_id) === Number(highlightedBookingId);

              return (
                <div
                  key={booking.booking_id}
                  ref={(el) => {
                    bookingRefs.current[booking.booking_id] = el;
                  }}
                  className={`${styles.bookingCard} ${
                    isHighlighted ? styles.highlightCard : ""
                  }`}
                >
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
                        <p className={styles.bookingId}>Booking ID: #{booking.booking_id}</p>
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
                        <span className={styles.detailLabel}>Nights</span>
                        <span className={styles.detailValue}>{nights}</span>
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
                        <span className={styles.detailValue}>
                          Rs. {Number(booking.total_price || 0).toFixed(2)}
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

                    {rooms.length > 0 && (
                      <div className={styles.roomBreakdown}>
                        <h4 className={styles.breakdownHeading}>Room Details</h4>
                        <div className={styles.roomBreakdownList}>
                          {rooms.map((room, index) => (
                            <div key={room.room_id || index} className={styles.roomBreakdownItem}>
                              <div>
                                <p className={styles.breakdownRoomTitle}>
                                  Room {index + 1}: {room.room_name}
                                </p>
                                <p className={styles.breakdownRoomMeta}>{room.room_type}</p>
                              </div>

                              <p className={styles.breakdownPrice}>
                                Rs. {Number(room.price_per_night || 0).toFixed(2)} / night
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {canUpdateStay && (
                      <div
                        className={
                          normalizedStatus === "checked_in"
                            ? styles.checkedInBox
                            : styles.editDatesBox
                        }
                      >
                        <h4 className={styles.sectionHeading}>
                          {normalizedStatus === "checked_in"
                            ? "Extend or Shorten Stay"
                            : "Update Stay Dates"}
                        </h4>

                        <div className={styles.dateRow}>
                          <div className={styles.dateField}>
                            <label>Check-in</label>
                            <input type="date" value={booking.check_in} disabled />
                          </div>

                          <div className={styles.dateField}>
                            <label>Check-out</label>
                            <input
                              type="date"
                              value={currentEdit.check_out}
                              min={booking.check_in}
                              onChange={(e) =>
                                handleDateChange(
                                  booking.booking_id,
                                  "check_out",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>

                        <p className={styles.policyNote}>
                          Extension or shortening is allowed only if all selected room(s)
                          remain available for the updated date range.
                        </p>

                        <button
                          className={styles.updateBtn}
                          type="button"
                          onClick={() => handleUpdateDates(booking)}
                          disabled={updatingBookingId === booking.booking_id}
                        >
                          {updatingBookingId === booking.booking_id
                            ? "Updating..."
                            : "Update Stay"}
                        </button>
                      </div>
                    )}

                    <div className={styles.actionsRow}>
                      <button
                        type="button"
                        className={styles.downloadBtn}
                        onClick={() => handleDownloadSinglePdf(booking.booking_id)}
                      >
                        <FileDown size={16} />
                        Download PDF
                      </button>

                      {canCancel && normalizedStatus === "confirmed" && (
                        <button
                          type="button"
                          className={styles.cancelBtn}
                          onClick={() => handleCancelBooking(booking.booking_id)}
                          disabled={cancellingBookingId === booking.booking_id}
                        >
                          {cancellingBookingId === booking.booking_id
                            ? "Cancelling..."
                            : "Cancel Booking"}
                        </button>
                      )}

                      {normalizedStatus === "completed" && (
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

          {bookings.length > BOOKINGS_PER_PAGE && (
            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.paginationBtn}
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <span className={styles.paginationInfo}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                className={styles.paginationBtn}
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
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