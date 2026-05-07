import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ManageUser.css";

const BASE_URL = "https://firstcry-backend1.onrender.com";

function ManageUser() {
  const [users, setUsers]     = useState([]);
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(BASE_URL + "/users");
      setUsers(res.data.users);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const handleBlock = async (id) => {
    try {
      await axios.put(`${BASE_URL}/users/block/${id}`);
      fetchUsers(); // refresh
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${BASE_URL}/users/delete/${id}`);
      fetchUsers(); // refresh
    } catch (err) {
      console.log(err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day:    "numeric",
      month:  "numeric",
      year:   "numeric",
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-IN", {
      day:    "numeric",
      month:  "numeric",
      year:   "numeric",
      hour:   "2-digit",
      minute: "2-digit",
    });
  };

  // filter by email search
  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mu-wrapper">
      <div className="mu-box">
        <h2 className="mu-title">Manage Users</h2>

        {/* Search */}
        <input
          className="mu-search"
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading && <p className="mu-loading">Loading users...</p>}

        {/* Table */}
        <table className="mu-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Joined On</th>
              <th>Last Active</th>
              <th>Total Orders</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                  No users found
                </td>
              </tr>
            )}
            {filtered.map((user) => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <span className={user.isActive ? "status-active" : "status-inactive"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>{formatDate(user.joinedOn)}</td>
                <td>{formatDateTime(user.lastActive)}</td>
                <td>{user.totalOrders}</td>
                <td>
                  <button
                    className="btn-block"
                    onClick={() => handleBlock(user._id)}
                  >
                    {user.isActive ? "Block" : "Unblock"}
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(user._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageUser;