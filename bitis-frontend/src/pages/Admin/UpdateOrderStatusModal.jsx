// src/pages/Admin/UpdateOrderStatusModal.jsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../../api/orders';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Chờ xử lý' },
  { value: 'PROCESSING', label: 'Đang xử lý' },
  { value: 'SHIPPING', label: 'Đang giao hàng' },
  { value: 'DELIVERED', label: 'Đã giao hàng' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

export default function UpdateOrderStatusModal({ isOpen, onClose, order }) {
  const [newStatus, setNewStatus] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (order) {
      setNewStatus(order.status);
    }
  }, [order]);

  const updateStatus = useMutation({
    mutationFn: ({ orderId, status }) => ordersApi.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
      window.dispatchEvent(new CustomEvent('app:toast', {
        detail: { message: 'Đã cập nhật trạng thái đơn hàng', type: 'success' }
      }));
      onClose();
    },
    onError: (error) => {
      window.dispatchEvent(new CustomEvent('app:toast', {
        detail: { message: error.message || 'Cập nhật thất bại', type: 'error' }
      }));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!order) return;

    updateStatus.mutate({
      orderId: order.id,
      status: newStatus,
    });
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-heading font-bold mb-6">
            CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Mã đơn hàng
              </label>
              <input
                type="text"
                value={`#${order.id}`}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Trạng thái mới *
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={updateStatus.isLoading}
              className="w-full py-3 bg-primary text-white font-heading font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-300"
            >
              {updateStatus.isLoading ? 'ĐANG CẬP NHẬT...' : 'CẬP NHẬT'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}