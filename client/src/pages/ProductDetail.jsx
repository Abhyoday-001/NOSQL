import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import { CartContext } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import { Watch, Cpu, UtensilsCrossed, BookOpen } from 'lucide-react';

const getIcon = (category) => {
  switch(category) {
    case 'Wearables': return <Watch className="w-20 h-20 text-white/50" />;
    case 'Electronics': return <Cpu className="w-20 h-20 text-white/50" />;
    case 'Home & Kitchen': return <UtensilsCrossed className="w-20 h-20 text-white/50" />;
    case 'Books': return <BookOpen className="w-20 h-20 text-white/50" />;
    default: return <Watch className="w-20 h-20 text-white/50" />;
  }
};
const getCategoryColor = (category) => {
  switch(category) {
    case 'Wearables': return 'bg-blue-400';
    case 'Electronics': return 'bg-purple-400';
    case 'Home & Kitchen': return 'bg-orange-400';
    case 'Books': return 'bg-yellow-400';
    default: return 'bg-gray-400';
  }
};

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    window.scrollTo(0, 0);
    setImgLoaded(false);
    setImgError(false);
    
    axios.get(`/products/${id}`).then(res => {
      setProduct(res.data);
      axios.get(`/products?category=${encodeURIComponent(res.data.category)}`).then(simRes => {
        setSimilarProducts(simRes.data.filter(p => p._id !== id).slice(0, 4));
      });
    });
    axios.get(`/products/${id}/reviews`).then(res => setReviews(res.data));
  }, [id]);

  if (!product) return <div className="max-w-[1200px] mx-auto px-5 py-10">Loading...</div>;

  const fallbackBg = getCategoryColor(product.category);

  return (
    <div className="max-w-[1200px] mx-auto px-5 py-10 space-y-12">
      
      {/* Two Column Layout */}
      <div className="flex flex-col md:flex-row gap-10">
        
        {/* Left Column: Image */}
        <div className="md:w-1/2">
          <div className="aspect-[4/3] w-full bg-gray-100 rounded-2xl overflow-hidden relative shadow-sm">
            {!imgError ? (
              <>
                {!imgLoaded && (
                  <div className="absolute inset-0 animate-pulse bg-gray-200"></div>
                )}
                <img 
                  src={product.imageUrl || `https://loremflickr.com/640/480/product?lock=${product._id}`} 
                  alt={product.title}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgError(true)}
                />
              </>
            ) : (
              <div className={`absolute inset-0 flex items-center justify-center ${fallbackBg} bg-opacity-50`}>
                {getIcon(product.category)}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="md:w-1/2 flex flex-col justify-center">
          <p className="text-gray-500 font-semibold mb-2 uppercase tracking-wide text-sm">{product.category}</p>
          <h2 className="text-4xl font-bold mb-4 text-text">{product.title}</h2>
          <div className="flex items-center mb-6">
            <span className="text-lg font-semibold bg-gray-100 px-3 py-1 rounded-full mr-4">
              ★ {product.avgRating ? product.avgRating.toFixed(1) : '0.0'}
            </span>
            <span className="text-gray-500 text-sm">{reviews.length} Reviews</span>
          </div>
          
          <p className="text-5xl font-bold text-primary mb-8">${product.price}</p>
          
          <button 
            onClick={() => addToCart(product)} 
            className="btn-primary w-full md:w-auto px-10 py-4 text-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="space-y-6 pt-8 border-t border-gray-200">
          <h3 className="text-2xl font-bold text-text">Similar Products</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {similarProducts.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="space-y-6 pt-8 border-t border-gray-200">
        <h3 className="text-2xl font-bold text-text">Reviews</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.length === 0 ? <p className="text-gray-500 italic">No reviews yet.</p> : reviews.map(r => (
            <div key={r._id} className="card">
              <div className="flex items-center justify-between mb-3">
                <strong className="font-semibold">{r.userId?.name || 'Anonymous'}</strong>
                <span className="bg-emerald-50 text-primary font-bold px-2 py-1 rounded text-sm">★ {r.rating}/5</span>
              </div>
              <p className="text-gray-700">{r.comment}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
export default ProductDetail;