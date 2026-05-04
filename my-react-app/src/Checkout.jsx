import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Checkout.css";

function Checkout() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const cart = location.state?.cartItems || [];

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

 
  if (cart.length === 0) {
    return (
      <div style={{ textAlign: "center", marginTop: "80px" }}>
        <h2>Your cart is empty!</h2>
        <p>Please add items to your cart before checking out.</p>
        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: "20px",
            padding: "10px 30px",
            backgroundColor: "#e91e63",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Go Shopping
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

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

      console.log("Order response:", res.data);

      
      const orderId = res.data._id;

      if (!orderId) {
        alert("Order placed but ID missing. Contact support.");
        return;
      }

      navigate("/Payment", {
        state: { orderId, total, cartItems: cart }
      });

    } catch (err) {
      console.log("Order error:", err);
      alert("Failed to save order. Try again!");
    } finally {
      setLoading(false);
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
            placeholder="Email"
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

          <button type="submit" className="place-order-btn" disabled={loading}>
            {loading ? "Placing Order..." : "Continue to Payment"}
          </button>
        </form>
      </div>

      
      <div className="checkout-right">
        <h3>Order Summary</h3>

        {cart.map((item) => (
          <div key={item._id} className="summary-item">
            <img
              src={item.image}
              alt={item.name}
              style={{
                width: "60px",
                height: "60px",
                objectFit: "cover",
                borderRadius: "6px",
                marginRight: "10px"
              }}
            />
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
