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
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display pb-32">
      {/* Header / Cover */}
      <div className="relative h-48 bg-gradient-to-br from-primary to-secondary rounded-b-[3rem] shadow-lg">
        <div className="absolute -bottom-12 left-0 w-full flex justify-center">
          <div className="relative">
            <img 
              src={userData.avatar} 
              alt="Profile" 
              className="w-24 h-24 rounded-[2rem] border-4 border-white dark:border-background-dark shadow-xl object-cover"
            />
            <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-4 border-white dark:border-background-dark"></div>
          </div>
        </div>
      </div>

      {/* Info Usuario */}
      <div className="mt-16 text-center px-6">
        <h1 className="text-2xl font-black uppercase tracking-tight">{userData.name}</h1>
        <p className="text-slate-500 text-sm font-medium">{userData.email}</p>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-3 gap-4 px-6 mt-8">
        {userData.stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-surface-dark p-4 rounded-[2rem] border border-gray-100 dark:border-white/5 text-center">
            <p className="text-xl font-black text-primary">{stat.value}</p>
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-tighter">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Menú de Opciones */}
      <div className="px-6 mt-10 space-y-3">
        <button className="w-full flex items-center justify-between p-5 bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-white/5 active:scale-95 transition-all">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-primary">person</span>
            <span className="font-bold">Editar Perfil</span>
          </div>
          <span className="material-symbols-outlined text-slate-300">chevron_right</span>
        </button>

        <button className="w-full flex items-center justify-between p-5 bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-white/5 active:scale-95 transition-all">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-primary">notifications</span>
            <span className="font-bold">Notificaciones</span>
          </div>
          <span className="material-symbols-outlined text-slate-300">chevron_right</span>
        </button>

        <button 
          onClick={logout}
          className="w-full flex items-center gap-4 p-5 bg-red-50 dark:bg-red-500/10 rounded-3xl text-red-500 active:scale-95 transition-all mt-6"
        >
          <span className="material-symbols-outlined">logoutxxxxx</span>
          <span className="font-black uppercase text-sm tracking-wider">Cerrar Sesión</span>
        </button>
      </div>

      <BottomTabBar activeTab="profile" />
    </div>
  );
};