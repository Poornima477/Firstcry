
import React, {useState, useEffect} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";

  
function Manageproducts (){

 const navigate = useNavigate();
const [products, setProducts] = useState([]);

useEffect(() => {
 axios.get("https://firstcry-backend.onrender.com/product")
 .then(res => {
   console.log(res.data);
   setProducts(res.data);
 })
 .catch(err => console.log(err));
}, []);

const deleteProduct = (id) => {
  axios.delete(`https://firstcry-backend.onrender.com/delete-product/${id}`)
.then (() => {
  alert ("product deleted");
  setProducts(products.filter(product => product._id !== id));
})
.catch(err => console.log(err))
}

return(
  <div className="table">
  <table border="1" width="50%">
   <thead>
   <tr>
   <th>Category</th>
    <th>Name</th>
    <th>Image</th>
    <th>Description</th>
    <th>Price</th>
    <th>Quantity</th>
    
    </tr>
    </thead>

    <tbody>
    {products.map((product, index) => 
    <tr key={index}>
      <td>{product.category}</td>
      <td>{product.name}</td>
      <td>
    <img src={`https://firstcry-backend.onrender.com/public/images/${product.image}`} width="80" />
    </td>
      <td>{product.description}</td>
      <td>{product.price}</td>
      <td>{product.quantity}</td>

      <td>
       <button onClick={() => deleteProduct(product._id
    )}>Delete</button>
        </td>
        <td>
        <button onClick = {() => navigate (`/editproduct/${product._id}`)}>
                Edit
        </button>
            </td>
          </tr>
          )}
        </tbody>
      </table>

    </div>
  );
}
export default Manageproducts;