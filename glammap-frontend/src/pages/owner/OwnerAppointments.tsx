import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axiosInstance';
import { FiClock, FiCheckCircle, FiAlertCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

interface OwnerAppointment {
  id: string;
  client_name: string;
  service_name: string;
  start_time: string;
  status: AppointmentStatus;
}

interface PaginatedResponse {
  data: OwnerAppointment[];
  total: number;
  page: number;
  limit: number;
}

const LIMIT = 20;

const STATUS_LABELS: Record<AppointmentStatus, { text: string; color: string }> = {
  pending:   { text: 'Pendiente',  color: 'text-orange-400' },
  confirmed: { text: 'Confirmado', color: 'text-emerald-400' },
  completed: { text: 'Finalizado', color: 'text-slate-400' },
  cancelled: { text: 'Cancelado',  color: 'text-red-400' },
};

async function fetchOwnerAppointments(page: number): Promise<PaginatedResponse> {
  const { data } = await api.get<PaginatedResponse>('/owner/appointments', {
    params: { page, limit: LIMIT },
  });
  return data;
}

async function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<void> {
  await api.patch(`/owner/appointments/${id}/status`, { status });
}

export const OwnerAppointments = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['owner-appointments', page],
    queryFn: () => fetchOwnerAppointments(page),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      updateAppointmentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-appointments'] });
      // Also invalidate the badge query used in BottomTabBar
      queryClient.invalidateQueries({ queryKey: ['owner-pending-count'] });
    },
  });

  const appointments = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

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
          <h1 className="text-xl font-black tracking-tighter uppercase italic">Turnos</h1>
          {total > 0 && (
            <p className="text-[10px] font-bold text-primary tracking-widest uppercase">{total} en total</p>
          )}
        </div>
        <div className="w-12" />
      </div>

      <div className="px-6 mt-6 space-y-4">
        {isLoading && (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-[#121f22] rounded-[2.5rem] animate-pulse" />
          ))
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-16 text-red-400">
            <FiAlertCircle className="text-4xl mb-4" />
            <p className="text-lg font-bold">Error al cargar los turnos</p>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['owner-appointments'] })}
              className="mt-4 px-6 py-2 bg-primary text-slate-900 rounded-xl font-bold"
            >
              Reintentar
            </button>
          </div>
        )}

        {!isLoading && !isError && appointments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <span className="material-symbols-outlined text-7xl mb-4">calendar_today</span>
            <p className="font-bold">No hay turnos registrados</p>
          </div>
        )}

        {appointments.map((appt) => {
          const date = new Date(appt.start_time);
          const timeStr = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
          const dateStr = date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
          const statusInfo = STATUS_LABELS[appt.status];
          const isProcessing = statusMutation.isPending && (statusMutation.variables as { id: string })?.id === appt.id;

          return (
            <div
              key={appt.id}
              className={`bg-white dark:bg-[#121f22] p-5 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm transition-all ${isProcessing ? 'opacity-50 scale-95' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${statusInfo.color}`}>
                      {statusInfo.text}
                    </span>
                  </div>
                  <p className="font-black text-base leading-tight truncate">{appt.client_name}</p>
                  <p className="text-sm text-slate-500 mt-0.5 truncate">{appt.service_name}</p>
                  <p className="text-xs text-slate-400 mt-1">{dateStr} · {timeStr} hs</p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2 shrink-0">
                  {appt.status === 'pending' && (
                    <button
                      onClick={() => statusMutation.mutate({ id: appt.id, status: 'confirmed' })}
                      disabled={isProcessing}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-wider hover:bg-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
                      aria-label="Confirmar turno"
                    >
                      <FiCheckCircle />
                      Confirmar
                    </button>
                  )}
                  {appt.status === 'confirmed' && (
                    <button
                      onClick={() => statusMutation.mutate({ id: appt.id, status: 'completed' })}
                      disabled={isProcessing}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-black uppercase tracking-wider hover:bg-primary/20 transition-all active:scale-95 disabled:opacity-50"
                      aria-label="Marcar como completado"
                    >
                      <FiClock />
                      Completar
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {!isLoading && !isError && totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 mt-8 px-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-[#121f22] border border-gray-100 dark:border-white/5 font-bold text-sm disabled:opacity-30 active:scale-95 transition-all"
            aria-label="Página anterior"
          >
            <FiChevronLeft /> Anterior
          </button>
          <span className="text-sm font-bold text-slate-500">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-[#121f22] border border-gray-100 dark:border-white/5 font-bold text-sm disabled:opacity-30 active:scale-95 transition-all"
            aria-label="Página siguiente"
          >
            Siguiente <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};
