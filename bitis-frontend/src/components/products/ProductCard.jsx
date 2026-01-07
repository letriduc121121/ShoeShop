// src/components/products/ProductCard.jsx
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useAddToCart } from '../../hooks/useCart';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addToCart = useAddToCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevent card click

    // ✅ Check auth trước khi add to cart
    if (!isAuthenticated) {
      // Show login modal hoặc redirect
      navigate('/?login=required');
      return;
    }

    // Add to cart
    addToCart.mutate(
      { productId: product.id, quantity: 1 },
      {
        onSuccess: () => {
          // Show success toast
          window.dispatchEvent(new CustomEvent('app:toast', {
            detail: { message: 'Đã thêm vào giỏ hàng!', type: 'success' }
          }));
        },
        onError: (error) => {
          // Show error toast
          window.dispatchEvent(new CustomEvent('app:toast', {
            detail: { message: error.message || 'Có lỗi xảy ra', type: 'error' }
          }));
        },
      }
    );
  };

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="bg-white rounded-2xl overflow-hidden border-2 border-transparent hover:border-primary transition-all duration-300 hover:-translate-y-2 cursor-pointer group"
    >
      {/* Image */}
      <div className="relative h-80 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <span className="text-gray-400 text-8xl font-heading font-black opacity-10">
            BITI'S
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-6">
        {/* Category Badge */}
        <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-bold rounded mb-3">
          {product.category}
        </span>

        {/* Name */}
        <h3 className="text-xl font-bold mb-2 line-clamp-2 h-14">
          {product.name}
        </h3>

        {/* Price & Action */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-3xl font-heading font-bold text-primary">
            {formatPrice(product.price)}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={addToCart.isLoading || product.stock === 0}
            className="p-3 bg-primary text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>

        {/* Stock */}
        <div className="mt-3 text-sm text-gray-500">
          {product.stock > 0 ? (
            <span>Còn {product.stock} đôi</span>
          ) : (
            <span className="text-red-500 font-semibold">Hết hàng</span>
          )}
        </div>
      </div>
    </div>
  );
}