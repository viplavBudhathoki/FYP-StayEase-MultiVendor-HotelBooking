import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { baseUrl } from "../../constant";
import styles from "./BookingUpdateModal.module.css";

const BookingUpdateModal = ({ booking, onClose, onSuccess }) => {
  const token = localStorage.getItem("token");

  const [checkOut, setCheckOut] = useState(booking?.check_out || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCheckOut(booking?.check_out || "");
  }, [booking]);

  const perNightPrice = useMemo(() => {
    const start = new Date(booking.check_in);
    const end = new Date(booking.check_out);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (!nights || nights <= 0) return 0;
    return Number(booking.total_price) / nights;
  }, [booking]);

  const updatedNights = useMemo(() => {
    if (!booking?.check_in || !checkOut) return 0;

    const start = new Date(booking.check_in);
    const end = new Date(checkOut);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    return nights > 0 ? nights : 0;
  }, [booking, checkOut]);

  const updatedPrice = useMemo(() => {
    return updatedNights * perNightPrice;
  }, [updatedNights, perNightPrice]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!checkOut) {
      toast.error("Please select a new check-out date");
      return;
    }

    if (checkOut <= booking.check_in) {
      toast.error("Check-out must be after check-in");
      return;
    }

    try {
      setLoading(true);

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
        toast.success(data.message || "Booking updated successfully");
        onSuccess?.();
        onClose?.();
      } else {
        toast.error(data.message || "Failed to update booking");
      }
    } catch {
      toast.error("Failed to update booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2>Modify Stay</h2>
            <p>
              {booking.hotel_name} — {booking.room_name}
            </p>
          </div>

          <button className={styles.closeBtn} onClick={onClose} type="button">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <span className={styles.label}>Check-in</span>
              <strong>{booking.check_in}</strong>
            </div>

            <div className={styles.infoCard}>
              <span className={styles.label}>Current Check-out</span>
              <strong>{booking.check_out}</strong>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label>New Check-out Date</label>
            <input
              type="date"
              value={checkOut}
              min={booking.check_in}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>

          <div className={styles.summaryBox}>
            <div className={styles.summaryRow}>
              <span>Per Night Price</span>
              <strong>Rs. {perNightPrice.toFixed(2)}</strong>
            </div>

            <div className={styles.summaryRow}>
              <span>Updated Nights</span>
              <strong>{updatedNights}</strong>
            </div>

            <div className={styles.summaryRow}>
              <span>Updated Total Price</span>
              <strong>Rs. {updatedPrice.toFixed(2)}</strong>
            </div>
          </div>

          <div className={styles.noteBox}>
            <p>
              You can extend your stay by choosing a later check-out date or leave
              early by choosing an earlier check-out date.
            </p>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={styles.saveBtn}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Stay"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingUpdateModal;