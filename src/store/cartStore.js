import { create } from 'zustand';
import { cartAPI } from '@/lib/api';

const useCartStore = create((set, get) => ({
  items: [],
  subtotal: 0,
  isLoading: false,

  fetchCart: async () => {
    try {
      set({ isLoading: true });
      const res = await cartAPI.get();
      set({ items: res.data.items || [], subtotal: res.data.subtotal || 0, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addItem: async (productId, quantity = 1) => {
    try {
      const res = await cartAPI.add({ product_id: productId, quantity });
      set({ items: res.data.items || [], subtotal: res.data.subtotal || 0 });
      return true;
    } catch { return false; }
  },

  updateItem: async (itemId, quantity) => {
    try {
      const res = await cartAPI.update(itemId, { quantity });
      set({ items: res.data.items || [], subtotal: res.data.subtotal || 0 });
    } catch {}
  },

  removeItem: async (itemId) => {
    try {
      const res = await cartAPI.remove(itemId);
      set({ items: res.data.items || [], subtotal: res.data.subtotal || 0 });
    } catch {}
  },

  clearCart: async () => {
    try {
      await cartAPI.clear();
      set({ items: [], subtotal: 0 });
    } catch {}
  },

  itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
}));

export default useCartStore;
