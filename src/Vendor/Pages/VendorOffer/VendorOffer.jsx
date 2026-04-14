import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Plus,
  Tag,
  Building2,
  CalendarDays,
  BedDouble,
  Trash2,
} from "lucide-react";
import { baseUrl } from "../../../constant";
import OfferModal from "../../Components/OfferModal/OfferModal";
import styles from "./VendorOffer.module.css";

const VendorOffer = () => {
  const navigate = useNavigate();

  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState("");
  const [hotelRooms, setHotelRooms] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  const token = localStorage.getItem("token");

  const selectedHotel = useMemo(() => {
    return (
      hotels.find((hotel) => String(hotel.hotel_id) === String(selectedHotelId)) ||
      null
    );
  }, [hotels, selectedHotelId]);

  const fetchRoomsByHotel = async (hotelId) => {
    if (!hotelId) {
      setHotelRooms([]);
      return [];
    }

    try {
      setLoadingRooms(true);

      const form = new FormData();
      form.append("token", token || "");
      form.append("hotel_id", hotelId);

      const res = await fetch(`${baseUrl}/rooms/getRoomsByHotel.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        const roomsData = Array.isArray(data.data) ? data.data : [];
        setHotelRooms(roomsData);
        return roomsData;
      } else {
        setHotelRooms([]);
        toast.error(data.message || "Failed to load rooms");
        return [];
      }
    } catch (error) {
      setHotelRooms([]);
      toast.error("Failed to load rooms");
      return [];
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchOffersByHotel = async (hotelId) => {
    if (!hotelId) {
      setOffers([]);
      return [];
    }

    try {
      setLoadingOffers(true);

      const form = new FormData();
      form.append("token", token || "");
      form.append("hotel_id", hotelId);

      const res = await fetch(`${baseUrl}/offers/getOffers.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        const offersData = Array.isArray(data.data) ? data.data : [];
        setOffers(offersData);
        return offersData;
      } else {
        setOffers([]);
        toast.error(data.message || "Failed to load offers");
        return [];
      }
    } catch (error) {
      setOffers([]);
      toast.error("Failed to load offers");
      return [];
    } finally {
      setLoadingOffers(false);
    }
  };

  const fetchHotels = async () => {
    try {
      setLoadingHotels(true);

      const form = new FormData();
      form.append("token", token || "");

      const res = await fetch(`${baseUrl}/hotels/getVendorHotels.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        const hotelList = Array.isArray(data.data) ? data.data : [];
        setHotels(hotelList);

        if (hotelList.length > 0) {
          const firstHotelId = String(hotelList[0].hotel_id);
          setSelectedHotelId(firstHotelId);

          await Promise.all([
            fetchRoomsByHotel(firstHotelId),
            fetchOffersByHotel(firstHotelId),
          ]);
        } else {
          setSelectedHotelId("");
          setHotelRooms([]);
          setOffers([]);
        }
      } else {
        toast.error(data.message || "Failed to load hotels");
      }
    } catch (error) {
      toast.error("Failed to load hotels");
    } finally {
      setLoadingHotels(false);
    }
  };

  useEffect(() => {
    fetchHotels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleHotelChange = async (e) => {
    const hotelId = e.target.value;

    setSelectedHotelId(hotelId);
    setShowOfferModal(false);
    setEditingOffer(null);

    await Promise.all([
      fetchRoomsByHotel(hotelId),
      fetchOffersByHotel(hotelId),
    ]);
  };

  const handleOpenAddModal = async () => {
    if (!selectedHotelId) {
      toast.error("Please select a hotel first");
      return;
    }

    const rooms = await fetchRoomsByHotel(selectedHotelId);

    if (!rooms.length) {
      toast.error("Add room types first before creating a room offer");
      return;
    }

    setEditingOffer(null);
    setShowOfferModal(true);
  };

  const handleEditOffer = async (offer) => {
    if (!selectedHotelId) {
      toast.error("Please select a hotel first");
      return;
    }

    const rooms = await fetchRoomsByHotel(selectedHotelId);

    if (!rooms.length) {
      toast.error("No room types found for this hotel");
      return;
    }

    setEditingOffer(offer);
    setShowOfferModal(true);
  };

  const handleDeleteOffer = async (offerId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this offer?"
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`${baseUrl}/offers/deleteOffer.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          offer_id: offerId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Offer deleted successfully");
        await fetchOffersByHotel(selectedHotelId);
      } else {
        toast.error(data.message || "Failed to delete offer");
      }
    } catch (error) {
      toast.error("Failed to delete offer");
    }
  };

  const handleModalSuccess = async () => {
    setShowOfferModal(false);
    setEditingOffer(null);

    await Promise.all([
      fetchOffersByHotel(selectedHotelId),
      fetchRoomsByHotel(selectedHotelId),
    ]);
  };

  const handleGoToRoomTypes = () => {
    if (!selectedHotelId) {
      toast.error("Please select a hotel first");
      return;
    }

    navigate(`/vendor/hotels/${selectedHotelId}/rooms`);
  };

  const getRoomName = (roomId) => {
    const room = hotelRooms.find(
      (item) => String(item.room_id) === String(roomId)
    );
    return room ? room.name : "Selected room";
  };

  const formatDiscount = (offer) => {
    if (offer.discount_type === "percentage") {
      return `${Number(offer.discount_value).toFixed(0)}% OFF`;
    }
    return `Rs. ${Number(offer.discount_value).toFixed(2)} OFF`;
  };

  const getStatusClass = (status) => {
    if (status === "active") return styles.statusActive;
    if (status === "inactive") return styles.statusInactive;
    return styles.statusExpired;
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.title}>Room Offers Management</h1>
          <p className={styles.subtitle}>
            Create and manage room-specific offers for your hotel room types.
          </p>
        </div>

        <button
          type="button"
          className={styles.addBtn}
          onClick={handleOpenAddModal}
          disabled={!selectedHotelId || loadingRooms}
        >
          <Plus size={18} />
          Add Room Offer
        </button>
      </div>

      <div className={styles.filterCard}>
        <div className={styles.filterGroup}>
          <label htmlFor="hotelSelect">Select Hotel</label>
          <select
            id="hotelSelect"
            value={selectedHotelId}
            onChange={handleHotelChange}
            disabled={loadingHotels || hotels.length === 0}
          >
            {hotels.length === 0 ? (
              <option value="">No hotels found</option>
            ) : (
              hotels.map((hotel) => (
                <option key={hotel.hotel_id} value={hotel.hotel_id}>
                  {hotel.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div className={styles.summaryBox}>
          <div className={styles.summaryItem}>
            <Building2 size={18} />
            <span>
              {selectedHotel ? selectedHotel.name : "No hotel selected"}
            </span>
          </div>

          <div className={styles.summaryItem}>
            <BedDouble size={18} />
            <span>
              {loadingRooms ? "Loading rooms..." : `${hotelRooms.length} room type(s)`}
            </span>
          </div>

          <div className={styles.summaryItem}>
            <Tag size={18} />
            <span>
              {loadingOffers ? "Loading offers..." : `${offers.length} offer(s)`}
            </span>
          </div>
        </div>
      </div>

      {selectedHotelId && !loadingRooms && hotelRooms.length === 0 && (
        <div className={styles.infoBox}>
          <div className={styles.infoText}>
            This hotel has no room types yet. Add room types first before
            creating room offers.
          </div>

          <button
            type="button"
            className={styles.goRoomBtn}
            onClick={handleGoToRoomTypes}
          >
            Go to Room Types
          </button>
        </div>
      )}

      {loadingOffers ? (
        <div className={styles.stateBox}>Loading offers...</div>
      ) : offers.length === 0 ? (
        <div className={styles.emptyBox}>
          <Tag size={34} />
          <h3>No room offers yet</h3>
          <p>Create your first room-specific offer for this hotel.</p>
        </div>
      ) : (
        <div className={styles.offerGrid}>
          {offers.map((offer) => (
            <div
              key={offer.offer_id}
              className={styles.offerCard}
              onClick={() => handleEditOffer(offer)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleEditOffer(offer);
                }
              }}
            >
              <div className={styles.cardTop}>
                <div>
                  <h3 className={styles.offerTitle}>{offer.title}</h3>
                  <p className={styles.offerDescription}>
                    {offer.description || "No description added."}
                  </p>
                </div>

                <span
                  className={`${styles.statusBadge} ${getStatusClass(
                    offer.status
                  )}`}
                >
                  {offer.status}
                </span>
              </div>

              <div className={styles.badgeRow}>
                <span className={styles.mainBadge}>{formatDiscount(offer)}</span>

                <span className={styles.secondaryBadge}>Room Offer</span>

                {Number(offer.is_featured) === 1 && (
                  <span className={styles.featuredBadge}>Featured</span>
                )}
              </div>

              <div className={styles.metaList}>
                <div className={styles.metaItem}>
                  <CalendarDays size={16} />
                  <span>
                    {offer.start_date} to {offer.end_date}
                  </span>
                </div>

                <div className={styles.metaItem}>
                  <BedDouble size={16} />
                  <span>{getRoomName(offer.room_id)}</span>
                </div>

                <div className={styles.metaText}>
                  Minimum {offer.min_nights} night(s), minimum {offer.min_rooms} room(s)
                </div>
              </div>

              <div className={styles.cardFooter}>
                <button
                  type="button"
                  className={styles.editBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditOffer(offer);
                  }}
                >
                  Edit Offer
                </button>

                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteOffer(offer.offer_id);
                  }}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showOfferModal && (
        <OfferModal
          offer={editingOffer}
          hotelId={selectedHotelId}
          rooms={hotelRooms}
          onClose={() => {
            setShowOfferModal(false);
            setEditingOffer(null);
          }}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default VendorOffer;