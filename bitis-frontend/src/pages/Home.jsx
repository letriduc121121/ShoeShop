// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/products/ProductCard';

export default function Home() {
  const { data: products } = useProducts();
  const featured = products?.slice(0, 6) || [];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-primary to-red-600 flex items-center">
        <div className="container mx-auto px-4 text-white">
          <h1 className="text-6xl font-heading font-bold mb-4">
            ĐI CHUYẾN<br/>VIỆT NAM
          </h1>
          <p className="text-xl mb-6">Giày thể thao được thiết kế dành riêng cho người Việt</p>
          <Link
            to="/products"
            className="inline-block px-8 py-3 bg-white text-primary font-heading font-bold rounded-lg hover:bg-gray-100"
          >
            KHÁM PHÁ NGAY
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-heading font-bold">SẢN PHẨM NỔI BẬT</h2>
          <Link to="/products" className="text-primary font-semibold hover:underline">
            Xem tất cả →
          </Link>
        </div>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featured.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}