import { useState } from 'react';
import { Tag, Plus, Search } from 'lucide-react';
import OfferModal from '../../components/OfferModal/OfferModal'; // make sure path is correct
import styles from './Offers.module.css';

const Offers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className={styles.offersPage}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1>Special Offers</h1>
          <p>Manage promotional deals and seasonal discounts</p>
        </div>

        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={handleAddClick}
        >
          <Plus size={20} />
          Create New Offer
        </button>
      </div>

      {/* Search Toolbar */}
      <div className={`${styles.toolbar} ${styles.card}`}>
        <div className={styles.searchBar}>
          <Search size={18} />
          <input type="text" placeholder="Search offers..." />
        </div>
      </div>

      {/* Empty State */}
      <div className={`${styles.emptyState} ${styles.card}`}>
        <Tag size={48} />
        <h3>No Offers Found</h3>
        <p>You haven't created any promotional offers yet.</p>

        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={handleAddClick}
        >
          <Plus size={18} />
          Create Your First Offer
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <OfferModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default Offers;
