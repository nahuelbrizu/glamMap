import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';

export const ServicesManagement = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [newService, setNewService] = useState({
    name: '',
    price: '',
    duration: '30'
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/owner/services');
      setServices(res.data);
    } catch (err) {
      // Mock mejorado para visualización
      setServices([
        { id: 1, name: "Corte Masculino", price: 800, duration: 30 },
        { id: 2, name: "Barba Premium", price: 500, duration: 20 },
        { id: 3, name: "Coloración Full", price: 2500, duration: 60 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este servicio?")) return;
    
    setDeletingId(id);
    try {
      // await api.delete(`/owner/services/${id}`);
      await new Promise(res => setTimeout(res, 800)); // Simulación
      setServices(services.filter(s => s.id !== id));
    } catch (err) {
      alert("No se pudo eliminar el servicio");
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // const res = await api.post('/owner/services', newService);
      setServices([{ ...newService, id: Date.now() }, ...services]);
      setIsModalOpen(false);
      setNewService({ name: '', price: '', duration: '30' });
    } catch (err) {
      alert("Error al guardar");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafb] dark:bg-[#0a1214] text-slate-900 dark:text-white font-display pb-32">
      
      {/* Header Estilizado */}
      <div className="sticky top-0 z-40 bg-[#f8fafb]/80 dark:bg-[#0a1214]/80 backdrop-blur-lg p-6 flex items-center justify-between border-b dark:border-white/5">
        <button 
          onClick={() => navigate(-1)} 
          className="material-symbols-outlined bg-white dark:bg-[#121f22] p-3 rounded-2xl shadow-sm border dark:border-white/5 active:scale-90 transition-all"
        >
          arrow_back
        </button>
        <div className="text-center">
          <h1 className="text-xl font-black tracking-tighter uppercase italic">Mis Servicios</h1>
          <p className="text-[10px] font-bold text-primary tracking-widest uppercase">{services.length} Activos</p>
        </div>
        <div className="w-12"></div>
      </div>

      <div className="px-6 space-y-4 mt-6">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-[#121f22] rounded-[2.5rem] animate-pulse" />
          ))
        ) : services.length > 0 ? (
          services.map((service) => (
            <div 
              key={service.id} 
              className={`bg-white dark:bg-[#121f22] p-5 rounded-[2.5rem] border border-gray-100 dark:border-white/5 flex items-center justify-between shadow-sm transition-all ${deletingId === service.id ? 'opacity-50 scale-95' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-3xl font-light">content_cut</span>
                </div>
                <div>
                  <p className="font-black text-lg tracking-tight">{service.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-md text-slate-500 uppercase tracking-tighter">
                      {service.duration} min
                    </span>
                    <span className="text-primary font-black text-sm">${service.price}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(service.id)}
                disabled={deletingId === service.id}
                className="w-10 h-10 rounded-full flex items-center justify-center text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all"
              >
                <span className="material-symbols-outlined">
                  {deletingId === service.id ? 'refresh' : 'delete'}
                </span>
              </button>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <span className="material-symbols-outlined text-7xl mb-4">inventory_2</span>
            <p className="font-bold">No hay servicios registrados</p>
          </div>
        )}
      </div>

      {/* Botón Flotante */}
      <div className="fixed bottom-10 left-0 w-full px-6 z-50">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-primary text-slate-950 py-5 rounded-[2.2rem] font-black text-lg shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-95 hover:brightness-110 transition-all"
        >
          <span className="material-symbols-outlined text-2xl">add_circle</span>
          NUEVO SERVICIO
        </button>
      </div>

      {/* MODAL BOTTOM SHEET */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60] flex items-end">
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)}></div>
          
          <form 
            onSubmit={handleAddService} 
            className="relative bg-white dark:bg-[#0a1214] w-full rounded-t-[3rem] p-8 border-t border-white/10 animate-slide-up shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
          >
            {/* Handle visual para el usuario */}
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-white/10 rounded-full mx-auto mb-6"></div>

            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">Configurar Servicio</h3>
                <p className="text-xs text-slate-500 font-bold">Completa los detalles para tus clientes</p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-primary ml-4 tracking-[0.2em]">Nombre del servicio</label>
                <input 
                  required
                  autoFocus
                  type="text" 
                  placeholder="Ej: Corte + Lavado"
                  className="w-full bg-slate-50 dark:bg-[#121f22] border-none rounded-[1.5rem] py-5 px-7 focus:ring-2 ring-primary/40 font-bold text-lg"
                  value={newService.name}
                  onChange={e => setNewService({...newService, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-primary ml-4 tracking-[0.2em]">Precio ($)</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
                    <input 
                      required
                      type="number" 
                      className="w-full bg-slate-50 dark:bg-[#121f22] border-none rounded-[1.5rem] py-5 pl-10 pr-6 focus:ring-2 ring-primary/40 font-black text-lg"
                      value={newService.price}
                      onChange={e => setNewService({...newService, price: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-primary ml-4 tracking-[0.2em]">Duración</label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-[#121f22] border-none rounded-[1.5rem] py-5 px-7 focus:ring-2 ring-primary/40 font-black text-lg appearance-none"
                    value={newService.duration}
                    onChange={e => setNewService({...newService, duration: e.target.value})}
                  >
                    {[15, 30, 45, 60, 90, 120].map(m => (
                      <option key={m} value={m}>{m} min</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full mt-10 py-5 rounded-[2rem] bg-primary text-slate-950 font-black text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all"
            >
              CREAR SERVICIO
            </button>
          </form>
        </div>
      )}
    </div>
  );
};