import { create } from 'zustand';
import type { UserStore } from './types';

export const useUserStore = create<UserStore>(set => ({
  // Initial state
  user: null,
  isLoading: false,
  error: null,

  // Actions
  setUser: user => set({ user, error: null }),
  clearUser: () => set({ user: null, error: null }),
  setLoading: isLoading => set({ isLoading }),
  setError: error => set({ error }),
}));
