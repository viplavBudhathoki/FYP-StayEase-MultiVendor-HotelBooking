import { useState } from "react";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { baseUrl } from "../../../constant";

import styles from "./HotelCard.module.css";

const HotelCard = ({ hotel, onEdit, onDeleteSuccess }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  return (
    <div className={`${styles.hotelCard} card`}>
    <div className={styles.hotelImage}>
    <img
        src={hotel.image_url ? `${baseUrl}/${hotel.image_url}` : "/placeholder.png"}
        alt={hotel.name}
    />
    </div>


      <div className={styles.hotelInfo}>
        <div className={styles.hotelHeader}>
          <h3>{hotel.name}</h3>

          <div className={styles.hotelActions}>
            <button
              className={styles.iconBtnSm}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <MoreVertical size={16} />
            </button>

            {isMenuOpen && (
              <div className={`${styles.hotelMenu} glass`}>
                <button
                  onClick={() => {
                    onEdit(hotel);
                    setIsMenuOpen(false);
                  }}
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button onClick={handleDelete} className={styles.textDanger}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <p className={styles.hotelLocation}><strong>Location:</strong> {hotel.location}</p>
        <p className={styles.hotelVendor}><strong>Vendor:</strong> {hotel.vendor_name || hotel.vendor}</p>
        {hotel.description && (
          <p className={styles.hotelDescription}>{hotel.description}</p>
        )}
      </div>
    </div>
  );
};

export default HotelCard;
