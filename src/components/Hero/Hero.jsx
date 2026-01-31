import React from 'react';
import styles from './Hero.module.css';
import { IoIosSearch } from "react-icons/io"; // Search icon from react-icons

const Hero = () => {
    return (
        <section className={styles.hero}>
            {/* Hero content container */}
            <div className={styles.heroContent}>
                {/* Main heading */}
                <h1 className={styles.heroTitle}>
                    Experience Luxury <br />
                    <span className={styles.heroSpan}>Like Never Before</span> {/* Highlighted text */}
                </h1>

                {/* Subtitle / description */}
                <p className={styles.heroSubtitle}>
                    Discover handpicked premium hotels and resorts for your next unforgettable getaway.
                </p>

                {/* Search bar container */}
                <div className={styles.searchBox}>

                    {/* Location input */}
                    <div className={styles.searchInputGroup}>
                        <label className={styles.searchLabel}>Location</label>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Where are you going?"
                        />
                    </div>

                    {/* Check-in date input */}
                    <div className={styles.searchInputGroup}>
                        <label className={styles.searchLabel}>Check in</label>
                        <input type="date" className={styles.searchInput} />
                    </div>

                    {/* Check-out date input */}
                    <div className={styles.searchInputGroup}>
                        <label className={styles.searchLabel}>Check out</label>
                        <input type="date" className={styles.searchInput} />
                    </div>

                    {/* Guests input */}
                    <div className={styles.searchInputGroup}>
                        <label className={styles.searchLabel}>Guests</label>
                        <input
                            type="number"
                            className={styles.searchInput}
                            placeholder="Add guests"
                            min="1"
                        />
                    </div>

                    {/* Search button with icon */}
                    <button className={styles.btnSearch}>
                        <IoIosSearch />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Hero;
