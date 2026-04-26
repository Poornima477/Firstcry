

import { useLocation } from "react-router-dom";
import "./OrderSuccess.css";

function OrderSuccess() {

  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <div className="success-container">

      <div className="success-box">

        <div className="checkmark">✓</div>

        <h2>Order Placed Successfully!</h2>

        <p className="order-id">
          Order ID: {orderId}
        </p>

      </div>

    </div>
  );
}

export default OrderSuccess;
