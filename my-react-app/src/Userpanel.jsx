import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Userpanel.css";

const BASE_URL = "https://firstcry-backend1.onrender.com";

function Userpanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const userEmail = localStorage.getItem("email");
  const userName  = localStorage.getItem("name");

  useEffect(() => {
    if (!userEmail) {
      navigate("/login");
      return;
    }
    setLoading(true);
    axios.get(`${BASE_URL}/my-orders/${userEmail}`)
      .then(res => setOrders(res.data))
      .catch(err => console.log("Orders fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getStatusClass = (status) => {
    if (status === "Delivered") return "status-delivered";
    if (status === "Cancelled") return "status-cancelled";
    return "status-pending";
  };

  return (
    <div className="userpanel">

      {/* Profile Card */}
      <div className="profile-card">
        <h2>My Profile</h2>
        <p>Email: {userEmail}</p>
        {userName && <p>Name: {userName}</p>}
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      {/* Order History */}
      <div className="order-section">
        <h2>Order History</h2>

        {loading && <p className="loading-text">Loading orders...</p>}

        {!loading && orders.length === 0 && (
          <p className="empty-text">No orders found.</p>
        )}

        {!loading && orders.length > 0 && (
          <table className="order-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Item Name</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>
                    {order.items && order.items.map((item, i) => (
                      <span key={i}>
                        {item.name}{i < order.items.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </td>
                  <td>₹{order.total}</td>
                  <td>
                    <span className={getStatusClass(order.orderStatus)}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-IN")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}

export default Userpanel;
