import { useState, useEffect } from "react";
import { Plus, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import { baseUrl } from "../../../constant";

import HotelCard from "../../Components/HotelCard/HotelCard";
import HotelModal from "../../Components/HotelModal/HotelModal";
import styles from "./Hotels.module.css";

const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);

  // Fetch all hotels from backend
  const fetchHotels = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Admin token missing");

      const form = new FormData();
      form.append("token", token);

      const res = await fetch(`${baseUrl}/hotels/getHotels.php`, {
        method: "POST",
        body: form
      });

      const data = await res.json();
      if (data.success) {
        setHotels(data.data);
      } else {
        toast.error(data.message || "Failed to fetch hotels");
      }
    } catch (err) {
      toast.error("Error fetching hotels: " + err.message);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  // Open modal for editing a hotel
  const handleEdit = (hotel) => {
    setEditingHotel(hotel);
    setIsModalOpen(true);
  };

  // Called after successful delete
  const handleDeleteSuccess = () => {
    fetchHotels();
  };

  // Close modal and reset editing state
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingHotel(null);
  };

  return (
    <div className={styles.hotelsPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1>Hotel Management</h1>
          <p>Manage and assign hotels to vendors</p>
        </div>

        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={20} /> Add New Hotel
        </button>
      </div>

      {/* Hotel List */}
      {hotels.length > 0 ? (
        <div className={styles.hotelList}>
          {hotels.map((hotel) => (
            <HotelCard
              key={hotel.hotel_id}
              hotel={hotel}
              onEdit={handleEdit}
              onDeleteSuccess={handleDeleteSuccess}
            />
          ))}
        </div>
      ) : (
        <div className={`${styles.emptyState} ${styles.card}`}>
          <Building2 size={48} />
          <h3>No Hotels Found</h3>
          <p>There are currently no hotels registered or the server is unavailable.</p>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={18} /> Add Your First Hotel
          </button>
        </div>
      )}

      {/* Hotel Modal for Add/Edit */}
      {isModalOpen && (
        <HotelModal
          hotel={editingHotel}   // Pass hotel to modal for editing
          onClose={handleModalClose}
          onSuccess={fetchHotels} // Refresh hotel list after save
        />
      )}
    </div>
  );
};

export default Hotels;


