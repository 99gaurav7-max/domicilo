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

function safeGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!safeGet('domicilo_token'),
  isLoading: true,

  login: async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const { user, accessToken, refreshToken } = res.data.data!;
    try { localStorage.setItem('domicilo_token', accessToken); localStorage.setItem('domicilo_refresh', refreshToken); localStorage.setItem('domicilo_user', JSON.stringify(user)); } catch {}
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    try { localStorage.removeItem('domicilo_token'); localStorage.removeItem('domicilo_refresh'); localStorage.removeItem('domicilo_user'); } catch {}
    set({ user: null, isAuthenticated: false });
    window.location.href = '/';
  },

  loadUser: async () => {
    try {
      const stored = safeGet('domicilo_user');
      if (stored) {
        set({ user: JSON.parse(stored), isAuthenticated: true });
      }
      const res = await authApi.getProfile();
      if (res.data.success) {
        try { localStorage.setItem('domicilo_user', JSON.stringify(res.data.data)); } catch {}
        set({ user: res.data.data!, isAuthenticated: true, isLoading: false });
      }
    } catch {
      try { localStorage.removeItem('domicilo_token'); localStorage.removeItem('domicilo_refresh'); localStorage.removeItem('domicilo_user'); } catch {}
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => {
    if (user) {
      try { localStorage.setItem('domicilo_user', JSON.stringify(user)); } catch {}
    }
    set({ user });
  },
}));
