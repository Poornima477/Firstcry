import { useEffect, useState } from "react";
import axios from "axios";
import "./orders.css";

const BASE_URL = "https://firstcry-backend1.onrender.com";

function Orders() {
  const [orders, setOrders] = useState([]);
  const userEmail = localStorage.getItem("email");

  useEffect(() => {
    const fetchOrders = () => {
      axios.get(`${BASE_URL}/my-orders/${userEmail}`)
        .then(res => {
          const filtered = res.data.filter(
            (order) => order.email === userEmail
          );
          setOrders(filtered);
        })
        .catch(err => console.log(err));
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

 
  const downloadInvoice = (orderId) => {
    window.open(`${BASE_URL}/generate-invoice/${orderId}`, "_blank");
  };

  return (
    <div className="orders">
      <h2>My Orders</h2>
      {orders.length === 0 && <p>No orders found</p>}
      {orders.map((order) => (
        <div key={order._id} className="order-box">
          <p><strong>Order ID:</strong> {order._id}</p>
          <p><strong>Status:</strong> {order.orderStatus}</p>

          <div className="items">
            {order.items.map((item, i) => (
              <div key={i} className="item">
                <img src={item.image} alt="" />
                <div>
                  <p>{item.name}</p>
                  <p>₹ {item.price}</p>
                  <p>Qty: {item.quantity}</p>
                  <p>Size: {item.size}</p>
                  <p>
                    <strong>Address:</strong> {order.address}, {order.city}, {order.state} - {order.pincode}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p><strong>Total:</strong> ₹ {order.total}</p>
          <p><strong>Payment:</strong> {order.paymentStatus}</p>

       
          <button
            onClick={() => downloadInvoice(order._id)}
            style={{
              marginTop: "10px",
              padding: "8px 20px",
              backgroundColor: "#e91e63",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Download GST Invoice
          </button>
        </div>
      ))}
    </div>
  );
}

export default Orders;
