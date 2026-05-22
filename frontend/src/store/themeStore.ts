import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  initTheme: () => void;
}

function getAutoTheme(): Theme {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? 'light' : 'dark';
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'light',

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('domicilo_theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return { theme: newTheme };
    });
  },

  setTheme: (theme: Theme) => {
    localStorage.setItem('domicilo_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    set({ theme });
  },

  initTheme: () => {
    const stored = localStorage.getItem('domicilo_theme');
    let theme: Theme;
    if (stored === 'auto' || !stored) {
      theme = getAutoTheme();
    } else {
      theme = stored as Theme;
    }
    document.documentElement.classList.toggle('dark', theme === 'dark');
    set({ theme });
  },
}));
