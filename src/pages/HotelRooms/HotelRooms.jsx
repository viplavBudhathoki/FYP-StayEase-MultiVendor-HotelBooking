import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { baseUrl } from "../../constant";
import styles from "./HotelRooms.module.css";

const HotelRooms = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceSort, setPriceSort] = useState("default");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedCounts, setSelectedCounts] = useState({});
  const [selectedImages, setSelectedImages] = useState({});

  const [stayInfo, setStayInfo] = useState({
    check_in: searchParams.get("check_in") || "",
    check_out: searchParams.get("check_out") || "",
    adults: Number(searchParams.get("adults") || 2),
    children: Number(searchParams.get("children") || 0),
    rooms_requested: Number(searchParams.get("rooms") || 1),
  });

  const token = localStorage.getItem("token");

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const isLoggedIn = !!token && !!user;
  const today = new Date().toISOString().split("T")[0];
  const totalGuests = Number(stayInfo.adults || 0) + Number(stayInfo.children || 0);

  const getRoomImage = (img) => {
    if (!img) return `${baseUrl}/uploads/rooms/placeholder.png`;
    return `${baseUrl}/${img}`;
  };

  const parseAmenities = (value, amenitiesArray) => {
    if (Array.isArray(amenitiesArray)) return amenitiesArray;

    if (!value) return [];

    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {}

    return String(value)
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
  };

  const buildRoomGallery = (room) => {
    const gallery = Array.isArray(room.gallery) ? [...room.gallery] : [];

    const hasMain = gallery.some((img) => img.image_url === room.image_url);

    if (!hasMain && room.image_url) {
      gallery.unshift({
        image_id: 0,
        image_url: room.image_url,
      });
    }

    if (gallery.length === 0) {
      gallery.push({
        image_id: 0,
        image_url: "uploads/rooms/placeholder.png",
      });
    }

    return gallery;
  };

  const goToRoomDetails = (roomId) => {
    const params = new URLSearchParams();

    if (stayInfo.check_in) params.set("check_in", stayInfo.check_in);
    if (stayInfo.check_out) params.set("check_out", stayInfo.check_out);
    params.set("adults", String(stayInfo.adults));
    params.set("children", String(stayInfo.children));
    params.set("rooms", String(stayInfo.rooms_requested));

    navigate(`/hotels/${hotelId}/rooms/${roomId}?${params.toString()}`);
  };

  const goToLogin = () => {
    toast.error("Please login first");
    navigate("/login", {
      state: { from: location.pathname + location.search },
    });
  };

  const updateSearchParams = (nextStayInfo) => {
    const params = new URLSearchParams();

    if (nextStayInfo.check_in) params.set("check_in", nextStayInfo.check_in);
    if (nextStayInfo.check_out) params.set("check_out", nextStayInfo.check_out);
    params.set("adults", String(nextStayInfo.adults));
    params.set("children", String(nextStayInfo.children));
    params.set("rooms", String(nextStayInfo.rooms_requested));

    setSearchParams(params);
  };

  const handleStayInfoChange = (field, value) => {
    setStayInfo((prev) => {
      const next = {
        ...prev,
        [field]:
          field === "adults" || field === "children" || field === "rooms_requested"
            ? Number(value)
            : value,
      };

      if (field === "check_in" && next.check_out && next.check_out <= value) {
        next.check_out = "";
      }

      updateSearchParams(next);
      return next;
    });
  };

  const fetchRooms = async () => {
    setLoading(true);

    try {
      const form = new FormData();
      form.append("hotel_id", hotelId);
      if (stayInfo.check_in) form.append("check_in", stayInfo.check_in);
      if (stayInfo.check_out) form.append("check_out", stayInfo.check_out);

      const res = await fetch(`${baseUrl}/rooms/getPublicRoomsByHotel.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        const roomData = Array.isArray(data.data) ? data.data : [];
        setRooms(roomData);

        const nextSelectedImages = {};
        roomData.forEach((room) => {
          const gallery = buildRoomGallery(room);
          nextSelectedImages[room.room_id] = gallery[0]?.image_url || room.image_url || "";
        });
        setSelectedImages(nextSelectedImages);

        setSelectedCounts((prev) => {
          const next = {};
          roomData.forEach((room) => {
            const roomId = String(room.room_id);
            const previous = Number(prev[roomId] || 0);
            const available = Number(room.available_rooms || 0);
            next[roomId] = Math.min(previous, available);
          });
          return next;
        });
      } else {
        toast.error(data.message || "Failed to load rooms");
        setRooms([]);
      }
    } catch {
      toast.error("Failed to load rooms");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [hotelId, stayInfo.check_in, stayInfo.check_out]);

  const sortedRooms = useMemo(() => {
    const copied = [...rooms];

    if (priceSort === "low-to-high") {
      copied.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (priceSort === "high-to-low") {
      copied.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }

    return copied;
  }, [rooms, priceSort]);

  const totalSelectedRooms = useMemo(() => {
    return Object.values(selectedCounts).reduce((sum, count) => sum + Number(count || 0), 0);
  }, [selectedCounts]);

  const selectedCapacity = useMemo(() => {
    return sortedRooms.reduce((sum, room) => {
      const count = Number(selectedCounts[String(room.room_id)] || 0);
      return sum + Number(room.capacity || 1) * count;
    }, 0);
  }, [sortedRooms, selectedCounts]);

  const selectedPricePerNight = useMemo(() => {
    return sortedRooms.reduce((sum, room) => {
      const count = Number(selectedCounts[String(room.room_id)] || 0);
      return sum + Number(room.price || 0) * count;
    }, 0);
  }, [sortedRooms, selectedCounts]);

  const nights = useMemo(() => {
    if (!stayInfo.check_in || !stayInfo.check_out) return 0;

    const start = new Date(stayInfo.check_in);
    const end = new Date(stayInfo.check_out);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    return diff > 0 ? diff : 0;
  }, [stayInfo.check_in, stayInfo.check_out]);

  const totalBookingPrice = useMemo(() => {
    return selectedPricePerNight * nights;
  }, [selectedPricePerNight, nights]);

  const availableCapacity = useMemo(() => {
    return sortedRooms.reduce((sum, room) => {
      if (room.can_book) {
        return sum + Number(room.capacity || 1) * Number(room.available_rooms || 0);
      }
      return sum;
    }, 0);
  }, [sortedRooms]);

  const canHotelHandleRequestedStay = useMemo(() => {
    const totalAvailableUnits = sortedRooms.reduce(
      (sum, room) => sum + Number(room.available_rooms || 0),
      0
    );

    return (
      totalAvailableUnits >= Number(stayInfo.rooms_requested || 1) &&
      availableCapacity >= totalGuests
    );
  }, [sortedRooms, stayInfo.rooms_requested, totalGuests, availableCapacity]);

  const extraSelectedRooms = totalSelectedRooms - Number(stayInfo.rooms_requested || 1);

  const capacityStatus =
    selectedCapacity === 0
      ? "No rooms selected yet"
      : selectedCapacity >= totalGuests
      ? `Good fit for ${totalGuests} guest(s)`
      : `Need ${totalGuests - selectedCapacity} more guest capacity`;

  const selectionStatusType =
    totalSelectedRooms === 0
      ? "neutral"
      : totalSelectedRooms < Number(stayInfo.rooms_requested || 1)
      ? "warning"
      : selectedCapacity < totalGuests
      ? "warning"
      : "success";

  const handleDecrease = (room) => {
    const roomId = String(room.room_id);
    const current = Number(selectedCounts[roomId] || 0);

    if (current <= 0) return;

    setSelectedCounts((prev) => ({
      ...prev,
      [roomId]: current - 1,
    }));
  };

  const handleIncrease = (room) => {
    if (!stayInfo.check_in || !stayInfo.check_out) {
      toast.error("Please select check-in and check-out dates first");
      return;
    }

    if (!room.can_book) {
      toast.error(`${room.name} is not available for the selected dates`);
      return;
    }

    const roomId = String(room.room_id);
    const current = Number(selectedCounts[roomId] || 0);
    const available = Number(room.available_rooms || 0);

    if (current >= available) {
      toast.error(`Only ${available} room(s) available for ${room.name}`);
      return;
    }

    setSelectedCounts((prev) => ({
      ...prev,
      [roomId]: current + 1,
    }));
  };

  const handleReserveSelected = async () => {
    if (!isLoggedIn) {
      goToLogin();
      return;
    }

    if (user?.role !== "user") {
      toast.error("Only customers can book rooms");
      return;
    }

    if (!stayInfo.check_in || !stayInfo.check_out) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    if (stayInfo.check_in < today) {
      toast.error("Check-in date cannot be in the past");
      return;
    }

    if (stayInfo.check_out <= stayInfo.check_in) {
      toast.error("Check-out must be after check-in");
      return;
    }

    if (stayInfo.adults < 1) {
      toast.error("At least 1 adult is required");
      return;
    }

    if (stayInfo.children < 0 || stayInfo.rooms_requested < 1) {
      toast.error("Invalid guest or room selection");
      return;
    }

    if (totalSelectedRooms < Number(stayInfo.rooms_requested || 1)) {
      toast.error(`Please select at least ${stayInfo.rooms_requested} room(s)`);
      return;
    }

    if (selectedCapacity < totalGuests) {
      toast.error(
        `Selected rooms cannot fit all guests. Current capacity is ${selectedCapacity}, but ${totalGuests} guests were selected.`
      );
      return;
    }

    try {
      setBookingLoading(true);

      const form = new FormData();
      form.append("token", token);
      form.append("check_in", stayInfo.check_in);
      form.append("check_out", stayInfo.check_out);
      form.append("adults", String(stayInfo.adults));
      form.append("children", String(stayInfo.children));

      Object.entries(selectedCounts).forEach(([roomId, count]) => {
        for (let i = 0; i < Number(count || 0); i++) {
          form.append("room_ids[]", String(roomId));
        }
      });

      const res = await fetch(`${baseUrl}/bookings/bookRoom.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Rooms booked successfully");
        navigate("/my-bookings");
      } else {
        toast.error(data.message || "Booking failed");
        fetchRooms();
      }
    } catch {
      toast.error("Failed to book rooms");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.stateText}>Loading rooms...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageTop}>
        <div>
          <h1 className={styles.title}>Choose your rooms</h1>
          <p className={styles.subtitle}>
            Select at least {stayInfo.rooms_requested} room(s) for our stay and make sure the total room capacity covers all guests.
          </p>
        </div>

        <div className={styles.sortBox}>
          <label htmlFor="price-sort" className={styles.sortLabel}>
            Sort by Price
          </label>
          <select
            id="price-sort"
            value={priceSort}
            onChange={(e) => setPriceSort(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="default">Recommended</option>
            <option value="low-to-high">Low to High</option>
            <option value="high-to-low">High to Low</option>
          </select>
        </div>
      </div>

      <div className={styles.searchSummary}>
        <div className={styles.summaryCard}>
          <span>Check-in</span>
          <strong>{stayInfo.check_in || "Not selected"}</strong>
        </div>

        <div className={styles.summaryCard}>
          <span>Check-out</span>
          <strong>{stayInfo.check_out || "Not selected"}</strong>
        </div>

        <div className={styles.summaryCard}>
          <span>Guests</span>
          <strong>{stayInfo.adults} Adults, {stayInfo.children} Children</strong>
        </div>

        <div className={styles.summaryCard}>
          <span>Requested Rooms</span>
          <strong>{stayInfo.rooms_requested}</strong>
          <small className={styles.summaryHelper}>
            Minimum selection for this booking
          </small>
        </div>
      </div>

      <div className={styles.bookingSection}>
        <div className={styles.dateGroupFive}>
          <div className={styles.dateField}>
            <label>Check-in</label>
            <input
              type="date"
              value={stayInfo.check_in}
              min={today}
              onChange={(e) => handleStayInfoChange("check_in", e.target.value)}
            />
          </div>

          <div className={styles.dateField}>
            <label>Check-out</label>
            <input
              type="date"
              value={stayInfo.check_out}
              min={stayInfo.check_in || today}
              onChange={(e) => handleStayInfoChange("check_out", e.target.value)}
            />
          </div>

          <div className={styles.dateField}>
            <label>Adults</label>
            <select
              value={stayInfo.adults}
              onChange={(e) => handleStayInfoChange("adults", e.target.value)}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n} Adult{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.dateField}>
            <label>Children</label>
            <select
              value={stayInfo.children}
              onChange={(e) => handleStayInfoChange("children", e.target.value)}
            >
              {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "Child" : "Children"}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.dateField}>
            <label>Rooms</label>
            <select
              value={stayInfo.rooms_requested}
              onChange={(e) => handleStayInfoChange("rooms_requested", e.target.value)}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} Room{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!canHotelHandleRequestedStay && (
          <div className={styles.warningBanner}>
            This hotel does not currently have enough available room inventory or total capacity for the selected stay.
          </div>
        )}
      </div>

      <div className={styles.selectionSummary}>
        <div className={styles.selectionInfo}>
          <p>Selected Rooms: <strong>{totalSelectedRooms}</strong> / minimum {stayInfo.rooms_requested}</p>
          <p>Selected Capacity: <strong>{selectedCapacity}</strong> guest(s)</p>
          <p>Total Guests: <strong>{totalGuests}</strong></p>
          <p>Nights: <strong>{nights}</strong></p>
          <p>Total Price: <strong>Rs. {totalBookingPrice.toFixed(2)}</strong></p>
        </div>

        <div
          className={`${styles.selectionHint} ${
            selectionStatusType === "success"
              ? styles.selectionHintSuccess
              : selectionStatusType === "warning"
              ? styles.selectionHintWarning
              : styles.selectionHintNeutral
          }`}
        >
          {totalSelectedRooms < Number(stayInfo.rooms_requested || 1) ? (
            <span>
              Please select at least <strong>{stayInfo.rooms_requested}</strong> room(s).
            </span>
          ) : selectedCapacity < totalGuests ? (
            <span>
              Selected rooms are not enough for <strong>{totalGuests}</strong> guest(s).
            </span>
          ) : extraSelectedRooms > 0 ? (
            <span>
              You selected <strong>{extraSelectedRooms}</strong> more room(s) than requested.
            </span>
          ) : (
            <span>{capacityStatus}</span>
          )}
        </div>

        <button
          type="button"
          className={styles.reserveSelectedBtn}
          disabled={
            bookingLoading ||
            !stayInfo.check_in ||
            !stayInfo.check_out ||
            totalSelectedRooms < Number(stayInfo.rooms_requested || 1) ||
            selectedCapacity < totalGuests ||
            !canHotelHandleRequestedStay
          }
          onClick={handleReserveSelected}
        >
          {bookingLoading ? "Booking..." : "Reserve Selected Rooms"}
        </button>
      </div>

      {sortedRooms.length === 0 ? (
        <div className={styles.stateText}>No rooms available.</div>
      ) : (
        <div className={styles.roomsList}>
          {sortedRooms.map((room) => {
            const amenities = parseAmenities(room.amenities, room.amenities_array);
            const roomCapacity = Number(room.capacity || 1);
            const isMaintenance = room.status === "maintenance";
            const isBookedForDates = room.is_booked_for_dates;
            const selectedCount = Number(selectedCounts[String(room.room_id)] || 0);
            const gallery = buildRoomGallery(room);
            const selectedImage =
              selectedImages[room.room_id] ||
              gallery[0]?.image_url ||
              room.image_url ||
              "uploads/rooms/placeholder.png";

            let statusText = room.availability_label || "Available";
            let statusClass = styles.availableStatus;

            if (isMaintenance) {
              statusText = "Under Maintenance";
              statusClass = styles.maintenanceStatus;
            } else if (!stayInfo.check_in || !stayInfo.check_out) {
              statusText = "Select travel dates to check availability";
              statusClass = styles.occupiedStatus;
            } else if (isBookedForDates) {
              statusText = "Unavailable for selected dates";
              statusClass = styles.occupiedStatus;
            }

            return (
              <div
                key={room.room_id}
                className={`${styles.roomCard} ${selectedCount > 0 ? styles.selectedRoomCard : ""}`}
              >
                <div className={styles.roomGallerySection}>
                  <img
                    src={getRoomImage(selectedImage)}
                    alt={room.name}
                    className={styles.roomImage}
                    onClick={() => goToRoomDetails(room.room_id)}
                    onError={(e) => {
                      e.currentTarget.src = `${baseUrl}/uploads/rooms/placeholder.png`;
                    }}
                  />

                  {gallery.length > 1 && (
                    <div className={styles.thumbnailRow}>
                      {gallery.map((img, index) => (
                        <button
                          key={img.image_id || index}
                          type="button"
                          className={`${styles.thumbBtn} ${
                            selectedImage === img.image_url ? styles.activeThumb : ""
                          }`}
                          onClick={() =>
                            setSelectedImages((prev) => ({
                              ...prev,
                              [room.room_id]: img.image_url,
                            }))
                          }
                        >
                          <img
                            src={getRoomImage(img.image_url)}
                            alt={`${room.name} ${index + 1}`}
                            className={styles.thumbImg}
                            onError={(e) => {
                              e.currentTarget.src = `${baseUrl}/uploads/rooms/placeholder.png`;
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.roomInfo}>
                  <div className={styles.roomTop}>
                    <div>
                      <h3
                        className={styles.roomName}
                        onClick={() => goToRoomDetails(room.room_id)}
                      >
                        {room.name}
                      </h3>
                      <p className={styles.roomType}>{room.type}</p>
                      <p className={styles.roomType}>Capacity: {roomCapacity} guest(s)</p>
                      <p className={styles.roomType}>Available: {room.available_rooms} room(s)</p>
                    </div>

                    <div className={styles.rightTop}>
                      <p className={styles.price}>Rs. {Number(room.price || 0).toFixed(2)} / night</p>
                      <span className={`${styles.statusBadge} ${statusClass}`}>
                        {statusText}
                      </span>
                    </div>
                  </div>

                  {room.description && (
                    <p className={styles.roomDescription}>{room.description}</p>
                  )}

                  <div className={styles.amenities}>
                    {amenities.map((a, i) => (
                      <span key={i} className={styles.chip}>
                        {a}
                      </span>
                    ))}
                  </div>

                  <div className={styles.roomBottom}>
                    <button
                      type="button"
                      className={styles.viewDetailsBtn}
                      onClick={() => goToRoomDetails(room.room_id)}
                    >
                      View Details
                    </button>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "auto" }}>
                      <button
                        type="button"
                        className={styles.viewDetailsBtn}
                        onClick={() => handleDecrease(room)}
                        disabled={selectedCount <= 0}
                      >
                        -
                      </button>

                      <span style={{ minWidth: "70px", textAlign: "center", fontWeight: 700 }}>
                        {selectedCount}
                      </span>

                      <button
                        type="button"
                        className={
                          isMaintenance || isBookedForDates || !stayInfo.check_in || !stayInfo.check_out
                            ? styles.maintenanceBtn
                            : styles.bookBtn
                        }
                        onClick={() => handleIncrease(room)}
                        disabled={
                          isMaintenance ||
                          isBookedForDates ||
                          !stayInfo.check_in ||
                          !stayInfo.check_out ||
                          selectedCount >= Number(room.available_rooms || 0)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HotelRooms;