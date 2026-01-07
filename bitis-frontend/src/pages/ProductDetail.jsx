// src/pages/ProductDetail.jsx
import { useParams } from 'react-router-dom';
import { useProduct } from '../hooks/useProducts';
import { useAddToCart } from '../hooks/useCart';
import Loading from '../components/common/Loading';

export default function ProductDetail() {
  const { id } = useParams();
  const { data: product, isLoading } = useProduct(id);
  const addToCart = useAddToCart();

  if (isLoading) return <Loading />;
  if (!product) return <div>Không tìm thấy sản phẩm</div>;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Image */}
        <div className="h-96 bg-gray-100 rounded-xl overflow-hidden">
          {product.imageUrl && (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          )}
        </div>

        {/* Info */}
        <div>
          <span className="inline-block px-3 py-1 bg-primary text-white text-sm font-bold rounded mb-4">
            {product.category}
          </span>
          <h1 className="text-4xl font-heading font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-6">{product.description}</p>
          <div className="text-4xl font-heading font-bold text-primary mb-8">
            {formatPrice(product.price)}
          </div>
          
          <div className="space-y-3 mb-8">
            <div className="flex justify-between">
              <span className="text-gray-600">Size:</span>
              <span className="font-semibold">{product.size}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tồn kho:</span>
              <span className="font-semibold">{product.stock} đôi</span>
            </div>
          </div>

          <button
            onClick={() => addToCart.mutate({ productId: product.id, quantity: 1 })}
            disabled={product.stock === 0}
            className="w-full py-4 bg-primary text-white font-heading font-semibold rounded-lg hover:bg-red-600 disabled:bg-gray-300"
          >
            THÊM VÀO GIỎ HÀNG
          </button>
        </div>
      </div>
    </div>
  );
}