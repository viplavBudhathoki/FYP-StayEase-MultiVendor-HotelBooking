import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './RoomModal.module.css';

const RoomModal = ({ room, onClose, onSuccess, vendorId }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Store vendor's hotels for dropdown
  const [hotels, setHotels] = useState([]);

  const [formData, setFormData] = useState({
    hotel_id: room?.hotel_id || '',
    name: room?.name || '',
    type: room?.type || 'Standard',
    status: room?.status || 'Available',
    price: room?.price || '',
    image_file: null
  });

  const [preview, setPreview] = useState(room?.photo || '');

  // Fetch vendor hotels on mount
  useEffect(() => {
    async function fetchHotels() {
      try {
        const res = await api.getVendorHotels(vendorId); // backend endpoint
        setHotels(res || []);
      } catch (err) {
        toast.error('Failed to fetch hotels');
      }
    }
    fetchHotels();
  }, [vendorId]);

  // Cleanup preview object URL
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image_file: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.hotel_id) {
      toast.error('Please select a hotel');
      return;
    }

    setIsLoading(true);

    try {
      const payload = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === 'image_file' && formData[key]) {
          payload.append('image', formData[key]);
        } else {
          payload.append(key, formData[key]);
        }
      });

      const response = await api.saveRoom(payload);

      if (response.success) {
        toast.success(response.message);
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || 'Failed to save room');
      }
    } catch (err) {
      toast.error('Failed to save room info');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.modalOverlay} glass`}>
      <div className={`${styles.modalContent} card`}>
        <div className={styles.modalHeader}>
          <h2>{room ? 'Edit Room' : 'Add New Room'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          
          {/* Hotel Selection */}
          <div className={styles.formGroup}>
            <label>Select Hotel</label>
            <select
              required
              value={formData.hotel_id}
              onChange={(e) => setFormData({ ...formData, hotel_id: e.target.value })}
            >
              <option value="">-- Select Hotel --</option>
              {hotels.map((hotel) => (
                <option key={hotel.hotel_id} value={hotel.hotel_id}>
                  {hotel.name}
                </option>
              ))}
            </select>
          </div>

          {/* Room Name */}
          <div className={styles.formGroup}>
            <label>Room Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Room Type & Price */}
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
              <label>Price per Night (Rs.)</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
          </div>

          {/* Room Status */}
          <div className={styles.formGroup}>
            <label>Room Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option>Available</option>
              <option>Occupied</option>
              <option>Maintenance</option>
            </select>
          </div>

          {/* Image Upload */}
          <div className={styles.formGroup}>
            <label>Room Image</label>
            <div className={`${styles.imagePreviewWrapper} glass`}>
              {preview ? (
                <img src={preview} alt="Preview" className={styles.imagePreviewImg} />
              ) : (
                <div className={styles.imagePlaceholder}>No image selected</div>
              )}
            </div>
            <div className={styles.fileUploadContainer}>
              <input
                type="file"
                id="room-image-input"
                accept="image/*"
                onChange={handleFileChange}
                hidden
              />
              <label htmlFor="room-image-input" className={styles.fileUploadLabel}>
                <Upload size={20} />
                {formData.image_file ? formData.image_file.name : 'Choose image from desktop...'}
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.primaryBtn} disabled={isLoading}>
              {isLoading ? 'Saving...' : room ? 'Update Room' : 'Add Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomModal;



// // Modal component used for adding and editing room details
// import { useState, useEffect } from 'react';
// import { X, Upload } from 'lucide-react';
// import toast from 'react-hot-toast';
// import styles from './RoomModal.module.css';

// const RoomModal = ({ room, onClose, onSuccess }) => {
//   // Controls submit button loading state
//   const [isLoading, setIsLoading] = useState(false);

//   // Form state (pre-filled when editing an existing room)
//   const [formData, setFormData] = useState({
//     id: room?.id || '',
//     name: room?.name || '',
//     type: room?.type || 'Standard',
//     status: room?.status || 'Available',
//     price: room?.price || '',
//     vendor: room?.vendor || 'Main Vendor',
//     photo_url: room?.photo || '',
//     image_file: null
//   });

//   // Image preview (existing image or newly selected one)
//   const [preview, setPreview] = useState(room?.photo || '');

//   // Cleanup object URL when component unmounts or preview changes
//   useEffect(() => {
//     return () => {
//       if (preview && preview.startsWith('blob:')) {
//         URL.revokeObjectURL(preview);
//       }
//     };
//   }, [preview]);

//   // Handle image file selection and preview
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setFormData({ ...formData, image_file: file });
//       setPreview(URL.createObjectURL(file));
//     }
//   };

//   // Submit form data (add or update room)
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       const payload = new FormData();

//       // Append all form fields to FormData
//       Object.keys(formData).forEach(key => {
//         if (key === 'image_file' && formData[key]) {
//           payload.append('image', formData[key]); // backend expects "image"
//         } else {
//           payload.append(key, formData[key]);
//         }
//       });

//       const response = await api.saveRoom(payload);

//       if (response.success) {
//         toast.success(response.message);
//         onSuccess(); // refresh room list
//         onClose();   // close modal
//       }
//     } catch (error) {
//       toast.error('Failed to save room info');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className={`${styles.modalOverlay} glass`}>
//       <div className={`${styles.modalContent} card`}>
        
//         {/* Modal header */}
//         <div className={styles.modalHeader}>
//           <h2>{room ? 'Edit Room' : 'Add New Room'}</h2>
//           <button className={styles.closeBtn} onClick={onClose}>
//             <X size={20} />
//           </button>
//         </div>

//         {/* Room form */}
//         <form onSubmit={handleSubmit} className={styles.modalForm}>
          
//           {/* Room name */}
//           <div className={styles.formGroup}>
//             <label>Room Name</label>
//             <input
//               type="text"
//               required
//               value={formData.name}
//               onChange={e => setFormData({ ...formData, name: e.target.value })}
//             />
//           </div>

//           {/* Room type and price */}
//           <div className={styles.formRow}>
//             <div className={styles.formGroup}>
//               <label>Room Type</label>
//               <select
//                 value={formData.type}
//                 onChange={e => setFormData({ ...formData, type: e.target.value })}
//               >
//                 <option>Standard</option>
//                 <option>Deluxe</option>
//                 <option>Executive</option>
//                 <option>Suite</option>
//               </select>
//             </div>

//             <div className={styles.formGroup}>
//               <label>Price per Night (Rs.)</label>
//               <input
//                 type="number"
//                 required
//                 value={formData.price}
//                 onChange={e => setFormData({ ...formData, price: e.target.value })}
//                 placeholder="0.00"
//               />
//             </div>
//           </div>

//           {/* Vendor / branch */}
//           <div className={styles.formGroup}>
//             <label>Vendor / Branch</label>
//             <input
//               type="text"
//               required
//               value={formData.vendor}
//               onChange={e => setFormData({ ...formData, vendor: e.target.value })}
//             />
//           </div>

//           {/* Room status */}
//           <div className={styles.formGroup}>
//             <label>Room Status</label>
//             <select
//               value={formData.status}
//               onChange={e => setFormData({ ...formData, status: e.target.value })}
//             >
//               <option>Available</option>
//               <option>Occupied</option>
//               <option>Maintenance</option>
//             </select>
//           </div>

//           {/* Image upload */}
//           <div className={styles.formGroup}>
//             <label>Room Image</label>

//             {/* Image preview */}
//             <div className={`${styles.imagePreviewWrapper} glass`}>
//               {preview ? (
//                 <img src={preview} alt="Preview" className={styles.imagePreviewImg} />
//               ) : (
//                 <div className={styles.imagePlaceholder}>
//                   No image selected
//                 </div>
//               )}
//             </div>

//             {/* File input */}
//             <div className={styles.fileUploadContainer}>
//               <input
//                 type="file"
//                 id="room-image-input"
//                 accept="image/*"
//                 onChange={handleFileChange}
//                 hidden
//               />
//               <label htmlFor="room-image-input" className={styles.fileUploadLabel}>
//                 <Upload size={20} />
//                 {formData.image_file
//                   ? formData.image_file.name
//                   : 'Choose image from desktop...'}
//               </label>
//             </div>
//           </div>

//           {/* Action buttons */}
//           <div className={styles.modalFooter}>
//             <button
//               type="button"
//               className={styles.cancelBtn}
//               onClick={onClose}
//             >
//               Cancel
//             </button>

//             <button
//               type="submit"
//               className={styles.primaryBtn}
//               disabled={isLoading}
//             >
//               {isLoading
//                 ? 'Saving...'
//                 : room
//                 ? 'Update Room'
//                 : 'Add Room'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default RoomModal;
