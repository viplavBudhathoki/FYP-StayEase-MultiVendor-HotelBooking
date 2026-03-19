import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { baseUrl } from "../../../constant";
import RoomModal from "../../Components/RoomModal/RoomModal";
import styles from "./HotelRooms.module.css";

const HotelRooms = () => {
  const { hotelId } = useParams();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  const getRoomImage = (img) => {
    if (!img) return `${baseUrl}/uploads/rooms/placeholder.png`;
    return `${baseUrl}/${img}`;
  };

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

  const fetchHotelInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      const form = new FormData();
      form.append("token", token || "");
      form.append("hotel_id", hotelId);

      const res = await fetch(`${baseUrl}/hotels/getVendorHotelById.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (data.success) setHotel(data.data);
      else setHotel(null);
    } catch {
      setHotel(null);
    }
  };

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

      const data = await res.json();
      if (data.success) setRooms(Array.isArray(data.data) ? data.data : []);
      else toast.error(data.message || "Failed to load rooms");
    } catch (err) {
      toast.error(err.message);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (room_id) => {
    if (!confirm("Delete this room?")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vendor token missing");

      const form = new FormData();
      form.append("token", token);
      form.append("room_id", room_id);

      const res = await fetch(`${baseUrl}/rooms/deleteRoom.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Deleted");
        fetchRooms();
      } else {
        toast.error(data.message || "Failed to delete");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchHotelInfo();
    fetchRooms();
  }, [hotelId]);

  const headerText = useMemo(() => {
    if (hotel) return `${hotel.name} — ${hotel.location}`;
    return `Hotel ID: ${hotelId}`;
  }, [hotel, hotelId]);

  if (loading) return <div className={styles.stateText}>Loading rooms...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Rooms</h1>
          <p className={styles.subtitle}>{headerText}</p>
        </div>

        <button
          className={styles.addBtn}
          onClick={() => {
            setEditingRoom(null);
            setOpenModal(true);
          }}
        >
          + Add Room
        </button>
      </div>

      {rooms.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No rooms added yet.</p>
        </div>
      ) : (
        <div className={styles.roomList}>
          {rooms.map((r) => {
            const amenitiesArr = parseAmenities(r.amenities);

            return (
              <div key={r.room_id} className={styles.roomRow}>
                <img
                  src={getRoomImage(r.image_url)}
                  alt={r.name}
                  className={styles.roomImage}
                  onError={(e) => {
                    e.currentTarget.src = `${baseUrl}/uploads/rooms/placeholder.png`;
                  }}
                />

                <div className={styles.roomContent}>
                  <div className={styles.roomTop}>
                    <div>
                      <p className={styles.roomType}>{r.type}</p>
                      <h2 className={styles.roomName}>{r.name}</h2>
                    </div>

                    <span className={`${styles.status} ${styles[r.status]}`}>
                      {r.status}
                    </span>
                  </div>

                  {r.description ? (
                    <p className={styles.roomDesc}>{r.description}</p>
                  ) : null}

                  {amenitiesArr.length > 0 && (
                    <div className={styles.amenitiesWrap}>
                      {amenitiesArr.map((a, idx) => (
                        <span key={idx} className={styles.amenityChip}>
                          {a}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className={styles.roomPrice}>Rs. {r.price} / night</p>

                  <div className={styles.roomActions}>
                    <button
                      className={styles.editBtn}
                      onClick={() => {
                        setEditingRoom(r);
                        setOpenModal(true);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className={styles.deleteBtn}
                      onClick={() => deleteRoom(r.room_id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {openModal && (
        <RoomModal
          hotelId={hotelId} // fixed hotel from route
          room={editingRoom}
          onClose={() => {
            setOpenModal(false);
            setEditingRoom(null);
          }}
          onSuccess={fetchRooms}
        />
      )}
    </div>
  );
};

export default HotelRooms;
