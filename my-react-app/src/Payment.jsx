import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Payment.css";

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const [method, setMethod] = useState("cod");
  const [total, setTotal]   = useState(0);
  const [loading, setLoading] = useState(false);

  const orderIdRef = useRef("");
  const emailRef   = useRef("");
  useEffect(() => {
    if (location.state?.orderId && location.state?.total) {
      orderIdRef.current = location.state.orderId;
      emailRef.current   = location.state.email || "";
      setTotal(location.state.total);
    } else {
      navigate("/checkout");
    }
  }, [location.state]);

  
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script   = document.createElement("script");
      script.src     = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload  = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      setLoading(true);

      const currentOrderId = orderIdRef.current;
      const currentEmail   = emailRef.current;

      if (!currentOrderId) {
        alert("Order not found. Please go back and try again.");
        setLoading(false);
        return;
      }


      if (method === "cod") {
        await axios.put(
          `https://firstcry-backend1.onrender.com/update-payment/${currentOrderId}`,
          { paymentMethod: "cod", status: "pending" }
        );
        setLoading(false);
       
        navigate("/OrderSuccess", {
          state: {
            orderId:       currentOrderId,
            email:         currentEmail,
            paymentMethod: "cod",
          },
        });
        return;
      }

     
      if (!total || total <= 0) {
        alert("Invalid amount.");
        setLoading(false);
        return;
      }

      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        alert("Razorpay failed to load. Check your internet connection.");
        setLoading(false);
        return;
      }

     
      const res = await axios.post(
        "https://firstcry-backend1.onrender.com/create-razorpay-order",
        { amount: total }
      );

      const razorpayOrder = res.data;
      if (!razorpayOrder || !razorpayOrder.id) {
        alert("Failed to create payment order. Try again.");
        setLoading(false);
        return;
      }

      const options = {
        key:         "rzp_test_Sl9YxuH6BbxZEs",
        amount:      razorpayOrder.amount,
        currency:    "INR",
        order_id:    razorpayOrder.id,
        name:        "FirstCry",
        description: "Order Payment",

       
        handler: async function (response) {
          try {
            console.log("Razorpay response:", response);
            console.log("Sending orderId:", currentOrderId);

            const verifyRes = await axios.post(
              "https://firstcry-backend1.onrender.com/verify-payment",
              {
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                orderId:             currentOrderId,
              }
            );

            console.log("Verify response:", verifyRes.data);

            if (verifyRes.data.success) {
              
              navigate("/OrderSuccess", {
                state: {
                  orderId:       currentOrderId,
                  email:         currentEmail,
                  paymentMethod: "online",
                },
              });
            } else {
              alert("Payment verification failed: " + verifyRes.data.message);
            }
          } catch (err) {
            console.log("Verify error:", err.response?.data || err.message);
            alert("Verification error: " + (err.response?.data?.message || err.message));
          } finally {
            setLoading(false);
          }
        },

        prefill: {
          contact: "",
          email:   currentEmail,
        },

        theme: { color: "#e91e63" },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        console.log("Payment failed:", response.error);
        alert("Payment failed: " + response.error.description);
        setLoading(false);
      });

      rzp.open();
      setLoading(false);

    } catch (err) {
      console.log("Payment error:", err.response?.data || err.message);
      alert("Payment error: " + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-box">
        <h2>Payment</h2>
        <p className="payment-amount">₹ {total}</p>

        <label className="payment-option">
          <input
            type="radio"
            checked={method === "cod"}
            onChange={() => setMethod("cod")}
          />
          Cash on Delivery
        </label>

        <label className="payment-option">
          <input
            type="radio"
            checked={method === "online"}
            onChange={() => setMethod("online")}
          />
          Online Payment
        </label>

        <button className="pay-btn" onClick={handlePayment} disabled={loading}>
          {loading ? "Processing..." : "Confirm & Pay"}
        </button>
      </div>
    </div>
  );
}

export default Payment;
