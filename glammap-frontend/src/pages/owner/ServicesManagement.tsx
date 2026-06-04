import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceService, type Service } from '../../api/services/service.service';

interface ServiceFormData {
  name: string;
  price: string;
  duration_minutes: string;
}

const EMPTY_FORM: ServiceFormData = { name: '', price: '', duration_minutes: '30' };

export const ServicesManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>(EMPTY_FORM);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['owner-services'],
    queryFn: serviceService.getOwnerServices,
  });

  const createMutation = useMutation({
    mutationFn: (data: ServiceFormData) =>
      serviceService.createService({
        name: data.name,
        price: Number(data.price),
        duration_minutes: Number(data.duration_minutes),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-services'] });
      setIsModalOpen(false);
      setFormData(EMPTY_FORM);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ServiceFormData }) =>
      serviceService.updateService(id, {
        name: data.name,
        price: Number(data.price),
        duration_minutes: Number(data.duration_minutes),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-services'] });
      setIsModalOpen(false);
      setEditingService(null);
      setFormData(EMPTY_FORM);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => serviceService.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-services'] });
    },
  });

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      price: String(service.price),
      duration_minutes: String(service.duration_minutes),
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este servicio?")) return;
    deleteMutation.mutate(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-[#f8fafb] dark:bg-[#0a1214] text-slate-900 dark:text-white font-display pb-32">

      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#f8fafb]/80 dark:bg-[#0a1214]/80 backdrop-blur-lg p-6 flex items-center justify-between border-b dark:border-white/5">
        <button
          onClick={() => navigate(-1)}
          className="material-symbols-outlined bg-white dark:bg-[#121f22] p-3 rounded-2xl shadow-sm border dark:border-white/5 active:scale-90 transition-all"
          aria-label="Volver"
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
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-[#121f22] rounded-[2.5rem] animate-pulse" />
          ))
        ) : services.length > 0 ? (
          services.map((service) => {
            const isDeleting = deleteMutation.isPending && deleteMutation.variables === service.id;
            return (
              <div
                key={service.id}
                className={`bg-white dark:bg-[#121f22] p-5 rounded-[2.5rem] border border-gray-100 dark:border-white/5 flex items-center justify-between shadow-sm transition-all ${isDeleting ? 'opacity-50 scale-95' : ''}`}
              >
                <button
                  className="flex items-center gap-4 text-left flex-1"
                  onClick={() => handleOpenEdit(service)}
                  aria-label={`Editar ${service.name}`}
                >
                  <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-3xl font-light">content_cut</span>
                  </div>
                  <div>
                    <p className="font-black text-lg tracking-tight">{service.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-md text-slate-500 uppercase tracking-tighter">
                        {service.duration_minutes} min
                      </span>
                      <span className="text-primary font-black text-sm">${service.price}</span>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  disabled={isDeleting}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all ml-2"
                  aria-label={`Eliminar ${service.name}`}
                >
                  <span className="material-symbols-outlined">
                    {isDeleting ? 'refresh' : 'delete'}
                  </span>
                </button>
              </div>
            );
          })
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
          onClick={handleOpenCreate}
          className="w-full bg-primary text-slate-950 py-5 rounded-[2.2rem] font-black text-lg shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-95 hover:brightness-110 transition-all"
        >
          <span className="material-symbols-outlined text-2xl">add_circle</span>
          NUEVO SERVICIO
        </button>
      </div>

      {/* MODAL BOTTOM SHEET */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60] flex items-end">
          <div className="absolute inset-0" onClick={() => { setIsModalOpen(false); setEditingService(null); setFormData(EMPTY_FORM); }}></div>

          <form
            onSubmit={handleSubmit}
            className="relative bg-white dark:bg-[#0a1214] w-full rounded-t-[3rem] p-8 border-t border-white/10 animate-slide-up shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
          >
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-white/10 rounded-full mx-auto mb-6"></div>

            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">
                  {editingService ? 'Editar Servicio' : 'Configurar Servicio'}
                </h3>
                <p className="text-xs text-slate-500 font-bold">Completa los detalles para tus clientes</p>
              </div>
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); setEditingService(null); setFormData(EMPTY_FORM); }}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center"
                aria-label="Cerrar"
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
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
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
                      min="0"
                      className="w-full bg-slate-50 dark:bg-[#121f22] border-none rounded-[1.5rem] py-5 pl-10 pr-6 focus:ring-2 ring-primary/40 font-black text-lg"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-primary ml-4 tracking-[0.2em]">Duración</label>
                  <select
                    className="w-full bg-slate-50 dark:bg-[#121f22] border-none rounded-[1.5rem] py-5 px-7 focus:ring-2 ring-primary/40 font-black text-lg appearance-none"
                    value={formData.duration_minutes}
                    onChange={e => setFormData({ ...formData, duration_minutes: e.target.value })}
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
              disabled={isSaving}
              className="w-full mt-10 py-5 rounded-[2rem] bg-primary text-slate-950 font-black text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving
                ? <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                : editingService ? 'GUARDAR CAMBIOS' : 'CREAR SERVICIO'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
