import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BottomTabBar } from '../../layouts/BottomTabBar';
import { appointmentService, type Appointment } from '../../api/services/appointment.service';
import { FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const STATUS_INFO: Record<Appointment['status'], { text: string; color: string; icon: React.ReactNode }> = {
  confirmed: { text: 'Confirmado', color: 'text-emerald-400', icon: <FiCheckCircle className="text-emerald-400" /> },
  pending:   { text: 'Pendiente',  color: 'text-orange-500',  icon: <FiClock className="text-orange-500" /> },
  cancelled: { text: 'Cancelado',  color: 'text-red-400',     icon: <FiAlertCircle className="text-red-400" /> },
  completed: { text: 'Finalizado', color: 'text-slate-400',   icon: <FiClock className="text-slate-400" /> },
};

export const Appointments = () => {
  const [activeTab, setActiveTab] = useState<'next' | 'history'>('next');
  const navigate = useNavigate();

  const { data: appointments = [], isLoading, isError } = useQuery({
    queryKey: ['my-appointments'],
    queryFn: appointmentService.getMyAppointments,
  });

  const filtered = useMemo(() => {
    return appointments.filter(a =>
      activeTab === 'next'
        ? a.status === 'confirmed' || a.status === 'pending'
        : a.status === 'completed' || a.status === 'cancelled'
    );
  }, [appointments, activeTab]);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display pb-24 transition-colors">
      <div className="p-6">
        <h1 className="text-3xl font-black uppercase mb-6 tracking-tighter">Mis Turnos</h1>

        <div className="flex bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl mb-8">
          {(['next', 'history'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === tab ? 'bg-primary text-background-dark shadow-lg' : 'text-slate-500'}`}
              aria-pressed={activeTab === tab}
            >
              {tab === 'next' ? 'Próximos' : 'Historial'}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {isLoading && <div className="text-center py-8 text-slate-500">Cargando turnos...</div>}

          {isError && (
            <div className="flex flex-col items-center justify-center py-16 text-red-400">
              <FiAlertCircle className="text-4xl mb-4" />
              <p className="text-lg">No se pudieron cargar los turnos.</p>
              <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-primary text-slate-900 rounded-xl font-bold">
                Reintentar
              </button>
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <span className="material-symbols-outlined text-5xl mb-2 opacity-20">calendar_today</span>
              <p className="text-base font-bold mb-2">
                {activeTab === 'next' ? 'No tienes turnos próximos' : 'Tu historial está vacío'}
              </p>
              <p className="text-xs">¡Empieza a reservar tus citas!</p>
            </div>
          )}

          {filtered.map(item => {
            const info = STATUS_INFO[item.status];
            const date = new Date(item.start_time);
            const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const day = date.toLocaleDateString('es-AR', { day: '2-digit' });
            const month = date.toLocaleDateString('es-AR', { month: 'short' }).toUpperCase();

            return (
              <div key={item.id} className="bg-white dark:bg-surface-dark p-5 rounded-[2.5rem] border border-gray-100 dark:border-white/5 flex items-center gap-5">
                <div className="flex flex-col items-center justify-center bg-slate-100 dark:bg-white/5 w-16 h-16 rounded-3xl">
                  <span className="text-[10px] font-black text-primary uppercase">{month}</span>
                  <span className="text-xl font-black">{day}</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {info.icon}
                    <span className={`text-[10px] font-black uppercase tracking-widest opacity-60 ${info.color}`}>{info.text}</span>
                  </div>
                  <h4 className="font-bold text-base leading-none line-clamp-1">{item.business_name}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{item.service_name} • {time} HS</p>
                </div>

                <button
                  onClick={() => navigate(`/business/${item.business_id}`)}
                  className="bg-slate-50 dark:bg-white/5 p-2 rounded-full text-slate-400 hover:bg-white/10 transition-colors"
                  aria-label={`Opciones para turno en ${item.business_name}`}
                >
                  <span className="material-symbols-outlined text-xl">more_vert</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <BottomTabBar activeTab="appointments" />
    </div>
  );
};
