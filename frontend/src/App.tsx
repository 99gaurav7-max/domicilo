import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { ProtectedRoute, PublicOnlyRoute } from './components/RouteGuards';
import { PublicLayout, DashboardLayout } from './components/layout/Layout';

// Lazy-loaded pages for code splitting
const LandingPage = lazy(() => import('./pages/public/LandingPage'));
const PropertiesPage = lazy(() => import('./pages/public/PropertiesPage'));
const PropertyDetailPage = lazy(() => import('./pages/public/PropertyDetailPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));

const OwnerDashboard = lazy(() => import('./pages/owner/OwnerDashboard'));
const OwnerProperties = lazy(() => import('./pages/owner/OwnerProperties'));
const OwnerTenants = lazy(() => import('./pages/owner/OwnerTenants'));
const OwnerLeads = lazy(() => import('./pages/owner/OwnerLeads'));
const OwnerPayments = lazy(() => import('./pages/owner/OwnerPayments'));
const OwnerAnalytics = lazy(() => import('./pages/owner/OwnerAnalytics'));

const TenantDashboard = lazy(() => import('./pages/tenant/TenantDashboard'));
const TenantPayments = lazy(() => import('./pages/tenant/TenantPayments'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );
}

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function AppContent() {
  const { initTheme } = useThemeStore();
  const { loadUser } = useAuthStore();

  useEffect(() => {
    initTheme();
    loadUser();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<SuspenseWrapper><LandingPage /></SuspenseWrapper>} />
          <Route path="/properties" element={<SuspenseWrapper><PropertiesPage /></SuspenseWrapper>} />
          <Route path="/properties/:id" element={<SuspenseWrapper><PropertyDetailPage /></SuspenseWrapper>} />
        </Route>

        {/* Auth Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<PublicOnlyRoute><SuspenseWrapper><LoginPage /></SuspenseWrapper></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><SuspenseWrapper><RegisterPage /></SuspenseWrapper></PublicOnlyRoute>} />
          <Route path="/forgot-password" element={<SuspenseWrapper><ForgotPasswordPage /></SuspenseWrapper>} />
          <Route path="/reset-password" element={<SuspenseWrapper><ResetPasswordPage /></SuspenseWrapper>} />
        </Route>

        {/* Standalone Pages */}
        <Route path="/settings" element={<ProtectedRoute><SuspenseWrapper><SettingsPage /></SuspenseWrapper></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><SuspenseWrapper><NotificationsPage /></SuspenseWrapper></ProtectedRoute>} />

        {/* Owner Routes */}
        <Route path="/owner" element={
          <ProtectedRoute roles={['owner']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SuspenseWrapper><OwnerDashboard /></SuspenseWrapper>} />
          <Route path="properties" element={<SuspenseWrapper><OwnerProperties /></SuspenseWrapper>} />
          <Route path="tenants" element={<SuspenseWrapper><OwnerTenants /></SuspenseWrapper>} />
          <Route path="leads" element={<SuspenseWrapper><OwnerLeads /></SuspenseWrapper>} />
          <Route path="payments" element={<SuspenseWrapper><OwnerPayments /></SuspenseWrapper>} />
          <Route path="analytics" element={<SuspenseWrapper><OwnerAnalytics /></SuspenseWrapper>} />
        </Route>

        {/* Tenant Routes */}
        <Route path="/tenant" element={
          <ProtectedRoute roles={['tenant']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SuspenseWrapper><TenantDashboard /></SuspenseWrapper>} />
          <Route path="payments" element={<SuspenseWrapper><TenantPayments /></SuspenseWrapper>} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SuspenseWrapper><AdminDashboard /></SuspenseWrapper>} />
          <Route path="users" element={<SuspenseWrapper><AdminUsers /></SuspenseWrapper>} />
          <Route path="properties" element={<SuspenseWrapper><OwnerProperties /></SuspenseWrapper>} />
          <Route path="payments" element={<SuspenseWrapper><AdminPayments /></SuspenseWrapper>} />
          <Route path="analytics" element={<SuspenseWrapper><OwnerAnalytics /></SuspenseWrapper>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" toastOptions={{
        className: 'glass-card text-sm',
        duration: 3000,
      }} />
      <AppContent />
    </QueryClientProvider>
  );
}
