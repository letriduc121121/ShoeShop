import { apiCall } from './axios';

export const ordersApi = {
  createOrder: (orderData) => apiCall.post('/orders', orderData),
  
  getUserOrders: () => apiCall.get('/orders'),
  
  getOrderById: (orderId) => apiCall.get(`/orders/${orderId}`),
  
  // Admin only
  getAllOrders: () => apiCall.get('/admin/orders'),
  
  updateOrderStatus: (orderId, status) => 
    apiCall.put(`/orders/${orderId}/status?status=${status}`),
};