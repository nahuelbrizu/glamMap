// src/components/layouts/SearchBar.tsx
import React from 'react';

type Props = {
  onSearch: (text: string) => void;
};

export const SearchBar = ({ onSearch }: Props) => {
  return (
    <div className="px-6 w-full">
      <div className="flex items-center w-full h-14 bg-white shadow-xl rounded-3xl px-5 border border-slate-100">
        <span className="material-symbols-outlined text-slate-400">search</span>
        <input 
          type="text" 
          placeholder="¿Qué servicio buscas hoy?" 
          className="flex-1 ml-3 bg-transparent outline-none text-secondary font-medium placeholder:text-slate-300"
          onChange={(e) => onSearch(e.target.value)}
        />
        <button className="text-primary material-symbols-outlined hover:scale-110 transition-transform">
          tune
        </button>
      </div>
    </div>
  );
};