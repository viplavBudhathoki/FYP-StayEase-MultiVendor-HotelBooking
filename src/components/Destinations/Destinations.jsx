import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Destinations.module.css';
import KathmanduImg from '../../Assets/Kathmandu.jpg';
import PokharaImg from '../../Assets/Pokhara.jpg'; // Force HMR update

const destinations = [
  {
    id: 1,
    name: 'Kathmandu',
    properties: '150+ Properties',
    image: KathmanduImg,
  },
  {
    id: 2,
    name: 'Pokhara',
    properties: '120+ Properties',
    image: PokharaImg,
  }
];

const Destinations = () => {
  const navigate = useNavigate();

  const handleDestinationClick = (name) => {
    navigate(`/hotels?destination=${name}`);
  };

  return (
    <section className={styles.destinationsSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Trending Destinations</h2>
          <p className={styles.subtitle}>Most popular choices for travelers</p>
        </div>

        <div className={styles.grid}>
          {destinations.map((dest) => (
            <div
              key={dest.id}
              className={styles.card}
              onClick={() => handleDestinationClick(dest.name)}
            >
              <div className={styles.imageWrapper}>
                <img src={dest.image} alt={dest.name} className={styles.image} loading="lazy" />
                <div className={styles.overlay}></div>
              </div>
              <div className={styles.content}>
                <h3 className={styles.name}>{dest.name}</h3>
                <p className={styles.properties}>{dest.properties}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Destinations;
