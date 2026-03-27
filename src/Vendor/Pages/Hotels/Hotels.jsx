import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { baseUrl } from "../../../constant";
import styles from "./Hotels.module.css";

const VendorHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getHotelImage = (img) => {
    if (!img) return `${baseUrl}/uploads/hotels/placeholder.png`;
    return `${baseUrl}/${img}`;
  };

  const goToHotelDetails = (hotelId) => {
    navigate(`/vendor/hotels/${hotelId}`);
  };

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vendor token missing");

      const form = new FormData();
      form.append("token", token);

      const res = await fetch(`${baseUrl}/hotels/getVendorHotels.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        setHotels(Array.isArray(data.data) ? data.data : []);
      } else {
        toast.error(data.message || "Failed to load hotels");
        setHotels([]);
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
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
    return <div className={styles.stateText}>No hotels assigned to us yet.</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>My Hotels</h1>
        <p className={styles.subtitle}>
          View and manage the hotels assigned to us.
        </p>
      </div>

      <div className={styles.hotelList}>
        {hotels.map((h) => (
          <div
            key={h.hotel_id}
            className={styles.hotelCard}
            role="button"
            tabIndex={0}
            onClick={() => goToHotelDetails(h.hotel_id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                goToHotelDetails(h.hotel_id);
              }
            }}
          >
            <div className={styles.hotelImageWrap}>
              <img
                src={getHotelImage(h.image_url)}
                alt={h.name}
                className={styles.hotelImage}
                onError={(e) => {
                  e.currentTarget.src = `${baseUrl}/uploads/hotels/placeholder.png`;
                }}
              />
            </div>

            <div className={styles.hotelInfo}>
              <h2 className={styles.hotelName}>{h.name || "Untitled Hotel"}</h2>

              <p className={styles.hotelLocation}>
                {h.location || "Location not available"}
              </p>

              <p className={styles.hotelDescription}>
                {h.description || "No description available."}
              </p>

              <button
                className={styles.manageBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  goToHotelDetails(h.hotel_id);
                }}
              >
                View Details →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorHotels;