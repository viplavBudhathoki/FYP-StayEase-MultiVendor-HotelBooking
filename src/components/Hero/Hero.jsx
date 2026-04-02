import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import styles from "./Hero.module.css";
import { IoIosSearch, IoIosArrowDropdown } from "react-icons/io";

const Hero = () => {
  const navigate = useNavigate();

  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  const today = new Date().toISOString().split("T")[0];

  const handleSearch = () => {
    if (!location) {
      toast.error("Please select a location");
      return;
    }

    if (!checkIn || !checkOut) {
      toast.error("Please select travel dates");
      return;
    }

    if (checkIn < today) {
      toast.error("Check-in date cannot be in the past");
      return;
    }

    if (checkOut <= checkIn) {
      toast.error("Check-out must be after check-in");
      return;
    }

    if (adults < 1) {
      toast.error("At least 1 adult is required");
      return;
    }

    if (children < 0 || rooms < 1) {
      toast.error("Invalid guests or rooms selection");
      return;
    }

    const totalGuests = Number(adults) + Number(children);
    const minRoomsNeeded = Math.ceil(totalGuests / 4);

    if (rooms < minRoomsNeeded) {
      toast.error(
        `For ${totalGuests} guests, at least ${minRoomsNeeded} room(s) are required`
      );
      return;
    }

    const params = new URLSearchParams();
    params.set("destination", location);
    params.set("check_in", checkIn);
    params.set("check_out", checkOut);
    params.set("adults", String(adults));
    params.set("children", String(children));
    params.set("rooms", String(rooms));

    navigate(`/hotels?${params.toString()}`);
  };

  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>
          Experience Luxury <br />
          <span className={styles.heroSpan}>Like Never Before</span>
        </h1>

        <p className={styles.heroSubtitle}>
          Discover handpicked premium hotels and resorts for your next unforgettable getaway.
        </p>

        <div className={styles.searchBox}>
          <div className={styles.searchInputGroup}>
            <label className={styles.searchLabel}>Location</label>
            <div className={styles.selectWrapper}>
              <select
                className={styles.searchInput}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="" disabled>
                  Select Location
                </option>
                <option value="Kathmandu">Kathmandu</option>
                <option value="Pokhara">Pokhara</option>
              </select>
              <IoIosArrowDropdown className={styles.dropdownIcon} />
            </div>
          </div>

          <div className={styles.searchInputGroup}>
            <label className={styles.searchLabel}>Check in</label>
            <input
              type="date"
              className={styles.searchInput}
              value={checkIn}
              min={today}
              onChange={(e) => {
                setCheckIn(e.target.value);
                if (checkOut && checkOut <= e.target.value) {
                  setCheckOut("");
                }
              }}
            />
          </div>

          <div className={styles.searchInputGroup}>
            <label className={styles.searchLabel}>Check out</label>
            <input
              type="date"
              className={styles.searchInput}
              value={checkOut}
              min={checkIn || today}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>

          <div className={styles.searchInputGroup}>
            <label className={styles.searchLabel}>Adults</label>
            <div className={styles.selectWrapper}>
              <select
                className={styles.searchInput}
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n} Adult{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
              <IoIosArrowDropdown className={styles.dropdownIcon} />
            </div>
          </div>

          <div className={styles.searchInputGroup}>
            <label className={styles.searchLabel}>Children</label>
            <div className={styles.selectWrapper}>
              <select
                className={styles.searchInput}
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
              >
                {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "Child" : "Children"}
                  </option>
                ))}
              </select>
              <IoIosArrowDropdown className={styles.dropdownIcon} />
            </div>
          </div>

          <div className={styles.searchInputGroup}>
            <label className={styles.searchLabel}>Rooms</label>
            <div className={styles.selectWrapper}>
              <select
                className={styles.searchInput}
                value={rooms}
                onChange={(e) => setRooms(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} Room{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
              <IoIosArrowDropdown className={styles.dropdownIcon} />
            </div>
          </div>

          <button className={styles.btnSearch} onClick={handleSearch}>
            <IoIosSearch />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;