import { apiCall } from './axios';

export const productsApi = {
  getAll: () => apiCall.get('/products'),
  
  getById: (id) => apiCall.get(`/products/${id}`),
  
  getByCategory: (category) => apiCall.get(`/products/category/${category}`),
  
  search: (keyword) => apiCall.get(`/products/search?keyword=${encodeURIComponent(keyword)}`),
  
  create: (productData) => apiCall.post('/products', productData),
  
  update: (id, productData) => apiCall.put(`/products/${id}`, productData),
  
  delete: (id) => apiCall.delete(`/products/${id}`),
};