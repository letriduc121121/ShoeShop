// src/pages/Products.jsx
import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/products/ProductCard';
import Loading from '../components/common/Loading';

const CATEGORIES = ['ALL', 'NAM', 'NỮ', 'UNISEX'];

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  // ✅ Fetch products - PUBLIC, không cần auth
  const { data: products, isLoading, error } = useProducts(selectedCategory);

  if (isLoading) {
    return <Loading message="Đang tải sản phẩm..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          <p>Không thể tải sản phẩm. Vui lòng thử lại sau.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-5xl font-heading font-bold mb-4">SẢN PHẨM</h1>
        
        {/* Filter Buttons */}
        <div className="flex gap-4 flex-wrap">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-lg font-heading font-semibold transition-all ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-white border-2 border-gray-200 hover:border-primary'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <p className="text-xl">Không có sản phẩm nào</p>
        </div>
      )}
    </div>
  );
}