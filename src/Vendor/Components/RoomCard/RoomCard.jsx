// React hook for local UI state
import { useState } from 'react';

// Icons used for actions
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';

// Toast notifications for user feedback
import toast from 'react-hot-toast';

// Scoped styles for the room card
import styles from './RoomCard.module.css';

// Card component for displaying individual room details
const RoomCard = ({ room, onEdit, onStatusChange }) => {

  // State to control the action menu visibility
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Update room status (Available / Occupied / Maintenance)
  const handleStatusUpdate = async (newStatus) => {
    const formData = new FormData();
    formData.append('id', room.id);
    formData.append('status', newStatus);

    const result = await api.updateStatus(formData);

    // Show success message and refresh parent data
    if (result.success) {
      toast.success(`Status updated to ${newStatus}`);
      onStatusChange();
    }
  };

  // Returns the correct badge style based on room status
  const getBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'available':
        return styles.badgeAvailable;
      case 'occupied':
        return styles.badgeOccupied;
      case 'maintenance':
        return styles.badgeMaintenance;
      default:
        return '';
    }
  };

  return (
    // Main room card container
    <div className={`${styles.roomCard} card`}>

      {/* Room image and status badge */}
      <div className={styles.roomImage}>
        <img src={room.photo} alt={room.name} />
        <span className={`${styles.badge} ${getBadgeClass(room.status)}`}>
          {room.status}
        </span>
      </div>

      {/* Room details */}
      <div className={styles.roomInfo}>

        {/* Header with room name and actions */}
        <div className={styles.roomHeader}>
          <h3>{room.name}</h3>

          {/* Action menu button */}
          <div className={styles.roomActions}>
            <button
              className={styles.iconBtnSm}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <MoreVertical size={16} />
            </button>

            {/* Dropdown action menu */}
            {isMenuOpen && (
              <div className={`${styles.roomMenu} glass`}>
                <button
                  onClick={() => {
                    onEdit(room);
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

        {/* Room type and vendor info */}
        <p className={styles.roomType}>
          {room.type} • {room.vendor}
        </p>

        {/* Footer with price and quick status switch */}
        <div className={styles.roomFooter}>
          <span className={styles.roomPrice}>
            ${room.price}
            <span> / night</span>
          </span>

          {/* Status dropdown for quick updates */}
          <div className={styles.statusQuickSwitch}>
            <select
              value={room.status}
              onChange={(e) => handleStatusUpdate(e.target.value)}
              className={styles.statusSelect}
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export RoomCard component
export default RoomCard;
