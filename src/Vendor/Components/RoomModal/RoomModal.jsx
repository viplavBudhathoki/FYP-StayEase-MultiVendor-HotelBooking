import { useState, useEffect } from "react";
import { X, Upload, ImagePlus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { baseUrl } from "../../../constant";
import styles from "./RoomModal.module.css";

const MAX_GALLERY_IMAGES = 4;
const DEFAULT_AMENITIES = ["WiFi", "AC", "TV", "Balcony", "Mini Fridge", "Hot Shower"];

const RoomModal = ({ hotelId = null, room = null, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const [preview, setPreview] = useState("");
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreview, setGalleryPreview] = useState([]);
  const [existingGallery, setExistingGallery] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);

  const [vendorHotels, setVendorHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState(hotelId || "");

  const [formData, setFormData] = useState({
    name: "",
    type: "Standard",
    status: "available",
    price: "",
    capacity: 1,
    description: "",
    image_file: null,
    amenities: [],
    customAmenity: "",
  });

  const token = localStorage.getItem("token");

  const normalizeAmenities = (val) => {
    if (!val) return [];
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {}
    return String(val)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  useEffect(() => {
    setFormData({
      name: room?.name || "",
      type: room?.type || "Standard",
      status: room?.status || "available",
      price: room?.price || "",
      capacity: room?.capacity || 1,
      description: room?.description || "",
      image_file: null,
      amenities: normalizeAmenities(room?.amenities),
      customAmenity: "",
    });

    const img = room?.image_url || "";
    if (!img) {
      setPreview("");
    } else {
      setPreview(img.startsWith("http") ? img : `${baseUrl}/${img}`);
    }

    setGalleryFiles([]);
    setGalleryPreview([]);
    setExistingGallery([]);
    setSelectedHotelId(hotelId || room?.hotel_id || "");
  }, [room, hotelId]);

  useEffect(() => {
    async function getVendorHotels() {
      if (hotelId) return;

      try {
        if (!token) throw new Error("Vendor token missing");

        const form = new FormData();
        form.append("token", token);

        const res = await fetch(`${baseUrl}/hotels/getVendorHotels.php`, {
          method: "POST",
          body: form,
        });

        const data = await res.json();
        if (data.success) {
          setVendorHotels(Array.isArray(data.data) ? data.data : []);
        } else {
          toast.error(data.message || "Failed to fetch hotels");
        }
      } catch (err) {
        toast.error("Failed to fetch hotels: " + err.message);
      }
    }

    getVendorHotels();
  }, [token, hotelId]);

  useEffect(() => {
    if (room?.room_id) {
      fetchExistingGallery(room.room_id);
    }
  }, [room]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }

      galleryPreview.forEach((img) => {
        if (img.startsWith("blob:")) URL.revokeObjectURL(img);
      });
    };
  }, [preview, galleryPreview]);

  const fetchExistingGallery = async (roomId) => {
    try {
      setGalleryLoading(true);

      const form = new FormData();
      form.append("room_id", roomId);

      const res = await fetch(`${baseUrl}/rooms/getRoomGallery.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        setExistingGallery(Array.isArray(data.data) ? data.data : []);
      } else {
        setExistingGallery([]);
      }
    } catch {
      setExistingGallery([]);
    } finally {
      setGalleryLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setFormData((prev) => ({ ...prev, image_file: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const currentTotal = existingGallery.length + galleryFiles.length;
    const allowedRemaining = MAX_GALLERY_IMAGES - currentTotal;

    if (allowedRemaining <= 0) {
      toast.error(`Only ${MAX_GALLERY_IMAGES} gallery images are allowed`);
      e.target.value = "";
      return;
    }

    const selectedFiles = files.slice(0, allowedRemaining);

    if (files.length > allowedRemaining) {
      toast.error(`Only ${MAX_GALLERY_IMAGES} gallery images are allowed`);
    }

    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));

    setGalleryFiles((prev) => [...prev, ...selectedFiles]);
    setGalleryPreview((prev) => [...prev, ...newPreviews]);

    e.target.value = "";
  };

  const removeNewGalleryImage = (index) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));

    setGalleryPreview((prev) => {
      const removed = prev[index];
      if (removed && removed.startsWith("blob:")) {
        URL.revokeObjectURL(removed);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const deleteExistingGalleryImage = async (imageId) => {
    const ok = window.confirm("Delete this gallery image?");
    if (!ok) return;

    try {
      const form = new FormData();
      form.append("token", token);
      form.append("image_id", imageId);

      const res = await fetch(`${baseUrl}/rooms/deleteRoomGalleryImage.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Gallery image deleted");
        setExistingGallery((prev) => prev.filter((img) => img.image_id !== imageId));
      } else {
        toast.error(data.message || "Failed to delete gallery image");
      }
    } catch {
      toast.error("Failed to delete gallery image");
    }
  };

  const toggleAmenity = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const addCustomAmenity = () => {
    const value = formData.customAmenity.trim();
    if (!value) return;

    if (!formData.amenities.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, value],
        customAmenity: "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, customAmenity: "" }));
    }
  };

  const removeAmenity = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((a) => a !== amenity),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalHotelId = hotelId || selectedHotelId;

    if (!finalHotelId) {
      toast.error("Please select a hotel");
      return;
    }

    if (!room && !formData.image_file) {
      toast.error("Please choose a main room image");
      return;
    }

    setIsLoading(true);

    try {
      if (!token) throw new Error("Vendor token missing");

      const payload = new FormData();
      payload.append("token", token);
      payload.append("hotel_id", finalHotelId);
      payload.append("name", formData.name);
      payload.append("type", formData.type);
      payload.append("status", formData.status);
      payload.append("price", formData.price);
      payload.append("capacity", formData.capacity);
      payload.append("description", formData.description);
      payload.append("amenities", JSON.stringify(formData.amenities));

      if (formData.image_file) {
        payload.append("image", formData.image_file);
      }

      if (galleryFiles.length > 0) {
        galleryFiles.forEach((file) => {
          payload.append("gallery_images[]", file);
        });
      }

      let apiUrl = `${baseUrl}/rooms/addRoom.php`;

      if (room && room.room_id) {
        apiUrl = `${baseUrl}/rooms/updateRoom.php`;
        payload.append("room_id", room.room_id);
      }

      const res = await fetch(apiUrl, {
        method: "POST",
        body: payload,
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Saved successfully");
        onSuccess?.();
        onClose?.();
      } else {
        toast.error(data.message || "Failed to save room");
      }
    } catch (err) {
      toast.error("Something went wrong: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const totalUsed = existingGallery.length + galleryFiles.length;
  const customAmenities = formData.amenities.filter(
    (a) => !DEFAULT_AMENITIES.includes(a)
  );

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{room ? "Edit Room" : "Add New Room"}</h2>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {!hotelId && (
            <div className={styles.formGroup}>
              <label>Select Hotel</label>
              <select
                required
                value={selectedHotelId}
                onChange={(e) => setSelectedHotelId(e.target.value)}
              >
                <option value="">-- Select Hotel --</option>
                {vendorHotels.map((hotel) => (
                  <option key={hotel.hotel_id} value={hotel.hotel_id}>
                    {hotel.name} ({hotel.location})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Room Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Room Type</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, type: e.target.value }))
                }
              >
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Executive">Executive</option>
                <option value="Suite">Suite</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value }))
                }
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Price (Rs.)</label>
              <input
                type="number"
                min="0"
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value }))
                }
              />
            </div>

            <div className={styles.formGroup}>
              <label>Capacity</label>
              <input
                type="number"
                min="1"
                required
                value={formData.capacity}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, capacity: e.target.value }))
                }
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>

          <div className={styles.formGroup}>
            <label>Amenities</label>

            <div className={styles.amenitiesBox}>
              {DEFAULT_AMENITIES.map((amenity) => (
                <label key={amenity} className={styles.amenityCheck}>
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                  />
                  {amenity}
                </label>
              ))}
            </div>

            <div className={styles.customAmenityRow}>
              <input
                type="text"
                placeholder="Add custom amenity and press Enter"
                value={formData.customAmenity}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, customAmenity: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomAmenity();
                  }
                }}
              />
            </div>

            {customAmenities.length > 0 && (
              <div className={styles.customChips}>
                {customAmenities.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    className={styles.customChip}
                    onClick={() => removeAmenity(amenity)}
                    title="Click to remove"
                  >
                    {amenity} ✕
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Main Room Image</label>

            <div className={styles.imagePreviewWrapper}>
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className={styles.imagePreviewImg}
                />
              ) : (
                <div className={styles.imagePlaceholder}>No main image selected</div>
              )}
            </div>

            <input
              type="file"
              id="room-image-input"
              accept="image/*"
              hidden
              onChange={handleFileChange}
            />

            <label htmlFor="room-image-input" className={styles.fileUploadLabel}>
              <Upload size={18} />
              {formData.image_file ? formData.image_file.name : "Choose main image"}
            </label>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.galleryHeader}>
              <label>Room Gallery Images</label>
              <span className={styles.galleryCounter}>
                {totalUsed}/{MAX_GALLERY_IMAGES}
              </span>
            </div>

            <div className={styles.galleryUploadBox}>
              <input
                type="file"
                id="room-gallery-input"
                accept="image/*"
                multiple
                hidden
                onChange={handleGalleryChange}
                disabled={totalUsed >= MAX_GALLERY_IMAGES}
              />

              <label
                htmlFor="room-gallery-input"
                className={`${styles.galleryUploadLabel} ${
                  totalUsed >= MAX_GALLERY_IMAGES ? styles.galleryUploadDisabled : ""
                }`}
              >
                <ImagePlus size={18} />
                {totalUsed >= MAX_GALLERY_IMAGES
                  ? "Gallery Limit Reached"
                  : "Upload gallery images"}
              </label>

              <p className={styles.galleryHint}>
                These images will appear on the room details and customer room view.
              </p>
            </div>

            {galleryLoading ? (
              <div className={styles.galleryStateText}>Loading gallery...</div>
            ) : existingGallery.length > 0 ? (
              <div className={styles.existingGallerySection}>
                <p className={styles.gallerySectionTitle}>Existing Gallery</p>
                <div className={styles.galleryPreviewGrid}>
                  {existingGallery.map((img) => (
                    <div key={img.image_id} className={styles.galleryPreviewCard}>
                      <img
                        src={`${baseUrl}/${img.image_url}`}
                        alt="Existing gallery"
                        className={styles.galleryPreviewImg}
                      />
                      <button
                        type="button"
                        className={styles.removeGalleryBtn}
                        onClick={() => deleteExistingGalleryImage(img.image_id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {galleryPreview.length > 0 && (
              <div className={styles.newGallerySection}>
                <p className={styles.gallerySectionTitle}>New Selected Images</p>
                <div className={styles.galleryPreviewGrid}>
                  {galleryPreview.map((img, index) => (
                    <div key={index} className={styles.galleryPreviewCard}>
                      <img
                        src={img}
                        alt={`Gallery ${index + 1}`}
                        className={styles.galleryPreviewImg}
                      />
                      <button
                        type="button"
                        className={styles.removeGalleryBtn}
                        onClick={() => removeNewGalleryImage(index)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              onClick={onClose}
              className={styles.secondaryBtn}
            >
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className={styles.primaryBtn}>
              {isLoading ? "Saving..." : room ? "Update Room" : "Save Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomModal;