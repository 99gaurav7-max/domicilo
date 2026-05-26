import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../../store/authStore';
import StarsBackground from '../StarsBackground';

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuthStore();

  if (!user) return null;

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="min-h-screen bg-gray-50/80 dark:bg-transparent relative">
      <StarsBackground />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} onCollapsedChange={setSidebarCollapsed} />
      <div className={`relative z-10 transition-all duration-200 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
        <Header onMenuToggle={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PublicLayout() {
  return (
    <div className="min-h-screen relative">
      <StarsBackground />
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  );
}
