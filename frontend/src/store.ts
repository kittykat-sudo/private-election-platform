// frontend/src/store.ts
import { create } from 'zustand';

interface AppState {
  user: { id: string; tenantId: string; role: 'voter' | 'admin' } | null;
  setUser: (user: AppState['user']) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));