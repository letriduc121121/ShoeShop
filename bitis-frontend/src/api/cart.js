import { apiCall } from './axios';

export const cartApi = {
  getCart: () => apiCall.get('/cart'),
  
  addToCart: (productId, quantity = 1) => 
    apiCall.post('/cart', { productId, quantity }),
  
  updateQuantity: (cartItemId, quantity) => 
    apiCall.put(`/cart/${cartItemId}?quantity=${quantity}`),
  
  removeItem: (cartItemId) => apiCall.delete(`/cart/${cartItemId}`),
  
  clearCart: () => apiCall.delete('/cart'),
};