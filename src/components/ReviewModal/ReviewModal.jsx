import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Rating from "react-rating";
import { FaRegStar, FaStar } from "react-icons/fa";
import { baseUrl } from "../../constant";
import styles from "./ReviewModal.module.css";

const ReviewModal = ({ booking, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [myReview, setMyReview] = useState(null);

  const [formData, setFormData] = useState({
    rating: 0,
    comment: "",
  });

  const token = localStorage.getItem("token");

  const fetchMyReview = async () => {
    try {
      const form = new FormData();
      form.append("token", token);
      form.append("booking_id", booking.booking_id);

      const res = await fetch(`${baseUrl}/hotels/getMyBookingReview.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success && data.has_review) {
        setMyReview(data.data);
        setFormData({
          rating: Number(data.data.rating),
          comment: data.data.review_message || "",
        });
      } else {
        setMyReview(null);
        setFormData({
          rating: 0,
          comment: "",
        });
      }
    } catch {
      setMyReview(null);
    }
  };

  useEffect(() => {
    fetchMyReview();
  }, [booking.booking_id]);

  const handleSubmit = async () => {
    if (formData.rating < 0.5) {
      toast.error("Please give a rating");
      return;
    }

    if (!formData.comment.trim()) {
      toast.error("Please write a review");
      return;
    }

    try {
      setLoading(true);

      const form = new FormData();
      form.append("token", token);
      form.append("booking_id", booking.booking_id);
      form.append("rating", formData.rating);
      form.append("review_message", formData.comment.trim());

      const apiUrl = myReview
        ? `${baseUrl}/hotels/updateRating.php`
        : `${baseUrl}/hotels/giveRating.php`;

      const res = await fetch(apiUrl, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Review saved successfully");
        onSuccess?.();
        onClose?.();
      } else {
        toast.error(data.message || "Failed to save review");
      }
    } catch {
      toast.error("Failed to save review");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const ok = window.confirm("Are you sure you want to delete your review?");
    if (!ok) return;

    try {
      setLoading(true);

      const form = new FormData();
      form.append("token", token);
      form.append("booking_id", booking.booking_id);

      const res = await fetch(`${baseUrl}/hotels/deleteRating.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Review deleted successfully");
        onSuccess?.();
        onClose?.();
      } else {
        toast.error(data.message || "Failed to delete review");
      }
    } catch {
      toast.error("Failed to delete review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2>{myReview ? "Edit Review" : "Leave a Review"}</h2>
            <p>
              {booking.hotel_name} — {booking.room_name}
            </p>
          </div>

          <button className={styles.closeBtn} onClick={onClose} type="button">
            ×
          </button>
        </div>

        <div className={styles.ratingBlock}>
          <p className={styles.selectedRating}>
            Selected Rating: {Number(formData.rating || 0).toFixed(1)}
          </p>

          <Rating
            initialRating={formData.rating}
            fractions={2}
            fullSymbol={<FaStar />}
            emptySymbol={<FaRegStar />}
            className={styles.stars}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, rating: value }))
            }
          />
        </div>

        <textarea
          className={styles.textarea}
          placeholder="Write your review about your stay..."
          value={formData.comment}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, comment: e.target.value }))
          }
        />

        <div className={styles.actions}>
          {myReview && (
            <button
              className={styles.deleteBtn}
              onClick={handleDelete}
              disabled={loading}
              type="button"
            >
              Delete Review
            </button>
          )}

          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={loading}
            type="button"
          >
            {loading
              ? "Saving..."
              : myReview
              ? "Update Review"
              : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;