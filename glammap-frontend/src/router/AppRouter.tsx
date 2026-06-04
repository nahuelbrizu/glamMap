import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import { Spinner } from '../components/ui/Spinner';
import type { UserRole } from '../context/AuthContext';

const AdminDashboard    = lazy(() => import('../pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const Onboarding        = lazy(() => import('../pages/Onboarding').then(m => ({ default: m.Onboarding })));
const Login             = lazy(() => import('../pages/Login').then(m => ({ default: m.Login })));
const AuthSuccess       = lazy(() => import('../pages/AuthSuccess').then(m => ({ default: m.AuthSuccess })));
const Explore           = lazy(() => import('../pages/Explore').then(m => ({ default: m.Explore })));
const Register          = lazy(() => import('../pages/Register').then(m => ({ default: m.Register })));
const DashboardGeneral  = lazy(() => import('../pages/DashboardGeneral').then(m => ({ default: m.DashboardGeneral })));
const BusinessDetail    = lazy(() => import('../pages/BusinessDetail').then(m => ({ default: m.BusinessDetail })));
const UserProfile       = lazy(() => import('../pages/user/UserProfile').then(m => ({ default: m.UserProfile })));
const Appointments      = lazy(() => import('../pages/user/Appointments').then(m => ({ default: m.Appointments })));
const MyFavorites       = lazy(() => import('../pages/user/MyFavorites').then(m => ({ default: m.MyFavorites })));
const EditProfile       = lazy(() => import('../pages/EditProfile').then(m => ({ default: m.EditProfile })));
const OwnerDashboard    = lazy(() => import('../pages/owner/OwnerDashboard').then(m => ({ default: m.OwnerDashboard })));
const OwnerAppointments = lazy(() => import('../pages/owner/OwnerAppointments').then(m => ({ default: m.OwnerAppointments })));
const BusinessProfile   = lazy(() => import('../pages/owner/BusinessProfile').then(m => ({ default: m.BusinessProfile })));
const ServicesManagement = lazy(() => import('../pages/owner/ServicesManagement').then(m => ({ default: m.ServicesManagement })));

// BookingPage wraps BookingCalendar with router params and appointment creation logic
const BookingPage = lazy(() => import('../pages/BookingPage').then(m => ({ default: m.BookingPage })));

const homeByRole: Record<UserRole, string> = {
  admin: '/admin',
  owner: '/dashboard',
  client: '/explore',
};

export const AppRouter = () => {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;

  const homeRedirect = user ? homeByRole[user.role] : '/onboarding';

  return (
    <BrowserRouter>
      <Suspense fallback={<Spinner />}>
        <Routes>
          {/* AUTH */}
          <Route path="/onboarding" element={user ? <Navigate to={homeRedirect} replace /> : <Onboarding />} />
          <Route path="/login"      element={user ? <Navigate to={homeRedirect} replace /> : <Login />} />
          <Route path="/register"   element={user ? <Navigate to={homeRedirect} replace /> : <Register />} />
          <Route path="/auth-success" element={<AuthSuccess />} />

          {/* PUBLIC */}
          <Route path="/explore"      element={<MainLayout><Explore /></MainLayout>} />
          <Route path="/business/:id" element={<MainLayout><BusinessDetail /></MainLayout>} />

          {/* BOOKING — protected, client only */}
          <Route
            path="/business/:id/book"
            element={
              <MainLayout>
                <ProtectedRoute roleRequired="client">
                  <BookingPage />
                </ProtectedRoute>
              </MainLayout>
            }
          />

          {/* ADMIN */}
          <Route
            path="/admin"
            element={<ProtectedRoute roleRequired="admin"><AdminDashboard /></ProtectedRoute>}
          />

          {/* OWNER */}
          <Route path="/dashboard"
            element={<MainLayout><ProtectedRoute roleRequired="owner"><DashboardGeneral /></ProtectedRoute></MainLayout>} />
          <Route path="/owner/dashboard"
            element={<MainLayout><ProtectedRoute roleRequired="owner"><OwnerDashboard /></ProtectedRoute></MainLayout>} />
          <Route path="/owner/appointments"
            element={<MainLayout><ProtectedRoute roleRequired="owner"><OwnerAppointments /></ProtectedRoute></MainLayout>} />
          <Route path="/owner/profile"
            element={<MainLayout><ProtectedRoute roleRequired="owner"><BusinessProfile /></ProtectedRoute></MainLayout>} />
          <Route path="/owner/services"
            element={<MainLayout><ProtectedRoute roleRequired="owner"><ServicesManagement /></ProtectedRoute></MainLayout>} />

          {/* CLIENT */}
          <Route path="/profile"
            element={<MainLayout><ProtectedRoute roleRequired="client"><UserProfile /></ProtectedRoute></MainLayout>} />
          <Route path="/appointments"
            element={<MainLayout><ProtectedRoute roleRequired="client"><Appointments /></ProtectedRoute></MainLayout>} />
          <Route path="/favorites"
            element={<MainLayout><ProtectedRoute roleRequired="client"><MyFavorites /></ProtectedRoute></MainLayout>} />

          {/* EDIT PROFILE — both client and owner */}
          <Route
            path="/edit-profile"
            element={
              <MainLayout>
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              </MainLayout>
            }
          />

          <Route path="/"   element={<Navigate to={homeRedirect} replace />} />
          <Route path="*"   element={<Navigate to="/explore" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
