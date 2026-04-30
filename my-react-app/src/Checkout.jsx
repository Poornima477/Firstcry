import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Checkout.css";
import { useLocation } from "react-router-dom";

function Checkout() {
  const [products, setProducts] = useState([]);
  

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");

  const location = useLocation();
const cart = location.state?.cartItems || [];
  const navigate = useNavigate();

 
 
  const total = cart.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0
);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      
 const res = await axios.post("https://firstcry-backend1.onrender.com/place-order", {
  fullName,
  phone,
  email,
  address,
  city,
  state: stateName,
  pincode,
  items: cart,
  total,                 
  payment: "pending",
  paymentStatus: "pending",
  orderStatus: "Pending"
});
      
     navigate("/Payment", {
  state: { orderId: res.data.orderId, total, cartItems:cart },
});
    } catch (err) {
      console.log(err);
      alert("Failed to save order. Try again!");
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-left">
        <h2>Checkout</h2>
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h3>Delivery Information</h3>

          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <textarea
            placeholder="Address Line"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="State"
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              required
            />
         

          <input
            type="text"
            placeholder="Pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            required
          />

          <button type="submit" className="place-order-btn">
            Continue to Payment
          </button>
        </form>
      </div>

      <div className="checkout-right">
        <h3>Order Summary</h3>
       {cart.map((item) => (
  <div key={item._id} className="summary-item">
    <div>
      <p className="product-name">{item.name}</p>
      <p>Qty: {item.quantity}</p>
    </div>
    <p>₹ {item.price * item.quantity}</p>
  </div>
))}

        <div className="summary-total">
          <h4>Total</h4>
          <h4>₹ {total}</h4>
        </div>
      </div>
    </div>
  );
}

export default Checkout;