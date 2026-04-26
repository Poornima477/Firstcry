import React from "react";
import "./Dashboard.css";
import { Link } from "react-router-dom";

function Dashboard(){
return(
  <div className="dashboard">
    <h3>Dashboard</h3>
    <button className="bttn">
     <Link to="/Addproducts">Add Product</Link>
     </button>

  <br></br>
  <button className="bttn">
    <Link to="/Manageproducts">Manage Product</Link>
  </button>
        
  <br></br>
  <button className="bttn">Orders</button>
  <br></br>
  <button className="bttn">
  <Link to="/Manageorder">Manage orders</Link></button>
  <br></br>
   <button className="bttn">
  <Link to="/Users">Users</Link></button>
    </div>
      
    

  );
}
export default Dashboard;