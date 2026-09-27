import React, { useEffect, useState, useContext } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import ProductCard from './ProductCard';

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
    <div className="bg-emerald-50 py-8 border-b border-emerald-100">
      <div className="max-w-[1200px] mx-auto px-5">
        <h3 className="text-2xl font-bold text-primary mb-6">Recommended For You</h3>
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
          {recs.map((r, i) => (
            r.productId ? (
              <div key={i} className="min-w-[260px] max-w-[280px] snap-start shrink-0">
                <ProductCard 
                  product={r.productId} 
                  recoScore={r.score} 
                  recoReason={r.reason} 
                />
              </div>
            ) : null
          ))}
        </div>
      </div>
    </div>
  );
};
export default RecommendationStrip;