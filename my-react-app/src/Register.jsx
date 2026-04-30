import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  
  const sendVerifyOtp = () => {
    if (!name || !email || !password) {
      alert("Please fill Name, Email and Password first");
      return;
    }

   
    axios.post("https://firstcry-backend1.onrender.com/register", { name, email, password })
      .then(res => {
        if (res.data.success) {
         
          axios.post("https://firstcry-backend1.onrender.com/sendVerifyOtp", { email })
            .then(res2 => {
              if (res2.data.success) {
                alert("OTP sent to your email! Please check your inbox.");
              } else {
                alert(res2.data.message);
              }
            })
            .catch(err => console.log(err));
        } else {
          alert(res.data.message); 
        }
      })
      .catch(err => console.log(err));
  };

 
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!otp) {
      alert("Please enter the OTP sent to your email");
      return;
    }

    axios.post("https://firstcry-backend1.onrender.com/verifyOtp", { email, otp })
      .then(res => {
        if (res.data.success) {
          alert("Registered Successfully!"); 
          navigate("/");                    
        } else {
          alert(res.data.message);           
        }
      })
      .catch(err => console.log(err));
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
          <input
            type="text"
            placeholder="Full Name*"
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-details">
          <label>Email Id*</label>
          <input
            type="email"
            placeholder="Email Id*"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

       
        <div className="form-details">
          <label>Password*</label>
          <input
            type="password"
            placeholder="Password*"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        
        <div className="form-details">
          <button
            type="button"
            className="otp-btn"
            onClick={sendVerifyOtp}
          >
            Get OTP
          </button>
        </div>

       
        <div className="form-details">
          <label>Enter OTP*</label>
          <input
            type="text"
            placeholder="Enter OTP from email"
            onChange={(e) => setOtp(e.target.value)}
          />
        </div>

    
        <button className="register" type="submit">
          Register
        </button>

      </div>
    </form>
  );
}

export default Register;