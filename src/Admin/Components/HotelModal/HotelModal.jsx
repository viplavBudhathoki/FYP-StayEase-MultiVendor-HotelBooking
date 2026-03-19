import { useState, useEffect } from "react";
import { X, Upload, ImagePlus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { baseUrl } from "../../../constant";
import styles from "./HotelModal.module.css";

const MAX_GALLERY_IMAGES = 4;

const HotelModal = ({ hotel = null, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [vendors, setVendors] = useState([]);

  const [preview, setPreview] = useState("");
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreview, setGalleryPreview] = useState([]);
  const [existingGallery, setExistingGallery] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    vendor_id: "",
    image_file: null,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    setFormData({
      name: hotel?.name || "",
      location: hotel?.location || "",
      description: hotel?.description || "",
      vendor_id: hotel?.vendor_id || "",
      image_file: null,
    });

    const img = hotel?.image_url || "";
    if (!img) {
      setPreview("");
    } else {
      setPreview(img.startsWith("http") ? img : `${baseUrl}/${img}`);
    }

    setGalleryFiles([]);
    setGalleryPreview([]);
    setExistingGallery([]);
  }, [hotel]);

  useEffect(() => {
    async function getVendors() {
      try {
        if (!token) throw new Error("Admin token missing");

        const form = new FormData();
        form.append("token", token);

        const res = await fetch(`${baseUrl}/hotels/getVendors.php`, {
          method: "POST",
          body: form,
        });

        const data = await res.json();
        if (data.success) {
          setVendors(Array.isArray(data.data) ? data.data : []);
        } else {
          toast.error(data.message || "Failed to fetch vendors");
        }
      } catch (err) {
        toast.error("Failed to fetch vendors: " + err.message);
      }
    }

    getVendors();
  }, [token]);

  useEffect(() => {
    if (hotel?.hotel_id) {
      fetchExistingGallery(hotel.hotel_id);
    }
  }, [hotel]);

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

  const fetchExistingGallery = async (hotelId) => {
    try {
      setGalleryLoading(true);

      const form = new FormData();
      form.append("token", token);
      form.append("hotel_id", hotelId);

      const res = await fetch(`${baseUrl}/hotels/getHotelGallery.php`, {
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

      const res = await fetch(`${baseUrl}/hotels/deleteHotelGalleryImage.php`, {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.vendor_id) {
      toast.error("Please select a vendor");
      return;
    }

    setIsLoading(true);

    try {
      if (!token) throw new Error("Admin token missing");

      const payload = new FormData();
      payload.append("token", token);
      payload.append("name", formData.name);
      payload.append("location", formData.location);
      payload.append("description", formData.description);
      payload.append("vendor_id", formData.vendor_id);

      if (formData.image_file) {
        payload.append("image", formData.image_file);
      }

      if (galleryFiles.length > 0) {
        galleryFiles.forEach((file) => {
          payload.append("gallery[]", file);
        });
      }

      let apiUrl = `${baseUrl}/hotels/addHotel.php`;

      if (hotel && hotel.hotel_id) {
        apiUrl = `${baseUrl}/hotels/updateHotel.php`;
        payload.append("hotel_id", hotel.hotel_id);
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
        toast.error(data.message || "Failed to save hotel");
      }
    } catch (err) {
      toast.error("Something went wrong: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const totalUsed = existingGallery.length + galleryFiles.length;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{hotel ? "Edit Hotel" : "Add New Hotel"}</h2>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label>Hotel Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div className={styles.formGroup}>
            <label>Location</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
            />
          </div>

          <div className={styles.formGroup}>
            <label>Select Vendor</label>
            <select
              required
              value={formData.vendor_id}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, vendor_id: e.target.value }))
              }
            >
              <option value="">-- Select Vendor --</option>
              {vendors.map((vendor) => (
                <option key={vendor.user_id} value={vendor.user_id}>
                  {vendor.full_name}
                </option>
              ))}
            </select>
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
            <label>Main Hotel Image</label>

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
              id="hotel-image-input"
              accept="image/*"
              hidden
              onChange={handleFileChange}
            />

            <label htmlFor="hotel-image-input" className={styles.fileUploadLabel}>
              <Upload size={18} />
              {formData.image_file ? formData.image_file.name : "Choose main image"}
            </label>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.galleryHeader}>
              <label>Hotel Gallery Images</label>
              <span className={styles.galleryCounter}>
                {totalUsed}/{MAX_GALLERY_IMAGES}
              </span>
            </div>

            <div className={styles.galleryUploadBox}>
              <input
                type="file"
                id="hotel-gallery-input"
                accept="image/*"
                multiple
                hidden
                onChange={handleGalleryChange}
                disabled={totalUsed >= MAX_GALLERY_IMAGES}
              />

              <label
                htmlFor="hotel-gallery-input"
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
                These images will appear on the customer hotel details page.
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
              {isLoading ? "Saving..." : hotel ? "Update Hotel" : "Save Hotel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HotelModal;