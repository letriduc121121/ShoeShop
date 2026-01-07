// src/pages/Cart.jsx
import { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart, useUpdateCartItem, useRemoveCartItem } from '../hooks/useCart';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/common/Loading';
import CheckoutModal from '../components/cart/CheckoutModal';

export default function Cart() {
  const navigate = useNavigate();
  const { data: cartItems, isLoading } = useCart();
  const updateQuantity = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const [showCheckout, setShowCheckout] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleUpdateQuantity = (cartItemId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;

    updateQuantity.mutate({ cartItemId, quantity: newQuantity });
  };

  const handleRemove = (cartItemId) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      removeItem.mutate(cartItemId, {
        onSuccess: () => {
          window.dispatchEvent(new CustomEvent('app:toast', {
            detail: { message: 'Đã xóa khỏi giỏ hàng', type: 'success' }
          }));
        }
      });
    }
  };

  if (isLoading) {
    return <Loading message="Đang tải giỏ hàng..." />;
  }

  const total = cartItems?.reduce((sum, item) => sum + parseFloat(item.subtotal), 0) || 0;
  const totalItems = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="w-24 h-24 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-heading font-bold mb-2">Giỏ hàng trống</h2>
          <p className="text-gray-600 mb-6">Hãy thêm sản phẩm vào giỏ hàng nhé!</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-red-600"
          >
            MUA SẮM NGAY
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-heading font-bold mb-8">GIỎ HÀNG</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-primary transition-colors"
            >
              <div className="flex gap-4">
                {/* Image */}
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{item.productName}</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {formatPrice(item.price)} / đôi
                  </p>

                  <div className="flex items-center justify-between">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                        disabled={item.quantity <= 1 || updateQuantity.isLoading}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded hover:bg-gray-200 disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                        disabled={updateQuantity.isLoading}
                        className="w-8 h-8 flex items-center justify-center bg-white rounded hover:bg-gray-200"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Subtotal & Remove */}
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-heading font-bold text-primary">
                        {formatPrice(item.subtotal)}
                      </span>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border-2 border-gray-200 sticky top-24">
            <h3 className="font-heading font-bold text-xl mb-4">TỔNG CỘNG</h3>

            <div className="space-y-3 mb-4 pb-4 border-b">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính ({totalItems} sản phẩm)</span>
                <span className="font-semibold">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển</span>
                <span className="font-semibold text-green-600">Miễn phí</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="font-heading font-bold text-lg">Tổng cộng</span>
              <span className="font-heading font-bold text-2xl text-primary">
                {formatPrice(total)}
              </span>
            </div>

            <button
              onClick={() => setShowCheckout(true)}
              className="w-full py-3 bg-primary text-white font-heading font-semibold rounded-lg hover:bg-red-600 transition-colors"
            >
              THANH TOÁN
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        total={total}
      />
    </div>
  );
}

