import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosInstance"; 
import { FiEye, FiEyeOff, FiAlertCircle, FiArrowRight, FiMail, FiLock, FiPhone } from 'react-icons/fi';
import { FaGoogle } from 'react-icons/fa'; // For Google icon
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post('/auth/register', formData);
      console.log("Registro exitoso:", response.data);
      navigate("/login");
    } catch (err: any) {
      console.error("Error en el registro:", err);
      setError(err.response?.data?.message || "Ocurrió un error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    const baseUrl = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3000/api';
    window.location.href = `${baseUrl}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-12 flex flex-col">
      <Button 
        onClick={() => navigate(-1)} 
        variant="ghost"
        className="mb-8 w-fit"
        aria-label="Go back"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Volver
      </Button>

      <div className="flex-1 max-w-md mx-auto w-full">
        <h2 className="text-3xl font-bold mb-2">Crea tu cuenta</h2>
        <p className="text-slate-400 mb-8 font-medium">Únete a la comunidad de estética más grande.</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-2xl mb-6 text-sm flex items-center gap-2">
            <FiAlertCircle className="text-red-500"/> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Nombre Completo"
            type="text"
            required
            placeholder="Ej. Juan Pérez"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />

          <Input 
            label="Email"
            type="email"
            required
            placeholder="tu@email.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            icon={<FiMail />}
          />

          <Input 
            label="Teléfono (WhatsApp)"
            type="tel"
            required
            placeholder="+54 9 11 ..."
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            icon={<FiPhone />}
          />

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Contraseña</label>
            <div className="relative group">
              <Input 
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                icon={<FiLock />}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff className="text-lg"/> : <FiEye className="text-lg"/>}
              </button>
            </div>
            <p className="text-xs text-slate-500 ml-1">Debe tener al menos 8 caracteres.</p>
          </div>

          <Button type="submit" disabled={loading} className="mt-8">
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                Crear Cuenta <FiArrowRight className="ml-2"/>
              </>
            )}
          </Button>
        </form>

        <div className="text-center space-y-4 mt-8">
          <p className="text-slate-500 text-sm">
            ¿Ya tienes cuenta?{' '}
            <Button onClick={() => navigate("/login")} variant="ghost">
              Inicia Sesión
            </Button>
          </p>
          
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-950 px-2 text-slate-600 font-medium">O continúa con</span></div>
          </div>

          <Button
            onClick={handleGoogleSignUp}
            variant="secondary"
            className="bg-white text-slate-900 border-slate-100 hover:bg-slate-50"
          >
            <FaGoogle className="w-6 h-6 text-slate-900"/>
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
