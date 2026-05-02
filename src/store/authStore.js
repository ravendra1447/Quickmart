import { create } from 'zustand';
import { authAPI } from '@/lib/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: true,

  initialize: async () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      let user = null;
      
      try {
        user = userStr ? JSON.parse(userStr) : null;
      } catch (e) {
        console.error('[AUTH] Failed to parse stored user:', e);
        localStorage.removeItem('user');
      }
      
      // Immediately set from localStorage so UI doesn't flicker/redirect
      if (token && user) {
        set({ token, user, isLoading: true });
        
        try {
          const res = await authAPI.getMe();
          // res is already unwrapped by interceptor: { success, message, data: <user> }
          const freshUser = res?.data || user;
          localStorage.setItem('user', JSON.stringify(freshUser));
          set({ user: freshUser, isLoading: false });
        } catch (err) {
          console.error('[AUTH] Sync failed:', err);
          // If it's a 401/403, then clear. Otherwise (network error), keep local data.
          if (err.status === 401 || err.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            set({ user: null, token: null, isLoading: false });
          } else {
            // Network error — keep using local data
            set({ isLoading: false });
          }
        }
      } else {
        set({ token: null, user: null, isLoading: false });
      }
    }
  },

  setAuth: (user, token) => {
    if (!user || !token) {
      console.error('[AUTH] setAuth called with invalid data:', { user: !!user, token: !!token });
      return;
    }
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isLoading: false });
  },

  fetchUser: async () => {
    try {
      const res = await authAPI.getMe();
      const user = res?.data || null;
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      set({ user, isLoading: false });
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
