import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import Rating from "react-rating";
import { FaRegStar, FaStar } from "react-icons/fa";
import { baseUrl } from "../../constant";
import styles from "./HotelRooms.module.css";

const HotelRooms = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [myReview, setMyReview] = useState(null);

  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: "",
  });

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = !!token && !!user;

  const getRoomImage = (img) => {
    if (!img) return `${baseUrl}/uploads/rooms/placeholder.png`;
    return `${baseUrl}/${img}`;
  };

  const parseAmenities = (value) => {
    if (!value) return [];

    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {}

    return String(value)
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
  };

  const goToLogin = () => {
    toast.error("Please login first");
    navigate("/login", {
      state: { from: location.pathname },
    });
  };

  const fetchRooms = async () => {
    setLoading(true);

    try {
      const form = new FormData();
      form.append("hotel_id", hotelId);

      const res = await fetch(`${baseUrl}/rooms/getPublicRoomsByHotel.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        setRooms(Array.isArray(data.data) ? data.data : []);
      } else {
        toast.error(data.message || "Failed to load rooms");
        setRooms([]);
      }
    } catch {
      toast.error("Failed to load rooms");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);

    try {
      const res = await fetch(
        `${baseUrl}/hotels/getHotelRatings.php?hotel_id=${hotelId}`
      );
      const data = await res.json();

      if (data.success) {
        setReviews(Array.isArray(data.data) ? data.data : []);
      } else {
        setReviews([]);
      }
    } catch {
      toast.error("Failed to load reviews");
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchMyReview = async () => {
    if (!token) {
      setMyReview(null);
      setReviewForm({
        rating: 0,
        comment: "",
      });
      return;
    }

    try {
      const form = new FormData();
      form.append("token", token);
      form.append("hotel_id", hotelId);

      const res = await fetch(`${baseUrl}/hotels/getMyHotelReview.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success && data.has_review) {
        setMyReview(data.data);
        setReviewForm({
          rating: Number(data.data.rating),
          comment: data.data.review_message || "",
        });
      } else {
        setMyReview(null);
        setReviewForm({
          rating: 0,
          comment: "",
        });
      }
    } catch {
      setMyReview(null);
    }
  };

  const openReviewModal = () => {
    if (!isLoggedIn) {
      goToLogin();
      return;
    }

    if (user?.role !== "user") {
      toast.error("Only customers can review hotels");
      return;
    }

    setIsReviewModalOpen(true);
  };

  const submitReview = async () => {
    if (!isLoggedIn) {
      goToLogin();
      return;
    }

    if (user?.role !== "user") {
      toast.error("Only customers can review hotels");
      return;
    }

    if (reviewForm.rating < 0.5) {
      toast.error("Please give a rating");
      return;
    }

    if (!reviewForm.comment.trim()) {
      toast.error("Please write a review");
      return;
    }

    try {
      const form = new FormData();
      form.append("token", token);
      form.append("hotel_id", hotelId);
      form.append("rating", reviewForm.rating);
      form.append("review_message", reviewForm.comment.trim());

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
        setIsReviewModalOpen(false);
        fetchReviews();
        fetchMyReview();
      } else {
        toast.error(data.message || "Failed to submit review");
      }
    } catch {
      toast.error("Failed to submit review");
    }
  };

  const deleteReview = async () => {
    if (!isLoggedIn) {
      goToLogin();
      return;
    }

    if (user?.role !== "user") {
      toast.error("Only customers can delete reviews");
      return;
    }

    const ok = window.confirm("Are you sure you want to delete your review?");
    if (!ok) return;

    try {
      const form = new FormData();
      form.append("token", token);
      form.append("hotel_id", hotelId);

      const res = await fetch(`${baseUrl}/hotels/deleteRating.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Review deleted successfully");
        setMyReview(null);
        setReviewForm({
          rating: 0,
          comment: "",
        });
        setIsReviewModalOpen(false);
        fetchReviews();
        fetchMyReview();
      } else {
        toast.error(data.message || "Failed to delete review");
      }
    } catch {
      toast.error("Failed to delete review");
    }
  };

  const handleBookNow = (room) => {
    if (!isLoggedIn) {
      toast.error("Please login first to book a room");
      navigate("/login", {
        state: { from: location.pathname },
      });
      return;
    }

    if (user?.role !== "user") {
      toast.error("Only customers can book rooms");
      return;
    }

    // toast.success(`Proceeding to book ${room.name}`);
  };

  useEffect(() => {
    fetchRooms();
    fetchReviews();
    fetchMyReview();
  }, [hotelId]);

  const colors = ["#ffd700", "#c4b5fd", "#86efac", "#f9a8d4", "#93c5fd"];

  if (loading) {
    return <div className={styles.stateText}>Loading rooms...</div>;
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Available Rooms</h1>

      {rooms.length === 0 ? (
        <div className={styles.stateText}>No rooms available.</div>
      ) : (
        <div className={styles.roomsList}>
          {rooms.map((room) => {
            const amenities = parseAmenities(room.amenities);

            return (
              <div key={room.room_id} className={styles.roomCard}>
                <img
                  src={getRoomImage(room.image_url)}
                  alt={room.name}
                  className={styles.roomImage}
                  onError={(e) => {
                    e.currentTarget.src = `${baseUrl}/uploads/rooms/placeholder.png`;
                  }}
                />

                <div className={styles.roomInfo}>
                  <div className={styles.roomTop}>
                    <div>
                      <h3 className={styles.roomName}>{room.name}</h3>
                      <p className={styles.roomType}>{room.type}</p>
                    </div>

                    <p className={styles.price}>Rs. {room.price} / night</p>
                  </div>

                  {room.description && (
                    <p className={styles.roomDescription}>{room.description}</p>
                  )}

                  <div className={styles.amenities}>
                    {amenities.map((a, i) => (
                      <span key={i} className={styles.chip}>
                        {a}
                      </span>
                    ))}
                  </div>

                  <div className={styles.roomBottom}>
                    <button
                      className={styles.bookBtn}
                      onClick={() => handleBookNow(room)}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.reviewSection}>
        <div className={styles.reviewTopBar}>
          <h2 className={styles.reviewTitle}>Guest Reviews</h2>

          <div className={styles.reviewActionGroup}>
            <button className={styles.openReviewBtn} onClick={openReviewModal}>
              {isLoggedIn
                ? myReview
                  ? "Edit Review"
                  : "Review Hotel"
                : "Review Hotel"}
            </button>

            {isLoggedIn && myReview && (
              <button className={styles.deleteReviewBtn} onClick={deleteReview}>
                Delete Review
              </button>
            )}
          </div>
        </div>

        {reviewsLoading ? (
          <p className={styles.reviewState}>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <div className={styles.emptyReviewBox}>
            <p>No reviews yet.</p>
          </div>
        ) : (
          <div className={styles.reviewList}>
            {reviews.map((r, i) => (
              <div key={i} className={styles.reviewItem}>
                <div className={styles.reviewLeft}>
                  <div
                    className={styles.userAvatar}
                    style={{
                      backgroundColor:
                        colors[Math.max(Math.ceil(Number(r.rating)) - 1, 0)] ||
                        "#e2e8f0",
                    }}
                  >
                    {r.full_name?.[0]?.toUpperCase() || "U"}
                  </div>

                  <div className={styles.reviewContent}>
                    <div className={styles.reviewHeader}>
                      <strong>{r.full_name}</strong>

                      <Rating
                        readonly
                        initialRating={Number(r.rating)}
                        fractions={2}
                        fullSymbol={<FaStar />}
                        emptySymbol={<FaRegStar />}
                        className={styles.stars}
                      />

                      <span className={styles.ratingText}>
                        {Number(r.rating).toFixed(1)}
                      </span>
                    </div>

                    <p className={styles.reviewMessage}>
                      {r.review_message || "No message added."}
                    </p>
                  </div>
                </div>

                <span className={styles.reviewDate}>
                  {new Date(r.created_at).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {isReviewModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsReviewModalOpen(false)}
        >
          <div
            className={styles.modalBox}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>{myReview ? "Edit Your Review" : "Review Hotel"}</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setIsReviewModalOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>

            <p className={styles.modalText}>
              {myReview
                ? "Update your rating and review for this hotel"
                : "Give your rating and review for this hotel"}
            </p>

            <div className={styles.selectedRating}>
              Selected Rating: {Number(reviewForm.rating || 0).toFixed(1)}
            </div>

            <Rating
              initialRating={reviewForm.rating}
              fractions={2}
              fullSymbol={<FaStar />}
              emptySymbol={<FaRegStar />}
              className={styles.modalStars}
              onChange={(value) =>
                setReviewForm({ ...reviewForm, rating: value })
              }
            />

            <textarea
              className={styles.reviewTextarea}
              placeholder="Enter your review"
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm({ ...reviewForm, comment: e.target.value })
              }
            />

            <button
              className={styles.submitReviewBtn}
              onClick={submitReview}
              type="button"
            >
              {myReview ? "Update Review" : "Submit Review"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelRooms;