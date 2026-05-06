import React from 'react';

export const OwnerDashboard = () => {
  return (
    <div className="p-6 bg-slate-50 min-h-screen font-display">
      <header className="mb-8">
        <h1 className="text-2xl font-black text-secondary">Mi Negocio</h1>
        <p className="text-slate-500">Resumen de actividad para hoy</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-primary p-6 rounded-[2.5rem] text-white shadow-lg shadow-primary/20">
          <p className="text-xs font-bold uppercase opacity-80">Ganancias</p>
          <h2 className="text-3xl font-black mt-1">$45.2k</h2>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-xs font-bold uppercase text-slate-400">Turnos</p>
          <h2 className="text-3xl font-black text-secondary mt-1">12</h2>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg">Próximas Citas</h3>
          <button className="text-primary font-bold text-sm">Ver todas</button>
        </div>
        
        {/* Lista de citas */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-2">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-bold text-secondary">
              09:00
            </div>
            <div>
              <p className="font-bold text-secondary">María García</p>
              <p className="text-slate-400 text-xs text-secondary/60">Corte + Brushing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};