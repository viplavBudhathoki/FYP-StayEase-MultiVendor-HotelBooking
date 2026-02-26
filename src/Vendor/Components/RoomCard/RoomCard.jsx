import { useState } from "react";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import styles from "./RoomCard.module.css";

const RoomCard = ({ room, onEdit, onStatusChange, onUpdateStatus }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleStatusUpdate = async (newStatus) => {
    // newStatus is lowercase now
    const ok = await onUpdateStatus(room.room_id, newStatus);
    if (ok) {
      toast.success(`Status updated to ${newStatus}`);
      onStatusChange?.();
    }
  };

  const getBadgeClass = (status) => {
    switch ((status || "").toLowerCase()) {
      case "available":
        return styles.badgeAvailable;
      case "occupied":
        return styles.badgeOccupied;
      case "maintenance":
        return styles.badgeMaintenance;
      default:
        return "";
    }
  };

  return (
    <div className={`${styles.roomCard} card`}>
      <div className={styles.roomImage}>
        <img src={room.image_url} alt={room.name} />
        <span className={`${styles.badge} ${getBadgeClass(room.status)}`}>
          {room.status}
        </span>
      </div>

      <div className={styles.roomInfo}>
        <div className={styles.roomHeader}>
          <h3>{room.name}</h3>

          <div className={styles.roomActions}>
            <button
              className={styles.iconBtnSm}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <MoreVertical size={16} />
            </button>

            {isMenuOpen && (
              <div className={`${styles.roomMenu} glass`}>
                <button
                  onClick={() => {
                    onEdit?.(room);
                    setIsMenuOpen(false);
                  }}
                >
                  <Edit2 size={14} /> Edit Room
                </button>

                <button className={styles.textDanger}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <p className={styles.roomType}>
          {room.type} • Vendor #{room.vendor_id}
        </p>

        <div className={styles.roomFooter}>
          <span className={styles.roomPrice}>
            Rs. {room.price} <span>/ night</span>
          </span>

          <div className={styles.statusQuickSwitch}>
            <select
              value={room.status}
              onChange={(e) => handleStatusUpdate(e.target.value)}
              className={styles.statusSelect}
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;