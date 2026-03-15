import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Rating from "react-rating";
import { FaRegStar, FaStar } from "react-icons/fa";
import { CiLocationOn } from "react-icons/ci";
import { baseUrl } from "../../constant";
import styles from "./HotelDetails.module.css";

const HotelDetails = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingHotel, setLoadingHotel] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const getHotelImage = (img) => {
    if (!img) return `${baseUrl}/uploads/hotels/placeholder.png`;
    return `${baseUrl}/${img}`;
  };

  const fetchHotelDetails = async () => {
    setLoadingHotel(true);

    try {
      const form = new FormData();
      form.append("hotel_id", hotelId);

      const res = await fetch(`${baseUrl}/hotels/getPublicHotelDetails.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        setHotel(data.data || null);
      } else {
        toast.error(data.message || "Failed to load hotel details");
        setHotel(null);
      }
    } catch {
      toast.error("Failed to load hotel details");
      setHotel(null);
    } finally {
      setLoadingHotel(false);
    }
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);

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
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchHotelDetails();
    fetchReviews();
  }, [hotelId]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const total = reviews.reduce(
      (sum, item) => sum + Number(item.rating || 0),
      0
    );
    return total / reviews.length;
  }, [reviews]);

  const colors = ["#ffd700", "#c4b5fd", "#86efac", "#f9a8d4", "#93c5fd"];

  if (loadingHotel) {
    return <div className={styles.stateText}>Loading hotel details...</div>;
  }

  if (!hotel) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <h2>Hotel not found</h2>
          <p>We could not find the requested hotel.</p>

          <button
            className={styles.primaryBtn}
            type="button"
            onClick={() => navigate("/hotels")}
          >
            Back to Hotels
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.heroCard}>
        <div className={styles.imageSection}>
          <img
            src={getHotelImage(hotel.image_url)}
            alt={hotel.name}
            className={styles.hotelImage}
            onError={(e) => {
              e.currentTarget.src = `${baseUrl}/uploads/hotels/placeholder.png`;
            }}
          />
        </div>

        <div className={styles.contentSection}>
          <span className={styles.badge}>Hotel Details</span>

          <h1 className={styles.hotelName}>{hotel.name}</h1>

          <div className={styles.locationRow}>
            <CiLocationOn />
            <span>{hotel.location}</span>
          </div>

          <p className={styles.description}>
            {hotel.description ||
              "A comfortable and welcoming stay for our trip."}
          </p>

          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Starting Price</span>
              <strong className={styles.statValue}>
                Rs{" "}
                {Number(hotel.starting_price || 0) > 0
                  ? Number(hotel.starting_price).toFixed(0)
                  : "--"}
              </strong>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Average Rating</span>
              <strong className={styles.statValue}>
                {averageRating > 0 ? averageRating.toFixed(1) : "New"}
              </strong>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Reviews</span>
              <strong className={styles.statValue}>{reviews.length}</strong>
            </div>
          </div>

          <div className={styles.actionRow}>
            <button
              className={styles.primaryBtn}
              type="button"
              onClick={() => navigate(`/hotels/${hotel.hotel_id}/rooms`)}
            >
              View Rooms
            </button>

            <button
              className={styles.secondaryBtn}
              type="button"
              onClick={() => navigate("/hotels")}
            >
              Back to Hotels
            </button>
          </div>
        </div>
      </div>

      <div className={styles.reviewSection}>
        <div className={styles.reviewTopBar}>
          <h2 className={styles.reviewTitle}>Guest Reviews</h2>
        </div>

        {loadingReviews ? (
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
    </div>
  );
};

export default HotelDetails;