// React hook for managing component state
import { useState } from 'react';

// Close (X) icon
import { X } from 'lucide-react';

// Toast notifications for success/error feedback
import toast from 'react-hot-toast';

// Scoped styles for the modal
import styles from './OfferModal.module.css';

// Modal component for adding or editing offers
const OfferModal = ({ offer, onClose, onSuccess }) => {

  // Loading state for submit action
  const [isLoading, setIsLoading] = useState(false);

  // Form state (pre-filled when editing an existing offer)
  const [formData, setFormData] = useState({
    id: offer?.id || '',
    title: offer?.title || '',
    discount: offer?.discount || '',
    status: offer?.status || 'Active',
    rooms_applicable: offer?.rooms || 0
  });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare form data for API submission
      const payload = new FormData();
      Object.keys(formData).forEach(key => {
        payload.append(key, formData[key]);
      });

      // Save offer (create or update)
      const response = await api.saveOffer(payload);

      // Handle successful response
      if (response.success) {
        toast.success(response.message || 'Offer saved successfully');
        onSuccess();  // Refresh offer list
        onClose();    // Close modal
      }
    } catch (error) {
      // Show error message if request fails
      toast.error("Failed to save offer");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Modal overlay with glass effect
    <div className={`${styles.modalOverlay} glass`}>
      <div className={`${styles.modalContent} card`}>

        {/* Modal header */}
        <div className={styles.modalHeader}>
          <h2>{offer ? 'Edit Special Offer' : 'Add New Offer'}</h2>

          {/* Close modal button */}
          <button className="icon-btn-sm" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Offer form */}
        <form onSubmit={handleSubmit} className={styles.modalForm}>

          {/* Offer title */}
          <div className={styles.formGroup}>
            <label>Offer Title</label>
            <input 
              type="text"
              required
              value={formData.title}
              onChange={e =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          {/* Discount value */}
          <div className={styles.formGroup}>
            <label>Discount Value</label>
            <input 
              type="text"
              required
              value={formData.discount}
              onChange={e =>
                setFormData({ ...formData, discount: e.target.value })
              }
            />
          </div>

          {/* Grouped fields */}
          <div className={styles.formRow}>

            {/* Applicable rooms */}
            <div className={styles.formGroup}>
              <label>Applicable Rooms</label>
              <input 
                type="number"
                required
                value={formData.rooms_applicable}
                onChange={e =>
                  setFormData({ ...formData, rooms_applicable: e.target.value })
                }
              />
            </div>

            {/* Offer status */}
            <div className={styles.formGroup}>
              <label>Status</label>
              <select
                value={formData.status}
                onChange={e =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          {/* Modal footer actions */}
          <div className={styles.modalFooter}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading
                ? 'Saving...'
                : offer
                ? 'Update Offer'
                : 'Add Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Export OfferModal component
export default OfferModal;
