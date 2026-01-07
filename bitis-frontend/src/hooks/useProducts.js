// src/hooks/useProducts.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiCall } from '../api/axios';
import useAuthStore from '../store/authStore';

// ✅ Fetch all products - PUBLIC, không cần auth
export const useProducts = (category = null) => {
  return useQuery({
    queryKey: ['products', category],
    queryFn: async () => {
      const url = category && category !== 'ALL' 
        ? `/products/category/${category}`
        : '/products';
      return apiCall.get(url);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    // ✅ Không retry nếu fail, tránh spam requests
    retry: 1,
  });
};

// ✅ Fetch single product - PUBLIC
export const useProduct = (id) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => apiCall.get(`/products/${id}`),
    enabled: !!id, // Chỉ fetch khi có id
    staleTime: 5 * 60 * 1000,
  });
};

// ✅ Search products - PUBLIC
export const useSearchProducts = (keyword) => {
  return useQuery({
    queryKey: ['products', 'search', keyword],
    queryFn: () => apiCall.get(`/products/search?keyword=${keyword}`),
    enabled: keyword.trim().length > 0, // Chỉ search khi có keyword
    staleTime: 3 * 60 * 1000,
  });
};

// ✅ Create product - ADMIN only
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((state) => state.isAdmin());

  return useMutation({
    mutationFn: (productData) => {
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin only');
      }
      return apiCall.post('/products', productData);
    },
    onSuccess: () => {
      // Invalidate và refetch products
      queryClient.invalidateQueries(['products']);
    },
  });
};

// ✅ Update product - ADMIN only
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((state) => state.isAdmin());

  return useMutation({
    mutationFn: ({ id, data }) => {
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin only');
      }
      return apiCall.put(`/products/${id}`, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['product', variables.id]);
    },
  });
};

// ✅ Delete product - ADMIN only
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((state) => state.isAdmin());

  return useMutation({
    mutationFn: (id) => {
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin only');
      }
      return apiCall.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
    },
  });
};