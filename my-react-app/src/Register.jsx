import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

function Register() {
  const[name,setName] = useState("");
  const[email,setEmail]=useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate()
  const [otp, setOtp] = useState("");
  const handleSubmit = (e) => {
  e.preventDefault();
  axios.post("https://firstcry-backend.onrender.com/register", { name, email, password })
    .then(res => {
      if (res.data.success) {
        alert("Registered! Sending OTP...");
        sendVerifyOtp(); 
      } else {
        alert(res.data.message);
      }
    })
    .catch(err => console.log(err));
};

 
  const sendVerifyOtp = () => {
  console.log("Send OTP clicked");

  if (!email) {
    alert("Please enter email first");
    return;
  }

  axios.post("https://firstcry-backend.onrender.com/sendVerifyOtp", { email })
    .then(res => {
      if (res.data.success) {
        alert("OTP sent to email");
      } else {
        alert(res.data.message);
      }
    })
    .catch(err => {
      console.log(err);
    });
};


  const verifyOtp = () => {
  axios.post("https://firstcry-backend.onrender.com/verifyOtp", { email, otp })
  .then(res => {
   if (res.data.success) {
   alert("Email verified successfully");
    navigate("/login");
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
        <input type="text" placeholder="Full Name*" 
        onChange={(e)=>setName(e.target.value)}
       
        />
      </div>

      <div className="form-details">
        <label>Email Id*</label>
        <input type="email" placeholder="Email Id*"
          onChange={(e)=>setEmail(e.target.value)}
    
        />
      </div>

    <div className="form-details">
        <label>Password*</label>
        <input type="password" placeholder="password*"
          onChange={(e)=>setPassword(e.target.value)}
    
        />
      </div>


        <div className="form-details">
          <button type="button" className="otp-btn" onClick={sendVerifyOtp}>Get OTP</button>
          
        </div>

        <div className="form-details">
          <label>Enter OTP</label>
          <input type="text" placeholder="OTP" onChange={e => setOtp(e.target.value)} />
          <button type="button" onClick={verifyOtp}>Verify OTP</button>
        </div>

        <button className="register">Register</button>
      </div>
    </form>
  );
}

export default Register;
