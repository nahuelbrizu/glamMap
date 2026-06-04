import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

type UserRole = 'client' | 'owner' | 'admin';

interface Props {
  children: ReactNode;
  roleRequired?: UserRole;
}

export const ProtectedRoute = ({ children, roleRequired }: Props) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background-dark">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="mt-4 text-slate-400 text-sm font-medium">Cargando perfil...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roleRequired && user.role !== roleRequired) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'owner') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/explore" replace />;
  }

  return <>{children}</>;
};
