import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./login.css";

function Admin() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post("https://firstcry-backend1.onrender.com/login", {
      email,
      password
    })
    .then(() => {

      if (email === "poorna@gmail.com" && password === "poorna123") {
        navigate("/dashboard");
      } else {
        alert("Invalid admin credentials");
      }

    })
    .catch(err => console.log(err));
  };

  return (
    <form onSubmit={handleSubmit} className="form-wrapper">
      <div className="card">
        <h3 className="title">Admin Login Page</h3>

        <div className="form-details">
          
  <label>Email</label>
      <input type="email" placeholder="Enter your Email" value={email} onChange={(e) => setEmail(e.target.value)}
          />

  <label>Password</label>
    <input type="password" placeholder="Enter your Password" value={password} onChange={(e) => setPassword(e.target.value)}/>

  <button type="submit" className="btn">
            Submit
          </button>     
        </div>
      </div>
    </form>
  );
}
export default Admin;