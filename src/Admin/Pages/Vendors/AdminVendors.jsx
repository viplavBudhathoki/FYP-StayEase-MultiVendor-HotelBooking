import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { baseUrl } from "../../../constant";
import styles from "./AdminVendors.module.css";

const AdminVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Admin token missing");

      const form = new FormData();
      form.append("token", token);

      // FIXED PATH: admin -> hotels
      const res = await fetch(`${baseUrl}/hotels/getVendors.php`, {
        method: "POST",
        body: form,
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("API did not return JSON. Check backend path / PHP errors.");
      }

      if (data.success) {
        setVendors(Array.isArray(data.data) ? data.data : []);
      } else {
        toast.error(data.message || "Failed to load vendors");
        setVendors([]);
      }
    } catch (err) {
      toast.error(err.message);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Vendors</h1>
        <p>List of all vendor accounts</p>

        {/* Total Vendors */}
        <p className={styles.countText}>
          Total Vendors: {loading ? "..." : vendors.length}
        </p>
      </div>

      {loading ? (
        <div className={styles.empty}>Loading...</div>
      ) : vendors.length === 0 ? (
        <div className={styles.empty}>No vendors found.</div>
      ) : (
        <div className={styles.card}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Vendor Name</th>
                <th>Email</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.user_id}>
                  <td>{v.user_id}</td>
                  <td>{v.full_name}</td>
                  <td>{v.email}</td>
                  <td>
                    {v.created_at
                      ? new Date(v.created_at).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminVendors;