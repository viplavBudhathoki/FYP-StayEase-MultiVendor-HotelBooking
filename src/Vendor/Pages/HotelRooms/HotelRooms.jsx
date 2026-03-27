import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { baseUrl } from "../../../constant";
import RoomModal from "../../Components/RoomModal/RoomModal";
import styles from "./HotelRooms.module.css";

const HotelRooms = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  const [selectedImages, setSelectedImages] = useState({});

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

  const buildRoomGallery = (room) => {
    const gallery = Array.isArray(room.gallery) ? [...room.gallery] : [];

    const hasMain = gallery.some((img) => img.image_url === room.image_url);

    if (!hasMain && room.image_url) {
      gallery.unshift({
        image_id: 0,
        image_url: room.image_url,
      });
    }

    if (gallery.length === 0) {
      gallery.push({
        image_id: 0,
        image_url: "uploads/rooms/placeholder.png",
      });
    }

    return gallery;
  };

  const goToRoomDetails = (roomId) => {
    navigate(`/vendor/rooms/${roomId}`);
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
      if (data.success) {
        setHotel(data.data);
      } else {
        setHotel(null);
      }
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

      if (data.success) {
        const roomData = Array.isArray(data.data) ? data.data : [];
        setRooms(roomData);

        const nextSelectedImages = {};
        roomData.forEach((room) => {
          const gallery = buildRoomGallery(room);
          nextSelectedImages[room.room_id] = gallery[0]?.image_url || "";
        });
        setSelectedImages(nextSelectedImages);
      } else {
        toast.error(data.message || "Failed to load rooms");
        setRooms([]);
      }
    } catch (err) {
      toast.error(err.message);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (room_id) => {
    if (!window.confirm("Delete this room?")) return;

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

  if (loading) {
    return <div className={styles.stateText}>Loading rooms...</div>;
  }

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
            const gallery = buildRoomGallery(r);
            const selectedImage =
              selectedImages[r.room_id] ||
              gallery[0]?.image_url ||
              "uploads/rooms/placeholder.png";

            return (
              <div key={r.room_id} className={styles.roomRow}>
                <div className={styles.roomGallerySection}>
                  <img
                    src={getRoomImage(selectedImage)}
                    alt={r.name}
                    className={styles.roomImage}
                    onClick={() => goToRoomDetails(r.room_id)}
                    onError={(e) => {
                      e.currentTarget.src = `${baseUrl}/uploads/rooms/placeholder.png`;
                    }}
                  />

                  {gallery.length > 1 && (
                    <div className={styles.thumbnailRow}>
                      {gallery.map((img, index) => (
                        <button
                          key={img.image_id || index}
                          type="button"
                          className={`${styles.thumbBtn} ${
                            selectedImage === img.image_url ? styles.activeThumb : ""
                          }`}
                          onClick={() =>
                            setSelectedImages((prev) => ({
                              ...prev,
                              [r.room_id]: img.image_url,
                            }))
                          }
                        >
                          <img
                            src={getRoomImage(img.image_url)}
                            alt={`${r.name} ${index + 1}`}
                            className={styles.thumbImg}
                            onError={(e) => {
                              e.currentTarget.src = `${baseUrl}/uploads/rooms/placeholder.png`;
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.roomContent}>
                  <div className={styles.roomTop}>
                    <div>
                      <p className={styles.roomType}>{r.type}</p>
                      <h2
                        className={styles.roomName}
                        onClick={() => goToRoomDetails(r.room_id)}
                      >
                        {r.name}
                      </h2>
                    </div>

                    <span className={`${styles.status} ${styles[r.status] || ""}`}>
                      {r.status}
                    </span>
                  </div>

                  {r.description ? (
                    <p className={styles.roomDesc}>{r.description}</p>
                  ) : null}

                  <div className={styles.roomMeta}>
                    <span className={styles.metaItem}>Capacity: {r.capacity}</span>
                    <span className={styles.metaItem}>Gallery: {gallery.length}</span>
                  </div>

                  {amenitiesArr.length > 0 && (
                    <div className={styles.amenitiesWrap}>
                      {amenitiesArr.map((a, idx) => (
                        <span key={idx} className={styles.amenityChip}>
                          {a}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className={styles.roomPrice}>
                    Rs. {Number(r.price).toLocaleString()} / night
                  </p>

                  <div className={styles.roomActions}>
                    <button
                      className={styles.editBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingRoom(r);
                        setOpenModal(true);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className={styles.deleteBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRoom(r.room_id);
                      }}
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
          hotelId={hotelId}
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