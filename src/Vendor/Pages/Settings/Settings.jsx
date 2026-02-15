import styles from "./Settings.module.css";

const Settings = () => {
  return (
    <div className={styles.SettingsPage}>
      <div className={styles.PageHeader}>
        <h1>Settings</h1>
        <p>Manage our application settings here.</p>
      </div>

      <div className={styles.SettingsCard}>
        <p>We can configure our application preferences here.</p>
      </div>
    </div>
  );
};

export default Settings;
