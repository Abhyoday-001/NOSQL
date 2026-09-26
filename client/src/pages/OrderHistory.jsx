import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const OrderHistory = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) {
      axios.get(`/orders/${user._id}`).then(res => setOrders(res.data));
    }
  }, [user]);

  return (
    <div className="container">
      <h2 style={{ margin: '20px 0' }}>Order History</h2>
      {orders.map(o => (
        <div key={o._id} style={{ background: '#fff', padding: '15px', marginBottom: '15px', borderRadius: '8px' }}>
          <h4>Order: {o._id}</h4>
          <p>Status: {o.status}</p>
          <p>Total: ${o.totalAmount}</p>
          <ul>
            {o.items.map((i, idx) => (
              <li key={idx}>{i.productId?.title || 'Product'} - Qty: {i.qty} - ${i.price}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
export default OrderHistory;