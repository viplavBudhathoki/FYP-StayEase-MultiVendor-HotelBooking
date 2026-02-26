import { Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { baseUrl } from "../../../constant";
import styles from "./HotelCard.module.css";

const HotelCard = ({ hotel, onEdit, onDeleteSuccess }) => {
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
        toast.success(data.message);
        if (onDeleteSuccess) onDeleteSuccess();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Something went wrong: " + err.message);
    }
  };

  const imageSrc = hotel.image_url
    ? `${baseUrl}/${hotel.image_url}`
    : `${baseUrl}/uploads/hotels/placeholder.png`;

  return (
    <div className={styles.hotelCard}>
      <div className={styles.hotelImage}>
        <img src={imageSrc} alt={hotel.name} />
      </div>

      <div className={styles.hotelInfo}>
        <div className={styles.hotelHeader}>
          <h3>{hotel.name}</h3>
        </div>

        <p className={styles.hotelLocation}>
          <strong>Location:</strong> {hotel.location}
        </p>

        <p className={styles.hotelVendor}>
          <strong>Vendor:</strong> {hotel.vendor_name || hotel.vendor}
        </p>

        {hotel.description && (
          <p className={styles.hotelDescription}>{hotel.description}</p>
        )}

        <div className={styles.hotelActions}>
          <button onClick={() => onEdit(hotel)} className={styles.editBtn}>
            <Edit2 size={16} /> Edit
          </button>
          <button onClick={handleDelete} className={`${styles.editBtn} ${styles.textDanger}`}>
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;