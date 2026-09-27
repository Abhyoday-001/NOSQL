import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      axios.get(`/orders/${user._id}`).then(res => setOrders(res.data));
    }
  }, [user]);

  if (!user) return <div className="max-w-[1200px] mx-auto px-5 py-10">Please log in to view orders.</div>;

  return (
    <div className="max-w-[1200px] mx-auto px-5 py-10">
      <h2 className="text-3xl font-bold mb-8">Order History</h2>
      
      {orders.length === 0 ? <p className="text-gray-500">No orders found.</p> : (
        <div className="space-y-6">
          {orders.map(o => (
            <div key={o._id} className="card border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                <strong className="text-gray-500">Order ID: <span className="text-text">{o._id}</span></strong>
                <strong className="text-xl text-primary">\${o.totalAmount.toFixed(2)}</strong>
              </div>
              <ul className="space-y-3">
                {o.items.map((i, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span className="font-medium text-text">{i.productId?.title || 'Unknown Product'}</span> 
                    <span className="text-gray-500">Qty: {i.qty} — \${i.price} each</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default OrderHistory;