import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, CreditCard, Home, Bell, Settings,
  FileText, BarChart3, ClipboardList, PanelLeftClose, PanelLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const navItems: Record<string, { label: string; path: string; icon: any }[]> = {
  owner: [
    { label: 'Dashboard', path: '/owner/dashboard', icon: LayoutDashboard },
    { label: 'Properties', path: '/owner/properties', icon: Building2 },
    { label: 'Tenants', path: '/owner/tenants', icon: Users },
    { label: 'Leads', path: '/owner/leads', icon: ClipboardList },
    { label: 'Payments', path: '/owner/payments', icon: CreditCard },
    { label: 'Analytics', path: '/owner/analytics', icon: BarChart3 },
  ],
  tenant: [
    { label: 'Dashboard', path: '/tenant/dashboard', icon: LayoutDashboard },
    { label: 'Payments', path: '/tenant/payments', icon: CreditCard },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Properties', path: '/admin/properties', icon: Building2 },
    { label: 'Payments', path: '/admin/payments', icon: CreditCard },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  ],
};

export function Sidebar({ isOpen, onClose, onCollapsedChange }: SidebarProps) {
  const { user } = useAuthStore();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  if (!user) return null;

  const items = navItems[user.role] || [];

  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full z-40 transform transition-all duration-300 ease-out lg:translate-x-0 sidebar-panel ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'w-16' : 'w-64'}`}
        style={{
          background: 'rgba(10, 10, 26, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div className={`flex items-center h-16 border-b border-white/5 ${collapsed ? 'justify-center px-0' : 'gap-3 px-6'}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-royal-500 to-royal-700 flex items-center justify-center shadow-lg shadow-royal-500/20">
            <Home className="w-5 h-5 text-white" />
          </div>
          {!collapsed && <span className="font-bold text-lg gradient-text">Domicilo</span>}
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  collapsed ? 'justify-center px-2' : 'gap-3 px-4'
                } ${
                  isActive
                    ? 'bg-royal-500/10 text-royal-400 shadow-sm shadow-royal-500/5 border border-royal-500/10'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-royal-400' : ''}`} />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-white/5">
            <Link
              to="/notifications"
              onClick={onClose}
              className={`flex items-center py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-all ${
                collapsed ? 'justify-center px-2' : 'gap-3 px-4'
              }`}
              title={collapsed ? 'Notifications' : undefined}
            >
              <Bell className="w-4 h-4 flex-shrink-0" />
              {!collapsed && 'Notifications'}
            </Link>
            <Link
              to="/settings"
              onClick={onClose}
              className={`flex items-center py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-all ${
                collapsed ? 'justify-center px-2' : 'gap-3 px-4'
              }`}
              title={collapsed ? 'Settings' : undefined}
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              {!collapsed && 'Settings'}
            </Link>
          </div>
        </nav>

        <button
          onClick={() => {
            const next = !collapsed;
            setCollapsed(next);
            localStorage.setItem('sidebarCollapsed', String(next));
            onCollapsedChange?.(next);
          }}
          className="hidden lg:flex absolute bottom-4 right-0 translate-x-1/2 w-7 h-7 rounded-full bg-black/40 border border-white/10 items-center justify-center shadow-lg hover:bg-white/10 transition-all z-10 backdrop-blur-sm"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <PanelLeft className="w-3.5 h-3.5 text-gray-400" />
            : <PanelLeftClose className="w-3.5 h-3.5 text-gray-400" />}
        </button>
      </aside>
    </>
  );
}
