import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import RecommendationStrip from '../components/RecommendationStrip';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    axios.get('/products').then(res => {
      setProducts(res.data);
      const uniqueCats = [...new Set(res.data.map(p => p.category))];
      setCategories(uniqueCats);
    }).catch(console.error);
  }, []);

  const displayedProducts = selectedCategory ? products.filter(p => p.category === selectedCategory) : products;

  return (
    <div className="pb-12">
      <RecommendationStrip />
      
      <div className="max-w-[1200px] mx-auto px-5 mt-10 space-y-6">
        
        {/* Category Nav */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          <button 
            onClick={() => setSelectedCategory('')} 
            className={`px-5 py-2 rounded-full font-semibold whitespace-nowrap transition-colors ${selectedCategory === '' ? 'bg-primary text-white' : 'bg-white text-primary border-2 border-primary hover:bg-emerald-50'}`}
          >
            All
          </button>
          {categories.map(c => (
            <button 
              key={c}
              onClick={() => setSelectedCategory(c)} 
              className={`px-5 py-2 rounded-full font-semibold whitespace-nowrap transition-colors ${selectedCategory === c ? 'bg-primary text-white' : 'bg-white text-primary border-2 border-primary hover:bg-emerald-50'}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-6">{selectedCategory || 'All'} Catalogue</h2>
          
          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedProducts.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Home;