import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaImages } from "react-icons/fa";
import { ArrowLeft, Pencil, BedDouble, Users, Tag } from "lucide-react";
import { baseUrl } from "../../../constant";
import RoomModal from "../../Components/RoomModal/RoomModal";
import styles from "./VendorRoomDetails.module.css";

const VendorRoomDetails = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);

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

  const fetchRoomDetails = async () => {
    setLoadingRoom(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vendor token missing");

      const form = new FormData();
      form.append("token", token);
      form.append("room_id", roomId);

      const res = await fetch(`${baseUrl}/rooms/getSingleRoom.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        const roomData = data.data || null;
        setRoom(roomData);

        if (roomData?.image_url) {
          setSelectedImage(roomData.image_url);
        } else {
          setSelectedImage("");
        }
      } else {
        toast.error(data.message || "Failed to load room details");
        setRoom(null);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load room details");
      setRoom(null);
    } finally {
      setLoadingRoom(false);
    }
  };

  const fetchGallery = async () => {
    setLoadingGallery(true);

    try {
      const form = new FormData();
      form.append("room_id", roomId);

      const res = await fetch(`${baseUrl}/rooms/getRoomGallery.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        const galleryData = Array.isArray(data.data) ? data.data : [];
        setGallery(galleryData);

        if (!selectedImage && galleryData.length > 0) {
          setSelectedImage(galleryData[0].image_url);
        }
      } else {
        setGallery([]);
      }
    } catch {
      setGallery([]);
    } finally {
      setLoadingGallery(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([fetchRoomDetails(), fetchGallery()]);
  };

  useEffect(() => {
    refreshAll();
  }, [roomId]);

  const totalGalleryImages = useMemo(() => gallery.length, [gallery]);
  const amenities = useMemo(() => parseAmenities(room?.amenities), [room]);

  if (loadingRoom) {
    return <div className={styles.stateText}>Loading room details...</div>;
  }

  if (!room) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <h2>Room not found</h2>
          <p>We could not find the requested room.</p>

          <button
            className={styles.secondaryBtn}
            type="button"
            onClick={() => navigate("/vendor/rooms")}
          >
            Back to Rooms
          </button>
        </div>
      </div>
    );
  }

  const allImages = [];
  if (room.image_url) {
    allImages.push({
      image_id: "main-image",
      image_url: room.image_url,
    });
  }

  gallery.forEach((img) => {
    if (img.image_url !== room.image_url) {
      allImages.push(img);
    }
  });

  return (
    <div className={styles.page}>
      <div className={styles.heroCard}>
        <div className={styles.imageSection}>
          <div className={styles.mainImageWrap}>
            <img
              src={getRoomImage(selectedImage || room.image_url)}
              alt={room.name}
              className={styles.roomImage}
              onError={(e) => {
                e.currentTarget.src = `${baseUrl}/uploads/rooms/placeholder.png`;
              }}
            />
          </div>

          {allImages.length > 0 && (
            <div className={styles.galleryGrid}>
              {allImages.slice(0, 5).map((img, index) => (
                <button
                  key={img.image_id || index}
                  type="button"
                  className={`${styles.galleryItem} ${
                    selectedImage === img.image_url ? styles.galleryItemActive : ""
                  }`}
                  onClick={() => setSelectedImage(img.image_url)}
                >
                  <img
                    src={getRoomImage(img.image_url)}
                    alt={`Room ${index + 1}`}
                    className={styles.galleryThumb}
                    onError={(e) => {
                      e.currentTarget.src = `${baseUrl}/uploads/rooms/placeholder.png`;
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.contentSection}>
          <span className={styles.badge}>Room Details</span>

          <h1 className={styles.roomName}>{room.name}</h1>

          <p className={styles.roomType}>{room.type || "Room Type"}</p>

          <p className={styles.description}>
            {room.description || "No description available for this room."}
          </p>

          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Price</span>
              <strong className={styles.statValue}>
                Rs. {Number(room.price || 0).toLocaleString()}
              </strong>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Capacity</span>
              <strong className={styles.statValue}>{room.capacity || 1}</strong>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Gallery Images</span>
              <strong className={styles.statValue}>{totalGalleryImages}</strong>
            </div>
          </div>

          <div className={styles.infoRow}>
            <div className={styles.infoMiniCard}>
              <span className={styles.infoMiniLabel}>
                <Tag size={16} />
                Status
              </span>
              <span className={styles.infoMiniValue}>{room.status}</span>
            </div>

            <div className={styles.infoMiniCard}>
              <span className={styles.infoMiniLabel}>
                <Users size={16} />
                Capacity
              </span>
              <span className={styles.infoMiniValue}>{room.capacity}</span>
            </div>

            <div className={styles.infoMiniCard}>
              <span className={styles.infoMiniLabel}>
                <BedDouble size={16} />
                Type
              </span>
              <span className={styles.infoMiniValue}>{room.type}</span>
            </div>
          </div>

          {amenities.length > 0 && (
            <div className={styles.amenitiesWrap}>
              {amenities.map((item, index) => (
                <span key={index} className={styles.amenityChip}>
                  {item}
                </span>
              ))}
            </div>
          )}

          <div className={styles.actionRow}>
            <button
              className={styles.primaryBtn}
              type="button"
              onClick={() => setIsEditOpen(true)}
            >
              <Pencil size={18} />
              Edit Room
            </button>

            <button
              className={styles.secondaryBtn}
              type="button"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={18} />
              Back
            </button>
          </div>
        </div>
      </div>

      <div className={styles.gallerySection}>
        <div className={styles.galleryTopBar}>
          <h2 className={styles.galleryTitle}>Room Gallery</h2>
          <div className={styles.galleryMeta}>
            <FaImages />
            <span>
              {loadingGallery
                ? "Loading..."
                : `${totalGalleryImages} image${totalGalleryImages === 1 ? "" : "s"}`}
            </span>
          </div>
        </div>

        {loadingGallery ? (
          <p className={styles.galleryState}>Loading gallery...</p>
        ) : gallery.length === 0 ? (
          <div className={styles.emptyGalleryBox}>
            <p>No gallery images added yet.</p>
          </div>
        ) : (
          <div className={styles.fullGalleryGrid}>
            {gallery.map((img, index) => (
              <div key={img.image_id || index} className={styles.fullGalleryItem}>
                <img
                  src={getRoomImage(img.image_url)}
                  alt={`Gallery ${index + 1}`}
                  className={styles.fullGalleryImage}
                  onError={(e) => {
                    e.currentTarget.src = `${baseUrl}/uploads/rooms/placeholder.png`;
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {isEditOpen && (
        <RoomModal
          hotelId={room.hotel_id}
          room={room}
          onClose={() => setIsEditOpen(false)}
          onSuccess={() => {
            setIsEditOpen(false);
            refreshAll();
          }}
        />
      )}
    </div>
  );
};

export default VendorRoomDetails;