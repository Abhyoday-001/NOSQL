import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cart, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const total = cart.reduce((acc, item) => acc + item.price, 0);

  const placeOrder = async () => {
    if (!user) return alert('Please login to place order');
    try {
      const items = cart.map(c => ({ productId: c._id, qty: 1, price: c.price }));
      await axios.post('/orders', { items, totalAmount: total });
      alert('Order Placed!');
      clearCart();
      navigate('/orders');
    } catch (err) {
      alert('Error placing order');
    }
  };

  return (
    <div className="container">
      <h2 style={{ margin: '20px 0' }}>Your Cart</h2>
      {cart.length === 0 ? <p>Cart is empty</p> : (
        <div>
          {cart.map((c, i) => (
            <div key={i} className="cart-item">
              <span>{c.title}</span>
              <span>${c.price}</span>
            </div>
          ))}
          <div className="cart-total">Total: ${total}</div>
          <button onClick={placeOrder} style={{ display: 'block', width: '100%', background: 'var(--secondary)', color: '#fff', padding: '15px', border: 'none', borderRadius: '4px', marginTop: '20px', fontSize: '1.1em', cursor: 'pointer' }}>Place Order</button>
        </div>
      )}
    </div>
  );
};
export default Cart;