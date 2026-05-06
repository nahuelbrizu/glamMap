import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import { FiCamera, FiUser, FiPhone, FiMail, FiLock, FiSave, FiHeart } from 'react-icons/fi';

export const EditProfile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/users/profile', formData);
      setUser(res.data.user); // Actualizamos el contexto global
      alert("Perfil actualizado con éxito");
      navigate('/profile');
    } catch (error) {
      console.error("Error al actualizar perfil", error);
      alert("Error al guardar los cambios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen flex flex-col font-display">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-primary transition-colors font-medium">
          Cancelar
        </button>
        <h1 className="text-lg font-bold absolute left-1/2 -translate-x-1/2">Editar Perfil</h1>
      </header>

      <main className="flex-1 w-full max-w-lg mx-auto pb-28 px-4">
        {/* Avatar Section */}
        <div className="flex flex-col items-center pt-8 pb-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
              <img 
                src={user?.avatar_url || `https://ui-avatars.com/api/?name=${formData.name}&background=13c8ec&color=fff`} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow-lg border-2 border-background-light dark:border-background-dark hover:scale-110 transition-transform">
              <FiCamera size={18} />
            </button>
          </div>
          <button className="mt-4 text-primary font-bold text-sm">Cambiar foto</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FiUser className="text-primary" /> Información Personal
            </h3>
            <div className="space-y-4">
              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-500 mb-1.5">Nombre Completo</span>
                <input 
                  className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 h-12 focus:ring-2 ring-primary/50 outline-none"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </label>

              <label className="flex flex-col">
                <span className="text-sm font-medium text-slate-500 mb-1.5">Número de Teléfono</span>
                <div className="relative">
                  <input 
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl pl-4 pr-12 h-12 focus:ring-2 ring-primary/50 outline-none"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                  <FiPhone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </label>

              <label className="flex flex-col opacity-75 cursor-not-allowed">
                <span className="text-sm font-medium text-slate-500 mb-1.5 flex justify-between">
                  Correo Electrónico
                  <span className="text-xs flex items-center gap-1"><FiLock /> No editable</span>
                </span>
                <div className="relative">
                  <input 
                    className="w-full bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 rounded-xl px-4 h-12 outline-none"
                    readOnly 
                    type="email" 
                    value={formData.email} 
                  />
                  <FiMail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </label>
            </div>
          </div>
        </form>
      </main>

      {/* Footer Button */}
      <footer className="fixed bottom-0 left-0 w-full bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-slate-800 p-4 z-40">
        <div className="max-w-lg mx-auto">
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-primary hover:bg-cyan-400 text-white font-bold h-12 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiSave /> Guardar Cambios</>}
          </button>
        </div>
      </footer>
    </div>
  );
};