import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from './client';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';

// Products
export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const { data } = await api.get('/products', { params });
      return data;
    },
  });
};

export const useProduct = (id) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/products/meta/categories');
      return data;
    },
  });
};

export const useBrands = () => {
  return useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data } = await api.get('/products/meta/brands');
      return data;
    },
  });
};

// Auth
export const useLogin = () => {
  const login = useAuthStore((state) => state.login);
  
  return useMutation({
    mutationFn: async (credentials) => {
      const { data } = await api.post('/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      login(data.token, data.user);
      toast.success('Welcome back!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Login failed');
    },
  });
};

export const useRegister = () => {
  const login = useAuthStore((state) => state.login);
  
  return useMutation({
    mutationFn: async (userData) => {
      const { data } = await api.post('/auth/register', userData);
      return data;
    },
    onSuccess: (data) => {
      login(data.token, data.user);
      toast.success('Account created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Registration failed');
    },
  });
};

// Cart
export const useCart = () => {
  const setCart = useCartStore((state) => state.setCart);
  
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data } = await api.get('/cart');
      setCart(data);
      return data;
    },
    enabled: useAuthStore.getState().isAuthenticated,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const addItem = useCartStore((state) => state.addItem);
  
  return useMutation({
    mutationFn: async ({ product_id, quantity = 1, variant_id = null }) => {
      const { data } = await api.post('/cart', { product_id, quantity, variant_id });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['cart']);
      addItem(data);
      toast.success('Added to cart!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to add to cart');
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  
  return useMutation({
    mutationFn: async ({ id, quantity }) => {
      const { data } = await api.put(`/cart/${id}`, { quantity });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['cart']);
      updateQuantity(data.id, data.quantity);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update cart');
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();
  const removeItem = useCartStore((state) => state.removeItem);
  
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/cart/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries(['cart']);
      removeItem(id);
      toast.success('Removed from cart');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to remove item');
    },
  });
};

// Orders
export const useCheckout = () => {
  const queryClient = useQueryClient();
  const clearCart = useCartStore((state) => state.clearCart);
  
  return useMutation({
    mutationFn: async (checkoutData) => {
      const { data } = await api.post('/orders/checkout', checkoutData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
      queryClient.invalidateQueries(['orders']);
      clearCart();
      toast.success('Order placed successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Checkout failed');
    },
  });
};

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await api.get('/orders');
      return data;
    },
    enabled: useAuthStore.getState().isAuthenticated,
  });
};

export const useOrder = (id) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

// Reviews
export const useProductReviews = (productId, params = {}) => {
  return useQuery({
    queryKey: ['reviews', productId, params],
    queryFn: async () => {
      const { data } = await api.get(`/reviews/product/${productId}`, { params });
      return data;
    },
    enabled: !!productId,
  });
};

export const useAddReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reviewData) => {
      const { data } = await api.post('/reviews', reviewData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['reviews', data.product_id]);
      queryClient.invalidateQueries(['product', data.product_id]);
      toast.success('Review posted!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to post review');
    },
  });
};

// Wishlist
export const useWishlist = () => {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const { data } = await api.get('/wishlist');
      return data;
    },
    enabled: useAuthStore.getState().isAuthenticated,
  });
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product_id) => {
      const { data } = await api.post('/wishlist', { product_id });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['wishlist']);
      toast.success('Added to wishlist!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to add to wishlist');
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productId) => {
      await api.delete(`/wishlist/${productId}`);
      return productId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['wishlist']);
      toast.success('Removed from wishlist');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to remove from wishlist');
    },
  });
};

export const useIsInWishlist = (productId) => {
  return useQuery({
    queryKey: ['wishlist-check', productId],
    queryFn: async () => {
      const { data } = await api.get(`/wishlist/check/${productId}`);
      return data.inWishlist;
    },
    enabled: !!productId && useAuthStore.getState().isAuthenticated,
  });
};

// Addresses
export const useAddresses = () => {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const { data } = await api.get('/addresses');
      return data;
    },
    enabled: useAuthStore.getState().isAuthenticated,
  });
};

export const useAddAddress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (addressData) => {
      const { data } = await api.post('/addresses', addressData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['addresses']);
      toast.success('Address added!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to add address');
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...addressData }) => {
      const { data } = await api.put(`/addresses/${id}`, addressData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['addresses']);
      toast.success('Address updated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update address');
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/addresses/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['addresses']);
      toast.success('Address deleted');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete address');
    },
  });
};
