import { createContext, useState } from "react";

// ✅ Create Context
export const CartContext = createContext();

// ✅ Provider Component
export const CartProvider = ({ children }) => {

  const [cart, setCart] = useState([]);

  // ✅ Add to Cart
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product._id);

    if (existingItem) {
      const updatedCart = cart.map(item =>
        item.id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          id: product._id,   // important for your Checkout
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
          size: "M" // default size
        }
      ]);
    }
  };

  // ✅ Remove from Cart
  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // ✅ Clear Cart
  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{
      cart,
      setCart,
      addToCart,
      removeFromCart,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;