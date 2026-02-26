import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { baseUrl } from "../../../constant";
import styles from "./Hotels.module.css";

const VendorHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // image_url is saved as: uploads/hotels/xxx.jpg
  const getHotelImage = (img) => {
    if (!img) return `${baseUrl}/uploads/hotels/placeholder.png`;
    return `${baseUrl}/${img}`;
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

      const text = await res.text();
      const data = JSON.parse(text);

      if (data.success) {
        setHotels(Array.isArray(data.data) ? data.data : []);
      } else {
        toast.error(data.message || "Failed to load hotels");
      }
    } catch (err) {
      toast.error(err.message);
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
      <h1 className={styles.title}>My Hotels</h1>

      <div className={styles.hotelList}>
        {hotels.map((h) => (
          <div key={h.hotel_id} className={styles.hotelCard}>
            {/* IMAGE */}
            <img
              src={getHotelImage(h.image_url)}
              alt={h.name}
              className={styles.hotelImage}
              onError={(e) => {
                e.currentTarget.src = `${baseUrl}/uploads/hotels/placeholder.png`;
              }}
            />

            {/* CONTENT */}
            <div className={styles.hotelInfo}>
              <h2 className={styles.hotelName}>{h.name}</h2>
              <p className={styles.hotelLocation}>{h.location}</p>
              <p className={styles.hotelDescription}>{h.description}</p>

              <button
                className={styles.manageBtn}
                onClick={() =>
                  navigate(`/vendor/hotels/${h.hotel_id}/rooms`)
                }
              >
                Manage Rooms →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorHotels;