import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

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
    <div className="max-w-[1200px] mx-auto px-5 py-10">
      <h2 className="text-3xl font-bold mb-8 text-text">Your Cart</h2>
      
      {cart.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
          <p className="text-xl text-gray-500 mb-6">Your cart is completely empty.</p>
          <Link to="/" className="btn-primary inline-block">Start Shopping</Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Line Items */}
          <div className="lg:w-2/3 space-y-4">
            {cart.map((c, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl shadow-sm flex items-center justify-between border border-transparent hover:border-gray-200 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    <img src={c.imageUrl || `https://loremflickr.com/640/480/product?lock=${c._id}`} alt={c.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{c.title}</h4>
                    <p className="text-sm text-gray-500">{c.category}</p>
                  </div>
                </div>
                <div className="text-xl font-bold text-primary">${c.price}</div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 sticky top-6">
              <h3 className="text-xl font-bold mb-6 pb-4 border-b border-gray-100">Order Summary</h3>
              
              <div className="flex justify-between mb-3 text-gray-600">
                <span>Subtotal ({cart.length} items)</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-6 text-gray-600">
                <span>Shipping</span>
                <span className="text-emerald-600 font-semibold">Free</span>
              </div>
              
              <div className="flex justify-between items-center pt-6 border-t border-gray-100 mb-8">
                <span className="text-lg font-bold text-text">Total</span>
                <span className="text-3xl font-bold text-primary">${total.toFixed(2)}</span>
              </div>
              
              <button 
                onClick={placeOrder} 
                className="btn-primary w-full py-4 text-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Checkout
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
export default Cart;