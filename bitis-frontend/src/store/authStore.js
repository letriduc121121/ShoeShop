// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiCall } from '../api/axios';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials, queryClient) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall.post('/auth/login', credentials);
          
          set({
            user: response,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // ✅ Clear cache để fetch fresh data của user mới
          if (queryClient) {
            queryClient.clear();
            console.log('🧹 Cleared React Query cache on login');
          }
          
          return response;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      register: async (userData, queryClient) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall.post('/auth/register', userData);
          
          set({
            user: response,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // ✅ Clear cache cho user mới
          if (queryClient) {
            queryClient.clear();
            console.log('🧹 Cleared React Query cache on register');
          }
          
          return response;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Đăng ký thất bại';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      logout: async (queryClient) => {
        try {
          await apiCall.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // ✅ Clear cache TRƯỚC khi reset state
          if (queryClient) {
            queryClient.clear();
            console.log('🧹 Cleared React Query cache on logout');
          }
          
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      clearError: () => set({ error: null }),

      // Helper methods
      isAdmin: () => {
        const { user } = get();
        return user?.role === 'ADMIN';
      },

      requireAuth: () => {
        const { isAuthenticated } = get();
        return isAuthenticated;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ✅ Listen to logout event từ axios interceptor
window.addEventListener('auth:logout', () => {
  // Note: Không có queryClient ở đây, nhưng state vẫn được clear
  useAuthStore.getState().logout();
});

export default useAuthStore;