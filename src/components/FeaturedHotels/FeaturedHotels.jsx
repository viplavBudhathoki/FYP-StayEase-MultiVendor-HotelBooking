import { useEffect, useState } from "react";
import { CiLocationOn } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { baseUrl } from "../../constant";
import styles from "./FeaturedHotels.module.css";

const FeaturedHotels = () => {
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
        setHotels(Array.isArray(data.data) ? data.data.slice(0, 6) : []);
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

  return (
    <section className={styles.featured} id="hotels">
      <div className={styles.container}>
        <div className={styles.featuredHeader}>
          <h2 className={styles.sectionTitle}>Featured Destinations</h2>
          <p className={styles.sectionSubtitle}>
            Hand-picked properties for your comfort and style
          </p>
        </div>

        {loading ? (
          <p style={{ textAlign: "center" }}>Loading hotels...</p>
        ) : hotels.length === 0 ? (
          <p style={{ textAlign: "center" }}>No hotels available right now.</p>
        ) : (
          <div className={styles.hotelsGrid}>
            {hotels.map((hotel) => (
              <div
                key={hotel.hotel_id}
                className={styles.hotelCard}
                onClick={() => navigate(`/hotels/${hotel.hotel_id}/rooms`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    navigate(`/hotels/${hotel.hotel_id}/rooms`);
                  }
                }}
              >
                <div className={styles.hotelImageContainer}>
                  <img
                    src={getHotelImage(hotel.image_url)}
                    alt={hotel.name}
                    className={styles.hotelImage}
                    onError={(e) => {
                      e.currentTarget.src = `${baseUrl}/uploads/hotels/placeholder.png`;
                    }}
                  />
                  <div className={styles.hotelPriceBadge}>
                    View Rooms
                  </div>
                </div>

                <div className={styles.hotelInfo}>
                  <div className={styles.hotelLocation}>
                    <CiLocationOn /> {hotel.location}
                  </div>

                  <h3 className={styles.hotelName}>{hotel.name}</h3>

                  <div className={styles.hotelFooter}>
                    <div className={styles.hotelRating}>★ 4.5</div>
                    <button
                      className={styles.btnBook}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/hotels/${hotel.hotel_id}/rooms`);
                      }}
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedHotels;