import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../../store/authStore';

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();

  if (!user) return null;

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <div className="lg:pl-64">
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
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Outlet />
    </div>
  );
}
