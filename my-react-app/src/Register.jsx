import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

const BASE_URL = "https://firstcry-backend1.onrender.com";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendVerifyOtp = async () => {
    if (!name || !email || !password) {
      alert("Please fill Name, Email and Password first");
      return;
    }
    setLoading(true);
    try {
      // Step 1: Register
      const regRes = await axios.post(`${BASE_URL}/register`, { name, email, password });
      console.log("Register:", regRes.data);

      if (!regRes.data.success) {
        alert(regRes.data.message);
        setLoading(false);
        return;
      }

      // Step 2: Send OTP with detailed logging
      console.log("Calling sendVerifyOtp for:", email);
      const otpRes = await axios.post(`${BASE_URL}/sendVerifyOtp`, { email });
      console.log("SendOTP full response:", otpRes.data); // ← watch this in console

      if (otpRes.data.success) {
        alert("✅ OTP sent to " + email + "! Check inbox and spam.");
        setOtpSent(true);
      } else {
        alert("OTP Failed: " + otpRes.data.message); // ← shows exact error
      }
    } catch (err) {
      console.error("FULL ERROR:", err.response?.data || err.message);
      alert("Error: " + JSON.stringify(err.response?.data || err.message));
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpSent) {
      alert("Please click 'Get OTP' first.");
      return;
    }
    if (!otp.trim()) {
      alert("Please enter the OTP.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/verifyOtp`, { email, otp: otp.trim() });
      console.log("VerifyOTP:", res.data);
      if (res.data.success) {
        alert("🎉 Registered Successfully! Welcome to FirstCry.");
        navigate("/");
      } else {
        alert("❌ " + res.data.message);
      }
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
    setLoading(false);
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

        <div className="form-details">
          <label>Full Name*</label>
          <input type="text" placeholder="Full Name*" value={name}
            onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="form-details">
          <label>Email Id*</label>
          <input type="email" placeholder="Email Id*" value={email}
            onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="form-details">
          <label>Password*</label>
          <input type="password" placeholder="Password*" value={password}
            onChange={(e) => setPassword(e.target.value)} required />
        </div>

        {!otpSent && (
          <div className="form-details">
            <button type="button" className="otp-btn"
              onClick={sendVerifyOtp} disabled={loading}>
              {loading ? "Sending OTP..." : "Get OTP"}
            </button>
          </div>
        )}

        {otpSent && (
          <>
            <p style={{ textAlign: "center", color: "green", fontSize: "13px" }}>
              📧 OTP sent to <strong>{email}</strong> — check inbox & spam
            </p>
            <div className="form-details">
              <label>Enter OTP*</label>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                autoFocus
              />
            </div>
            <p style={{ textAlign: "center", fontSize: "13px", color: "#007bff", cursor: "pointer" }}
              onClick={sendVerifyOtp}>
              🔁 Resend OTP
            </p>
          </>
        )}

        <button className="register" type="submit" disabled={loading || !otpSent}>
          {loading ? "Verifying..." : "Register"}
        </button>
      </div>
    </form>
  );
}

export default Register;