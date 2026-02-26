import { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { baseUrl } from "../../../constant";
import styles from "./HotelModal.module.css";

const HotelModal = ({ hotel = null, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [vendors, setVendors] = useState([]);

  const [preview, setPreview] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    vendor_id: "",
    image_file: null,
  });

  // Sync form + preview when editing hotel changes
  useEffect(() => {
    setFormData({
      name: hotel?.name || "",
      location: hotel?.location || "",
      description: hotel?.description || "",
      vendor_id: hotel?.vendor_id || "",
      image_file: null, // reset file when switching edit
    });

    const img = hotel?.image_url || "";
    if (!img) {
      setPreview("");
    } else {
      // supports both relative + full url just in case
      setPreview(img.startsWith("http") ? img : `${baseUrl}/${img}`);
    }
  }, [hotel]);

  // Fetch vendors list
  useEffect(() => {
    async function getVendors() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Admin token missing");

        const form = new FormData();
        form.append("token", token);

        const res = await fetch(`${baseUrl}/hotels/getVendors.php`, {
          method: "POST",
          body: form,
        });

        const data = await res.json();
        if (data.success) setVendors(data.data);
        else toast.error(data.message || "Failed to fetch vendors");
      } catch (err) {
        toast.error("Failed to fetch vendors: " + err.message);
      }
    }

    getVendors();
  }, []);

  // Handle image file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, image_file: file }));
    setPreview(URL.createObjectURL(file)); // preview local file
  };

  // Submit Add or Update Hotel
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.vendor_id) {
      toast.error("Please select a vendor");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Admin token missing");

      const payload = new FormData();
      payload.append("token", token);
      payload.append("name", formData.name);
      payload.append("location", formData.location);
      payload.append("description", formData.description);
      payload.append("vendor_id", formData.vendor_id);

      if (formData.image_file) payload.append("image", formData.image_file);

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

        // If backend returns relative image_url (recommended)
        if (data.data?.image_url) {
          const img = data.data.image_url;
          setPreview(img.startsWith("http") ? img : `${baseUrl}/${img}`);
        }

        onSuccess?.(); // Refresh hotel list
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
            <label>Hotel Image</label>

            <div className={styles.imagePreviewWrapper}>
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className={styles.imagePreviewImg}
                />
              ) : (
                <div className={styles.imagePlaceholder}>No image selected</div>
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
              {formData.image_file
                ? formData.image_file.name
                : "Choose image from desktop..."}
            </label>
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