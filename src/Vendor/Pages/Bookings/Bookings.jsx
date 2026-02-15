import BookingCard from '../../Components/BookingCard/BookingCard';
import styles from './Bookings.module.css';

const Bookings = () => {
  return (
    <div className={styles.bookingsPage}>
      <h1>Booking Management</h1>
      <BookingCard />
    </div>
  );
};

export default Bookings;
