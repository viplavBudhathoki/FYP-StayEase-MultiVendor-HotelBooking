import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { baseUrl } from "../../../constant";
import RoomModal from "../../Components/RoomModal/RoomModal";
import styles from "./HotelRooms.module.css";

const HotelRooms = () => {
  const { hotelId } = useParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vendor token missing");

      const form = new FormData();
      form.append("token", token);
      form.append("hotel_id", hotelId);

      const res = await fetch(`${baseUrl}/rooms/getRoomsByHotel.php`, {
        method: "POST",
        body: form,
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("API returned HTML, not JSON.");
      }

      if (data.success) setRooms(Array.isArray(data.data) ? data.data : []);
      else toast.error(data.message || "Failed to load rooms");
    } catch (err) {
      toast.error(err.message);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [hotelId]);

  if (loading) return <div className={styles.stateText}>Loading rooms...</div>;
  if (rooms.length === 0)
    return <div className={styles.stateText}>No rooms added yet.</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Rooms</h1>
          <p className={styles.subtitle}>Hotel ID: {hotelId}</p>
        </div>

        <button className={styles.addBtn} onClick={() => setOpenModal(true)}>
          + Add Room
        </button>
      </div>

      <div className={styles.roomGrid}>
        {rooms.map((r) => (
          <div key={r.room_id} className={styles.roomCard}>
            <div className={styles.roomName}>{r.name}</div>
            <div className={styles.roomMeta}>
              {r.type} • Rs. {r.price}
            </div>

            <span
              className={`${styles.status} ${styles[r.status]}`}
            >
              {r.status}
            </span>
          </div>
        ))}
      </div>

      {openModal && (
        <RoomModal
          hotelId={hotelId}
          onClose={() => setOpenModal(false)}
          onSuccess={fetchRooms}
        />
      )}
    </div>
  );
};

export default HotelRooms;