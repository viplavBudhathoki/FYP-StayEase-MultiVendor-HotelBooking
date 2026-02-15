import { AlertCircle } from 'lucide-react';
import styles from './Analysis.module.css';

const Analysis = () => {
  return (
    <div className={styles.AnalysisPage}>
      <div className={styles.PageHeader}>
        <h1>Business Analysis</h1>
        <p>Detailed insights into your property performance</p>
      </div>

      <div className={styles.EmptyState}>
        <AlertCircle size={48} />
        <h3>No Analysis Data</h3>
        <p>
          We couldn't retrieve any business analysis at this time.
          Please ensure the backend is connected.
        </p>
      </div>
    </div>
  );
};

export default Analysis;
