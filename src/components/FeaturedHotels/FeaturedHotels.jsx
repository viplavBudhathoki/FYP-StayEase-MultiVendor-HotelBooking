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
        setHotels([]);
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
          <h2 className={styles.sectionTitle}>Featured Hotels</h2>
          <p className={styles.sectionSubtitle}>
            Hand-picked properties for our comfort and style
          </p>
        </div>

        {loading ? (
          <p className={styles.stateText}>Loading hotels...</p>
        ) : hotels.length === 0 ? (
          <p className={styles.stateText}>No hotels available right now.</p>
        ) : (
          <div className={styles.hotelsGrid}>
            {hotels.map((hotel) => {
              const rating = Number(hotel.rating || 0);
              const reviewCount = Number(hotel.review_count || 0);
              const startingPrice = Number(hotel.starting_price || 0);

              return (
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
                      Rs {startingPrice > 0 ? startingPrice.toFixed(0) : "--"}
                    </div>
                  </div>

                  <div className={styles.hotelInfo}>
                    <div className={styles.hotelLocation}>
                      <CiLocationOn /> {hotel.location}
                    </div>

                    <h3 className={styles.hotelName}>{hotel.name}</h3>

                    <p className={styles.hotelDescription}>
                      {hotel.description ||
                        "A comfortable and welcoming stay for our trip."}
                    </p>

                    <div className={styles.hotelFooter}>
                      <div className={styles.hotelRating}>
                        <span className={styles.star}>★</span>
                        {rating > 0 ? rating.toFixed(1) : "New"}{" "}
                        <span className={styles.reviewText}>
                          ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                        </span>
                      </div>

                      <button
                        className={styles.btnBook}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/hotels/${hotel.hotel_id}`);
                        }}
                        type="button"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedHotels;