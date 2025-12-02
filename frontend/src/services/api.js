import axios from 'axios';

// Create axios instance with base config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// =====================================================
// TOKEN MANAGEMENT
// =====================================================

const TOKEN_KEY = 'almaartesana_access_token';
const REFRESH_KEY = 'almaartesana_refresh_token';

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export const setTokens = (access, refresh) => {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
};

export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

// Add auth header to requests
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post('/api/auth/refresh/', {
            refresh: refreshToken
          });
          
          const { access } = response.data;
          localStorage.setItem(TOKEN_KEY, access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear tokens
          clearTokens();
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// =====================================================
// AUTH ENDPOINTS
// =====================================================

export const register = (data) => api.post('/auth/register/', data);

export const login = async (email, password) => {
  const response = await api.post('/auth/login/', {
    username: email, // Django expects username
    password
  });
  
  const { access, refresh } = response.data;
  setTokens(access, refresh);
  
  return response;
};

export const logout = () => {
  clearTokens();
};

export const getProfile = () => api.get('/auth/profile/');

export const updateProfile = (data) => api.put('/auth/profile/', data);

export const changePassword = (currentPassword, newPassword) => 
  api.post('/auth/change-password/', {
    current_password: currentPassword,
    new_password: newPassword
  });

// =====================================================
// CATEGORY ENDPOINTS
// =====================================================

export const getCategories = () => api.get('/categories/');

export const getCategory = (slug) => api.get(`/categories/${slug}/`);

export const getCategoryProducts = (slug) => api.get(`/categories/${slug}/products/`);

// =====================================================
// PRODUCT ENDPOINTS
// =====================================================

export const getProducts = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/products/${queryString ? `?${queryString}` : ''}`);
};

export const getProduct = (slug) => api.get(`/products/${slug}/`);

export const getFeaturedProducts = () => api.get('/products/featured/');

export const getNewArrivals = () => api.get('/products/new_arrivals/');

export const getOnSaleProducts = () => api.get('/products/on_sale/');

export const searchProducts = (query) => 
  api.get(`/products/?search=${encodeURIComponent(query)}`);

// =====================================================
// CART ENDPOINTS (Auth required)
// =====================================================

export const getCart = () => api.get('/cart/');

export const addToCart = (productId, quantity = 1) => 
  api.post('/cart/', { product_id: productId, quantity });

export const updateCartItem = (itemId, quantity) => 
  api.put(`/cart/${itemId}/`, { quantity });

export const removeFromCart = (itemId) => api.delete(`/cart/${itemId}/`);

export const clearCart = () => api.delete('/cart/clear/');

// =====================================================
// WISHLIST ENDPOINTS (Auth required)
// =====================================================

export const getWishlist = () => api.get('/wishlist/');

export const addToWishlist = (productId) => 
  api.post('/wishlist/', { product_id: productId });

export const removeFromWishlist = (itemId) => api.delete(`/wishlist/${itemId}/`);

export const toggleWishlist = (productId) => 
  api.post('/wishlist/toggle/', { product_id: productId });

// =====================================================
// ORDER ENDPOINTS
// =====================================================

export const getOrders = () => api.get('/orders/');

export const getOrder = (orderNumber) => api.get(`/orders/${orderNumber}/`);

export const createOrder = (orderData) => api.post('/orders/create/', orderData);

// =====================================================
// UTILITY
// =====================================================

export const isAuthenticated = () => {
  return !!getAccessToken();
};

export default api;