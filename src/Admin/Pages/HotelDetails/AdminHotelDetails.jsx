import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, UserRound, Building2, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { baseUrl } from "../../../constant";
import HotelModal from "../../Components/HotelModal/HotelModal";
import styles from "./AdminHotelDetails.module.css";

const AdminHotelDetails = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchHotelDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Admin token missing");

      const form = new FormData();
      form.append("token", token);
      form.append("hotel_id", hotelId);

      const res = await fetch(`${baseUrl}/hotels/getSingleHotel.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        setHotel(data.data || null);
      } else {
        toast.error(data.message || "Failed to load hotel details");
        setHotel(null);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load hotel details");
      setHotel(null);
    }
  };

  const fetchGallery = async () => {
    try {
      setGalleryLoading(true);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Admin token missing");

      const form = new FormData();
      form.append("token", token);
      form.append("hotel_id", hotelId);

      const res = await fetch(`${baseUrl}/hotels/getHotelGallery.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        setGallery(Array.isArray(data.data) ? data.data : []);
      } else {
        setGallery([]);
      }
    } catch {
      setGallery([]);
    } finally {
      setGalleryLoading(false);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([fetchHotelDetails(), fetchGallery()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, [hotelId]);

  if (loading) {
    return <div className={styles.stateText}>Loading hotel details...</div>;
  }

  if (!hotel) {
    return (
      <div className={styles.page}>
        <div className={styles.topActions}>
          <button
            className={styles.backBtn}
            onClick={() => navigate("/admin/hotels")}
            type="button"
          >
            <ArrowLeft size={18} />
            Back to Hotels
          </button>
        </div>

        <div className={styles.emptyState}>
          <h2>Hotel not found</h2>
          <p>We could not find the requested hotel details.</p>
        </div>
      </div>
    );
  }

  const imageSrc = hotel.image_url
    ? `${baseUrl}/${hotel.image_url}`
    : `${baseUrl}/uploads/hotels/placeholder.png`;

  return (
    <div className={styles.page}>
      <div className={styles.topActions}>
        <button
          className={styles.backBtn}
          onClick={() => navigate("/admin/hotels")}
          type="button"
        >
          <ArrowLeft size={18} />
          Back to Hotels
        </button>

        <button
          className={styles.editBtn}
          type="button"
          onClick={() => setIsEditOpen(true)}
        >
          <Pencil size={18} />
          Edit Hotel
        </button>
      </div>

      <div className={styles.detailsCard}>
        <div className={styles.imageSection}>
          <img
            src={imageSrc}
            alt={hotel.name}
            className={styles.hotelImage}
            onError={(e) => {
              e.currentTarget.src = `${baseUrl}/uploads/hotels/placeholder.png`;
            }}
          />
        </div>

        <div className={styles.contentSection}>
          <div className={styles.topBlock}>
            <div className={styles.badge}>Hotel Details</div>
            <h1 className={styles.hotelName}>{hotel.name}</h1>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>
                <MapPin size={16} />
                Location
              </span>
              <span className={styles.infoValue}>
                {hotel.location || "Not added"}
              </span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>
                <UserRound size={16} />
                Vendor
              </span>
              <span className={styles.infoValue}>
                {hotel.vendor_name || "Not assigned"}
              </span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>
                <Building2 size={16} />
                Hotel ID
              </span>
              <span className={styles.infoValue}>{hotel.hotel_id}</span>
            </div>
          </div>

          <div className={styles.descriptionBox}>
            <h3>Description</h3>
            <p>{hotel.description || "No description available for this hotel."}</p>
          </div>
        </div>
      </div>

      <div className={styles.gallerySection}>
        <div className={styles.galleryHeader}>
          <h2>Hotel Gallery</h2>
          <p>{gallery.length} image{gallery.length === 1 ? "" : "s"}</p>
        </div>

        {galleryLoading ? (
          <div className={styles.galleryState}>Loading gallery...</div>
        ) : gallery.length === 0 ? (
          <div className={styles.galleryState}>No gallery images added yet.</div>
        ) : (
          <div className={styles.galleryGrid}>
            {gallery.map((img) => (
              <div key={img.image_id} className={styles.galleryCard}>
                <img
                  src={`${baseUrl}/${img.image_url}`}
                  alt="Hotel gallery"
                  className={styles.galleryImage}
                  onError={(e) => {
                    e.currentTarget.src = `${baseUrl}/uploads/hotels/placeholder.png`;
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {isEditOpen && (
        <HotelModal
          hotel={hotel}
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

export default AdminHotelDetails;