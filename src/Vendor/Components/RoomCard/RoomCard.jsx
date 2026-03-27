import { Edit2, Trash2, Eye } from "lucide-react";
import { baseUrl } from "../../../constant";
import styles from "./RoomCard.module.css";

const RoomCard = ({ room, onEdit, onDelete, onViewDetails }) => {
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

  const handleViewDetails = () => {
    onViewDetails?.(room?.room_id);
  };

  return (
    <div className={styles.roomCard}>
      <img
        src={imageSrc}
        alt={room?.name || "Room"}
        className={styles.roomImg}
        onClick={handleViewDetails}
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

            <h3
              className={styles.roomTitle}
              onClick={handleViewDetails}
            >
              {room?.name}
            </h3>
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
            className={`${styles.actionBtn} ${styles.viewBtn}`}
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
            type="button"
          >
            <Eye size={15} />
            View Details
          </button>

          <button
            className={`${styles.actionBtn} ${styles.editBtn}`}
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(room);
            }}
            type="button"
          >
            <Edit2 size={15} />
            Edit
          </button>

          <button
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(room.room_id);
            }}
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