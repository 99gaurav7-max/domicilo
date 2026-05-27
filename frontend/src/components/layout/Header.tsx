import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, LogOut, User, Settings, ChevronDown, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

interface HeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

export function Header({ onMenuToggle, isSidebarOpen }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40">
      <div className="mx-2 mt-2 lg:mx-4 lg:mt-3 rounded-2xl bg-white/60 dark:bg-black/30 backdrop-blur-2xl border border-white/20 dark:border-white/5 shadow-lg shadow-black/5 dark:shadow-black/20">
        <div className="flex items-center justify-between h-16 px-4 text-gray-600 dark:text-gray-200">
          <div className="flex items-center gap-3">
            <button onClick={onMenuToggle} aria-label="Toggle sidebar"
              className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-royal-500/10 active:scale-95 transition-all duration-200">
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-royal-500 to-royal-700 flex items-center justify-center shadow-lg shadow-royal-500/20">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg hidden sm:block gradient-text">Domicilo</span>
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => navigate('/notifications')} aria-label="Notifications"
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-royal-500/10 active:scale-95 transition-all duration-200 relative">
              <Bell className="w-4 h-4" />
            </button>

            {user && (
              <div className="relative">
                <button onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 min-h-[44px] rounded-xl hover:bg-royal-500/10 active:scale-95 transition-all duration-200">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-royal-500 to-royal-700 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-royal-500/20">
                    {user.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">{user.fullName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: 'easeOut' as const }}
                        className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white/80 dark:bg-black/60 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-2xl shadow-black/20 z-20 overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.fullName}</p>
                          <p className="text-xs text-royal-500 capitalize font-medium">{user.role}</p>
                        </div>
                        <Link to={user.role === 'other' ? '/properties' : `/${user.role}/dashboard`}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-royal-500/5 transition-colors"
                          onClick={() => setShowUserMenu(false)}>
                          <User className="w-4 h-4 text-royal-500" /> Dashboard
                        </Link>
                        <Link to="/settings"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-royal-500/5 transition-colors"
                          onClick={() => setShowUserMenu(false)}>
                          <Settings className="w-4 h-4 text-royal-500" /> Settings
                        </Link>
                        <div className="border-t border-white/10 mt-1 pt-1">
                          <button onClick={() => { setShowUserMenu(false); logout(); }}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors w-full">
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
