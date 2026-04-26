import React, { useState } from "react";
import "./addproducts.css";
import axios from "axios";

function AddProducts() {

  const [category,setCategory] = useState("");
  const [name,setName] = useState("");
  const [description,setDescription] = useState("");
  const [price,setPrice] = useState("");
  const [quantity,setQuantity] = useState("");
  const [file, setFile] = useState(null);

  const addProduct = async () => {
  try {
    const formData = new FormData();

    formData.append("category", category);
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("quantity", quantity);
    formData.append("image", file);

    const response = await axios.post(
      "https://firstcry-backend1.onrender.com/add-product",
      formData
    );

   console.log(response.data);
  alert(response.data.message);

  } catch (error) {
    console.log("FULL ERROR:", error.response?.data || error);
    alert("Failed to add product");
  }
};

  return(
    <div className="Products">

      <h3 className="heading">Add Products</h3>

      <div className="list">
        <label>Product Category</label>
        <select onChange={(e)=>setCategory(e.target.value)}>
          <option>Select Category</option>
          <option>BOYS FASHION</option>
          <option>GIRLS FASHION</option>
          <option>FOOTWEAR</option>
          <option>FEEDING</option>
          <option>BATH</option>
          <option>BOOKS</option>
        </select>
      </div>

      <div className="list">
        <label>Product Name</label>
        <input type="text" onChange={(e)=>setName(e.target.value)} />
      </div>

      <div className="list">
        <label>Add Product Image</label>
        <input type="file" onChange={(e)=>setFile(e.target.files[0])}/>
      </div>

      <div className="list">
        <label>Description</label>
        <input type="text" onChange={(e)=>setDescription(e.target.value)} />
      </div>

      <div className="list">
        <label>Product Price</label>
        <input type="number" onChange={(e)=>setPrice(e.target.value)} />
      </div>

      <div className="list">
        <label>Product Quantity</label>
        <input type="number" onChange={(e)=>setQuantity(e.target.value)} />
      </div>

      <button className="btnn" onClick={addProduct}>
        Add Product
      </button>

    </div>
  );
}

export default AddProducts;