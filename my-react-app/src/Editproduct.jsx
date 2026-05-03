import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const BASE_URL = "https://firstcry-backend1.onrender.com";

function Editproduct() {
  const { id } = useParams();

  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [existingImage, setExistingImage] = useState(""); // current image URL from DB
  const [file, setFile] = useState(null);                 // new image file (optional)
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // ── Fetch existing product ──────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${BASE_URL}/product/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setCategory(data.category);
        setName(data.name);
        setDescription(data.description);
        setPrice(data.price);
        setQuantity(data.quantity);
        setExistingImage(data.image || "");   // ← store the Cloudinary URL
      })
      .catch((err) => console.log(err));
  }, [id]);

  // ── Handle new image selection ──────────────────────────────────────────────
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    if (selected) setPreview(URL.createObjectURL(selected));
  };

  // ── Submit update ───────────────────────────────────────────────────────────
  const updateProduct = async () => {
    if (!category || !name || !description || !price || !quantity) {
      alert("Please fill all fields.");
      return;
    }

    setLoading(true);
    try {
      // If user picked a new image → send multipart/form-data (re-uploads to Cloudinary)
      if (file) {
        const formData = new FormData();
        formData.append("category", category);
        formData.append("name", name);
        formData.append("description", description);
        formData.append("price", price);
        formData.append("quantity", quantity);
        formData.append("image", file);

        const response = await axios.put(
          `${BASE_URL}/updateproduct/${id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (response.data.message === "Product Updated Successfully") {
          alert("✅ Product Updated Successfully!");
          setExistingImage(response.data.product?.image || existingImage);
          setFile(null);
          setPreview(null);
        } else {
          alert("Failed: " + response.data.message);
        }
      } else {
        // No new image → send JSON, keep existing Cloudinary URL on the backend
        const response = await axios.put(
          `${BASE_URL}/updateproduct/${id}`,
          { category, name, description, price, quantity }
        );

        if (response.data.message === "Product Updated Successfully") {
          alert("✅ Product Updated Successfully!");
        } else {
          alert("Failed: " + response.data.message);
        }
      }
    } catch (err) {
      console.error("Update error:", err.response?.data || err.message);
      alert("Failed to update: " + (err.response?.data?.message || err.message));
    }
    setLoading(false);
  };

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <div className="Products">
      <h3 className="heading">Edit Product</h3>

      {/* Category */}
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

      {/* Name */}
      <div className="list">
        <label>Product Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* Image */}
      <div className="list">
        <label>Product Image</label>

        {/* Show existing image if no new preview yet */}
        {!preview && existingImage && (
          <div>
            <p style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>
              Current image:
            </p>
            <img
              src={existingImage}
              alt="Current product"
              style={{
                width: "150px",
                height: "150px",
                objectFit: "cover",
                borderRadius: "8px",
                border: "1px solid #ddd",
                marginBottom: "8px",
                display: "block",
              }}
            />
          </div>
        )}

        <input type="file" accept="image/*" onChange={handleFileChange} />
        <p style={{ fontSize: "12px", color: "#aaa", marginTop: "4px" }}>
          Leave blank to keep the current image
        </p>

        {/* Show new image preview */}
        {preview && (
          <img
            src={preview}
            alt="New preview"
            style={{
              width: "150px",
              height: "150px",
              objectFit: "cover",
              marginTop: "10px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              display: "block",
            }}
          />
        )}
      </div>

      {/* Description */}
      <div className="list">
        <label>Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Price */}
      <div className="list">
        <label>Product Price</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>

      {/* Quantity */}
      <div className="list">
        <label>Product Quantity</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>

      <button className="btnn" onClick={updateProduct} disabled={loading}>
        {loading ? "Updating..." : "Update Product"}
      </button>
    </div>
  );
}

export default Editproduct;
