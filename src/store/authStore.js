import { create } from 'zustand';
import { authAPI } from '@/lib/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: true,

  initialize: async () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      
      // Initial set from localStorage for fast UI
      set({ token, user, isLoading: !!token });

      // If we have a token, fetch fresh user data to stay in sync
      if (token) {
        try {
          const res = await authAPI.getMe();
          localStorage.setItem('user', JSON.stringify(res.data));
          set({ user: res.data, isLoading: false });
        } catch (err) {
          console.error("Auth initialization failed:", err);
          // If token is invalid/expired, we might want to logout, but for now just stop loading
          set({ isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
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
