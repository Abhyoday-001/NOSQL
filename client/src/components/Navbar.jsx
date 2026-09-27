import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-[#1A1A1A] text-white shadow-md border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-5 py-4 flex items-center justify-between">
        
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-bold text-white hover:text-emerald-400 transition-colors">RecoApp</Link>
          <Link to="/" className="text-gray-300 hover:text-white transition-colors font-medium">Home</Link>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/cart" className="text-gray-300 hover:text-white transition-colors font-medium flex items-center gap-2">
            Cart 
            {cart.length > 0 && (
              <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">{cart.length}</span>
            )}
          </Link>
          
          {user ? (
            <div className="flex items-center gap-6">
              <Link to="/orders" className="text-gray-300 hover:text-white transition-colors font-medium">Orders</Link>
              <span className="text-gray-400">Hi, {user.name}</span>
              <button 
                onClick={handleLogout}
                className="border-2 border-emerald-500 text-emerald-400 font-semibold py-1.5 px-4 rounded-xl hover:bg-emerald-500/10 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-emerald-600 text-white font-semibold py-1.5 px-5 rounded-xl hover:bg-emerald-500 transition-colors duration-200">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;