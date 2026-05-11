import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ManageOrder.css";

const BASE_URL = "https://firstcry-backend1.onrender.com";

function Manageorder() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  const fetchOrders = () => {
    axios.get(BASE_URL + "/order")
      .then(res => setOrders(res.data))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const deleteOrder = (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    axios.delete(`${BASE_URL}/order/${id}`)
      .then(() => {
        alert("Order deleted!");
        fetchOrders();
      })
      .catch(err => {
        console.log(err);
        alert("Delete failed!");
      });
  };

  const getStatusClass = (status) => {
    if (status === "Delivered") return "status-delivered";
    if (status === "Cancelled") return "status-cancelled";
    if (status === "Shipped")   return "status-shipped";
    return "status-pending";
  };

  return (
    <div className="mo-wrapper">
      <h2 className="mo-title">Manage Orders</h2>

      <table className="mo-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                No orders found
              </td>
            </tr>
          )}
          {orders.map((order) => (
            <tr key={order._id}>
              <td>#{order._id.slice(-6).toUpperCase()}</td>
              <td>{order.fullName}</td>
              <td>{order.phone}</td>
              <td>{order.address}, {order.city}</td>
              <td>₹{order.total}</td>
              <td>
                <span className={getStatusClass(order.orderStatus)}>
                  {order.orderStatus}
                </span>
              </td>
              <td>
                <button
                  className="btn-edit"
                  onClick={() => navigate(`/Editorder/${order._id}`)}
                >
                  Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => deleteOrder(order._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Manageorder;