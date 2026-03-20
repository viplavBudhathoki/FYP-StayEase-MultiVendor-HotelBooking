import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CiLocationOn } from "react-icons/ci";
import { IoStar } from "react-icons/io5";
import { baseUrl } from "../../constant";
import styles from "./Hotels.module.css";

const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("rating-high-to-low");
  const navigate = useNavigate();

  const getHotelImage = (img) => {
    if (!img) return `${baseUrl}/uploads/hotels/placeholder.png`;
    return `${baseUrl}/${img}`;
  };

  const fetchHotels = async () => {
    setLoading(true);

    try {
      const res = await fetch(`${baseUrl}/hotels/getPublicHotels.php`);
      const data = await res.json();

      if (data.success) {
        setHotels(Array.isArray(data.data) ? data.data : []);
      } else {
        toast.error(data.message || "Failed to load hotels");
        setHotels([]);
      }
    } catch {
      toast.error("Failed to load hotels");
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const sortedHotels = useMemo(() => {
    const copied = [...hotels];

    if (sortBy === "rating-high-to-low") {
      copied.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (sortBy === "rating-low-to-high") {
      copied.sort((a, b) => Number(a.rating || 0) - Number(b.rating || 0));
    } else if (sortBy === "price-low-to-high") {
      copied.sort(
        (a, b) => Number(a.starting_price || 0) - Number(b.starting_price || 0)
      );
    } else if (sortBy === "price-high-to-low") {
      copied.sort(
        (a, b) => Number(b.starting_price || 0) - Number(a.starting_price || 0)
      );
    }

    return copied;
  }, [hotels, sortBy]);

  if (loading) {
    return <div className={styles.stateText}>Loading hotels...</div>;
  }

  if (hotels.length === 0) {
    return <div className={styles.stateText}>No hotels available right now.</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.heroSection}>
        <p className={styles.smallTag}>Discover stays across Nepal</p>
        <h1 className={styles.title}>Find the perfect hotel for your next stay</h1>
        <p className={styles.subtitle}>
          Browse premium stays, compare options, and explore hotel details before booking.
        </p>

        <div className={styles.topStats}>
          <div className={styles.statBox}>
            <span className={styles.statNumber}>{hotels.length}</span>
            <span className={styles.statLabel}>Hotels available</span>
          </div>

          <div className={styles.statBox}>
            <span className={styles.statNumber}>24/7</span>
            <span className={styles.statLabel}>Guest support</span>
          </div>

          <div className={styles.statBox}>
            <span className={styles.statNumber}>Best</span>
            <span className={styles.statLabel}>Comfort picks</span>
          </div>
        </div>
      </div>

      <div className={styles.sortRow}>
        <div className={styles.sortBox}>
          <label htmlFor="hotel-sort" className={styles.sortLabel}>
            Sort Hotels
          </label>

          <select
            id="hotel-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="rating-high-to-low">Rating: High to Low</option>
            <option value="rating-low-to-high">Rating: Low to High</option>
            <option value="price-low-to-high">Price: Low to High</option>
            <option value="price-high-to-low">Price: High to Low</option>
            <option value="default">Recommended</option>
          </select>
        </div>
      </div>

      <div className={styles.hotelsGrid}>
        {sortedHotels.map((hotel) => (
          <div
            key={hotel.hotel_id}
            className={styles.hotelCard}
            onClick={() => navigate(`/hotels/${hotel.hotel_id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(`/hotels/${hotel.hotel_id}`);
              }
            }}
          >
            <div className={styles.imageWrap}>
              <img
                src={getHotelImage(hotel.image_url)}
                alt={hotel.name}
                className={styles.hotelImage}
                onError={(e) => {
                  e.currentTarget.src = `${baseUrl}/uploads/hotels/placeholder.png`;
                }}
              />

              <div className={styles.imageOverlay}>
                <span className={styles.badge}>
                  <IoStar />
                  {Number(hotel.rating) > 0 ? Number(hotel.rating).toFixed(1) : "New"}
                </span>

                {Number(hotel.rating) >= 4.5 && (
                  <span className={styles.popularTag}>Popular choice</span>
                )}
              </div>
            </div>

            <div className={styles.hotelInfo}>
              <div className={styles.location}>
                <CiLocationOn /> {hotel.location}
              </div>

              <h3 className={styles.hotelName}>{hotel.name}</h3>

              <p className={styles.hotelDescription}>
                {hotel.description || "A comfortable and welcoming stay for your trip."}
              </p>

              <div className={styles.cardFooter}>
                <div className={styles.priceBlock}>
                  <span className={styles.priceLabel}>Starting from</span>
                  <span className={styles.priceText}>
                    Rs{" "}
                    {Number(hotel.starting_price) > 0
                      ? Number(hotel.starting_price)
                      : "--"}
                  </span>
                  <span className={styles.reviewCount}>
                    ({hotel.review_count || 0}{" "}
                    {Number(hotel.review_count || 0) === 1 ? "review" : "reviews"})
                  </span>
                </div>

                <button
                  className={styles.viewBtn}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/hotels/${hotel.hotel_id}`);
                  }}
                >
                  Explore →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hotels;