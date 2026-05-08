import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Payment.css";

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const [method, setMethod] = useState("cod");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const orderIdRef = useRef("");
  const emailRef = useRef("");

  useEffect(() => {
    if (location.state?.orderId && location.state?.total) {
      orderIdRef.current = location.state.orderId;
      emailRef.current = location.state.email || "";
      setTotal(location.state.total);
    } else {
      navigate("/checkout");
    }
  }, [location.state, navigate]);

  // Load Razorpay Script
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      setLoading(true);

      const currentOrderId = orderIdRef.current;
      const currentEmail = emailRef.current;

      if (!currentOrderId) {
        alert("Order not found.");
        setLoading(false);
        return;
      }

      if (method === "cod") {
        await axios.put(
          `https://firstcry-backend1.onrender.com/update-payment/${currentOrderId}`,
          {
            paymentMethod: "cod",
            status: "pending",
          }
        );

        navigate("/OrderSuccess", {
          state: {
            orderId: currentOrderId,
            email: currentEmail,
            paymentMethod: "cod",
          },
        });

        setLoading(false);
        return;
      }


      if (!total || total <= 0) {
        alert("Invalid amount");
        setLoading(false);
        return;
      }

      const isLoaded = await loadRazorpay();

      if (!isLoaded) {
        alert("Razorpay SDK failed to load.");
        setLoading(false);
        return;
      }

      // Create Razorpay Order
      const res = await axios.post(
        "https://firstcry-backend1.onrender.com/create-razorpay-order",
        { amount: total }
      );

      const razorpayOrder = res.data;

      const options = {
        key: "rzp_test_Sl9YxuH6BbxZEs",
        amount: razorpayOrder.amount,
        currency: "INR",
        order_id: razorpayOrder.id,
        name: "FirstCry",
        description: "Order Payment",

      
        handler: async function (response) {
          try {
            console.log("Payment Success:", response);

            // Directly update payment
            const updateRes = await axios.put(
              `https://firstcry-backend1.onrender.com/update-payment/${currentOrderId}`,
              {
                paymentMethod: "online",
                status: "paid",
                paymentId: response.razorpay_payment_id,
              }
            );

            console.log(updateRes.data);

            navigate("/OrderSuccess", {
              state: {
                orderId: currentOrderId,
                email: currentEmail,
                paymentMethod: "online",
              },
            });
          } catch (err) {
            console.log("Update payment error:", err);
            alert(
              "Payment successful but order update failed."
            );
          } finally {
            setLoading(false);
          }
        },

        prefill: {
          email: currentEmail,
          contact: "",
        },

        theme: {
          color: "#e91e63",
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        console.log(response.error);

        alert(
          "Payment Failed: " + response.error.description
        );

        setLoading(false);
      });

      rzp.open();

    } catch (err) {
      console.log("Payment Error:", err.response?.data || err.message);

      alert(
        "Payment Error: " +
          (err.response?.data?.message || err.message)
      );

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

        <button
          className="pay-btn"
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? "Processing..." : "Confirm & Pay"}
        </button>
      </div>
    </div>
  );
}

export default Payment;