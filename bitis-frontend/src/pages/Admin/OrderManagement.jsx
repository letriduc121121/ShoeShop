// src/pages/Admin/OrderManagement.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../../api/orders';
import { Edit } from 'lucide-react';
import UpdateOrderStatusModal from './UpdateOrderStatusModal';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ xử lý' },
  { value: 'PROCESSING', label: 'Đang xử lý' },
  { value: 'SHIPPING', label: 'Đang giao' },
  { value: 'DELIVERED', label: 'Đã giao' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPING: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function OrderManagement() {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [editingOrder, setEditingOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => ordersApi.getAllOrders(),
  });

  const filteredOrders = orders?.filter(
    (order) => filterStatus === 'ALL' || order.status === filterStatus
  );

  const handleEditStatus = (order) => {
    setEditingOrder(order);
    setShowStatusModal(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (isLoading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-heading font-bold">Danh sách đơn hàng</h2>
        
        {/* Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-heading">Mã ĐH</th>
                <th className="px-6 py-4 text-left font-heading">Khách hàng</th>
                <th className="px-6 py-4 text-left font-heading">Ngày đặt</th>
                <th className="px-6 py-4 text-left font-heading">Tổng tiền</th>
                <th className="px-6 py-4 text-left font-heading">Thanh toán</th>
                <th className="px-6 py-4 text-left font-heading">Trạng thái</th>
                <th className="px-6 py-4 text-left font-heading">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders?.map((order, index) => (
                <tr
                  key={order.id}
                  className={`border-b border-gray-200 hover:bg-gray-50 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4 font-semibold">#{order.id}</td>
                  <td className="px-6 py-4">
                    {order.userId ? `User #${order.userId}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4 font-semibold text-primary">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">{order.paymentMethod}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        STATUS_COLORS[order.status]
                      }`}
                    >
                      {STATUS_OPTIONS.find((s) => s.value === order.status)?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEditStatus(order)}
                      className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Modal */}
      <UpdateOrderStatusModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setEditingOrder(null);
        }}
        order={editingOrder}
      />
    </div>
  );
}