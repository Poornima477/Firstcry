import React, { useState } from "react";
import "./addproducts.css";
import axios from "axios";

const BASE_URL = "https://firstcry-backend1.onrender.com";

function AddProducts() {
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    
    if (selected) {
      setPreview(URL.createObjectURL(selected));
    }
  };

  const addProduct = async () => {
    if (!category || !name || !description || !price || !quantity || !file) {
      alert("Please fill all fields and select an image.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("quantity", quantity);
      formData.append("image", file);

      const response = await axios.post(`${BASE_URL}/add-product`, formData, {
        headers: {
          "Content-Type": "multipart/form-data" 
        }
      });

      console.log("Response:", response.data);

      if (response.data.message === "Product Added Successfully") {
        alert(" Product Added Successfully!");
        console.log("Image URL:", response.data.product.image); 
        
        setCategory("");
        setName("");
        setDescription("");
        setPrice("");
        setQuantity("");
        setFile(null);
        setPreview(null);
      } else {
        alert("Failed: " + response.data.message);
      }

    } catch (error) {
      console.error("FULL ERROR:", error.response?.data || error.message);
      alert("Failed to add product: " + (error.response?.data?.message || error.message));
    }
    setLoading(false);
  };

  return (
    <div className="Products">
      <h3 className="heading">Add Products</h3>

      <div className="list">
        <label>Product Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select Category</option>
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
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="list">
        <label>Add Product Image</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      
        {preview && (
          <img
            src={preview}
            alt="Preview"
            style={{
              width: "150px",
              height: "150px",
              objectFit: "cover",
              marginTop: "10px",
              borderRadius: "8px",
              border: "1px solid #ddd"
            }}
          />
        )}
      </div>

      <div className="list">
        <label>Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="list">
        <label>Product Price</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>

      <div className="list">
        <label>Product Quantity</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>

      <button className="btnn" onClick={addProduct} disabled={loading}>
        {loading ? "Uploading..." : "Add Product"}
      </button>
    </div>
  );
}

export default AddProducts;