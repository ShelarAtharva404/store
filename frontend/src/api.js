import axios from "axios";

const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getProducts = (params) => api.get("/products", { params });
export const getProduct = (id) => api.get(`/products/${id}`);

export const register = (data) => api.post("/auth/register", data);
export const login = (data) => api.post("/auth/login", data);

export const getCart = () => api.get("/cart");
export const addToCart = (product_id, quantity = 1) => api.post("/cart", { product_id, quantity });
export const updateCartItem = (id, quantity) => api.put(`/cart/${id}`, { quantity });
export const removeCartItem = (id) => api.delete(`/cart/${id}`);

export const checkout = () => api.post("/orders/checkout");
export const getOrders = () => api.get("/orders");
export const getOrder = (id) => api.get(`/orders/${id}`);

export default api;
