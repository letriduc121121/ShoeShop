import { apiCall } from './axios';

export const authApi = {
  login: (credentials) => apiCall.post('/auth/login', credentials),
  
  register: (userData) => apiCall.post('/auth/register', userData),
  
  logout: () => apiCall.post('/auth/logout'),
};
