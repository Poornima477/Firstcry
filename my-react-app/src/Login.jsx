import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";

const BASE_URL = "https://firstcry-backend1.onrender.com";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/login`, { email, password });
      console.log("Login response:", res.data);

      if (res.data.success) {
        alert("✅ Login Successful! Welcome back.");
        navigate("/");
      } else {
        alert("❌ " + res.data.message);
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      alert("Error: " + (err.response?.data?.message || err.message));
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="form-wrapper">
      <div className="card">
        <h3 className="title">Log In/Register</h3>
        <div className="form-details">

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Logging in..." : "Continue"}
          </button>

          <p className="register-text">
            New to FirstCry?{" "}<Link to="/signup">Register Here</Link>
          </p>

          <div className="divider">
            <span>Or log-in with</span>
          </div>

          <div className="google">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png"
              alt="Google"
            />
          </div>

          <p className="terms">
            By continuing, you agree to FirstCry's
            <a href="#"> Terms of Use</a> and <a href="#"> Privacy Policy</a>
          </p>

          <p className="admin">
            Are you Admin? <Link to="/Admin">Login here</Link>
          </p>

        </div>
      </div>
    </form>
  );
}

export default Login;