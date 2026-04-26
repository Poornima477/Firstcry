import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, {useState} from "react";

import Navbar from "./Navbar";
import Layout from "./Layout";
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";
import Productcard from "./Productcard";
import Admin from "./Admin";
import Dashboard from "./Dashboard";
import Addproducts from "./Addproducts";
import Manageproducts from "./Manageproducts";
import Editproduct from "./Editproduct";
import ProductDetails from "./ProductDetails";
import Cart from "./Cart"
import Checkout from "./Checkout";

import { CartProvider } from "./CartContext";
import OrderSuccess from "./OrderSuccess";
import Payment from "./Payment";
import Manageorder from "./Manageorder";
import Editorder from "./Editorder";
import Search from "./Search";
import USer from "./User";

function App() {

  //const [cart, setCart] = useState([]);

 //const handleClick = (product) => {
  //setCart([...cart, product]);   
 // alert("product added successfully");
//};
  return (
    <CartProvider>
    <BrowserRouter>
      <Routes>

       
        <Route
          path="/"
          element={
            <>
              <Navbar/>
              <Layout />
              <Productcard/>


              
            </>
          }
        >
          <Route index element={<Home />} />
        </Route>
        <Route path="/admin" element={<Admin />} />
        <Route path="/dashboard" element={<Dashboard/>}/>
         <Route path="/Addproducts" element={<Addproducts/>}/>
         <Route path="/Manageproducts" element={<Manageproducts/>}/>
         <Route path="/Editproduct/:id" element={<Editproduct/>}/>
         <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/Cart" element={<Cart/>} />
        <Route path="/Checkout" element={<Checkout/>} />
         <Route path="/Ordersuccess" element={<OrderSuccess/>} />
        <Route path="/Payment" element={<Payment/>} />
         <Route path="/Manageorder" element={<Manageorder/>} />
        <Route path="/search" element={<Search/>} />
        <Route path="/User" element={<User/>} />
          
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/Editorder/:id" element={<Editorder />} />
        
        

      </Routes>
    </BrowserRouter>
    </CartProvider>
  );
}

export default App;