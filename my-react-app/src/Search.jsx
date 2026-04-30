import { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import "./search.css";

function Search() {

  const location = useLocation();
  const navigate = useNavigate();
 

  const query = new URLSearchParams(location.search).get("q");

  console.log("QUERY:", query); 

  const [products, setProducts] = useState([]);
  const [sizes, setSizes] = useState({});

  useEffect(() => {
  if (!query || query.trim() === "") {
    setProducts([]);
    return;
  }

  axios.get(`https://firstcry-backend1.onrender.com/search?q=${query}`)
    .then(res => setProducts(res.data))
    .catch(err => console.log(err));
}, [query]);

  const handleSize = (id, size) => {
    setSizes({ ...sizes, [id]: size });
  };

  const addCart = (product) => {

    const size = sizes[product._id];

    if (!size) {
      alert("Please select size");
      return;
    }

    addToCart({
  _id: product._id,
  name: product.name,
  price: product.price,
  image: product.image,
  size: size,
  quantity: 1
});
  };

  const buyNow = (product) => {

    const size = sizes[product._id];

    if (!size) {
      alert("Please select size");
      return;
    }

    navigate("/checkout", {
      state: {
        product: product,
        size: size,
        quantity: 1
      }
    });
  };

  return (

  <div className="search-container">

    <h2>Search Results for "{query}"</h2>

{products.length === 0 && <p>No products found</p>}

<div className="product-grid">
  {products.map((p) => (
    <div className="product-card" key={p._id}>
      <img
        src={`https://firstcry-backend1.onrender.com/public/images/${p.image}`}
        alt={p.name}
      />
      <h4>{p.name}</h4>
      <p>₹ {p.price}</p>

      <select
        value={sizes[p._id] || ""}
        onChange={(e) => handleSize(p._id, e.target.value)}
      >
        <option value="">Select Size</option>
        <option>S</option>
        <option>M</option>
        <option>L</option>
        <option>XL</option>
      </select>

      <div className="btn-group">
        <button onClick={() => addCart(p)}>Add to Cart</button>
        <button onClick={() => buyNow(p)}>Buy Now</button>
      </div>
    </div>
  ))}
</div>

      </div>

    
  );
}

export default Search;