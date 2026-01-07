// src/pages/Admin/AdminDashboard.jsx
import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../../api/products';
import { ordersApi } from '../../api/orders';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-heading font-bold mb-8 text-primary">
        QUẢN TRỊ ADMIN
      </h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b-2 border-gray-200">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-6 py-3 font-heading font-semibold transition-colors ${
            activeTab === 'products'
              ? 'text-primary border-b-2 border-primary -mb-0.5'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Package className="w-5 h-5" />
          QUẢN LÝ SẢN PHẨM
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-6 py-3 font-heading font-semibold transition-colors ${
            activeTab === 'orders'
              ? 'text-primary border-b-2 border-primary -mb-0.5'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          QUẢN LÝ ĐƠN HÀNG
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-6 py-3 font-heading font-semibold transition-colors ${
            activeTab === 'stats'
              ? 'text-primary border-b-2 border-primary -mb-0.5'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          THỐNG KÊ
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'products' && <ProductManagement />}
      {activeTab === 'orders' && <OrderManagement />}
      {activeTab === 'stats' && <AdminStats />}
    </div>
  );
}

// =====================================================

// Admin Stats Component
function AdminStats() {
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll(),
  });

  const { data: orders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => ordersApi.getAllOrders(),
  });

  const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0) || 0;
  const totalProducts = products?.length || 0;
  const totalOrders = orders?.length || 0;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-gray-600 text-sm">Tổng đơn hàng</p>
            <p className="text-3xl font-heading font-bold">{totalOrders}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <p className="text-gray-600 text-sm">Doanh thu</p>
            <p className="text-2xl font-heading font-bold text-green-600">
              {formatPrice(totalRevenue)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center">
            <Package className="w-8 h-8 text-yellow-600" />
          </div>
          <div>
            <p className="text-gray-600 text-sm">Sản phẩm</p>
            <p className="text-3xl font-heading font-bold">{totalProducts}</p>
          </div>
        </div>
      </div>
    </div>
  );
}