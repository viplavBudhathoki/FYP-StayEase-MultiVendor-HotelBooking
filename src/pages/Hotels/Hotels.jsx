import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { CiLocationOn } from "react-icons/ci";
import { IoStar } from "react-icons/io5";
import { baseUrl } from "../../constant";
import styles from "./Hotels.module.css";

const Hotels = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const today = new Date().toISOString().split("T")[0];

  const initialSearchData = {
    destination: searchParams.get("destination") || "",
    check_in: searchParams.get("check_in") || "",
    check_out: searchParams.get("check_out") || "",
    adults: Number(searchParams.get("adults") || 2),
    children: Number(searchParams.get("children") || 0),
    rooms: Number(searchParams.get("rooms") || 1),
  };

  const hasInitialRealSearch =
    Boolean(initialSearchData.destination.trim()) &&
    Boolean(initialSearchData.check_in) &&
    Boolean(initialSearchData.check_out);

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "rating-high-to-low");
  const [hasSearched, setHasSearched] = useState(hasInitialRealSearch);

  const [searchData, setSearchData] = useState(initialSearchData);

  const totalGuests =
    Number(searchData.adults || 0) + Number(searchData.children || 0);

  const getHotelImage = (img) => {
    if (!img) return `${baseUrl}/uploads/hotels/placeholder.png`;
    return `${baseUrl}/${img}`;
  };

  const syncSearchToUrl = (nextSearch, nextSort = sortBy, searched = hasSearched) => {
    const params = new URLSearchParams();

    if (searched) {
      if (nextSearch.destination.trim()) {
        params.set("destination", nextSearch.destination.trim());
      }

      if (nextSearch.check_in) {
        params.set("check_in", nextSearch.check_in);
      }

      if (nextSearch.check_out) {
        params.set("check_out", nextSearch.check_out);
      }

      params.set("adults", String(nextSearch.adults));
      params.set("children", String(nextSearch.children));
      params.set("rooms", String(nextSearch.rooms));
    }

    params.set("sort", nextSort);
    setSearchParams(params);
  };

  const fetchHotels = async (
    customSearch = searchData,
    applyAvailabilityFilters = hasSearched
  ) => {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      if (customSearch.destination?.trim()) {
        params.set("destination", customSearch.destination.trim());
      }

      if (applyAvailabilityFilters) {
        if (customSearch.check_in) {
          params.set("check_in", customSearch.check_in);
        }

        if (customSearch.check_out) {
          params.set("check_out", customSearch.check_out);
        }

        params.set("adults", String(customSearch.adults || 2));
        params.set("children", String(customSearch.children || 0));
        params.set("rooms", String(customSearch.rooms || 1));
      }

      const res = await fetch(`${baseUrl}/hotels/getPublicHotels.php?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setHotels(Array.isArray(data.data) ? data.data : []);
      } else {
        toast.error(data.message || "Failed to load hotels");
        setHotels([]);
      }
    } catch {
      toast.error("Failed to load hotels");
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels(searchData, hasInitialRealSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (field, value) => {
    setSearchData((prev) => {
      const next = {
        ...prev,
        [field]:
          field === "adults" || field === "children" || field === "rooms"
            ? Number(value)
            : value,
      };

      if (field === "check_in" && next.check_out && next.check_out <= value) {
        next.check_out = "";
      }

      return next;
    });
  };

  const validateSearch = () => {
    if (!searchData.destination?.trim()) {
      toast.error("Please enter a destination");
      return false;
    }

    if (!searchData.check_in || !searchData.check_out) {
      toast.error("Please select travel dates");
      return false;
    }

    if (searchData.check_in < today) {
      toast.error("Check-in date cannot be in the past");
      return false;
    }

    if (searchData.check_out <= searchData.check_in) {
      toast.error("Check-out must be after check-in");
      return false;
    }

    if (searchData.adults < 1) {
      toast.error("At least 1 adult is required");
      return false;
    }

    if (searchData.children < 0 || searchData.rooms < 1) {
      toast.error("Invalid guest or room selection");
      return false;
    }

    const minRoomsNeeded = Math.ceil(totalGuests / 4);

    if (searchData.rooms < minRoomsNeeded) {
      toast.error(`For ${totalGuests} guests, at least ${minRoomsNeeded} room(s) are required`);
      return false;
    }

    return true;
  };

  const handleSearch = () => {
    if (!validateSearch()) return;

    setHasSearched(true);
    syncSearchToUrl(searchData, sortBy, true);
    fetchHotels(searchData, true);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    syncSearchToUrl(searchData, value, hasSearched);
  };

  const filteredHotels = useMemo(() => {
    const copied = [...hotels];

    if (sortBy === "rating-high-to-low") {
      copied.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (sortBy === "rating-low-to-high") {
      copied.sort((a, b) => Number(a.rating || 0) - Number(b.rating || 0));
    } else if (sortBy === "price-low-to-high") {
      copied.sort((a, b) => {
        const aPrice = Number(a.starting_price || 0);
        const bPrice = Number(b.starting_price || 0);

        if (aPrice === 0 && bPrice > 0) return 1;
        if (bPrice === 0 && aPrice > 0) return -1;

        return aPrice - bPrice;
      });
    } else if (sortBy === "price-high-to-low") {
      copied.sort((a, b) => Number(b.starting_price || 0) - Number(a.starting_price || 0));
    } else if (sortBy === "availability-high-to-low") {
      copied.sort((a, b) => Number(b.available_rooms || 0) - Number(a.available_rooms || 0));
    }

    return copied;
  }, [hotels, sortBy]);

  const buildHotelUrl = (hotelId) => {
    const params = new URLSearchParams();

    if (hasSearched) {
      if (searchData.destination.trim()) {
        params.set("destination", searchData.destination.trim());
      }

      if (searchData.check_in) {
        params.set("check_in", searchData.check_in);
      }

      if (searchData.check_out) {
        params.set("check_out", searchData.check_out);
      }

      params.set("adults", String(searchData.adults));
      params.set("children", String(searchData.children));
      params.set("rooms", String(searchData.rooms));
    }

    const query = params.toString();
    return `/hotels/${hotelId}${query ? `?${query}` : ""}`;
  };

  if (loading) {
    return <div className={styles.stateText}>Loading hotels...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.heroSection}>
        <p className={styles.smallTag}>Discover stays across Nepal</p>
        <h1 className={styles.title}>Find the perfect hotel for our next stay</h1>
        <p className={styles.subtitle}>
          Search by destination, travel dates, and guest count like a real booking platform.
        </p>

        <div className={styles.searchBar}>
          <select
            value={searchData.destination}
            onChange={(e) => handleInputChange("destination", e.target.value)}
            className={styles.searchInput}
          >
            <option value="" disabled>
              Select Location
            </option>
            <option value="Kathmandu">Kathmandu</option>
            <option value="Pokhara">Pokhara</option>
          </select>

          <input
            type="date"
            value={searchData.check_in}
            min={today}
            onChange={(e) => handleInputChange("check_in", e.target.value)}
            className={styles.searchInput}
          />

          <input
            type="date"
            value={searchData.check_out}
            min={searchData.check_in || today}
            onChange={(e) => handleInputChange("check_out", e.target.value)}
            className={styles.searchInput}
          />

          <select
            value={searchData.adults}
            onChange={(e) => handleInputChange("adults", e.target.value)}
            className={styles.searchInput}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n} Adult{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>

          <select
            value={searchData.children}
            onChange={(e) => handleInputChange("children", e.target.value)}
            className={styles.searchInput}
          >
            {[0, 1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "Child" : "Children"}
              </option>
            ))}
          </select>

          <select
            value={searchData.rooms}
            onChange={(e) => handleInputChange("rooms", e.target.value)}
            className={styles.searchInput}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} Room{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>

          <button type="button" className={styles.searchBtn} onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>

      <div className={styles.sortRow}>
        <div className={styles.sortBox}>
          <label htmlFor="hotel-sort" className={styles.sortLabel}>
            Sort Hotels
          </label>
          <select
            id="hotel-sort"
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="rating-high-to-low">Rating: High to Low</option>
            <option value="rating-low-to-high">Rating: Low to High</option>
            <option value="price-low-to-high">Price: Low to High</option>
            <option value="price-high-to-low">Price: High to Low</option>
            {hasSearched && (
              <option value="availability-high-to-low">Availability: High to Low</option>
            )}
            <option value="default">Recommended</option>
          </select>
        </div>
      </div>

      {filteredHotels.length === 0 ? (
        <div className={styles.stateText}>
          {hasSearched
            ? "No hotels found for the selected destination and dates."
            : "No hotels available right now."}
        </div>
      ) : (
        <div className={styles.hotelsGrid}>
          {filteredHotels.map((hotel) => {
            const hasEnoughRooms = Boolean(hotel.matches_room_count);
            const hasEnoughCapacity = Boolean(hotel.matches_guest_capacity);
            const canHandleStay = Boolean(hotel.can_handle_stay);

            return (
              <div
                key={hotel.hotel_id}
                className={styles.hotelCard}
                onClick={() => navigate(buildHotelUrl(hotel.hotel_id))}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(buildHotelUrl(hotel.hotel_id));
                  }
                }}
              >
                <div className={styles.imageWrap}>
                  <img
                    src={getHotelImage(hotel.image_url)}
                    alt={hotel.name}
                    className={styles.hotelImage}
                    onError={(e) => {
                      e.currentTarget.src = `${baseUrl}/uploads/hotels/placeholder.png`;
                    }}
                  />

                  <div className={styles.imageOverlay}>
                    <span className={styles.badge}>
                      <IoStar />
                      {Number(hotel.rating) > 0 ? Number(hotel.rating).toFixed(1) : "New"}
                    </span>
                  </div>
                </div>

                <div className={styles.hotelInfo}>
                  <div className={styles.location}>
                    <CiLocationOn /> {hotel.location}
                  </div>

                  <h3 className={styles.hotelName}>{hotel.name}</h3>

                  <p className={styles.hotelDescription}>
                    {hotel.description || "A comfortable and welcoming stay for our trip."}
                  </p>

                  {hasSearched && (
                    <div className={styles.matchBadges}>
                      <span
                        className={`${styles.matchBadge} ${
                          hasEnoughRooms ? styles.goodBadge : styles.warnBadge
                        }`}
                      >
                        {hasEnoughRooms
                          ? `${hotel.available_rooms} room(s) available`
                          : `Only ${hotel.available_rooms} room(s) available`}
                      </span>

                      <span
                        className={`${styles.matchBadge} ${
                          hasEnoughCapacity ? styles.goodBadge : styles.warnBadge
                        }`}
                      >
                        {hasEnoughCapacity
                          ? `Fits ${totalGuests} guest(s)`
                          : `Capacity for ${hotel.total_capacity} guest(s)`}
                      </span>

                      <span
                        className={`${styles.matchBadge} ${
                          canHandleStay ? styles.goodBadge : styles.warnBadge
                        }`}
                      >
                        {canHandleStay ? "Good match for this stay" : "May not fit this stay"}
                      </span>
                    </div>
                  )}

                  <div className={styles.cardFooter}>
                    <div className={styles.priceBlock}>
                      <span className={styles.priceLabel}>Starting from</span>
                      <span className={styles.priceText}>
                        Rs.{" "}
                        {Number(hotel.starting_price) > 0
                          ? Number(hotel.starting_price).toFixed(2)
                          : "--"}
                      </span>
                      <span className={styles.reviewCount}>
                        ({hotel.review_count || 0} review
                        {Number(hotel.review_count || 0) === 1 ? "" : "s"})
                      </span>
                    </div>

                    <button
                      className={styles.viewBtn}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(buildHotelUrl(hotel.hotel_id));
                      }}
                    >
                      Explore →
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

export default Hotels;