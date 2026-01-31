import React from "react";
import { CiLocationOn } from "react-icons/ci";
import styles from "./FeaturedHotels.module.css";

const hotels = [
  {
    id: 1,
    name: "The Royal Paradise",
    location: "Maldives",
    price: "$450",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1571003123894-1ac99dadbee0",
  },
  {
    id: 2,
    name: "Urban Heights",
    location: "New York, USA",
    price: "$320",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945",
  },
  {
    id: 3,
    name: "Alpine Retreat",
    location: "Swiss Alps",
    price: "$580",
    rating: 5.0,
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
  },
];

const FeaturedHotels = () => {
  return (
    <section className={styles.featured} id="hotels">
      <div className={styles.container}>
        <div className={styles.featuredHeader}>
          <h2 className={styles.sectionTitle}>Featured Destinations</h2>
          <p className={styles.sectionSubtitle}>
            Hand-picked properties for your comfort and style
          </p>
        </div>

        <div className={styles.hotelsGrid}>
          {hotels.map((hotel) => (
            <div key={hotel.id} className={styles.hotelCard}>
              <div className={styles.hotelImageContainer}>
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className={styles.hotelImage}
                />
                <div className={styles.hotelPriceBadge}>
                  {hotel.price}/night
                </div>
              </div>

              <div className={styles.hotelInfo}>
                <div className={styles.hotelLocation}>
                  <CiLocationOn /> {hotel.location}
                </div>

                <h3 className={styles.hotelName}>{hotel.name}</h3>

                <div className={styles.hotelFooter}>
                  <div className={styles.hotelRating}>★ {hotel.rating}</div>
                  <button className={styles.btnBook}>
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedHotels;
