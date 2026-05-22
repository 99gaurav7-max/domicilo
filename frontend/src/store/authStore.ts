import { create } from 'zustand';
import { User } from '../types';
import { authApi } from '../services/endpoints';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('domicilo_token'),
  isLoading: true,

  login: async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const { user, accessToken, refreshToken } = res.data.data!;
    localStorage.setItem('domicilo_token', accessToken);
    localStorage.setItem('domicilo_refresh', refreshToken);
    localStorage.setItem('domicilo_user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('domicilo_token');
    localStorage.removeItem('domicilo_refresh');
    localStorage.removeItem('domicilo_user');
    set({ user: null, isAuthenticated: false });
    window.location.href = '/';
  },

  loadUser: async () => {
    try {
      const stored = localStorage.getItem('domicilo_user');
      if (stored) {
        set({ user: JSON.parse(stored), isAuthenticated: true });
      }
      const res = await authApi.getProfile();
      if (res.data.success) {
        localStorage.setItem('domicilo_user', JSON.stringify(res.data.data));
        set({ user: res.data.data!, isAuthenticated: true, isLoading: false });
      }
    } catch {
      localStorage.removeItem('domicilo_token');
      localStorage.removeItem('domicilo_refresh');
      localStorage.removeItem('domicilo_user');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem('domicilo_user', JSON.stringify(user));
    }
    set({ user });
  },
}));
