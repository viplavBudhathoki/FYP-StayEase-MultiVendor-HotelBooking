import { Edit2, Trash2 } from "lucide-react";
import { baseUrl } from "../../../constant";
import styles from "./RoomCard.module.css";

const RoomCard = ({ room, onEdit, onDelete }) => {
  const parseAmenities = (value) => {
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {}
    return String(value)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const amenitiesArr = parseAmenities(room?.amenities);

  const imageSrc = room?.image_url
    ? `${baseUrl}/${room.image_url}`
    : `${baseUrl}/uploads/rooms/placeholder.png`;

  return (
    <div className={styles.roomCard}>
      <img
        src={imageSrc}
        alt={room?.name || "Room"}
        className={styles.roomImg}
        onError={(e) => {
          e.currentTarget.src = `${baseUrl}/uploads/rooms/placeholder.png`;
        }}
      />

      <div className={styles.roomInfo}>
        <div className={styles.roomHeaderRow}>
          <div>
            <p className={styles.hotelLine}>
              {room?.hotel_name} — {room?.hotel_location}
            </p>
            <h3 className={styles.roomTitle}>{room?.name}</h3>
          </div>

          <span
            className={`${styles.badge} ${
              styles[(room?.status || "").toLowerCase()]
            }`}
          >
            {room?.status}
          </span>
        </div>

        {amenitiesArr.length > 0 && (
          <div className={styles.chips}>
            {amenitiesArr.slice(0, 8).map((a, i) => (
              <span key={i} className={styles.chip}>
                {a}
              </span>
            ))}
          </div>
        )}

        <p className={styles.price}>Rs. {room?.price} / night</p>

        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${styles.editBtn}`}
            onClick={() => onEdit?.(room)}
            type="button"
          >
            <Edit2 size={15} />
            Edit
          </button>

          <button
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={() => onDelete?.(room.room_id)}
            type="button"
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;