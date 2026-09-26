import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import { CartContext } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    axios.get(`/products/${id}`).then(res => setProduct(res.data));
    axios.get(`/products/${id}/reviews`).then(res => setReviews(res.data));
  }, [id]);

  if (!product) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <div style={{ background: '#fff', padding: '20px', margin: '20px 0', borderRadius: '8px' }}>
        <h2>{product.title}</h2>
        <p>Price: ${product.price}</p>
        <p>Category: {product.category}</p>
        <p>Avg Rating: {product.avgRating.toFixed(1)}/5</p>
        <button onClick={() => addToCart(product)} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px', marginTop: '10px' }}>Add to Cart</button>
      </div>

      <h3>Reviews</h3>
      {reviews.map(r => (
        <div key={r._id} style={{ background: '#fff', padding: '15px', marginBottom: '10px', borderRadius: '8px' }}>
          <strong>{r.userId?.name || 'Anonymous'}:</strong> {r.rating}/5
          <p>{r.comment}</p>
        </div>
      ))}
    </div>
  );
};
export default ProductDetail;