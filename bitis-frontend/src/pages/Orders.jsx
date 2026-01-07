// src/pages/Orders.jsx
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/orders';
import { Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import Loading from '../components/common/Loading';

const STATUS_CONFIG = {
  PENDING: {
    label: 'Chờ xử lý',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  PROCESSING: {
    label: 'Đang xử lý',
    color: 'bg-blue-100 text-blue-800',
    icon: Package,
  },
  SHIPPING: {
    label: 'Đang giao',
    color: 'bg-purple-100 text-purple-800',
    icon: Truck,
  },
  DELIVERED: {
    label: 'Đã giao',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
};

export default function Orders() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.getUserOrders(),
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return <Loading message="Đang tải đơn hàng..." />;
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <Package className="w-24 h-24 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-heading font-bold mb-2">Chưa có đơn hàng</h2>
          <p className="text-gray-600">Hãy đặt hàng ngay nhé!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-heading font-bold mb-8">ĐơN HÀNG CỦA TÔI</h1>

      <div className="space-y-6">
        {orders.map((order) => {
          const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
          const StatusIcon = statusConfig.icon;

          return (
            <div
              key={order.id}
              className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-primary transition-colors"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
                <div>
                  <span className="font-heading font-bold text-lg">
                    Đơn hàng #{order.id}
                  </span>
                  <span className="text-gray-600 ml-4">
                    {formatDate(order.createdAt)}
                  </span>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${statusConfig.color}`}>
                  <StatusIcon className="w-5 h-5" />
                  <span className="font-semibold">{statusConfig.label}</span>
                </div>
              </div>

              {/* Items */}
              <div className="p-6 space-y-4">
                {order.orderItems?.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.productName}</h3>
                      <p className="text-gray-600 text-sm">
                        Số lượng: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading font-bold text-primary">
                        {formatPrice(item.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                <div className="text-gray-600">
                  <span>Thanh toán: </span>
                  <span className="font-semibold">{order.paymentMethod}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-600 mr-2">Tổng cộng:</span>
                  <span className="font-heading font-bold text-2xl text-primary">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
