// src/hooks/useCart.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiCall } from '../api/axios';
import useAuthStore from '../store/authStore';

// ✅ Fetch cart - CHỈ khi đã đăng nhập
export const useCart = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['cart'],
    queryFn: () => apiCall.get('/cart'),
    // ✅ QUAN TRỌNG: Chỉ fetch khi đã đăng nhập
    enabled: isAuthenticated,
    staleTime: 1 * 60 * 1000, // 1 minute
    // ✅ Tránh retry nếu 401/403
    retry: (failureCount, error) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// ✅ Add to cart
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useMutation({
    mutationFn: ({ productId, quantity }) => {
      if (!isAuthenticated) {
        throw new Error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      }
      return apiCall.post('/cart', { productId, quantity });
    },
    onSuccess: () => {
      // Refetch cart
      queryClient.invalidateQueries(['cart']);
    },
  });
};

// ✅ Update cart item quantity
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cartItemId, quantity }) => {
      return apiCall.put(`/cart/${cartItemId}?quantity=${quantity}`);
    },
    // Optimistic update
    onMutate: async ({ cartItemId, quantity }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['cart']);

      // Snapshot previous value
      const previousCart = queryClient.getQueryData(['cart']);

      // Optimistically update
      queryClient.setQueryData(['cart'], (old) => {
        return old?.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity, subtotal: item.price * quantity }
            : item
        );
      });

      return { previousCart };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['cart'], context.previousCart);
    },
    onSettled: () => {
      // Refetch to ensure sync
      queryClient.invalidateQueries(['cart']);
    },
  });
};

// ✅ Remove from cart
export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cartItemId) => {
      return apiCall.delete(`/cart/${cartItemId}`);
    },
    // Optimistic update
    onMutate: async (cartItemId) => {
      await queryClient.cancelQueries(['cart']);
      const previousCart = queryClient.getQueryData(['cart']);

      queryClient.setQueryData(['cart'], (old) => {
        return old?.filter((item) => item.id !== cartItemId);
      });

      return { previousCart };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['cart'], context.previousCart);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['cart']);
    },
  });
};

// ✅ Clear cart
export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiCall.delete('/cart'),
    onSuccess: () => {
      queryClient.setQueryData(['cart'], []);
    },
  });
};