import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import { Spinner } from '../components/ui/Spinner';

// Lazy-loaded Pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const Onboarding = lazy(() => import('../pages/Onboarding').then(module => ({ default: module.Onboarding })));
const Login = lazy(() => import('../pages/Login').then(module => ({ default: module.Login })));
const AuthSuccess = lazy(() => import('../pages/AuthSuccess').then(module => ({ default: module.AuthSuccess })));
const Explore = lazy(() => import('../pages/Explore').then(module => ({ default: module.Explore })));
const Register = lazy(() => import('../pages/Register').then(module => ({ default: module.Register })));
const DashboardGeneral = lazy(() => import('../pages/DashboardGeneral').then(module => ({ default: module.DashboardGeneral })));
const BusinessDetail = lazy(() => import('../pages/BusinessDetail').then(module => ({ default: module.BusinessDetail })));
const UserProfile = lazy(() => import('../pages/usersPages/UserProfile').then(module => ({ default: module.UserProfile })));
const Appointments = lazy(() => import('../pages/user/Appointments').then(module => ({ default: module.Appointments })));
const MyFavorites = lazy(() => import('../pages/user/MyFavorites').then(module => ({ default: module.MyFavorites })));
const OwnerDashboard = lazy(() => import('../pages/owner/OwnerDashboard').then(module => ({ default: module.OwnerDashboard })));
const BusinessProfile = lazy(() => import('../pages/owner/BusinessProfile').then(module => ({ default: module.BusinessProfile })));
const ServicesManagement = lazy(() => import('../pages/owner/ServicesManagement').then(module => ({ default: module.ServicesManagement })));

export const AppRouter = () => {
  const { user, loading } = useAuth();

  const getHomeRedirect = (role: string) => {
    if (role === 'admin') return '/admin';
    if (role === 'business') return '/dashboard';
    return '/explore';
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route 
            path="/onboarding" 
            element={user ? <Navigate to={getHomeRedirect(user.role)} replace /> : <Onboarding />} 
          />
          <Route 
            path="/login" 
            element={user ? <Navigate to={getHomeRedirect(user.role)} replace /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to={getHomeRedirect(user.role)} replace /> : <Register />} 
          />
          
          <Route path="/auth-success" element={<AuthSuccess />} />

          <Route
            path="/explore"
            element={<MainLayout><Explore /></MainLayout>}
          />
          <Route
            path="/business/:id"
            element={<MainLayout><ProtectedRoute><BusinessDetail /></ProtectedRoute></MainLayout>}
          />

          <Route 
            path="/admin"
            element={
              <ProtectedRoute roleRequired="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/dashboard" 
            element={<MainLayout><ProtectedRoute roleRequired="business"><DashboardGeneral /></ProtectedRoute></MainLayout>} 
          />
          <Route
            path="/owner/dashboard"
            element={<MainLayout><ProtectedRoute roleRequired="business"><OwnerDashboard /></ProtectedRoute></MainLayout>}
          />
          <Route
            path="/owner/profile"
            element={<MainLayout><ProtectedRoute roleRequired="business"><BusinessProfile /></ProtectedRoute></MainLayout>}
          />
          <Route
            path="/owner/services"
            element={<MainLayout><ProtectedRoute roleRequired="business"><ServicesManagement /></ProtectedRoute></MainLayout>}
          />

          <Route
            path="/profile"
            element={<MainLayout><ProtectedRoute roleRequired="client"><UserProfile /></ProtectedRoute></MainLayout>}
          />
          <Route
            path="/appointments"
            element={<MainLayout><ProtectedRoute roleRequired="client"><Appointments /></ProtectedRoute></MainLayout>}
          />
          <Route
            path="/favorites"
            element={<MainLayout><ProtectedRoute roleRequired="client"><MyFavorites /></ProtectedRoute></MainLayout>}
          />

          <Route 
            path="/" 
            element={
              user 
                ? <Navigate to={getHomeRedirect(user.role)} replace /> 
                : <Navigate to="/onboarding" replace />
            } 
          />
          <Route path="*" element={<Navigate to="/explore" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};