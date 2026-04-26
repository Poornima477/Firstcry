import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Productcard.css";
import { useNavigate } from "react-router-dom";

function Productcard(){
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  useEffect(()=>{
    axios.get("https://firstcry-backend.onrender.com/product")
    .then(res=>{
      setProducts(res.data);
    })
    .catch(err=>console.log(err));
  },[]);

  return(
    
    <div className="product_box">

      <div className="row">
        <img src="https://cdn.fcglcdn.com/brainbees/images/boutique/670x670/38715.jpg" />
        <img src="https://cdn.fcglcdn.com/brainbees/images/boutique/670x670/38807.jpg" />
        <img src="https://cdn.fcglcdn.com/brainbees/images/boutique/670x670/38721.jpg" />
      </div>

      <div className="row">
        <img src="https://cdn.fcglcdn.com/brainbees/images/boutique/670x670/38479.jpg" />
        <img src="https://cdn.fcglcdn.com/brainbees/images/boutique/670x670/38833.jpg" />
        <img src="https://cdn.fcglcdn.com/brainbees/images/boutique/670x670/38825.jpg" />
      </div>

      <div className="row">
        <img src="https://cdn.fcglcdn.com/brainbees/images/boutique/670x670/38480.jpg" />
        <img src="https://cdn.fcglcdn.com/brainbees/images/boutique/670x670/38830.jpg" />
        <img src="https://cdn.fcglcdn.com/brainbees/images/boutique/670x670/38831.jpg" />
      </div>

  <div className="products">
     {products.map((product)=>(

      <div className="row" key={product._id}>

      <img src={`https://firstcry-backend.onrender.com/public/images/${product.image}`} alt={product.name}
      onClick={() => navigate(`/product/${product._id}`)}
         style={{ cursor: "pointer" }}
            />
      <div>
        <h3>{product.name}</h3>
          <p>{product.description}</p>
          <p>₹ {product.price}</p>

        </div>
           
        </div>

        ))}

      </div>

    </div>
  )
}

export default Productcard;