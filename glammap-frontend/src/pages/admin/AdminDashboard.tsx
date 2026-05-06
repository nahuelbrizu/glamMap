import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import MainLayout from '../../layouts/MainLayout';

export const AdminDashboard = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'usuarios' | 'negocios' | 'turnos' | 'reportes'>('usuarios');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Carga de datos centralizada
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setData([]); // Limpiar datos al cambiar de pestaña para evitar flashes visuales
      try {
        let endpoint = '';
        switch (activeTab) {
          case 'usuarios': 
            endpoint = '/users/all'; 
            break;
          case 'negocios': 
            endpoint = '/business/explore'; 
            break;
          case 'turnos': 
            endpoint = '/users/appointments'; 
            break;
          case 'reportes':
            break;
        }


        if (endpoint) {
          const res = await api.get(endpoint);
          // Aseguramos que data siempre sea un array
          setData(Array.isArray(res.data) ? res.data : res.data ? [res.data] : []);
        }
      } catch (err: any) {
        console.error(`Error cargando ${activeTab}:`, err.response?.status);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  // 2. Filtro Robusto (Memorizado para optimizar rendimiento)
  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (!item) return false;
      const search = searchTerm.toLowerCase();
      return (
        (item.name || "").toLowerCase().includes(search) ||
        (item.email || "").toLowerCase().includes(search) ||
        (item.address || "").toLowerCase().includes(search) ||
        (item.role || "").toLowerCase().includes(search)
      );
    });
  }, [data, searchTerm]);

  return (
    <MainLayout>
      <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center bg-white/95 dark:bg-[#101f22]/95 backdrop-blur-md p-4 justify-between border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 w-full max-w-7xl mx-auto px-2 md:px-6">
            <span className="material-symbols-outlined text-2xl text-primary">admin_panel_settings</span>
            <h2 className="text-lg font-bold tracking-tight uppercase flex-1">Panel Admin</h2>
            <button onClick={logout} className="p-2 text-red-500 hover:bg-red-50/10 rounded-full transition-all flex items-center gap-2">
              <span className="hidden md:inline font-bold text-sm">Cerrar Sesión</span>
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col gap-6">
          {/* Top Section: Stats & Controls */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Stats (Mobile: Row, Desktop: Col spanning 4) */}
            <section className="grid grid-cols-2 gap-4 md:col-span-4 lg:col-span-3">
              <StatCard icon="group" value={activeTab === 'usuarios' ? data.length : "..."} label="Total" color="text-primary" />
              <StatCard icon="analytics" value="Active" label="Status" color="text-yellow-500" />
            </section>

            {/* Controls (Tabs & Search) - Spans remaining columns */}
            <div className="flex flex-col gap-4 md:col-span-8 lg:col-span-9">
              {/* Selector de Pestañas */}
              <div className="flex p-1 bg-white dark:bg-white/5 rounded-2xl overflow-x-auto no-scrollbar border border-gray-100 dark:border-white/10 shadow-sm">
                {(['usuarios', 'negocios', 'turnos', 'reportes'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); setSearchTerm(''); }}
                    className={`flex-1 min-w-[100px] py-3 md:py-2.5 rounded-xl text-xs md:text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeTab === tab 
                      ? 'bg-primary shadow-md text-slate-950' 
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Buscador */}
              <div className="flex items-center bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 px-4 h-14 focus-within:ring-2 ring-primary/50 transition-all shadow-sm">
                <span className="material-symbols-outlined text-slate-400 mr-3">search</span>
                <input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Filtrar ${activeTab}...`}
                  className="bg-transparent border-none text-base md:text-sm w-full focus:ring-0 outline-none text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Lista Dinámica (Grid on Desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20 md:pb-6">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-24 bg-white dark:bg-white/5 rounded-2xl animate-pulse border border-gray-100 dark:border-white/5" />)
            ) : filteredData.length > 0 ? (
              filteredData.map((item) => {
                if (activeTab === 'usuarios') return (
                  <UserListItem key={item.id} name={item.name} email={item.email} status={item.role} />
                );
                if (activeTab === 'negocios') return (
                  <BusinessListItem key={item.id} name={item.name} location={item.address} status={item.status || "Activo"} />
                );
                if (activeTab === 'turnos') return (
                  <AppointmentListItem key={item.id} item={item} />
                );
                return null;
              })
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white dark:bg-white/5 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                <span className="material-symbols-outlined text-6xl mb-4 text-slate-300 dark:text-slate-700">inventory_2</span>
                <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Sin registros encontrados</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </MainLayout>
  );
};

// --- Subcomponentes auxiliares ---

const AppointmentListItem = ({ item }: any) => (
  <div className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
    <div className="flex justify-between items-start">
      <div>
        <div className="flex items-center gap-2 mb-1">
           <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
           <p className="text-[10px] font-black text-primary uppercase">{item.date}</p>
        </div>
        <h4 className="font-bold text-sm">{item.service_name || 'Servicio General'}</h4>
        <p className="text-[10px] text-slate-500">{item.client_name || 'Cliente'}</p>
      </div>
      <div className="text-right">
        <span className="text-lg font-black tracking-tighter">{item.time}</span>
        <p className="text-[9px] font-bold text-slate-400 uppercase">Confirmado</p>
      </div>
    </div>
  </div>
);

const UserListItem = ({ name, email, status }: any) => (
  <div className="flex items-center gap-3 p-3 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
    <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black text-xs">
      {name?.charAt(0) || 'U'}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-bold truncate">{name}</h4>
      <p className="text-[10px] text-slate-500 truncate">{email}</p>
    </div>
    <span className={`text-[8px] px-2 py-1 rounded-lg font-black uppercase ${status === 'admin' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
      {status}
    </span>
  </div>
);

const BusinessListItem = ({ name, location, status }: any) => (
  <div className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
    <div className="flex items-center gap-3 mb-3">
      <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
        <span className="material-symbols-outlined">storefront</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold truncate">{name}</h4>
        <p className="text-[10px] text-slate-500 truncate">{location}</p>
      </div>
      <span className="text-[9px] font-black uppercase text-yellow-600 bg-yellow-600/10 px-2 py-1 rounded-md">{status}</span>
    </div>
    <div className="flex gap-2">
       <button className="flex-1 py-2 bg-primary text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest">Gestionar</button>
    </div>
  </div>
);

const StatCard = ({ icon, value, label, color }: any) => (
  <div className="p-4 bg-white dark:bg-white/5 rounded-[2rem] border border-gray-100 dark:border-white/5 relative overflow-hidden">
    <span className={`material-symbols-outlined absolute -right-2 -top-2 text-5xl opacity-10 ${color}`}>{icon}</span>
    <p className="text-2xl font-black tracking-tighter mb-1">{value}</p>
    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
  </div>
);