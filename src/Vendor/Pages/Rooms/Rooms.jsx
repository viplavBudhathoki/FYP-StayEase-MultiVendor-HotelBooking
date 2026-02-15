import { useState } from 'react';
import { Plus, BedDouble } from 'lucide-react';
import RoomModal from '../../Components/RoomModal/RoomModal';
import styles from './Rooms.module.css';

const Rooms = ({ vendorId }) => { // pass vendorId from login/user context
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddClick = () => setIsModalOpen(true);

  return (
    <div className={styles.roomsPage}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Room Management</h1>
          <p>Monitor and update status for all hotel properties</p>
        </div>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleAddClick}>
          <Plus size={20} /> Add New Room
        </button>
      </div>

      <div className={`${styles.roomsToolbar} ${styles.card}`}>
        <div className={styles.filterGroup}>
          {['All', 'Available', 'Occupied', 'Maintenance'].map(status => (
            <button key={status} className={styles.filterBtn}>{status}</button>
          ))}
        </div>
        <div className={styles.searchBar}>
          <input type="text" placeholder="Filter by room name..." />
        </div>
      </div>

      <div className={`${styles.emptyState} ${styles.card}`}>
        <BedDouble size={48} />
        <h3>No Rooms Found</h3>
        <p>It looks like there are no rooms registered yet or the server is unavailable.</p>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleAddClick}>
          <Plus size={18} /> Add Your First Room
        </button>
      </div>

      {isModalOpen && (
        <RoomModal
          room={null}
          vendorId={vendorId} // pass vendorId here
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};

export default Rooms;




// import { useState } from 'react';
// import { Plus, BedDouble } from 'lucide-react';
// import RoomModal from '../../Components/RoomModal/RoomModal';
// import styles from './Rooms.module.css';

// const Rooms = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const handleAddClick = () => {
//     setIsModalOpen(true);
//   };

//   return (
//     <div className={styles.roomsPage}>
//       {/* Page Header */}
//       <div className={styles.pageHeader}>
//         <div>
//           <h1>Room Management</h1>
//           <p>Monitor and update status for all hotel properties</p>
//         </div>
//         <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleAddClick}>
//           <Plus size={20} /> Add New Room
//         </button>
//       </div>

//       {/* Toolbar */}
//       <div className={`${styles.roomsToolbar} ${styles.card}`}>
//         <div className={styles.filterGroup}>
//           {['All', 'Available', 'Occupied', 'Maintenance'].map(status => (
//             <button
//               key={status}
//               className={styles.filterBtn}
//             >
//               {status}
//             </button>
//           ))}
//         </div>
//         <div className={styles.searchBar}>
//           <input type="text" placeholder="Filter by room name..." />
//         </div>
//       </div>

//       {/* Empty State */}
//       <div className={`${styles.emptyState} ${styles.card}`}>
//         <BedDouble size={48} />
//         <h3>No Rooms Found</h3>
//         <p>It looks like there are no rooms registered yet or the server is unavailable.</p>
//         <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleAddClick}>
//           <Plus size={18} /> Add Your First Room
//         </button>
//       </div>

//       {/* Modal */}
//       {isModalOpen && (
//         <RoomModal
//           room={null}
//           onClose={() => setIsModalOpen(false)}
//           onSuccess={() => {}}
//         />
//       )}
//     </div>
//   );
// };

// export default Rooms;
