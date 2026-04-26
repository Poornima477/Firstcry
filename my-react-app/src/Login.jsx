import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post("https://firstcry-backend.onrender.com/login", {
      email,
      password
    })
    .then(result => {
      alert(result.data);

      if (result.data === "Login successful") {
        alert("Login suessfully")
        navigate("/");
      }
    })
    .catch(err => console.log(err));
  };

  return (
    <form onSubmit={handleSubmit} className="form-wrapper">
    <div className="card">
      <h3 className="title">Log In/Register</h3>

       <div className="form-details">
          
  <label>Email</label>
        <input type="email" placeholder="Enter your Email" value={email} onChange={(e) => setEmail(e.target.value)}
         />
  <label>Password</label>
        <input type="password" placeholder="Enter your Password" value={password} onChange={(e) => setPassword(e.target.value)}
          />

  <button type="submit" className="btn">
            Continue
  </button>
       
<p className="register-text">
   New to FirstCry?{" "} <Link to="/signup">Register Here</Link>
</p>

 <div className="divider">
  <span>Or log-in with</span>
 </div>
         
 <div className="google">
   <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png" alt="Google"/>
  </div>      

  <p className="terms"> By continuing, you agree to FirstCry's<a href="#"> Terms of Use</a> and
            <a href="#"> Privacy Policy</a>
   </p>
  <p className="admin">
   Are you Admin? 
  <Link to="/Admin">Login here</Link>
</p>
      
 </div>
</div> </form>
  );
}

export default Login;