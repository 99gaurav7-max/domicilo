import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, CreditCard, Home, Bell, Settings,
  FileText, BarChart3, ClipboardList, PanelLeftClose, PanelLeft
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
  const [collapsed, setCollapsed] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (!initRef.current) {
      try { setCollapsed(localStorage.getItem('sidebarCollapsed') === 'true'); } catch {}
      initRef.current = true;
    }
  }, []);

  if (!user) return null;

  const items = navItems[user.role] || [];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden transition-opacity duration-200"
          style={{ opacity: isOpen ? 1 : 0 }}
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full z-40 transition-transform duration-200 ease-out lg:translate-x-0 sidebar-panel ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'w-16' : 'w-64'}`}
        style={{
          background: 'rgba(10, 10, 26, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.06)',
          willChange: 'transform',
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
                className={`flex items-center py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                  collapsed ? 'justify-center px-2' : 'gap-3 px-4'
                } ${
                  isActive
                    ? 'bg-royal-500/10 text-royal-400 shadow-sm shadow-royal-500/5 border border-royal-500/10'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-royal-400' : ''}`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-white/5">
            <Link
              to="/notifications"
              onClick={onClose}
              className={`flex items-center py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-colors ${
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
              className={`flex items-center py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-colors ${
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
            try { localStorage.setItem('sidebarCollapsed', String(next)); } catch {}
            onCollapsedChange?.(next);
          }}
          className="hidden lg:flex absolute bottom-4 right-0 translate-x-1/2 w-7 h-7 rounded-full bg-black/40 border border-white/10 items-center justify-center shadow-lg hover:bg-white/10 transition-colors z-10 backdrop-blur-sm"
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
