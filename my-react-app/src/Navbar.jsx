
import {Link} from "react-router-dom";
import {useState} from "react";
import "./Navbar.css";
import { FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Navbar(){
const navigate = useNavigate();
const [search , setSearch] = useState("");

const handleSearch = (e) => {
  if (e.key === "Enter") {
    navigate(`/search?q=${search}`);
  }
};

  return(
    <> 
    <div className="container">
    <div className="navbar">
      <div className="firstcry">
        <img src="https://cdn.fcglcdn.com/brainbees/images/n/fc_logo.png"/>
        <input className="searchbar"  type="text" placeholder="Search for a Category,Brand or Product" onChange={(e) => setSearch(e.target.value)} onKeyDown={handleSearch} ></input>
  

      <div className="sidebar">
        <ul>
          <li>
             Select location</li>
          <li>Store and Preschool</li>
          <li>Support</li>
          <li>Track order</li>
          <li>FirstCry parenting </li>
          <li>
            <Link to="/login">Login/</Link>
            <Link to="/register">Register</Link>
            </li>
          <li>Shortlist</li>
          <li className="cartt">
  <FaShoppingCart className="cartt-icon" />
  <Link to="/cart">Cart</Link>
</li>
          
        </ul>
      </div>
          </div>

    



    </div>
    </div>

    </>
  );
}
export default Navbar;