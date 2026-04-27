import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false); // ✅ controls OTP field visibility
  const navigate = useNavigate();

  const sendVerifyOtp = () => {
    axios.post("https://firstcry-backend1.onrender.com/sendVerifyOtp", { email })
      .then(res => {
        if (res.data.success) {
          alert("OTP sent to your email!");
          setOtpSent(true); // ✅ show OTP field after sending
        } else {
          alert(res.data.message);
        }
      })
      .catch(err => console.log(err));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!otpSent) {
      // Step 1: Register and send OTP
      axios.post("https://firstcry-backend1.onrender.com/register", { name, email, password })
        .then(res => {
          if (res.data.success) {
            alert("Registered! Sending OTP to your email...");
            sendVerifyOtp();
          } else {
            alert(res.data.message);
          }
        })
        .catch(err => console.log(err));
    } else {
      // Step 2: Verify OTP and redirect to home
      axios.post("https://firstcry-backend1.onrender.com/verifyOtp", { email, otp })
        .then(res => {
          if (res.data.success) {
            alert("Email verified successfully!");
            navigate("/"); // ✅ redirect to home
          } else {
            alert(res.data.message);
          }
        })
        .catch(err => console.log(err));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-wrapper">
      <div className="form-card">
        <img
          className="img"
          src="https://cdn.fcglcdn.com/brainbees/images/m/login_revamp_banner_mobile.jpg"
          alt="Register Banner"
        />
        <h3 className="title">Register</h3>

        {/* Hide these fields after OTP is sent */}
        {!otpSent && (
          <>
            <div className="form-details">
              <label>Full Name*</label>
              <input
                type="text"
                placeholder="Full Name*"
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-details">
              <label>Email Id*</label>
              <input
                type="email"
                placeholder="Email Id*"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-details">
              <label>Password*</label>
              <input
                type="password"
                placeholder="Password*"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </>
        )}

        {/* Show OTP field only after OTP is sent */}
        {otpSent && (
          <div className="form-details">
            <label>Enter OTP sent to {email}</label>
            <input
              type="text"
              placeholder="Enter OTP"
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
        )}

        {/* Button changes label based on state */}
        <button className="register" type="submit">
          {otpSent ? "Verify OTP & Continue" : "Register & Send OTP"}
        </button>
      </div>
    </form>
  );
}

export default Register;