import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../../store/authStore';

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />
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
