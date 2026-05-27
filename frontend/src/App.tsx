import { useEffect, lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute, PublicOnlyRoute } from './components/RouteGuards';
import { PublicLayout, DashboardLayout } from './components/layout/Layout';
import PageTransition from './components/PageTransition';
import NavigationProgress from './components/NavigationProgress';

// Lazy-loaded pages for code splitting
const LandingPage = lazy(() => import('./pages/public/LandingPage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/public/PrivacyPolicyPage'));
const TermsServicePage = lazy(() => import('./pages/public/TermsServicePage'));
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
const AdminProperties = lazy(() => import('./pages/admin/AdminProperties'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-royal-500" />
    </div>
  );
}

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}><PageTransition>{children}</PageTransition></Suspense>;
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AppContent() {
  const { loadUser } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <>
      <NavigationProgress />
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<SuspenseWrapper><LandingPage /></SuspenseWrapper>} />
          <Route path="/about" element={<SuspenseWrapper><AboutPage /></SuspenseWrapper>} />
          <Route path="/privacy" element={<SuspenseWrapper><PrivacyPolicyPage /></SuspenseWrapper>} />
          <Route path="/terms" element={<SuspenseWrapper><TermsServicePage /></SuspenseWrapper>} />
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

        {/* Standalone Pages with Dashboard Layout */}
        <Route path="/settings" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<SuspenseWrapper><SettingsPage /></SuspenseWrapper>} />
        </Route>
        <Route path="/notifications" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<SuspenseWrapper><NotificationsPage /></SuspenseWrapper>} />
        </Route>

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
          <Route path="properties" element={<SuspenseWrapper><AdminProperties /></SuspenseWrapper>} />
          <Route path="payments" element={<SuspenseWrapper><AdminPayments /></SuspenseWrapper>} />
          <Route path="analytics" element={<SuspenseWrapper><AdminAnalytics /></SuspenseWrapper>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-center" toastOptions={{
          className: 'toast-default',
          duration: 3000,
          success: { className: 'toast-success', iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { className: 'toast-error', iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }} />
        <AppContent />
      </QueryClientProvider>
    </BrowserRouter>
  );
}
