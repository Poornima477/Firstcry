import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function ProductDetails() {

  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {

      const res = await axios.get(`https://firstcry-backend.onrender.com/product/${id}`);
      setProduct(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  const addToCart = async () => {
  try {
    await axios.post("https://firstcry-backend.onrender.com/cart", {
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });

    alert("Added to cart");
  } catch (error) {
    console.log(error);
  }
};

 if (product === null) {
    return <h2>Loading...</h2>;
  }

  return (
    <>
    
     
    <div style={{ textAlign: "center", marginTop: "30px" }}>

      <img
        src={`https://firstcry-backend.onrender.com/public/images/${product.image}`}
        width="400"
        alt=""
      />

      <h2>{product.name}</h2>

      <br />

      <p>
        {product.description}</p>

      <h3>₹ {product.price}</h3>

     
      <button className="btns"
        onClick={addToCart}
        
      >
        Add to Cart
      </button>

    </div>
    </>
  );
}

export default ProductDetails;