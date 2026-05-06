import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';

export const BusinessProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Estados para el formulario
  const [formData, setFormData] = useState({
    name: 'Estética Bella',
    address: 'Av. Reforma 222, CDMX',
    description: '',
    phone: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Cargar datos reales al montar (opcional si ya vienen en el user context)
  useEffect(() => {
    if (user?.business) {
      setFormData({
        name: user.business.name || '',
        address: user.business.address || '',
        description: user.business.description || '',
        phone: user.business.phone || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulación de petición al backend
      // await api.patch('/business/profile', formData);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulación
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error al guardar perfil", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-[#0a1214] text-slate-900 dark:text-white font-display pb-10">
      
      {/* AppBar Dinámica */}
      <div className="sticky top-0 z-50 flex items-center bg-white/80 dark:bg-[#0a1214]/90 p-4 justify-between border-b dark:border-white/5 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="text-lg font-black tracking-tight">Perfil de Negocio</h2>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`font-black text-sm px-4 py-2 rounded-full transition-all ${
            saveSuccess ? 'bg-green-500 text-white' : 'text-primary hover:bg-primary/10'
          }`}
        >
          {isSaving ? '...' : saveSuccess ? '¡Listo!' : 'Guardar'}
        </button>
      </div>

      {/* Hero / Portada con Cambio de Foto */}
      <div className="relative h-52 bg-gradient-to-b from-primary/30 to-transparent flex items-end justify-center pb-8">
        <div className="relative group">
          <div className="w-36 h-36 rounded-[2.5rem] border-4 border-white dark:border-[#0a1214] bg-slate-200 overflow-hidden shadow-2xl transition-transform group-hover:scale-105">
            <img 
              src={user?.avatar_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=200&auto=format&fit=crop"} 
              alt="Logo" 
              className="w-full h-full object-cover" 
            />
          </div>
          <label className="absolute bottom-[-10px] right-[-10px] bg-primary text-slate-950 p-3 rounded-2xl shadow-xl cursor-pointer hover:scale-110 active:scale-90 transition-all">
            <span className="material-symbols-outlined text-xl">photo_camera</span>
            <input type="file" className="hidden" accept="image/*" />
          </label>
        </div>
      </div>

      <div className="px-6 space-y-8 mt-6 max-w-lg mx-auto">
        
        {/* Sección: Información General */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <span className="material-symbols-outlined text-primary text-sm">info</span>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Información General</h3>
          </div>
          
          <div className="space-y-4">
            <div className="group bg-white dark:bg-[#121f22] p-4 rounded-[2rem] border border-gray-100 dark:border-white/5 focus-within:border-primary/50 transition-all shadow-sm">
              <label className="text-[9px] uppercase font-black text-primary ml-1">Nombre Comercial</label>
              <input 
                type="text" 
                className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-lg mt-1" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="group bg-white dark:bg-[#121f22] p-4 rounded-[2rem] border border-gray-100 dark:border-white/5 focus-within:border-primary/50 transition-all shadow-sm">
              <label className="text-[9px] uppercase font-black text-primary ml-1">Dirección Física</label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-sm mt-1" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
                <span className="material-symbols-outlined text-slate-400 text-lg">map</span>
              </div>
            </div>
          </div>
        </section>

        {/* Sección: Atajos de Gestión */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Configuración de Negocio</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/owner/services')} 
              className="bg-white dark:bg-[#121f22] p-6 rounded-[2.5rem] flex flex-col items-center gap-3 border border-gray-100 dark:border-white/5 hover:border-primary/40 active:scale-95 transition-all shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">content_cut</span>
              </div>
              <span className="font-bold text-sm">Servicios</span>
            </button>
            
            <button className="bg-white dark:bg-[#121f22] p-6 rounded-[2.5rem] flex flex-col items-center gap-3 border border-gray-100 dark:border-white/5 hover:border-primary/40 active:scale-95 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">schedule</span>
              </div>
              <span className="font-bold text-sm">Horarios</span>
            </button>
          </div>
        </section>

        {/* Peligro / Salida */}
        <div className="pt-4">
          <button 
            onClick={logout}
            className="w-full py-5 rounded-[2rem] border-2 border-red-500/10 hover:bg-red-500/5 text-red-500 font-black flex items-center justify-center gap-2 transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            CERRAR SESIÓN
          </button>
          <p className="text-center text-[10px] text-slate-500 mt-6 font-bold uppercase tracking-widest opacity-50">ID Negocio: {user?.id?.substring(0,8)}</p>
        </div>
      </div>
    </div>
  );
};