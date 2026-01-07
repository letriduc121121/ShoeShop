// src/components/cart/CheckoutModal.jsx
import { useState } from 'react';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../../api/orders';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function CheckoutModal({ isOpen, onClose, total }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const [formData, setFormData] = useState({
    deliveryAddress: user?.address || '',
    deliveryPhone: user?.phone || '',
    paymentMethod: 'COD',
    notes: '',
  });

  const createOrder = useMutation({
    mutationFn: (orderData) => ordersApi.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
      queryClient.invalidateQueries(['orders']);
      
      window.dispatchEvent(new CustomEvent('app:toast', {
        detail: { message: 'Đặt hàng thành công!', type: 'success' }
      }));

      onClose();
      navigate('/orders');
    },
    onError: (error) => {
      window.dispatchEvent(new CustomEvent('app:toast', {
        detail: { message: error.message || 'Đặt hàng thất bại', type: 'error' }
      }));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createOrder.mutate(formData);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-heading font-bold mb-6">THANH TOÁN</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Địa chỉ giao hàng *
              </label>
              <textarea
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                placeholder="Nhập địa chỉ giao hàng"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Số điện thoại *
              </label>
              <input
                type="tel"
                name="deliveryPhone"
                value={formData.deliveryPhone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Phương thức thanh toán *
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
              >
                <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                <option value="QR_CODE">Chuyển khoản QR Code</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Ghi chú
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                placeholder="Ghi chú cho đơn hàng (tùy chọn)"
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-heading font-bold text-lg">Tổng cộng:</span>
                <span className="font-heading font-bold text-2xl text-primary">
                  {formatPrice(total)}
                </span>
              </div>

              <button
                type="submit"
                disabled={createOrder.isLoading}
                className="w-full py-3 bg-primary text-white font-heading font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-300"
              >
                {createOrder.isLoading ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐẶT HÀNG'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}