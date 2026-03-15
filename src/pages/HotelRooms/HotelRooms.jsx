import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import Rating from "react-rating";
import { FaRegStar, FaStar } from "react-icons/fa";
import { baseUrl } from "../../constant";
import styles from "./HotelRooms.module.css";

const HotelRooms = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [priceSort, setPriceSort] = useState("default");
  const [bookingDates, setBookingDates] = useState({});
  const [bookingLoadingId, setBookingLoadingId] = useState(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = !!token && !!user;

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
      state: { from: location.pathname },
    });
  };

  const handleDateChange = (roomId, field, value) => {
    setBookingDates((prev) => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [field]: value,
      },
    }));
  };

  const fetchRooms = async () => {
    setLoading(true);

    try {
      const form = new FormData();
      form.append("hotel_id", hotelId);

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

  const fetchReviews = async () => {
    setReviewsLoading(true);

    try {
      const res = await fetch(
        `${baseUrl}/hotels/getHotelRatings.php?hotel_id=${hotelId}`
      );

      const data = await res.json();

      if (data.success) {
        setReviews(Array.isArray(data.data) ? data.data : []);
      } else {
        setReviews([]);
      }
    } catch {
      toast.error("Failed to load reviews");
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleBookNow = async (room) => {
    if (room.status !== "available") {
      if (room.status === "occupied") {
        toast.error("This room is currently occupied");
      } else if (room.status === "maintenance") {
        toast.error("This room is under maintenance");
      } else {
        toast.error("This room is not available for booking");
      }
      return;
    }

    if (!isLoggedIn) {
      goToLogin();
      return;
    }

    if (user?.role !== "user") {
      toast.error("Only customers can book rooms");
      return;
    }

    const roomDates = bookingDates[room.room_id] || {};
    const checkIn = roomDates.check_in || "";
    const checkOut = roomDates.check_out || "";

    if (!checkIn || !checkOut) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    if (checkOut <= checkIn) {
      toast.error("Check-out must be after check-in");
      return;
    }

    try {
      setBookingLoadingId(room.room_id);

      const form = new FormData();
      form.append("token", token);
      form.append("room_id", room.room_id);
      form.append("check_in", checkIn);
      form.append("check_out", checkOut);

      const res = await fetch(`${baseUrl}/bookings/bookRoom.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Room booked successfully");

        setBookingDates((prev) => ({
          ...prev,
          [room.room_id]: {
            check_in: "",
            check_out: "",
          },
        }));

        navigate("/my-bookings");
      } else {
        toast.error(data.message || "Booking failed");
      }
    } catch {
      toast.error("Failed to book room");
    } finally {
      setBookingLoadingId(null);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchReviews();
  }, [hotelId]);

  const sortedRooms = useMemo(() => {
    const copied = [...rooms];

    if (priceSort === "low-to-high") {
      copied.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (priceSort === "high-to-low") {
      copied.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return copied;
  }, [rooms, priceSort]);

  const colors = ["#ffd700", "#c4b5fd", "#86efac", "#f9a8d4", "#93c5fd"];

  if (loading) {
    return <div className={styles.stateText}>Loading rooms...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageTop}>
        <div>
          <h1 className={styles.title}>Rooms</h1>
          <p className={styles.subtitle}>
            Explore room options, compare prices, and book your stay.
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
            <option value="default">Default</option>
            <option value="low-to-high">Low to High</option>
            <option value="high-to-low">High to Low</option>
          </select>
        </div>
      </div>

      {sortedRooms.length === 0 ? (
        <div className={styles.stateText}>No rooms available.</div>
      ) : (
        <div className={styles.roomsList}>
          {sortedRooms.map((room) => {
            const amenities = parseAmenities(room.amenities);
            const roomDates = bookingDates[room.room_id] || {};

            const isAvailable = room.status === "available";
            const isOccupied = room.status === "occupied";
            const isMaintenance = room.status === "maintenance";
            const isUnavailable = !isAvailable;

            let statusText = "Available";
            let statusClass = styles.availableStatus;
            let buttonText = "Book Now";
            let buttonClass = styles.bookBtn;

            if (isOccupied) {
              statusText = "Occupied";
              statusClass = styles.occupiedStatus;
              buttonText = "Currently Occupied";
              buttonClass = styles.occupiedBtn;
            }

            if (isMaintenance) {
              statusText = "Under Maintenance";
              statusClass = styles.maintenanceStatus;
              buttonText = "Under Maintenance";
              buttonClass = styles.maintenanceBtn;
            }

            return (
              <div key={room.room_id} className={styles.roomCard}>
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

                  <div className={styles.bookingSection}>
                    <div className={styles.dateGroup}>
                      <div className={styles.dateField}>
                        <label>Check-in</label>
                        <input
                          type="date"
                          value={roomDates.check_in || ""}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) =>
                            handleDateChange(room.room_id, "check_in", e.target.value)
                          }
                          disabled={isUnavailable}
                        />
                      </div>

                      <div className={styles.dateField}>
                        <label>Check-out</label>
                        <input
                          type="date"
                          value={roomDates.check_out || ""}
                          min={
                            roomDates.check_in ||
                            new Date().toISOString().split("T")[0]
                          }
                          onChange={(e) =>
                            handleDateChange(room.room_id, "check_out", e.target.value)
                          }
                          disabled={isUnavailable}
                        />
                      </div>
                    </div>

                    <div className={styles.roomBottom}>
                      {isAvailable ? (
                        <button
                          className={buttonClass}
                          onClick={() => handleBookNow(room)}
                          disabled={bookingLoadingId === room.room_id}
                          type="button"
                        >
                          {bookingLoadingId === room.room_id
                            ? "Booking..."
                            : buttonText}
                        </button>
                      ) : (
                        <button className={buttonClass} disabled type="button">
                          {buttonText}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.reviewSection}>
        <div className={styles.reviewTopBar}>
          <h2 className={styles.reviewTitle}>Guest Reviews</h2>
        </div>

        {reviewsLoading ? (
          <p className={styles.reviewState}>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <div className={styles.emptyReviewBox}>
            <p>No reviews yet.</p>
          </div>
        ) : (
          <div className={styles.reviewList}>
            {reviews.map((r, i) => (
              <div key={i} className={styles.reviewItem}>
                <div className={styles.reviewLeft}>
                  <div
                    className={styles.userAvatar}
                    style={{
                      backgroundColor:
                        colors[Math.max(Math.ceil(Number(r.rating)) - 1, 0)] ||
                        "#e2e8f0",
                    }}
                  >
                    {r.full_name?.[0]?.toUpperCase() || "U"}
                  </div>

                  <div className={styles.reviewContent}>
                    <div className={styles.reviewHeader}>
                      <strong>{r.full_name}</strong>

                      <Rating
                        readonly
                        initialRating={Number(r.rating)}
                        fractions={2}
                        fullSymbol={<FaStar />}
                        emptySymbol={<FaRegStar />}
                        className={styles.stars}
                      />

                      <span className={styles.ratingText}>
                        {Number(r.rating).toFixed(1)}
                      </span>
                    </div>

                    <p className={styles.reviewMessage}>
                      {r.review_message || "No message added."}
                    </p>
                  </div>
                </div>

                <span className={styles.reviewDate}>
                  {new Date(r.created_at).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelRooms;