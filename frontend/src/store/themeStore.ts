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

function safeGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSet(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch {}
}

function getStoredTheme(): Theme {
  const stored = safeGet('domicilo_theme');
  if (stored === 'auto' || !stored) {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18 ? 'light' : 'dark';
  }
  return stored as Theme;
}

const initialTheme = getStoredTheme();
if (initialTheme === 'dark') {
  document.documentElement.classList.add('dark');
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      safeSet('domicilo_theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return { theme: newTheme };
    });
  },

  setTheme: (theme: Theme) => {
    safeSet('domicilo_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    set({ theme });
  },

  initTheme: () => {
    const stored = safeGet('domicilo_theme');
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
