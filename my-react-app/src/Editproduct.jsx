
import React, {useState, useEffect} from "react";
import { useParams } from "react-router-dom";

function Editproduct() {
const { id } = useParams();


  const [category,setCategory] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity,setQuantity] = useState("");

  
useEffect(()=>{
  fetch(`https://firstcry-backend1.onrender.com/product/${id}`)
  .then((res)=> res.json())
  .then((data) => {
    setCategory(data.category);
    setName(data.name);
    setDescription(data.description);
    setPrice(data.price);
    setQuantity(data.quantity);
  })
    .catch((err) => console.log(err));
  
}, [id]);

const updateProduct = () => {
fetch(`https://firstcry-backend1.onrender.com/updateproduct/${id}`, {

method: "PUT",
headers: {
"Content-Type": "application/json"
},

body: JSON.stringify({
category,
name,
description,
price,
quantity
})

})

.then(res => res.json())
.then(data => {
alert("Product Updated Successfully");
})
.catch(err => console.log(err));

}


  return(
    <div>
       <h2>Edit Product</h2>
    <input   value= {category} onChange={(e) => setCategory(e.target.value)}/>

    <input  value={name} onChange={(e) => setName(e.target.value)}/>

    <input   value={description} onChange={(e) => setDescription(e.target.value)}/>

    <input   value={price} onChange = {(e) => setPrice(e.target.value)}/>

    <input  value={quantity} onChange = {(e) => setQuantity(e.target.value)}/>

    <button onClick={updateProduct}>
      Update
      </button>


    </div>
   
  );
} 

export default Editproduct;