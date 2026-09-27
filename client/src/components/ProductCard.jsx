import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Watch, Cpu, UtensilsCrossed, BookOpen } from 'lucide-react';
import { CartContext } from '../context/CartContext';

const getIcon = (category) => {
  switch(category) {
    case 'Wearables': return <Watch className="w-12 h-12 text-white/50" />;
    case 'Electronics': return <Cpu className="w-12 h-12 text-white/50" />;
    case 'Home & Kitchen': return <UtensilsCrossed className="w-12 h-12 text-white/50" />;
    case 'Books': return <BookOpen className="w-12 h-12 text-white/50" />;
    default: return <Watch className="w-12 h-12 text-white/50" />;
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

const ProductCard = ({ product, recoScore, recoReason }) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { addToCart } = useContext(CartContext);

  const fallbackBg = getCategoryColor(product.category);

  return (
    <div className="card flex flex-col h-full relative group">
      {/* Recommendation Badge */}
      {recoScore && (
        <div className="absolute top-2 left-2 z-10 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
          {Math.round(recoScore * 100)}% Match
        </div>
      )}

      {/* Image Container */}
      <div className="aspect-[4/3] w-full bg-gray-100 rounded-t-xl overflow-hidden relative mb-4">
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

      {/* Content */}
      <div className="flex-grow flex flex-col">
        <h3 className="text-lg font-bold leading-tight mb-1">{product.title}</h3>
        {recoReason && (
          <p className="text-xs text-gray-500 mb-2 italic line-clamp-1">{recoReason}</p>
        )}
        <p className="text-sm text-gray-500 mb-3">{product.category}</p>
        <p className="text-xl font-bold text-primary mb-4 mt-auto">${product.price}</p>
        
        <div className="flex gap-2">
          <Link to={`/product/${product._id}`} className="btn-secondary flex-1 text-center text-sm py-1.5 px-3">View</Link>
          <button onClick={() => addToCart(product)} className="btn-primary flex-1 text-sm py-1.5 px-3">Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
