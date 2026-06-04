import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axiosInstance';
import { FiCalendar, FiStar, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';

interface OwnerStats {
  appointmentsByStatus: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  avgRating: number | null;
  topService: { name: string; count: number } | null;
}

async function fetchOwnerStats(): Promise<OwnerStats> {
  const { data } = await api.get<OwnerStats>('/owner/stats');
  return data;
}

export const OwnerDashboard = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ['owner-stats'],
    queryFn: fetchOwnerStats,
  });

  return (
    <div className="p-6 bg-slate-50 dark:bg-[#0a1214] min-h-screen font-display pb-32">
      <header className="mb-8">
        <h1 className="text-2xl font-black text-secondary dark:text-white">Mi Negocio</h1>
        <p className="text-slate-500">Resumen de actividad</p>
      </header>

      {/* ── Stats Section ── */}
      <section className="mb-8">
        <h2 className="text-xs font-black uppercase tracking-widest text-primary mb-4">Estadísticas (últimos 30 días)</h2>

        {statsLoading && (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-[#121f22] rounded-[2rem] animate-pulse" />
            ))}
          </div>
        )}

        {statsError && (
          <div className="flex items-center gap-2 text-red-400 text-sm py-4">
            <FiAlertCircle />
            <span>No se pudieron cargar las estadísticas.</span>
          </div>
        )}

        {stats && !statsLoading && (
          <>
            {/* Appointments by status */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <StatCard
                label="Pendientes"
                value={stats.appointmentsByStatus.pending}
                color="bg-orange-500/10 text-orange-500"
                icon={<FiCalendar />}
              />
              <StatCard
                label="Confirmados"
                value={stats.appointmentsByStatus.confirmed}
                color="bg-emerald-500/10 text-emerald-500"
                icon={<FiCalendar />}
              />
              <StatCard
                label="Completados"
                value={stats.appointmentsByStatus.completed}
                color="bg-primary/10 text-primary"
                icon={<FiCalendar />}
              />
              <StatCard
                label="Cancelados"
                value={stats.appointmentsByStatus.cancelled}
                color="bg-red-500/10 text-red-400"
                icon={<FiCalendar />}
              />
            </div>

            {/* Rating + Top Service */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-[#121f22] rounded-[2rem] p-5 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col gap-2">
                <div className="flex items-center gap-2 text-amber-400">
                  <FiStar />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Rating Promedio</span>
                </div>
                <p className="text-3xl font-black text-amber-400">
                  {stats.avgRating != null ? stats.avgRating.toFixed(1) : '–'}
                </p>
                <p className="text-[10px] text-slate-400 font-bold">sobre 5.0</p>
              </div>

              <div className="bg-white dark:bg-[#121f22] rounded-[2rem] p-5 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary">
                  <FiTrendingUp />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Top Servicio</span>
                </div>
                {stats.topService ? (
                  <>
                    <p className="text-sm font-black leading-tight line-clamp-2">{stats.topService.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{stats.topService.count} reservas</p>
                  </>
                ) : (
                  <p className="text-sm text-slate-400 font-bold">Sin datos aún</p>
                )}
              </div>
            </div>
          </>
        )}
      </section>

      {/* ── Quick Actions ── */}
      <section className="bg-white dark:bg-[#121f22] rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-white/5">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg dark:text-white">Acciones rápidas</h3>
        </div>
        <div className="space-y-3">
          <QuickLink
            icon="calendar_month"
            label="Ver mis turnos"
            onClick={() => navigate('/owner/appointments')}
          />
          <QuickLink
            icon="content_cut"
            label="Gestionar servicios"
            onClick={() => navigate('/owner/services')}
          />
          <QuickLink
            icon="store"
            label="Perfil del negocio"
            onClick={() => navigate('/owner/profile')}
          />
        </div>
      </section>
    </div>
  );
};

// ── Sub-components ──

interface StatCardProps {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}

const StatCard = ({ label, value, color, icon }: StatCardProps) => (
  <div className="bg-white dark:bg-[#121f22] rounded-[2rem] p-5 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col gap-2">
    <div className={`flex items-center gap-2 ${color}`}>
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
    </div>
    <p className={`text-3xl font-black ${color}`}>{value}</p>
  </div>
);

interface QuickLinkProps {
  icon: string;
  label: string;
  onClick: () => void;
}

const QuickLink = ({ icon, label, onClick }: QuickLinkProps) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-95"
  >
    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
      <span className="material-symbols-outlined text-xl">{icon}</span>
    </div>
    <span className="flex-1 text-left font-bold text-sm dark:text-white">{label}</span>
    <span className="material-symbols-outlined text-slate-400">chevron_right</span>
  </button>
);
