import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, UserRound, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import { baseUrl } from "../../../constant";
import styles from "./AdminHotelDetails.module.css";

const AdminHotelDetails = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHotelDetails = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Admin token missing");

      const form = new FormData();
      form.append("token", token);
      form.append("hotel_id", hotelId);

      const res = await fetch(`${baseUrl}/hotels/getSingleHotel.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        setHotel(data.data);
      } else {
        toast.error(data.message || "Failed to load hotel details");
        setHotel(null);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load hotel details");
      setHotel(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotelDetails();
  }, [hotelId]);

  if (loading) {
    return <div className={styles.stateText}>Loading hotel details...</div>;
  }

  if (!hotel) {
    return (
      <div className={styles.page}>
        <button
          className={styles.backBtn}
          onClick={() => navigate("/admin/hotels")}
          type="button"
        >
          <ArrowLeft size={18} />
          Back to Hotels
        </button>

        <div className={styles.emptyState}>
          <h2>Hotel not found</h2>
          <p>We could not find the requested hotel details.</p>
        </div>
      </div>
    );
  }

  const imageSrc = hotel.image_url
    ? `${baseUrl}/${hotel.image_url}`
    : `${baseUrl}/uploads/hotels/placeholder.png`;

  return (
    <div className={styles.page}>
      <button
        className={styles.backBtn}
        onClick={() => navigate("/admin/hotels")}
        type="button"
      >
        <ArrowLeft size={18} />
        Back to Hotels
      </button>

      <div className={styles.detailsCard}>
        <div className={styles.imageSection}>
          <img
            src={imageSrc}
            alt={hotel.name}
            className={styles.hotelImage}
            onError={(e) => {
              e.currentTarget.src = `${baseUrl}/uploads/hotels/placeholder.png`;
            }}
          />
        </div>

        <div className={styles.contentSection}>
          <div className={styles.topBlock}>
            <div className={styles.badge}>Hotel Details</div>
            <h1 className={styles.hotelName}>{hotel.name}</h1>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>
                <MapPin size={16} />
                Location
              </span>
              <span className={styles.infoValue}>
                {hotel.location || "Not added"}
              </span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>
                <UserRound size={16} />
                Vendor
              </span>
              <span className={styles.infoValue}>
                {hotel.vendor_name || "Not assigned"}
              </span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>
                <Building2 size={16} />
                Hotel ID
              </span>
              <span className={styles.infoValue}>{hotel.hotel_id}</span>
            </div>
          </div>

          <div className={styles.descriptionBox}>
            <h3>Description</h3>
            <p>{hotel.description || "No description available for this hotel."}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHotelDetails;