import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = API_BASE.replace('/api', '');
  return `${baseUrl}/${path.startsWith('/') ? path.slice(1) : path}`;
};

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject({ message, status: error.response?.status });
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  sendOtp: (data) => api.post('/auth/send-otp', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  googleLogin: (data) => api.post('/auth/google-login', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
  updateProfile: (data) => api.put('/auth/update-profile', data),
};

// Product APIs (Public)
export const productAPI = {
  list: (params) => api.get('/products', { params }),
  getBySlug: (slug) => api.get(`/products/${slug}`),
  getCategories: () => api.get('/products/categories'),
};

// Cart APIs
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart/add', data),
  update: (itemId, data) => api.put(`/cart/update/${itemId}`, data),
  remove: (itemId) => api.delete(`/cart/remove/${itemId}`),
  clear: () => api.delete('/cart/clear'),
};

// Order APIs
export const orderAPI = {
  checkout: (data) => api.post('/orders/checkout', data),
  list: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  requestReturn: (id, data) => api.post(`/orders/${id}/return`, data),
};

// Seller APIs
export const sellerAPI = {
  getDashboard: () => api.get('/seller/dashboard'),
  getProfile: () => api.get('/seller/profile'),
  updateProfile: (data) => api.put('/seller/profile', data),
  getProducts: (params) => api.get('/seller/products', { params }),
  getProduct: (id) => api.get(`/seller/products/${id}`),
  createProduct: (data) => api.post('/seller/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateProduct: (id, data) => api.put(`/seller/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteProduct: (id) => api.delete(`/seller/products/${id}`),
  getOrders: (params) => api.get('/seller/orders', { params }),
  updateOrderStatus: (id, data) => api.put(`/seller/orders/${id}/status`, data),
  getEarnings: () => api.get('/seller/earnings'),
  getStoreAreas: () => api.get('/seller/service-areas'),
  addStoreArea: (data) => api.post('/seller/service-areas', data),
  removeStoreArea: (id) => api.delete(`/seller/service-areas/${id}`),
};

// Admin APIs
export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  createSubcategory: (data) => api.post('/admin/subcategories', data),
  updateSubcategory: (id, data) => api.put(`/admin/subcategories/${id}`, data),
  deleteSubcategory: (id) => api.delete(`/admin/subcategories/${id}`),
  getSellers: (params) => api.get('/admin/sellers', { params }),
  updateSellerStatus: (id, data) => api.put(`/admin/sellers/${id}/status`, data),
  getProducts: (params) => api.get('/admin/products', { params }),
  createProduct: (data) => api.post('/admin/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getOrders: (params) => api.get('/admin/orders', { params }),
  getSettings: () => api.get('/admin/settings'),
  updateSetting: (data) => api.put('/admin/settings', data),
  // Hyperlocal Admin
  getBanners: () => api.get('/admin/banners'),
  createBanner: (data) => api.post('/admin/banners', data),
  updateBanner: (id, data) => api.put(`/admin/banners/${id}`, data),
  deleteBanner: (id) => api.delete(`/admin/banners/${id}`),
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: (data) => api.post('/admin/coupons', data),
  updateCoupon: (id, data) => api.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),
  getDeliveryPartners: (params) => api.get('/admin/delivery-partners', { params }),
  createDeliveryPartner: (data) => api.post('/admin/delivery-partners', data),
  assignOrder: (orderId, partnerId, data = {}) => api.post(`/admin/orders/${orderId}/assign`, { partner_id: partnerId, ...data }),
};

// Address APIs (Customer)
export const addressAPI = {
  list: () => api.get('/addresses'),
  create: (data) => api.post('/addresses', data),
  update: (id, data) => api.put(`/addresses/${id}`, data),
  delete: (id) => api.delete(`/addresses/${id}`),
  setDefault: (id) => api.put(`/addresses/${id}/default`),
};

// Hyperlocal Public APIs
export const hyperlocalAPI = {
  getBanners: () => api.get('/banners'),
  getNearbySellers: (lat, lng, radius) => api.get('/nearby-sellers', { params: { latitude: lat, longitude: lng, radius } }),
  getDeliveryEstimate: (params) => api.get('/delivery-estimate', { params }),
  validateCoupon: (data) => api.post('/coupons/validate', data),
};

// Common APIs
export const commonAPI = {
  uploadImage: (formData) => api.post('/upload', formData, { 
    headers: { 'Content-Type': 'multipart/form-data' } 
  }),
};

// Notification API
export const notificationAPI = {
  list: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  saveFCMToken: (token) => api.post('/notifications/fcm-token', { token }),
};

export const deliveryAPI = {
  getDashboard: () => api.get('/delivery/dashboard'),
  getAssignments: (params) => api.get('/delivery/assignments', { params }),
  markPickedUp: (id) => api.put(`/delivery/assignments/${id}/pickup`),
  markReachedHub: (id) => api.put(`/delivery/assignments/${id}/reach-hub`),
  verifyOtp: (id, otp) => api.put(`/delivery/assignments/${id}/verify-otp`, { otp }),
  updateProfile: (data) => api.put('/delivery/profile', data),
};

export const supportAPI = {
  listTickets: () => api.get('/support/tickets'),
  createTicket: (data) => api.post('/support/tickets', data),
  getTicket: (id) => api.get(`/support/tickets/${id}`),
  sendMessage: (id, data) => api.post(`/support/tickets/${id}/messages`, data),
};

export const returnAPI = {
  listRequests: () => api.get('/returns'),
  createRequest: (data) => api.post('/returns', data),
  getRequest: (id) => api.get(`/returns/${id}`),
};

export default api;

