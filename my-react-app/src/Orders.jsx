import { useEffect, useState } from "react";
import axios from "axios";
import "./orders.css";

function Orders() {

  const [orders, setOrders] = useState([]);
  const userEmail = localStorage.getItem("email");
useEffect(() => {

  const fetchOrders = () => {
    axios.get(`https://ecommerce-backend-tc76.onrender.com/my-orders/${userEmail}`)
      .then(res => {
        const filtered = res.data.filter(
          (order) => order.email === userEmail
        );
        setOrders(filtered);
      })
      .catch(err => console.log(err));
  };

  fetchOrders(); // first load

  const interval = setInterval(fetchOrders, 3000); 

  return () => clearInterval(interval);

}, []);

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

                <img
                  src={item.image}  
                  alt=""
                />

                <div>
                  <p>{item.name}</p>
                  <p>₹ {item.price}</p>
                  <p>Qty: {item.quantity}</p>
                  <p>Size: {item.size}</p>
                  <p><strong>Address:</strong> {order.address}, {order.city}, {order.state} - {order.pincode}</p>
                </div>

              </div>
            ))}
          </div>

          <p><strong>Total:</strong> ₹ {order.total}</p>
          <p><strong>Payment:</strong> {order.paymentStatus}</p>

        </div>
      ))}

    </div>
  );
}

export default Orders;