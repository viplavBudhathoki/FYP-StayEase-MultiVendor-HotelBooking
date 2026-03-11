import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CiLocationOn } from "react-icons/ci";
import { IoStar, IoBedOutline } from "react-icons/io5";
import { baseUrl } from "../../constant";
import styles from "./Hotels.module.css";

const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
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
      }
    } catch (err) {
      toast.error("Failed to load hotels");
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

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
          Browse premium stays, compare options, and explore rooms before booking.
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

      <div className={styles.hotelsGrid}>
        {hotels.map((hotel) => (
          <div
            key={hotel.hotel_id}
            className={styles.hotelCard}
            onClick={() => navigate(`/hotels/${hotel.hotel_id}/rooms`)}
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
                  <IoStar /> {Number(hotel.rating) > 0 ? Number(hotel.rating).toFixed(1) : "New"}
                </span>

                {hotel.rating >= 4.5 && (
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
                    Rs {hotel.starting_price > 0 ? hotel.starting_price : "--"}
                  </span>
                  <span className={styles.reviewCount}>
                    ({hotel.review_count || 0}{" "}
                    {Number(hotel.review_count || 0) === 1 ? "review" : "reviews"})
                  </span>
                </div>

                <button className={styles.viewBtn}>Explore →</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hotels;