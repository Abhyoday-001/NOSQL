import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  return (
    <nav>
      <div className="container">
        <h2><Link to="/">E-Shop</Link></h2>
        <div>
          <Link to="/">Home</Link>
          <Link to="/cart">Cart ({cart.length})</Link>
          {user ? (
            <>
              <Link to="/orders">Orders</Link>
              <button onClick={logout} style={{ marginLeft: '10px', background: 'transparent', color: '#fff', border: '1px solid #fff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;