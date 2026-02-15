import styles from "./Notifications.module.css";

const Notifications = () => {
  return (
    <div className={styles.NotificationsPage}>
      <div className={styles.PageHeader}>
        <h1>Notifications</h1>
        <p>System alerts and important updates</p>
      </div>

      <div className={styles.EmptyState}>
        <h3>No Alerts Available</h3>
        <p>No alerts available at the moment.</p>
      </div>
    </div>
  );
};

export default Notifications;
