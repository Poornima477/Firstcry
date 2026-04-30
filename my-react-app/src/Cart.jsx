import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import "./Cart.css";


function Cart() {

  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    axios.get("https://firstcry-backend1.onrender.com/cart")
      .then(res => setCartItems(res.data))
      .catch(err => console.log(err));
  }, []);

  
  const updateCart = async (item) => {
    try {
      await axios.post("https://firstcry-backend1.onrender.com/cart", {
        name: item.name,
        price: item.price,
        image: item.image
      });


      const res = await axios.get("https://firstcry-backend1.onrender.com/cart");
      setCartItems(res.data);

    } catch (err) {
      console.log(err);
    }
  };

const increaseQty = async (index) => {
  const updated = [...cartItems];
  updated[index].quantity += 1;

  await axios.put(`https://firstcry-backend1.onrender.com/cart/${updated[index]._id}`, {
    quantity: updated[index].quantity
  });

  setCartItems(updated);
};

  const decreaseQty = async (index) => {
    let updated = [...cartItems];

    if (updated[index].quantity > 1) {
      updated[index].quantity -= 1;

      await axios.put(`https://firstcry-backend1.onrender.com/cart/${updated[index]._id}`, {
        quantity: updated[index].quantity
      });

    } else {
      await axios.delete(`https://firstcry-backend1.onrender.com/cart/${updated[index]._id}`);
    }

    const res = await axios.get("https://firstcry-backend1.onrender.com/cart");
    setCartItems(res.data);
  };

  const removeItem = async (index) => {
    await axios.delete(`https://firstcry-backend1.onrender.com/cart/${cartItems[index]._id}`);

    const res = await axios.get("https://firstcry-backend1.onrender.com/cart");
    setCartItems(res.data);
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

 const handleCheckout = () => {
  navigate("/checkout", {
    state: { cartItems }
  });
};

  return (
  <>
  <div className="cart-container">

  <h2 className="cart-title">Your Cart</h2>
    {cartItems.length === 0 ? (
      <p className="cart-empty">No items in cart</p>
        ) : (
   <>
  <div className="cart-list">

    {cartItems.map((item, index) => (

      <div className="cart-card" key={index}>

        <img className="image" src={`https://firstcry-backend1.onrender.com/public/images/${item.image}`}
                  />

      <div className="cart-details">
        <h3>{item.name}</h3>
        <p>₹ {item.price}</p>

        <div className="qty-controls">
          <button onClick={() => decreaseQty(index)}>-</button>
        <span>{item.quantity}</span>
        <button onClick={() => increaseQty(index)}>+</button>
       </div>
    </div>

   <button className="btns" onClick={() => removeItem(index)}>  Remove</button>
  <button className="buy-btn" onClick={handleCheckout}>Buy Now</button>
 </div>
))}
  </div>

   <div className="cart-summary">
     <h3>Total: ₹ {totalPrice}</h3>
      <button className="buy-btn" onClick={handleCheckout}>Buy Now</button>
            </div>
          </>
        )}

      </div>
    </>
  );
}

export default Cart;