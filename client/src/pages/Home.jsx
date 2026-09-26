import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axios';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';
import RecommendationStrip from '../components/RecommendationStrip';

const Home = () => {
  const [products, setProducts] = useState([]);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    axios.get('/products').then(res => setProducts(res.data)).catch(console.error);
  }, []);

  return (
    <div>
      <RecommendationStrip />
      <div className="container">
        <h2>Catalogue</h2>
        <div className="product-grid">
          {products.map(p => (
            <div key={p._id} className="product-card">
              <h3>{p.title}</h3>
              <p>Category: {p.category}</p>
              <p>${p.price}</p>
              <button onClick={() => addToCart(p)}>Add to Cart</button>
              <Link to={`/product/${p._id}`} style={{ display: 'block', marginTop: '10px', textAlign: 'center', textDecoration: 'none', color: 'var(--primary)' }}>Details</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Home;