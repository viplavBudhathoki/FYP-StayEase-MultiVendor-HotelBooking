import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { baseUrl } from "../../constant";
import styles from "./HotelRooms.module.css";

const HotelRooms = () => {
  const { hotelId } = useParams();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const getRoomImage = (img) => {
    if (!img) return `${baseUrl}/uploads/rooms/placeholder.png`;
    return `${baseUrl}/${img}`;
  };

  const parseAmenities = (value) => {
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {}

    return value.split(",").map((a) => a.trim());
  };

  const fetchRooms = async () => {
    setLoading(true);

    try {
      const form = new FormData();
      form.append("hotel_id", hotelId);

      const res = await fetch(`${baseUrl}/rooms/getPublicRoomsByHotel.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        setRooms(Array.isArray(data.data) ? data.data : []);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [hotelId]);

  if (loading) {
    return <div className={styles.stateText}>Loading rooms...</div>;
  }

  if (rooms.length === 0) {
    return <div className={styles.stateText}>No rooms available.</div>;
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Available Rooms</h1>

      <div className={styles.roomsGrid}>
        {rooms.map((room) => {
          const amenities = parseAmenities(room.amenities);

          return (
            <div key={room.room_id} className={styles.roomCard}>
              <img
                src={getRoomImage(room.image_url)}
                alt={room.name}
                className={styles.roomImage}
              />

              <div className={styles.roomInfo}>
                <h3 className={styles.roomName}>{room.name}</h3>
                <p className={styles.roomType}>{room.type}</p>

                <p className={styles.price}>
                  Rs. {room.price} / night
                </p>

                <div className={styles.amenities}>
                  {amenities.map((a, i) => (
                    <span key={i} className={styles.chip}>
                      {a}
                    </span>
                  ))}
                </div>

                <button className={styles.bookBtn}>
                  Book Now
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HotelRooms;