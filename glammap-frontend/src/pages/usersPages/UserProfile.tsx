import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { BottomTabBar } from '../../layouts/BottomTabBar';

export const UserProfile = () => {
  const { user, logout } = useAuth();

  // Datos de ejemplo si el backend aún no devuelve el objeto completo
  const userData = {
    name: user?.name || "Usuario GlamMap",
    email: user?.email || "usuario@ejemplo.com",
    avatar: user?.picture || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    stats: [
      { label: 'Turnos', value: '12' },
      { label: 'Favoritos', value: '8' },
      { label: 'Reseñas', value: '5' }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-display pb-32">
      {/* Header / Cover */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-primary to-secondary rounded-b-[3rem] shadow-lg mb-16">
        <div className="absolute -bottom-16 left-0 w-full flex justify-center">
          <div className="relative">
            <img 
              src={userData.avatar} 
              alt="Profile" 
              className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] border-4 border-white dark:border-slate-950 shadow-xl object-cover bg-white"
            />
            <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 bg-green-500 w-6 h-6 md:w-8 md:h-8 rounded-full border-4 border-white dark:border-slate-950"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        {/* Info Usuario */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">{userData.name}</h1>
          <p className="text-slate-500 text-sm md:text-base font-medium mt-1">{userData.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Stats Quick View */}
          <div className="grid grid-cols-3 gap-4">
            {userData.stats.map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 text-center shadow-sm">
                <p className="text-3xl font-black text-primary mb-1">{stat.value}</p>
                <p className="text-xs font-bold uppercase text-slate-400 tracking-tighter">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Menú de Opciones */}
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-5 bg-white dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5 active:scale-95 transition-all shadow-sm hover:border-primary/50 group">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">person</span>
                <span className="font-bold text-sm md:text-base">Editar Perfil</span>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </button>

            <button className="w-full flex items-center justify-between p-5 bg-white dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5 active:scale-95 transition-all shadow-sm hover:border-primary/50 group">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">notifications</span>
                <span className="font-bold text-sm md:text-base">Notificaciones</span>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </button>

            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 p-5 bg-red-50 dark:bg-red-500/10 rounded-3xl text-red-500 active:scale-95 transition-all mt-8 hover:bg-red-100 dark:hover:bg-red-500/20"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="font-black uppercase text-sm tracking-wider">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      <BottomTabBar activeTab="profile" />
    </div>
  );
};