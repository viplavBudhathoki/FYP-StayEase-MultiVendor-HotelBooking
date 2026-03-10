import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus, BedDouble } from "lucide-react";
import { baseUrl } from "../../../constant";
import RoomModal from "../../Components/RoomModal/RoomModal";
import RoomCard from "../../Components/RoomCard/RoomCard";
import styles from "./Rooms.module.css";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchAllRooms = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vendor token missing");

      const form = new FormData();
      form.append("token", token);

      const res = await fetch(`${baseUrl}/rooms/getVendorRooms.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        setRooms(Array.isArray(data.data) ? data.data : []);
      } else {
        toast.error(data.message || "Failed to load rooms");
        setRooms([]);
      }
    } catch (err) {
      toast.error(err.message);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (room_id) => {
    if (!window.confirm("Delete this room?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vendor token missing");

      const form = new FormData();
      form.append("token", token);
      form.append("room_id", room_id);

      const res = await fetch(`${baseUrl}/rooms/deleteRoom.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Deleted");
        fetchAllRooms();
      } else {
        toast.error(data.message || "Failed to delete");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchAllRooms();
  }, []);

  const filteredRooms = useMemo(() => {
    const q = search.trim().toLowerCase();

    return rooms.filter((r) => {
      const statusOk =
        statusFilter === "all"
          ? true
          : String(r.status || "").toLowerCase() === statusFilter;

      const searchOk =
        !q ||
        String(r.name || "").toLowerCase().includes(q) ||
        String(r.hotel_name || "").toLowerCase().includes(q);

      return statusOk && searchOk;
    });
  }, [rooms, statusFilter, search]);

  const statusButtons = [
    { label: "All", value: "all" },
    { label: "Available", value: "available" },
    { label: "Occupied", value: "occupied" },
    { label: "Maintenance", value: "maintenance" },
  ];

  return (
    <div className={styles.roomsPage}>
      <div className={styles.pageHeader}>
        <div>
          <h1>Room Management</h1>
          <p>Monitor and update status for all hotel properties</p>
        </div>

        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => {
            setEditingRoom(null);
            setIsModalOpen(true);
          }}
          type="button"
        >
          <Plus size={20} /> Add New Room
        </button>
      </div>

      <div className={`${styles.roomsToolbar} ${styles.card}`}>
        <div className={styles.filterGroup}>
          {statusButtons.map((s) => (
            <button
              key={s.value}
              className={`${styles.filterBtn} ${
                statusFilter === s.value ? styles.filterBtnActive : ""
              }`}
              onClick={() => setStatusFilter(s.value)}
              type="button"
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Filter by room name or hotel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading rooms...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className={`${styles.emptyState} ${styles.card}`}>
          <BedDouble size={48} />
          <h3>No Rooms Found</h3>
          <p>It looks like there are no rooms registered yet.</p>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => {
              setEditingRoom(null);
              setIsModalOpen(true);
            }}
            type="button"
          >
            <Plus size={18} /> Add Your First Room
          </button>
        </div>
      ) : (
        <div className={styles.roomsGrid}>
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.room_id}
              room={room}
              onEdit={(selectedRoom) => {
                setEditingRoom(selectedRoom);
                setIsModalOpen(true);
              }}
              onDelete={deleteRoom}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <RoomModal
          hotelId={null}
          room={editingRoom}
          onClose={() => {
            setIsModalOpen(false);
            setEditingRoom(null);
          }}
          onSuccess={fetchAllRooms}
        />
      )}
    </div>
  );
};

export default Rooms;