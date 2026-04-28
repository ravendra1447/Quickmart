import { create } from 'zustand';
import { authAPI } from '@/lib/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: true,

  initialize: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      set({ token, user, isLoading: false });
    }
  },

  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  fetchUser: async () => {
    try {
      const res = await authAPI.getMe();
      set({ user: res.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  isAuthenticated: () => !!get().token,
  isAdmin: () => get().user?.role === 'super_admin',
  isSeller: () => get().user?.role === 'seller',
  isCustomer: () => get().user?.role === 'customer',
  isDeliveryPartner: () => get().user?.role === 'delivery_partner',
}));

export default useAuthStore;
