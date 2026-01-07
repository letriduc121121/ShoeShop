// src/api/axios.js
import axios from 'axios';

// Tạo axios instance
const api = axios.create({
  baseURL: '/api', // Vite proxy sẽ forward tới localhost:8080/api
  withCredentials: true, // Gửi cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Log requests
api.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    const { response, config } = error;
    
    console.error(`❌ ${config?.method?.toUpperCase()} ${config?.url} - ${response?.status}`);

    // ✅ 401 Unauthorized - Chỉ xử lý nếu KHÔNG phải endpoint public
    if (response?.status === 401) {
      const isPublicEndpoint = 
        config.url.includes('/auth/') || 
        (config.method === 'get' && config.url.includes('/products'));

      if (!isPublicEndpoint) {
        // Clear auth state và redirect login
        localStorage.removeItem('user');
        
        // Emit custom event để các component khác biết
        window.dispatchEvent(new CustomEvent('auth:logout'));
        
        // Không tự động redirect - để component xử lý
        console.warn('🔐 Session expired. Please login again.');
      }
    }

    // ✅ 403 Forbidden - Không có quyền
    if (response?.status === 403) {
      console.error('🚫 Access denied. Insufficient permissions.');
      // Có thể show toast notification
      window.dispatchEvent(new CustomEvent('app:toast', {
        detail: { message: 'Bạn không có quyền thực hiện thao tác này', type: 'error' }
      }));
    }

    return Promise.reject(error);
  }
);

export default api;

// ✅ Wrapper functions để dễ sử dụng hơn
export const apiCall = {
  get: (url, config) => api.get(url, config).then(res => res.data),
  post: (url, data, config) => api.post(url, data, config).then(res => res.data),
  put: (url, data, config) => api.put(url, data, config).then(res => res.data),
  delete: (url, config) => api.delete(url, config).then(res => res.data),
};