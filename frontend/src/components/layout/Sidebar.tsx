import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, CreditCard, Home, Bell, Settings,
  FileText, BarChart3, ClipboardList, Key, Search, PanelLeftClose, PanelLeft
} from 'lucide-react';
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
      {isOpen && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden mobile-overlay" onClick={onClose} />}
      <aside
        className={`fixed top-0 left-0 h-full glass border-r border-gray-200/50 dark:border-gray-800/50 z-40 transform transition-all duration-200 ease-out lg:translate-x-0 sidebar-panel ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'w-16' : 'w-64'}`}
      >
        <div className={`flex items-center h-16 border-b border-gray-100 dark:border-gray-800 ${collapsed ? 'justify-center px-0' : 'gap-3 px-6'}`}>
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
            <Home className="w-4 h-4 text-white" />
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
                className={`flex items-center py-2.5 rounded-xl text-sm font-medium transition-all ${collapsed ? 'justify-center px-2' : 'gap-3 px-4'} ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`} />
                {!collapsed && item.label}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
            <Link
              to="/notifications"
              onClick={onClose}
              className={`flex items-center py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all ${collapsed ? 'justify-center px-2' : 'gap-3 px-4'}`}
              title={collapsed ? 'Notifications' : undefined}
            >
              <Bell className="w-4 h-4 flex-shrink-0" />
              {!collapsed && 'Notifications'}
            </Link>
            <Link
              to="/settings"
              onClick={onClose}
              className={`flex items-center py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all ${collapsed ? 'justify-center px-2' : 'gap-3 px-4'}`}
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
          className="hidden lg:flex absolute bottom-4 right-0 translate-x-1/2 w-7 h-7 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 items-center justify-center shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all z-10"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft className="w-3.5 h-3.5 text-gray-500" /> : <PanelLeftClose className="w-3.5 h-3.5 text-gray-500" />}
        </button>
      </aside>
    </>
  );
}
