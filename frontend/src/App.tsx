import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Verification } from './pages/Verification';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { AuthCallback } from './pages/AuthCallback';
import { Dashboard } from './pages/Dashboard';
import { Links } from './pages/Links';
import { CreateLink } from './pages/CreateLink';
import { Recipient } from './pages/Recipient';
import { Admin } from './pages/Admin';
import { NotFound } from './pages/NotFound';
import { Loader } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Guard component for authenticated users
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex flex-col items-center justify-center space-y-4">
        <Loader className="h-12 w-12 text-brand-pink animate-spin" />
        <p className="text-sm font-semibold text-gray-500">Restoring session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Guard component for admin routes
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex flex-col items-center justify-center">
        <Loader className="h-12 w-12 text-brand-pink animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Landing View */}
        <Route path="/" element={<Home />} />

        {/* Public Recipient Invitation Flow */}
        <Route path="/c/:slug" element={<Recipient />} />

        {/* Google OAuth Callback Handler */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Auth Pages Wrapped in AuthLayout */}
        <Route
          path="/login"
          element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          }
        />
        <Route
          path="/register"
          element={
            <AuthLayout>
              <Register />
            </AuthLayout>
          }
        />
        <Route
          path="/verify-email"
          element={
            <AuthLayout>
              <Verification />
            </AuthLayout>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <AuthLayout>
              <ForgotPassword />
            </AuthLayout>
          }
        />
        <Route
          path="/reset-password"
          element={
            <AuthLayout>
              <ResetPassword />
            </AuthLayout>
          }
        />

        {/* Protected Dashboard Views wrapped in DashboardLayout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/links"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Links />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/create"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CreateLink />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Admin View */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <DashboardLayout>
                <Admin />
              </DashboardLayout>
            </AdminRoute>
          }
        />

        {/* 404 Catch All */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
