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
  const [selectedRoomIds, setSelectedRoomIds] = useState([]);

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

  const parseAmenities = (value) => {
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

  const goToLogin = () => {
    toast.error("Please login first");
    navigate("/login", {
      state: { from: location.pathname + location.search },
    });
  };

  const updateSearchParams = (nextStayInfo) => {
    const params = new URLSearchParams(searchParams);

    if (nextStayInfo.check_in) params.set("check_in", nextStayInfo.check_in);
    else params.delete("check_in");

    if (nextStayInfo.check_out) params.set("check_out", nextStayInfo.check_out);
    else params.delete("check_out");

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
        setRooms(Array.isArray(data.data) ? data.data : []);
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

  useEffect(() => {
    setSelectedRoomIds((prev) => {
      const validRoomIds = new Set(rooms.map((room) => Number(room.room_id)));
      const filtered = prev.filter((id) => validRoomIds.has(Number(id)));

      if (filtered.length > stayInfo.rooms_requested) {
        return filtered.slice(0, stayInfo.rooms_requested);
      }

      return filtered;
    });
  }, [rooms, stayInfo.rooms_requested]);

  const sortedRooms = useMemo(() => {
    const copied = [...rooms];

    if (priceSort === "low-to-high") {
      copied.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (priceSort === "high-to-low") {
      copied.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }

    return copied;
  }, [rooms, priceSort]);

  const selectedRooms = useMemo(() => {
    const selectedSet = new Set(selectedRoomIds.map(Number));
    return sortedRooms.filter((room) => selectedSet.has(Number(room.room_id)));
  }, [sortedRooms, selectedRoomIds]);

  const selectedCapacity = useMemo(() => {
    return selectedRooms.reduce((sum, room) => sum + Number(room.capacity || 1), 0);
  }, [selectedRooms]);

  const selectedPricePerNight = useMemo(() => {
    return selectedRooms.reduce((sum, room) => sum + Number(room.price || 0), 0);
  }, [selectedRooms]);

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

  const handleToggleRoom = (room) => {
    const roomId = Number(room.room_id);
    const isSelected = selectedRoomIds.includes(roomId);

    if (room.status === "maintenance") {
      toast.error("This room is under maintenance");
      return;
    }

    if (!stayInfo.check_in || !stayInfo.check_out) {
      toast.error("Please select check-in and check-out dates first");
      return;
    }

    if (room.is_booked_for_dates) {
      toast.error("This room is unavailable for the selected dates");
      return;
    }

    if (isSelected) {
      setSelectedRoomIds((prev) => prev.filter((id) => id !== roomId));
      return;
    }

    if (selectedRoomIds.length >= stayInfo.rooms_requested) {
      toast.error(`You can select only ${stayInfo.rooms_requested} room(s)`);
      return;
    }

    setSelectedRoomIds((prev) => [...prev, roomId]);
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

    if (stayInfo.check_out <= stayInfo.check_in) {
      toast.error("Check-out must be after check-in");
      return;
    }

    if (stayInfo.check_in < today) {
      toast.error("Check-in date cannot be in the past");
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

    if (selectedRoomIds.length !== Number(stayInfo.rooms_requested || 1)) {
      toast.error(`Please select exactly ${stayInfo.rooms_requested} room(s)`);
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

      selectedRoomIds.forEach((id) => {
        form.append("room_ids[]", String(id));
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
            Select {stayInfo.rooms_requested} room(s) for our stay, guest count, and travel dates.
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
          <strong>
            {stayInfo.adults} Adults, {stayInfo.children} Children
          </strong>
        </div>

        <div className={styles.summaryCard}>
          <span>Rooms Needed</span>
          <strong>{stayInfo.rooms_requested}</strong>
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
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n} Room{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.selectionSummary}>
        <div className={styles.selectionInfo}>
          <p>
            Selected Rooms: <strong>{selectedRoomIds.length}</strong> / {stayInfo.rooms_requested}
          </p>
          <p>
            Selected Capacity: <strong>{selectedCapacity}</strong> guest(s)
          </p>
          <p>
            Total Guests: <strong>{totalGuests}</strong>
          </p>
          <p>
            Total Price: <strong>Rs. {totalBookingPrice.toFixed(2)}</strong>
          </p>
        </div>

        <button
          type="button"
          className={styles.reserveSelectedBtn}
          disabled={
            bookingLoading ||
            !stayInfo.check_in ||
            !stayInfo.check_out ||
            selectedRoomIds.length !== Number(stayInfo.rooms_requested || 1) ||
            selectedCapacity < totalGuests
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
            const amenities = parseAmenities(room.amenities);
            const roomCapacity = Number(room.capacity || 1);
            const isMaintenance = room.status === "maintenance";
            const isBookedForDates = room.is_booked_for_dates;
            const isSelected = selectedRoomIds.includes(Number(room.room_id));

            let statusText = "Available for selected stay";
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
                className={`${styles.roomCard} ${isSelected ? styles.selectedRoomCard : ""}`}
              >
                <img
                  src={getRoomImage(room.image_url)}
                  alt={room.name}
                  className={styles.roomImage}
                  onError={(e) => {
                    e.currentTarget.src = `${baseUrl}/uploads/rooms/placeholder.png`;
                  }}
                />

                <div className={styles.roomInfo}>
                  <div className={styles.roomTop}>
                    <div>
                      <h3 className={styles.roomName}>{room.name}</h3>
                      <p className={styles.roomType}>{room.type}</p>
                      <p className={styles.roomType}>
                        Capacity: {roomCapacity} guest(s)
                      </p>
                    </div>

                    <div className={styles.rightTop}>
                      <p className={styles.price}>Rs. {room.price} / night</p>
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
                      className={
                        isSelected
                          ? styles.selectedBtn
                          : isMaintenance || isBookedForDates || !stayInfo.check_in || !stayInfo.check_out
                          ? styles.maintenanceBtn
                          : styles.bookBtn
                      }
                      onClick={() => handleToggleRoom(room)}
                      disabled={
                        isMaintenance ||
                        isBookedForDates ||
                        !stayInfo.check_in ||
                        !stayInfo.check_out ||
                        (!isSelected && selectedRoomIds.length >= Number(stayInfo.rooms_requested || 1))
                      }
                    >
                      {isSelected ? "Selected" : "Select Room"}
                    </button>
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