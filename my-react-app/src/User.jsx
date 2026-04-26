import React, { useEffect, useState } from "react";
import axios from "axios";

function UserPanel() {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);

  const API = "https://firstcry-backend.onrender.com";

  
  useEffect(() => {
    axios.get(`${API}/users`)
      .then(res => {
        if (res.data.success) {
          setUsers(res.data.users);
        }
      })
      .catch(err => console.log(err));
  }, []);

 
  const handleDelete = (id) => {
    axios.delete(`${API}/delete-user/${id}`)
      .then(() => {
        alert("User deleted");
        setUsers(users.filter(user => user._id !== id));
      })
      .catch(err => console.log(err));
  };

 
  const handleEdit = (user) => {
    setEditUser(user);
  };

 
  const handleUpdate = () => {
    axios.put(`${API}/update-user/${editUser._id}`, editUser)
      .then(() => {
        alert("User updated");
        setEditUser(null);
      })
      .catch(err => console.log(err));
  };

  return (
    <div>
      <h2>User Panel</h2>

      {editUser && (
        <div>
          <h3>Edit User</h3>
          <input
            value={editUser.name}
            onChange={(e) =>
              setEditUser({ ...editUser, name: e.target.value })
            }
          />
          <input
            value={editUser.email}
            onChange={(e) =>
              setEditUser({ ...editUser, email: e.target.value })
            }
          />
          <button onClick={handleUpdate}>Save</button>
        </div>
      )}

   
      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Orders</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>

              <td>
                {user.orders.map((o, i) => (
                  <div key={i}>{o.productName}</div>
                ))}
              </td>

              <td>
                {user.orders.map((o, i) => (
                  <div key={i}>{o.status}</div>
                ))}
              </td>

              <td>
                <button onClick={() => handleEdit(user)}>Edit</button>
                <button onClick={() => handleDelete(user._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserPanel;