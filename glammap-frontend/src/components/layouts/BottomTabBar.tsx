// src/components/layouts/BottomTabBar.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const BottomTabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { name: 'explore', icon: 'explore', path: '/explore' },
    { name: 'citas', icon: 'calendar_today', path: '/appointments' },
    { name: 'favoritos', icon: 'favorite', path: '/favorites' },
    { name: 'perfil', icon: 'person', path: '/profile' },
  ];

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-30">
      <div className="bg-secondary/95 backdrop-blur-lg rounded-[2.5rem] h-20 shadow-2xl flex items-center justify-around px-4 border border-white/10">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.name}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center gap-1 transition-all duration-300
                ${isActive ? 'text-primary' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <span className={`material-symbols-outlined text-[28px] ${isActive ? 'fill-current font-variation-fill' : ''}`}>
                {tab.icon}
              </span>
              {isActive && <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};