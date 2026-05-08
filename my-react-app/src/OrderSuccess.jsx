import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./OrderSuccess.css";

function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const orderId       = location.state?.orderId;
  const email         = location.state?.email;
  const paymentMethod = location.state?.paymentMethod; // "cod" or "online"

  const [show, setShow] = useState(false);

  useEffect(() => {
   
    setTimeout(() => setShow(true), 100);

    
    if (!orderId) {
      navigate("/");
    }
  }, []);

  return (
    <div className="success-container">
      <div className={`success-box ${show ? "show" : ""}`}>

       }
        <div className="checkmark-circle">
          <div className="checkmark">✓</div>
        </div>

        <h2>Order Placed Successfully!</h2>

        <p className="order-id">
          Order ID: <strong>{orderId}</strong>
        </p>

      
        <div className={`payment-badge ${paymentMethod === "online" ? "online" : "cod"}`}>
          {paymentMethod === "online" ? "Paid Online" : "Cash on Delivery"}
        </div>

       
        {email && (
          <div className="invoice-msg">
            <span className="mail-icon"></span>
            <p>
              Invoice has been sent to<br />
              <strong>{email}</strong>
            </p>
          </div>
        )}

        <p className="thankyou-text">
          Thank you for shopping with <span className="brand">FirstCry</span>!
        </p>

        <div className="success-actions">
          <button className="btn-orders" onClick={() => navigate("/my-orders")}>
            View My Orders
          </button>
          <button className="btn-home" onClick={() => navigate("/")}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
