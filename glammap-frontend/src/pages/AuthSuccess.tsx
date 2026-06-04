import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, type UserRole } from '../context/AuthContext';

const HOME_BY_ROLE: Record<UserRole, string> = {
  admin: '/admin',
  owner: '/dashboard',
  client: '/explore',
};

export const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const role = (searchParams.get('role') ?? 'client') as UserRole;

    if (!token) {
      navigate('/login');
      return;
    }

    login(token).then(() => {
      navigate(HOME_BY_ROLE[role] ?? '/explore');
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background font-display">
      <div className="relative flex items-center justify-center w-16 h-16" aria-label="Autenticando">
        <div className="w-16 h-16 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
        <span className="absolute material-symbols-outlined text-primary text-4xl">done</span>
      </div>
      <h2 className="mt-6 text-xl font-black text-secondary">¡Acceso exitoso!</h2>
      <p className="text-slate-500 animate-pulse">Configurando tu experiencia...</p>
    </div>
  );
};
