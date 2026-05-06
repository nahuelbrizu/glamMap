import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  activeTab: 'home' | 'appointments' | 'favorites' | 'profile' | 'admin' | null;
}

export const BottomTabBar = ({ activeTab }: Props) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const tabs = [
    { id: 'home', icon: 'explore', label: 'Explorar', path: '/explore' },
    { id: 'appointments', icon: 'calendar_month', label: 'Turnos', path: '/appointments' },
    { id: 'favorites', icon: 'favorite', label: 'Favoritos', path: '/favorites' },
    { id: 'profile', icon: 'person', label: 'Perfil', path: '/profile' },
  ];

  if (user?.role === 'admin') {
    tabs.splice(1, 0, { id: 'admin', icon: 'admin_panel_settings', label: 'Admin', path: '/admin' });
  }

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-gray-100 dark:border-white/5 px-6 pb-8 pt-3 z-50">
      <div className="flex justify-between items-center max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center gap-1 transition-all active:scale-90 p-2"
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              <div className={`
                p-2 rounded-2xl transition-all
                ${isActive 
                  ? 'bg-primary text-slate-950 shadow-lg shadow-primary/20' 
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}
              `}>
                <span className={`material-symbols-outlined ${isActive ? 'fill-current scale-110' : ''}`}>
                  {tab.icon}
                </span>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-tighter hidden sm:block ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-600'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};