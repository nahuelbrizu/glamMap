import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  roleRequired?: 'client' | 'business' | 'admin';
}

export const ProtectedRoute = ({ children, roleRequired }: Props) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background-dark">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 text-sm font-medium">Cargando perfil...</p>
      </div>
    );
  }

  // Si no está logueado, guardamos la ruta actual para volver después del login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Validación de rol estricta
  if (roleRequired && user.role !== roleRequired) {
    console.error(`Acceso denegado. Rol requerido: ${roleRequired}. Tu rol: ${user.role}`);
    
    // Redirección inteligente según el rol que sí tiene el usuario
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'business') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/explore" replace />;
  }

  return <>{children}</>;
};