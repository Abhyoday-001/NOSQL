import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const RecommendationStrip = () => {
  const { user } = useContext(AuthContext);
  const [recs, setRecs] = useState([]);

  useEffect(() => {
    if (user) {
      axios.get(`/users/${user._id}/recommendations`).then(res => {
        if (res.data && res.data.recommended) {
          setRecs(res.data.recommended);
        }
      }).catch(err => console.error(err));
    }
  }, [user]);

  if (!user || recs.length === 0) return null;

  return (
    <div className="container">
      <h3 style={{ margin: '20px 0 10px' }}>Recommended For You</h3>
      <div className="reco-strip">
        {recs.map((r, i) => (
          <div key={i} className="reco-card">
            <h4>{r.productId?.title || 'Unknown Product'}</h4>
            <p>Score: {r.score.toFixed(2)}</p>
            <Link to={`/product/${r.productId?._id}`}>View</Link>
          </div>
        ))}
      </div>
    </div>
  );
};
export default RecommendationStrip;