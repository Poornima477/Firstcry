import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Manageorder() {
const [Orders, setOrders] = useState([]);
const [editId, setEditId] = useState(null);
const [editData, setEditData] = useState({});
const navigate = useNavigate();

const fetchOrders = () => {
axios.get("https://firstcry-backend1.onrender.com/order")
.then(res => setOrders(res.data))
.catch(err => console.log(err));
};

useEffect(() => {
fetchOrders();
}, []);


const handleEdit = (order) => {
setEditId(order._id);
setEditData(order);
};

const handleChange = (e) => {
setEditData({
...editData,
[e.target.name]: e.target.value
});
};


const handleUpdate = () => {
axios.put(`https://firstcry-backend1.onrender.com/order/${editId}`, editData)
.then(() => {
setEditId(null);
fetchOrders();
})
.catch(err => console.log(err));
};

const deleteOrder = (id) => {
axios.delete(`https://firstcry-backend1.onrender.com/order/${id}`)
.then(() => fetchOrders())
.catch(err => console.log(err));
};

return ( <div> <h2>Manage Orders</h2>
  <table border="1" width="90%">
    <thead>
      <tr>
        <th>Order Id</th>
        <th>Name</th>
        <th>Phone</th>
        <th>Address</th>
        <th>Total</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>

<tbody>
    {Orders.map((order) => (
    <tr key={order._id}>
     <td>{order._id}</td>

     {editId === order._id ? (
     <>
    <td>
    <input name="fullName"
     value={editData.fullName}  onChange={handleChange} />
     </td>

    <td>
    <input name="phone"
      value={phone} onChange={handleChange}/>
     </td>
     

  <td>
   <input name="address"
    value={editData.address} onChange={handleChange} />
  </td>

  <td>{order.total}</td>
  <td>
  <select name="orderStatus"
  value={editData.orderStatus} onChange={handleChange}>
  <option value="Pending">Pending</option>
   <option value="Shipped">Shipped</option>
    <option value="Delivered">Delivered</option>
    </select>
  </td>

  <td>
  <button onClick={handleUpdate}>Save</button>
   <button onClick={() => setEditId(null)}>Cancel</button>
  </td>
  </>
  ) : (
   <>
              
  <td>{order.fullName}</td>
  <td>{order.phone}</td>
  <td>{order.address}</td>
  <td>{order.total}</td>
  <td>{order.orderStatus}</td>
    <td>
      
  <button onClick={() => navigate(`/Editorder/${order._id}`)}>
  Edit
</button>
  <button onClick={() => deleteOrder(order._id)}>Delete</button>
    </td>
    </>
     )}
        </tr>
      ))}
    </tbody>
  </table>
</div>


);
}

export default Manageorder;
