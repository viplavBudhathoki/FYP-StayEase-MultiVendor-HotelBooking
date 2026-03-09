import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { baseUrl } from "../../constant";

const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getHotelImage = (img) => {
    if (!img) return `${baseUrl}/uploads/hotels/placeholder.png`;
    return `${baseUrl}/${img}`;
  };

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/hotels/getPublicHotels.php`);
      const data = await res.json();

      if (data.success) {
        setHotels(Array.isArray(data.data) ? data.data : []);
      } else {
        toast.error(data.message || "Failed to load hotels");
      }
    } catch (err) {
      toast.error("Failed to load hotels");
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  if (loading) return <div style={{ padding: "120px 30px" }}>Loading hotels...</div>;

  return (
    <div style={{ padding: "120px 30px 40px" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>All Hotels</h1>

      {hotels.length === 0 ? (
        <p>No hotels available right now.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {hotels.map((hotel) => (
            <div
              key={hotel.hotel_id}
              onClick={() => navigate(`/hotels/${hotel.hotel_id}/rooms`)}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                overflow: "hidden",
                cursor: "pointer",
                background: "#fff",
              }}
            >
              <img
                src={getHotelImage(hotel.image_url)}
                alt={hotel.name}
                style={{ width: "100%", height: "220px", objectFit: "cover" }}
                onError={(e) => {
                  e.currentTarget.src = `${baseUrl}/uploads/hotels/placeholder.png`;
                }}
              />

              <div style={{ padding: "16px" }}>
                <h2 style={{ margin: "0 0 8px", fontSize: "1.2rem" }}>{hotel.name}</h2>
                <p style={{ margin: "0 0 8px", color: "#64748b" }}>{hotel.location}</p>
                <p style={{ margin: 0, color: "#475569" }}>
                  {hotel.description || "No description available."}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Hotels;