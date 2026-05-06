import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      const target = user.role === 'admin' ? '/admin' : '/explore';
      navigate(target);
    }
  }, [user, authLoading, navigate]);

  const handleGoogleLogin = () => {
    const baseUrl = import.meta.env.VITE_REACT_APP_API_URL || '/api';
    window.location.href = `${baseUrl}/auth/google`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      await login(token, userData.role);
      navigate(userData.role === 'admin' ? '/admin' : '/explore');
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Credenciales incorrectas. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center px-6 py-12">
      <div className="w-full max-w-md mx-auto space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <span className="material-symbols-outlined text-4xl text-primary">content_cut</span>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Bienvenido a GlamMap</h2>
          <p className="text-slate-400 mt-2">Ingresa a tu cuenta de estética</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm flex items-center gap-2 animate-bounce">
              <FiAlertCircle /> {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              aria-label="Correo electrónico"
              icon={<FiMail />}
            />

            <div className="relative group">
              <Input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                aria-label="Contraseña"
                icon={<FiLock />}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="button" variant="ghost">
              ¿Olvidaste tu contraseña?
            </Button>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                Entrar <FiArrowRight />
              </>
            )}
          </Button>
        </form>

        <div className="text-center space-y-4">
          <p className="text-slate-500 text-sm">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-primary font-bold hover:underline">
              Regístrate aquí
            </Link>
          </p>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-950 px-2 text-slate-600 font-medium">O continúa con</span></div>
          </div>

          <Button
            onClick={handleGoogleLogin}
            variant="secondary"
            className="bg-white text-slate-900 border-slate-100 hover:bg-slate-50"
          >
            <img
              src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
              alt="Google"
              className="w-6 h-6"
            />
            Continuar con Google
          </Button>

          <p className="mt-6 text-xs text-center text-slate-400">
            Al continuar, aceptas nuestros <span className="underline cursor-pointer">Términos y Condiciones</span>
          </p>
        </div>
      </div>
    </div>
  );
};
