import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { baseUrl } from "../../../constant";
import styles from "./AdminUsers.module.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Admin token missing");

      const form = new FormData();
      form.append("token", token);

      // FIXED PATH: admin -> hotels
      const res = await fetch(`${baseUrl}/hotels/getUsers.php`, {
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
        setUsers(Array.isArray(data.data) ? data.data : []);
      } else {
        toast.error(data.message || "Failed to load users");
        setUsers([]);
      }
    } catch (err) {
      toast.error(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Users</h1>
        <p>List of all customer accounts</p>

        {/* Total Users */}
        <p className={styles.countText}>
          Total Users: {loading ? "..." : users.length}
        </p>
      </div>

      {loading ? (
        <div className={styles.empty}>Loading...</div>
      ) : users.length === 0 ? (
        <div className={styles.empty}>No users found.</div>
      ) : (
        <div className={styles.card}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>User Name</th>
                <th>Email</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id}>
                  <td>{u.user_id}</td>
                  <td>{u.full_name}</td>
                  <td>{u.email}</td>
                  <td>
                    {u.created_at
                      ? new Date(u.created_at).toLocaleDateString()
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

export default AdminUsers;