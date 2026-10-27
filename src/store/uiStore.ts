import { create } from 'zustand';
import type { Role } from '../types';

interface UIStore {
  role: Role | null;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  setRole: (r: Role) => void;
  logout: () => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  role: null,
  sidebarOpen: true,
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  setRole: (r) => set({ role: r }),
  logout: () => set({ role: null }),
}));
