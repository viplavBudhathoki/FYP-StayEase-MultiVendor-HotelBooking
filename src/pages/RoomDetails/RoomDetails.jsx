import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { baseUrl } from "../../constant";
import styles from "./RoomDetails.module.css";

const RoomDetails = () => {
  const { hotelId, roomId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [room, setRoom] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);

  const stayInfo = {
    check_in: searchParams.get("check_in") || "",
    check_out: searchParams.get("check_out") || "",
    adults: Number(searchParams.get("adults") || 2),
    children: Number(searchParams.get("children") || 0),
    rooms: Number(searchParams.get("rooms") || 1),
  };

  const getImage = (img) => {
    if (!img) return `${baseUrl}/uploads/rooms/placeholder.png`;
    return `${baseUrl}/${img}`;
  };

  const parseAmenities = (val) => {
    if (!val) return [];
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return String(val).split(",").map((s) => s.trim()).filter(Boolean);
  };

  const fetchRoom = async () => {
    setLoading(true);

    try {
      const form = new FormData();
      form.append("room_id", roomId);

      const res = await fetch(`${baseUrl}/rooms/getPublicRoomDetails.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        const r = data.data;
        setRoom(r);
        setGallery(Array.isArray(r.gallery) ? r.gallery : []);
        setSelectedImage(r.image_url || "");
      } else {
        toast.error("Room not found");
        setRoom(null);
      }
    } catch {
      toast.error("Failed to load room");
      setRoom(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoom();
  }, [roomId]);

  const amenities = useMemo(() => parseAmenities(room?.amenities), [room]);

  const thumbnails = useMemo(() => {
    const list = [];

    if (room?.image_url) {
      list.push({ image_url: room.image_url });
    }

    gallery.forEach((img) => {
      if (img?.image_url && img.image_url !== room?.image_url) {
        list.push(img);
      }
    });

    return list;
  }, [room, gallery]);

  const handleBackToRooms = () => {
    const params = new URLSearchParams();

    if (stayInfo.check_in) params.set("check_in", stayInfo.check_in);
    if (stayInfo.check_out) params.set("check_out", stayInfo.check_out);
    params.set("adults", String(stayInfo.adults));
    params.set("children", String(stayInfo.children));
    params.set("rooms", String(stayInfo.rooms));

    navigate(`/hotels/${hotelId}/rooms?${params.toString()}`);
  };

  if (loading) return <div className={styles.state}>Loading...</div>;

  if (!room) return <div className={styles.state}>Room not found</div>;

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate(-1)} type="button">
        ← Back
      </button>

      <div className={styles.top}>
        <div className={styles.imageSection}>
          <img
            src={getImage(selectedImage)}
            className={styles.mainImg}
            alt={room.name}
            onError={(e) => {
              e.currentTarget.src = `${baseUrl}/uploads/rooms/placeholder.png`;
            }}
          />

          {thumbnails.length > 0 && (
            <div className={styles.thumbRow}>
              {thumbnails.map((img, i) => (
                <img
                  key={`${img.image_url}-${i}`}
                  src={getImage(img.image_url)}
                  className={`${styles.thumb} ${
                    selectedImage === img.image_url ? styles.active : ""
                  }`}
                  onClick={() => setSelectedImage(img.image_url)}
                  onError={(e) => {
                    e.currentTarget.src = `${baseUrl}/uploads/rooms/placeholder.png`;
                  }}
                  alt={`${room.name} ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className={styles.info}>
          <h1>{room.name}</h1>
          <p className={styles.type}>{room.type}</p>

          <p className={styles.price}>Rs. {Number(room.price).toLocaleString()} / night</p>

          <p className={styles.meta}>Capacity: {room.capacity} guest(s)</p>

          <p className={styles.meta}>
            Hotel: {room.hotel_name} — {room.hotel_location}
          </p>

          {room.description && <p className={styles.desc}>{room.description}</p>}

          {amenities.length > 0 && (
            <div className={styles.amenities}>
              {amenities.map((a, i) => (
                <span key={i} className={styles.chip}>
                  {a}
                </span>
              ))}
            </div>
          )}

          <div className={styles.bookingBox}>
            <p>
              {stayInfo.adults} Adults, {stayInfo.children} Children
            </p>
            <p>
              {stayInfo.check_in || "Check-in not selected"} →{" "}
              {stayInfo.check_out || "Check-out not selected"}
            </p>

            <button className={styles.bookBtn} onClick={handleBackToRooms} type="button">
              Back to Select Rooms
            </button>
          </div>
        </div>
      </div>

      {gallery.length > 0 && (
        <div className={styles.gallerySection}>
          <h2>Room Gallery</h2>
          <div className={styles.grid}>
            {gallery.map((img, i) => (
              <img
                key={`${img.image_url}-${i}`}
                src={getImage(img.image_url)}
                alt={`${room.name} gallery ${i + 1}`}
                onError={(e) => {
                  e.currentTarget.src = `${baseUrl}/uploads/rooms/placeholder.png`;
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDetails;