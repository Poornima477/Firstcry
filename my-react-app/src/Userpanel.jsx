import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Userpanel.css";

const BASE_URL = "https://firstcry-backend1.onrender.com";

function Userpanel() {
  const [activeTab, setActiveTab] = useState("profile");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [address, setAddress] = useState({ line: "", city: "", state: "", pincode: "" });
  const [addressSaved, setAddressSaved] = useState(false);
  const navigate = useNavigate();

  const userEmail = localStorage.getItem("email");
  const userName  = localStorage.getItem("name");

 
  useEffect(() => {
    if (!userEmail) {
      navigate("/login");
    } else {
      setProfile({
        name:  userName || "",
        email: userEmail,
        phone: localStorage.getItem("phone") || ""
      });
    }
  }, []);

 
  useEffect(() => {
    const saved = localStorage.getItem("savedAddress");
    if (saved) setAddress(JSON.parse(saved));
  }, []);

  
  useEffect(() => {
    if (activeTab === "orders" && userEmail) {
      setOrdersLoading(true);
      axios.get(`${BASE_URL}/my-orders/${userEmail}`)
        .then(res => setOrders(res.data))
        .catch(err => console.log("Orders fetch error:", err))
        .finally(() => setOrdersLoading(false));
    }
  }, [activeTab]);

  const downloadInvoice = (orderId) => {
    window.open(`${BASE_URL}/generate-invoice/${orderId}`, "_blank");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleSaveProfile = () => {
    localStorage.setItem("name", profile.name);
    localStorage.setItem("phone", profile.phone);
    alert("Profile updated!");
  };

  const handleSaveAddress = () => {
    localStorage.setItem("savedAddress", JSON.stringify(address));
    setAddressSaved(true);
    setTimeout(() => setAddressSaved(false), 2000);
  };

  const getStatusClass = (status) => {
    if (status === "Delivered") return "status-delivered";
    if (status === "Cancelled") return "status-cancelled";
    return "status-pending";
  };

  return (
  <div className="userpanel">
  <div className="up-sidebar">
  <div className="up-avatar">
  <div className="up-avatar-circle">
  {(userName || "U")[0].toUpperCase()}
  </div>
  <p className="up-name">{userName || "User"}</p>
  <p className="up-email">{userEmail}</p>
   </div>

  <ul className="up-menu">
    <li className={activeTab === "profile" ? "active" : ""}
      onClick={() => setActiveTab("profile")} >
            My Profile
          </li>
          <li
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => setActiveTab("orders")}
          >
            My Orders
          </li>
          <li
            className={activeTab === "address" ? "active" : ""}
            onClick={() => setActiveTab("address")}
          >
           My Address
          </li>
          <li onClick={handleLogout} className="up-logout">
             Logout
          </li>
        </ul>
      </div>

     
      <div className="up-content">

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="up-card">
            <h2>My Profile</h2>
            <div className="up-form">
              <label>Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />

              <label>Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                style={{ background: "#f5f5f5", cursor: "not-allowed" }}
              />

              <label>Phone Number</label>
              <input
                type="text"
                placeholder="Enter phone number"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />

              <button className="up-btn" onClick={handleSaveProfile}>
                Save Profile
              </button>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="up-card">
            <h2>My Orders</h2>

            {ordersLoading && <p className="up-empty">Loading orders...</p>}

            {!ordersLoading && orders.length === 0 && (
              <p className="up-empty">No orders found.</p>
            )}

            {!ordersLoading && orders.map((order) => (
              <div key={order._id} className="up-order-box">

                <div className="up-order-header">
                  <span><strong>Order ID:</strong> #{order._id.slice(-6).toUpperCase()}</span>
                  <span className={`up-status ${getStatusClass(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </div>

                <div className="up-order-items">
                  {order.items && order.items.map((item, i) => (
                    <div key={i} className="up-order-item">
                      {/* ✅ item.image is a full Cloudinary URL */}
                      <img
                        src={item.image}
                        alt={item.name}
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                      <div>
                        <p className="up-item-name">{item.name}</p>
                        <p>Qty: {item.quantity}</p>
                        <p>₹ {item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="up-order-footer">
                  <p><strong>Total:</strong> ₹ {order.total}</p>
                  <p><strong>Payment:</strong> {order.paymentStatus}</p>
                  <p>
                    <strong>Address:</strong> {order.address}, {order.city}, {order.state} - {order.pincode}
                  </p>
                  <p>
                    <strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </p>
                  <button
                    className="up-invoice-btn"
                    onClick={() => downloadInvoice(order._id)}
                  >
                    Download GST Invoice
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Address Tab */}
        {activeTab === "address" && (
          <div className="up-card">
            <h2>My Address</h2>
            <div className="up-form">
              <label>Address Line</label>
              <textarea
                placeholder="House No, Street, Area"
                value={address.line}
                onChange={(e) => setAddress({ ...address, line: e.target.value })}
                rows={3}
              />

              <label>City</label>
              <input
                type="text"
                placeholder="City"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
              />

              <label>State</label>
              <input
                type="text"
                placeholder="State"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
              />

              <label>Pincode</label>
              <input
                type="text"
                placeholder="Pincode"
                value={address.pincode}
                onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
              />

              <button className="up-btn" onClick={handleSaveAddress}>
                Save Address
              </button>
              {addressSaved && (
                <p style={{ color: "green", marginTop: "8px" }}>
                  ✅ Address saved successfully!
                </p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Userpanel;
