import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, Moon, Sun, LogOut, User, Settings, ChevronDown, Building2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

interface HeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

export function Header({ onMenuToggle, isSidebarOpen }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky-header glass border-b border-gray-200/50 dark:border-gray-800/50 z-40">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button onClick={onMenuToggle} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg hidden sm:block gradient-text">Domicilo</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => navigate('/notifications')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
          </button>

          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">
                  {user.fullName?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">{user.fullName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 w-56 glass-card rounded-xl py-2 shadow-xl z-20 border border-gray-200/50 dark:border-gray-700/50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.fullName}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                    <Link to={`/${user.role}/dashboard`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setShowUserMenu(false)}>
                      <User className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link to="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => setShowUserMenu(false)}>
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                    <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                      <button onClick={() => { setShowUserMenu(false); logout(); }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
