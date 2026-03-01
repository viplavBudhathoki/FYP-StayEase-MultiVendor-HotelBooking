import { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { baseUrl } from "../../../constant";
import styles from "./RoomModal.module.css";

const DEFAULT_AMENITIES = ["WiFi", "AC", "TV", "Balcony", "Mini Fridge", "Hot Shower"];

const RoomModal = ({ hotelId = null, room = null, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState("");

  const [vendorHotels, setVendorHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState(hotelId || "");

  const [formData, setFormData] = useState({
    name: "",
    type: "Standard",
    status: "available",
    price: "",
    image_file: null,
    amenities: [],
    customAmenity: "",
  });

  // Prefill when editing
  useEffect(() => {
    if (!room) return;

    const amenitiesArr = room.amenities
      ? String(room.amenities)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    setFormData({
      name: room.name || "",
      type: room.type || "Standard",
      status: room.status || "available",
      price: room.price || "",
      image_file: null,
      amenities: amenitiesArr,
      customAmenity: "",
    });

    setPreview(room.image_url ? `${baseUrl}/${room.image_url}` : "");
  }, [room]);

  // cleanup blob url
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // If hotelId not provided, fetch vendor hotels so we can choose
  useEffect(() => {
    if (hotelId) return;

    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Vendor token missing");

        const form = new FormData();
        form.append("token", token);

        const res = await fetch(`${baseUrl}/hotels/getVendorHotels.php`, {
          method: "POST",
          body: form,
        });

        const data = await res.json();
        if (data.success) setVendorHotels(Array.isArray(data.data) ? data.data : []);
        else toast.error(data.message || "Failed to load hotels");
      } catch (err) {
        toast.error(err.message);
      }
    })();
  }, [hotelId]);

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
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((p) => ({ ...p, image_file: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalHotelId = hotelId || selectedHotelId;
    if (!finalHotelId) return toast.error("Please select a hotel");

    // optional: require at least 1 amenity
    // if (formData.amenities.length === 0) return toast.error("Select at least 1 amenity");

    // image required only for ADD
    if (!room && !formData.image_file) {
      toast.error("Please select a room image");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vendor token missing");

      const payload = new FormData();
      payload.append("token", token);
      payload.append("hotel_id", finalHotelId);

      payload.append("name", formData.name);
      payload.append("type", formData.type);
      payload.append("status", formData.status);
      payload.append("price", formData.price);
      payload.append("amenities", JSON.stringify(formData.amenities));

      if (formData.image_file) payload.append("image", formData.image_file);

      const apiUrl = room
        ? `${baseUrl}/rooms/updateRoom.php`
        : `${baseUrl}/rooms/addRoom.php`;

      if (room) payload.append("room_id", room.room_id);

      const res = await fetch(apiUrl, { method: "POST", body: payload });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message || (room ? "Room updated" : "Room added"));
        onSuccess?.();
        onClose?.();
      } else {
        toast.error(data.message || "Failed");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
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
                {vendorHotels.map((h) => (
                  <option key={h.hotel_id} value={h.hotel_id}>
                    {h.name} ({h.location})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Room Name</label>
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Room Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option>Standard</option>
                <option>Deluxe</option>
                <option>Executive</option>
                <option>Suite</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Price (Rs.)</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Amenities</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {DEFAULT_AMENITIES.map((a) => (
                <label key={a} style={{ display: "flex", gap: "6px" }}>
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(a)}
                    onChange={() => toggleAmenity(a)}
                  />
                  {a}
                </label>
              ))}
            </div>

            <input
              placeholder="Add custom amenity and press Enter"
              value={formData.customAmenity}
              onChange={(e) => setFormData({ ...formData, customAmenity: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomAmenity();
                }
              }}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Room Image {room ? "(optional)" : ""}</label>
            <div className={styles.imagePreviewWrapper}>
              {preview ? (
                <img src={preview} alt="Preview" className={styles.imagePreviewImg} />
              ) : (
                <div className={styles.imagePlaceholder}>No image selected</div>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              hidden
              id="room-image-input"
              onChange={handleFileChange}
            />
            <label htmlFor="room-image-input" className={styles.fileUploadLabel}>
              <Upload size={20} /> Choose image
            </label>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.primaryBtn} disabled={isLoading}>
              {isLoading ? "Saving..." : room ? "Update Room" : "Add Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomModal;

// import { useState, useEffect } from "react";
// import { X, Upload } from "lucide-react";
// import toast from "react-hot-toast";
// import { baseUrl } from "../../../constant";
// import styles from "./RoomModal.module.css";

// const DEFAULT_AMENITIES = ["WiFi", "AC", "TV", "Balcony", "Mini Fridge", "Hot Shower"];

// const RoomModal = ({ hotelId = null, onClose, onSuccess }) => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [preview, setPreview] = useState("");

//   // For optional "choose hotel"
//   const [vendorHotels, setVendorHotels] = useState([]);
//   const [selectedHotelId, setSelectedHotelId] = useState(hotelId || "");

//   const [formData, setFormData] = useState({
//     name: "",
//     type: "Standard",
//     status: "available", // match DB enum (lowercase)
//     price: "",
//     image_file: null,
//     amenities: [],
//     customAmenity: "",
//   });

//   // cleanup blob url
//   useEffect(() => {
//     return () => {
//       if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
//     };
//   }, [preview]);

//   // If hotelId not provided, fetch vendor's hotels so they can choose
//   useEffect(() => {
//     if (hotelId) return; // hotel fixed
//     (async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) throw new Error("Vendor token missing");

//         const form = new FormData();
//         form.append("token", token);

//         const res = await fetch(`${baseUrl}/hotels/getVendorHotels.php`, {
//           method: "POST",
//           body: form,
//         });

//         const text = await res.text();
//         const data = JSON.parse(text);

//         if (data.success) {
//           setVendorHotels(Array.isArray(data.data) ? data.data : []);
//         } else {
//           toast.error(data.message || "Failed to load hotels");
//         }
//       } catch (err) {
//         toast.error(err.message);
//       }
//     })();
//   }, [hotelId]);

//   const toggleAmenity = (amenity) => {
//     setFormData((prev) => ({
//       ...prev,
//       amenities: prev.amenities.includes(amenity)
//         ? prev.amenities.filter((a) => a !== amenity)
//         : [...prev.amenities, amenity],
//     }));
//   };

//   const addCustomAmenity = () => {
//     const value = formData.customAmenity.trim();
//     if (!value) return;

//     if (!formData.amenities.includes(value)) {
//       setFormData((prev) => ({
//         ...prev,
//         amenities: [...prev.amenities, value],
//         customAmenity: "",
//       }));
//     }
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setFormData((p) => ({ ...p, image_file: file }));
//     setPreview(URL.createObjectURL(file));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const finalHotelId = hotelId || selectedHotelId;
//     if (!finalHotelId) {
//       toast.error("Please select a hotel");
//       return;
//     }

//     if (!formData.image_file) {
//       toast.error("Please select a room image");
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("Vendor token missing");

//       const payload = new FormData();
//       payload.append("token", token);
//       payload.append("hotel_id", finalHotelId);
//       payload.append("name", formData.name);
//       payload.append("type", formData.type);
//       payload.append("status", formData.status); // lowercase
//       payload.append("price", formData.price);
//       payload.append("image", formData.image_file);
//       payload.append("amenities", JSON.stringify(formData.amenities));

//       const res = await fetch(`${baseUrl}/rooms/addRoom.php`, {
//         method: "POST",
//         body: payload,
//       });

//       const text = await res.text();
//       let data;
//       try {
//         data = JSON.parse(text);
//       } catch {
//         throw new Error("API returned HTML, not JSON");
//       }

//       if (data.success) {
//         toast.success(data.message || "Room added");
//         onSuccess?.();
//         onClose?.();
//       } else {
//         toast.error(data.message || "Failed to add room");
//       }
//     } catch (err) {
//       toast.error(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className={styles.modalOverlay}>
//       <div className={styles.modalContent}>
//         <div className={styles.modalHeader}>
//           <h2>Add New Room</h2>
//           <button className={styles.closeBtn} onClick={onClose} type="button">
//             <X size={20} />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className={styles.modalForm}>
//           {/* Show hotel dropdown ONLY when hotelId is not fixed */}
//           {!hotelId && (
//             <div className={styles.formGroup}>
//               <label>Select Hotel</label>
//               <select
//                 required
//                 value={selectedHotelId}
//                 onChange={(e) => setSelectedHotelId(e.target.value)}
//               >
//                 <option value="">-- Select Hotel --</option>
//                 {vendorHotels.map((h) => (
//                   <option key={h.hotel_id} value={h.hotel_id}>
//                     {h.name} ({h.location})
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}

//           {/* Room Name */}
//           <div className={styles.formGroup}>
//             <label>Room Name</label>
//             <input
//               required
//               value={formData.name}
//               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//             />
//           </div>

//           {/* Type & Price */}
//           <div className={styles.formRow}>
//             <div className={styles.formGroup}>
//               <label>Room Type</label>
//               <select
//                 value={formData.type}
//                 onChange={(e) => setFormData({ ...formData, type: e.target.value })}
//               >
//                 <option>Standard</option>
//                 <option>Deluxe</option>
//                 <option>Executive</option>
//                 <option>Suite</option>
//               </select>
//             </div>

//             <div className={styles.formGroup}>
//               <label>Price (Rs.)</label>
//               <input
//                 type="number"
//                 required
//                 value={formData.price}
//                 onChange={(e) => setFormData({ ...formData, price: e.target.value })}
//               />
//             </div>
//           </div>

//           {/* Status */}
//           <div className={styles.formGroup}>
//             <label>Status</label>
//             <select
//               value={formData.status}
//               onChange={(e) => setFormData({ ...formData, status: e.target.value })}
//             >
//               <option value="available">Available</option>
//               <option value="occupied">Occupied</option>
//               <option value="maintenance">Maintenance</option>
//             </select>
//           </div>

//           {/* Amenities */}
//           <div className={styles.formGroup}>
//             <label>Amenities</label>
//             <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
//               {DEFAULT_AMENITIES.map((a) => (
//                 <label key={a} style={{ display: "flex", gap: "6px" }}>
//                   <input
//                     type="checkbox"
//                     checked={formData.amenities.includes(a)}
//                     onChange={() => toggleAmenity(a)}
//                   />
//                   {a}
//                 </label>
//               ))}
//             </div>

//             <input
//               placeholder="Add custom amenity and press Enter"
//               value={formData.customAmenity}
//               onChange={(e) => setFormData({ ...formData, customAmenity: e.target.value })}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") {
//                   e.preventDefault();
//                   addCustomAmenity();
//                 }
//               }}
//             />
//           </div>

//           {/* Image */}
//           <div className={styles.formGroup}>
//             <label>Room Image</label>
//             <div className={styles.imagePreviewWrapper}>
//               {preview ? (
//                 <img src={preview} alt="Preview" className={styles.imagePreviewImg} />
//               ) : (
//                 <div className={styles.imagePlaceholder}>No image selected</div>
//               )}
//             </div>

//             <input
//               type="file"
//               accept="image/*"
//               hidden
//               id="room-image-input"
//               onChange={handleFileChange}
//             />
//             <label htmlFor="room-image-input" className={styles.fileUploadLabel}>
//               <Upload size={20} /> Choose image
//             </label>
//           </div>

//           {/* Actions */}
//           <div className={styles.modalFooter}>
//             <button type="button" className={styles.cancelBtn} onClick={onClose}>
//               Cancel
//             </button>
//             <button type="submit" className={styles.primaryBtn} disabled={isLoading}>
//               {isLoading ? "Saving..." : "Add Room"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default RoomModal;

// // import { useState, useEffect } from "react";
// // import { X, Upload } from "lucide-react";
// // import toast from "react-hot-toast";
// // import { baseUrl } from "../../../constant";
// // import styles from "./RoomModal.module.css";

// // const DEFAULT_AMENITIES = [
// //   "WiFi",
// //   "AC",
// //   "TV",
// //   "Balcony",
// //   "Mini Fridge",
// //   "Hot Shower",
// // ];

// // const RoomModal = ({ hotelId, onClose, onSuccess }) => {
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [preview, setPreview] = useState("");

// //   const [formData, setFormData] = useState({
// //     name: "",
// //     type: "Standard",
// //     status: "Available",
// //     price: "",
// //     image_file: null,
// //     amenities: [],
// //     customAmenity: "",
// //   });

// //   // cleanup blob url
// //   useEffect(() => {
// //     return () => {
// //       if (preview && preview.startsWith("blob:")) {
// //         URL.revokeObjectURL(preview);
// //       }
// //     };
// //   }, [preview]);

// //   const toggleAmenity = (amenity) => {
// //     setFormData((prev) => ({
// //       ...prev,
// //       amenities: prev.amenities.includes(amenity)
// //         ? prev.amenities.filter((a) => a !== amenity)
// //         : [...prev.amenities, amenity],
// //     }));
// //   };

// //   const addCustomAmenity = () => {
// //     const value = formData.customAmenity.trim();
// //     if (!value) return;

// //     if (!formData.amenities.includes(value)) {
// //       setFormData((prev) => ({
// //         ...prev,
// //         amenities: [...prev.amenities, value],
// //         customAmenity: "",
// //       }));
// //     }
// //   };

// //   const handleFileChange = (e) => {
// //     const file = e.target.files[0];
// //     if (!file) return;

// //     setFormData((p) => ({ ...p, image_file: file }));
// //     setPreview(URL.createObjectURL(file));
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();

// //     if (!formData.image_file) {
// //       toast.error("Please select a room image");
// //       return;
// //     }

// //     setIsLoading(true);

// //     try {
// //       const token = localStorage.getItem("token");
// //       if (!token) throw new Error("Vendor token missing");

// //       const payload = new FormData();
// //       payload.append("token", token);
// //       payload.append("hotel_id", hotelId);
// //       payload.append("name", formData.name);
// //       payload.append("type", formData.type);
// //       payload.append("status", formData.status);
// //       payload.append("price", formData.price);
// //       payload.append("image", formData.image_file);
// //       payload.append("amenities", JSON.stringify(formData.amenities));

// //       const res = await fetch(`${baseUrl}/rooms/addRoom.php`, {
// //         method: "POST",
// //         body: payload,
// //       });

// //       const text = await res.text();
// //       let data;
// //       try {
// //         data = JSON.parse(text);
// //       } catch {
// //         throw new Error("API returned HTML, not JSON");
// //       }

// //       if (data.success) {
// //         toast.success(data.message || "Room added");
// //         onSuccess();
// //         onClose();
// //       } else {
// //         toast.error(data.message || "Failed to add room");
// //       }
// //     } catch (err) {
// //       toast.error(err.message);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   return (
// //     <div className={styles.modalOverlay}>
// //       <div className={styles.modalContent}>
// //         <div className={styles.modalHeader}>
// //           <h2>Add New Room</h2>
// //           <button className={styles.closeBtn} onClick={onClose}>
// //             <X size={20} />
// //           </button>
// //         </div>

// //         <form onSubmit={handleSubmit} className={styles.modalForm}>
// //           {/* Room Name */}
// //           <div className={styles.formGroup}>
// //             <label>Room Name</label>
// //             <input
// //               required
// //               value={formData.name}
// //               onChange={(e) =>
// //                 setFormData({ ...formData, name: e.target.value })
// //               }
// //             />
// //           </div>

// //           {/* Type & Price */}
// //           <div className={styles.formRow}>
// //             <div className={styles.formGroup}>
// //               <label>Room Type</label>
// //               <select
// //                 value={formData.type}
// //                 onChange={(e) =>
// //                   setFormData({ ...formData, type: e.target.value })
// //                 }
// //               >
// //                 <option>Standard</option>
// //                 <option>Deluxe</option>
// //                 <option>Executive</option>
// //                 <option>Suite</option>
// //               </select>
// //             </div>

// //             <div className={styles.formGroup}>
// //               <label>Price (Rs.)</label>
// //               <input
// //                 type="number"
// //                 required
// //                 value={formData.price}
// //                 onChange={(e) =>
// //                   setFormData({ ...formData, price: e.target.value })
// //                 }
// //               />
// //             </div>
// //           </div>

// //           {/* Status */}
// //           <div className={styles.formGroup}>
// //             <label>Status</label>
// //             <select
// //               value={formData.status}
// //               onChange={(e) =>
// //                 setFormData({ ...formData, status: e.target.value })
// //               }
// //             >
// //               <option>Available</option>
// //               <option>Occupied</option>
// //               <option>Maintenance</option>
// //             </select>
// //           </div>

// //           {/* Amenities */}
// //           <div className={styles.formGroup}>
// //             <label>Amenities</label>
// //             <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
// //               {DEFAULT_AMENITIES.map((a) => (
// //                 <label key={a} style={{ display: "flex", gap: "6px" }}>
// //                   <input
// //                     type="checkbox"
// //                     checked={formData.amenities.includes(a)}
// //                     onChange={() => toggleAmenity(a)}
// //                   />
// //                   {a}
// //                 </label>
// //               ))}
// //             </div>

// //             <input
// //               placeholder="Add custom amenity and press Enter"
// //               value={formData.customAmenity}
// //               onChange={(e) =>
// //                 setFormData({ ...formData, customAmenity: e.target.value })
// //               }
// //               onKeyDown={(e) => {
// //                 if (e.key === "Enter") {
// //                   e.preventDefault();
// //                   addCustomAmenity();
// //                 }
// //               }}
// //             />
// //           </div>

// //           {/* Image */}
// //           <div className={styles.formGroup}>
// //             <label>Room Image</label>
// //             <div className={styles.imagePreviewWrapper}>
// //               {preview ? (
// //                 <img src={preview} className={styles.imagePreviewImg} />
// //               ) : (
// //                 <div className={styles.imagePlaceholder}>No image selected</div>
// //               )}
// //             </div>

// //             <input
// //               type="file"
// //               accept="image/*"
// //               hidden
// //               id="room-image-input"
// //               onChange={handleFileChange}
// //             />
// //             <label htmlFor="room-image-input" className={styles.fileUploadLabel}>
// //               <Upload size={20} /> Choose image
// //             </label>
// //           </div>

// //           {/* Actions */}
// //           <div className={styles.modalFooter}>
// //             <button type="button" className={styles.cancelBtn} onClick={onClose}>
// //               Cancel
// //             </button>
// //             <button
// //               type="submit"
// //               className={styles.primaryBtn}
// //               disabled={isLoading}
// //             >
// //               {isLoading ? "Saving..." : "Add Room"}
// //             </button>
// //           </div>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // };

// // export default RoomModal;