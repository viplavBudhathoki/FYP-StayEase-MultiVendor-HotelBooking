import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CiLocationOn } from "react-icons/ci";
import { FaImages } from "react-icons/fa";
import { ArrowLeft, Pencil, UserRound, Building2 } from "lucide-react";
import { baseUrl } from "../../../constant";
import HotelModal from "../../Components/HotelModal/HotelModal";
import styles from "./AdminHotelDetails.module.css";

const AdminHotelDetails = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [loadingHotel, setLoadingHotel] = useState(true);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);

  const getHotelImage = (img) => {
    if (!img) return `${baseUrl}/uploads/hotels/placeholder.png`;
    return `${baseUrl}/${img}`;
  };

  const fetchHotelDetails = async () => {
    setLoadingHotel(true);

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
        const hotelData = data.data || null;
        setHotel(hotelData);

        if (hotelData?.image_url) {
          setSelectedImage(hotelData.image_url);
        } else {
          setSelectedImage("");
        }
      } else {
        toast.error(data.message || "Failed to load hotel details");
        setHotel(null);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load hotel details");
      setHotel(null);
    } finally {
      setLoadingHotel(false);
    }
  };

  const fetchGallery = async () => {
    setLoadingGallery(true);

    try {
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
    await Promise.all([fetchHotelDetails(), fetchGallery()]);
  };

  useEffect(() => {
    refreshAll();
  }, [hotelId]);

  const totalGalleryImages = useMemo(() => gallery.length, [gallery]);

  if (loadingHotel) {
    return <div className={styles.stateText}>Loading hotel details...</div>;
  }

  if (!hotel) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <h2>Hotel not found</h2>
          <p>We could not find the requested hotel.</p>

          <button
            className={styles.secondaryBtn}
            type="button"
            onClick={() => navigate("/admin/hotels")}
          >
            Back to Hotels
          </button>
        </div>
      </div>
    );
  }

  const allImages = [];
  if (hotel.image_url) {
    allImages.push({
      image_id: "main-image",
      image_url: hotel.image_url,
    });
  }

  gallery.forEach((img) => {
    if (img.image_url !== hotel.image_url) {
      allImages.push(img);
    }
  });

  return (
    <div className={styles.page}>
      <div className={styles.heroCard}>
        <div className={styles.imageSection}>
          <div className={styles.mainImageWrap}>
            <img
              src={getHotelImage(selectedImage || hotel.image_url)}
              alt={hotel.name}
              className={styles.hotelImage}
              onError={(e) => {
                e.currentTarget.src = `${baseUrl}/uploads/hotels/placeholder.png`;
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
                    src={getHotelImage(img.image_url)}
                    alt={`Hotel ${index + 1}`}
                    className={styles.galleryThumb}
                    onError={(e) => {
                      e.currentTarget.src = `${baseUrl}/uploads/hotels/placeholder.png`;
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.contentSection}>
          <span className={styles.badge}>Hotel Details</span>

          <h1 className={styles.hotelName}>{hotel.name}</h1>

          <div className={styles.locationRow}>
            <CiLocationOn />
            <span>{hotel.location || "Location not available"}</span>
          </div>

          <p className={styles.description}>
            {hotel.description || "No description available for this hotel."}
          </p>

          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Hotel ID</span>
              <strong className={styles.statValue}>{hotel.hotel_id}</strong>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Assigned Vendor</span>
              <strong className={styles.statValue}>
                {hotel.vendor_name || "Not assigned"}
              </strong>
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Gallery Images</span>
              <strong className={styles.statValue}>{totalGalleryImages}</strong>
            </div>
          </div>

          <div className={styles.infoRow}>
            <div className={styles.infoMiniCard}>
              <span className={styles.infoMiniLabel}>
                <UserRound size={16} />
                Vendor
              </span>
              <span className={styles.infoMiniValue}>
                {hotel.vendor_name || "Not assigned"}
              </span>
            </div>

            <div className={styles.infoMiniCard}>
              <span className={styles.infoMiniLabel}>
                <Building2 size={16} />
                Hotel ID
              </span>
              <span className={styles.infoMiniValue}>{hotel.hotel_id}</span>
            </div>
          </div>

          <div className={styles.actionRow}>
            <button
              className={styles.primaryBtn}
              type="button"
              onClick={() => setIsEditOpen(true)}
            >
              <Pencil size={18} />
              Edit Hotel
            </button>

            <button
              className={styles.secondaryBtn}
              type="button"
              onClick={() => navigate("/admin/hotels")}
            >
              <ArrowLeft size={18} />
              Back to Hotels
            </button>
          </div>
        </div>
      </div>

      <div className={styles.gallerySection}>
        <div className={styles.galleryTopBar}>
          <h2 className={styles.galleryTitle}>Hotel Gallery</h2>
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
                  src={getHotelImage(img.image_url)}
                  alt={`Gallery ${index + 1}`}
                  className={styles.fullGalleryImage}
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