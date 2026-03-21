import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, BedDouble } from "lucide-react";
import toast from "react-hot-toast";
import RoomModal from "../../Components/RoomModal/RoomModal";
import RoomCard from "../../Components/RoomCard/RoomCard";
import { baseUrl } from "../../../constant";
import styles from "./Rooms.module.css";

const Rooms = () => {
  const [searchParams] = useSearchParams();

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
      toast.error(err.message || "Failed to load rooms");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    const ok = window.confirm("Are you sure you want to delete this room?");
    if (!ok) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vendor token missing");

      const form = new FormData();
      form.append("token", token);
      form.append("room_id", roomId);

      const res = await fetch(`${baseUrl}/rooms/deleteRoom.php`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Room deleted successfully");
        fetchAllRooms();
      } else {
        toast.error(data.message || "Failed to delete room");
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete room");
    }
  };

  useEffect(() => {
    fetchAllRooms();
  }, []);

  useEffect(() => {
    const urlStatus = (searchParams.get("status") || "all").toLowerCase();
    setStatusFilter(urlStatus);
  }, [searchParams]);

  const filteredRooms = useMemo(() => {
    const q = search.trim().toLowerCase();

    return rooms.filter((room) => {
      const roomStatus = String(room.status || "").toLowerCase();

      const statusMatch =
        statusFilter === "all" ? true : roomStatus === statusFilter;

      const searchMatch =
        !q ||
        String(room.name || "").toLowerCase().includes(q) ||
        String(room.type || "").toLowerCase().includes(q) ||
        String(room.hotel_name || "").toLowerCase().includes(q) ||
        String(room.description || "").toLowerCase().includes(q);

      return statusMatch && searchMatch;
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
          {statusButtons.map((status) => (
            <button
              key={status.value}
              type="button"
              className={`${styles.filterBtn} ${
                statusFilter === status.value ? styles.filterBtnActive : ""
              }`}
              onClick={() => setStatusFilter(status.value)}
            >
              {status.label}
            </button>
          ))}
        </div>

        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search by room name, type, hotel, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading rooms...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className={`${styles.emptyState} ${styles.card}`}>
          <BedDouble size={48} />
          <h3>No Rooms Found</h3>
          <p>No rooms are available in this filter right now.</p>

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
              onDelete={handleDeleteRoom}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <RoomModal
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