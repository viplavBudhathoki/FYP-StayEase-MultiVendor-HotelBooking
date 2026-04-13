import { Edit2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { baseUrl } from "../../../constant";
import styles from "./HotelCard.module.css";

const HotelCard = ({ hotel, onEdit, onDeleteSuccess }) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Admin token missing");

    if (!window.confirm("Are you sure you want to delete this hotel?")) return;

    try {
      const form = new FormData();
      form.append("token", token);
      form.append("hotel_id", hotel.hotel_id);

      const res = await fetch(`${baseUrl}/hotels/deleteHotel.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Hotel deleted successfully");
        onDeleteSuccess?.();
      } else {
        toast.error(data.message || "Failed to delete hotel");
      }
    } catch (err) {
      toast.error("Something went wrong: " + err.message);
    }
  };

  const imageSrc = hotel.image_url
    ? `${baseUrl}/${hotel.image_url}`
    : `${baseUrl}/uploads/hotels/placeholder.png`;

  return (
    <div
      className={styles.hotelCard}
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/admin/hotels/${hotel.hotel_id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          navigate(`/admin/hotels/${hotel.hotel_id}`);
        }
      }}
    >
      <div className={styles.hotelImage}>
        <img
          src={imageSrc}
          alt={hotel.name}
          onError={(e) => {
            e.currentTarget.src = `${baseUrl}/uploads/hotels/placeholder.png`;
          }}
        />
      </div>

      <div className={styles.hotelInfo}>
        <div className={styles.hotelHeader}>
          <h3>{hotel.name}</h3>
        </div>

        <p className={styles.hotelLocation}>
          <strong>Location:</strong> {hotel.location || "Not added"}
        </p>

        <p className={styles.hotelVendor}>
          <strong>Vendor:</strong> {hotel.vendor_name || hotel.vendor || "Not assigned"}
        </p>

        <p className={styles.hotelDescription}>
          {hotel.description || "No description available for this hotel."}
        </p>

        <div className={styles.hotelActions}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(hotel);
            }}
            className={styles.editBtn}
            type="button"
          >
            <Edit2 size={16} /> Edit
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className={`${styles.editBtn} ${styles.textDanger}`}
            type="button"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;