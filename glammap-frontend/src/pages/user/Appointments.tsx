import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomTabBar } from '../../layouts/BottomTabBar';
import api from '../../api/axiosInstance'; // Import API instance
import { FiClock, FiCheckCircle, FiAlertCircle, FiMoreVertical } from 'react-icons/fi'; // For status icons

// Define types for better clarity
interface Appointment {
  id: string;
  business_name?: string; // From join in backend query
  service_name?: string;  // From join in backend query
  start_time: string;     // ISO string format from backend
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  // Other fields like client_name, service duration might be available
}

export const Appointments = () => {
  const [activeTab, setActiveTab] = useState<'next' | 'history'>('next');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch appointments data
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/users/appointments');
        setAppointments(response.data);
      } catch (err: any) {
        console.error('Error fetching appointments:', err);
        setError('No se pudieron cargar los turnos. Intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []); // Empty dependency array means this runs once on mount

  // Filter appointments based on active tab
  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      if (activeTab === 'next') {
        return a.status === 'confirmed' || a.status === 'pending';
      } else { // history tab
        return a.status === 'completed' || a.status === 'cancelled';
      }
    });
  }, [appointments, activeTab]);

  // --- Placeholder Action Handlers for Overflow Menu ---
  const handleAppointmentAction = (action: 'view' | 'cancel', appointmentId: string) => {
    if (action === 'view') {
      alert(`Placeholder: Viewing details for appointment ${appointmentId}`);
      // TODO: Navigate to appointment detail page if it exists
      // navigate(`/appointments/${appointmentId}`);
    } else if (action === 'cancel') {
      alert(`Placeholder: Cancelling appointment ${appointmentId}`);
      // TODO: Implement API call to cancel appointment and then potentially re-fetch or update state
    }
  };

  // --- Accessibility Helper ---
  const getStatusInfo = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return { text: 'Confirmado', color: 'text-emerald-400', icon: <FiCheckCircle className='text-emerald-400' /> };
      case 'pending':
        return { text: 'Pendiente', color: 'text-orange-500', icon: <FiClock className='text-orange-500' /> };
      case 'cancelled':
        return { text: 'Cancelado', color: 'text-red-400', icon: <FiAlertCircle className='text-red-400' /> };
      case 'completed':
      default: // For 'completed' or any other status
        return { text: 'Finalizado', color: 'text-slate-400', icon: <FiClock className='text-slate-400' /> };
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display pb-24 transition-colors">
      <div className="p-6">
        <h1 className="text-3xl font-black uppercase mb-6 tracking-tighter">Mis Turnos</h1>

        {/* Switcher de Pestañas */}
        <div className="flex bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl mb-8">
          <button 
            onClick={() => setActiveTab('next')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'next' ? 'bg-primary text-background-dark shadow-lg' : 'text-slate-500'}`}
            aria-pressed={activeTab === 'next'} // Accessibility for tabs
          >
            Próximos
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${activeTab === 'history' ? 'bg-primary text-background-dark shadow-lg' : 'text-slate-500'}`}
            aria-pressed={activeTab === 'history'} // Accessibility for tabs
          >
            Historial
          </button>
        </div>

        {/* Lista de Turnos */}
        <div className="space-y-4">
          {loading && (
             <div className="text-center py-8 text-slate-500">Cargando turnos...</div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center py-16 text-red-400">
              <FiAlertCircle className="text-4xl mb-4" />
              <p className="text-lg">Error</p>
              <p className="text-sm">{error}</p>
              <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-primary text-slate-900 rounded-xl font-bold">Reintentar</button>
            </div>
          )}
          {!loading && !error && filteredAppointments.length > 0 ? (
            filteredAppointments.map((item) => {
              const statusInfo = getStatusInfo(item.status);
              const appointmentDate = new Date(item.start_time);
              const formattedTime = appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const formattedDate = appointmentDate.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
              const dateParts = formattedDate.split(' ');
              const day = dateParts[0];
              const month = dateParts[1].toUpperCase();

              return (
                <div key={item.id} className="bg-white dark:bg-surface-dark p-5 rounded-[2.5rem] border border-gray-100 dark:border-white/5 flex items-center gap-5">
                  {/* Fecha decorativa */}
                  <div className="flex flex-col items-center justify-center bg-slate-100 dark:bg-white/5 w-16 h-16 rounded-3xl">
                    <span className="text-[10px] font-black text-primary uppercase">{month}</span>
                    <span className="text-xl font-black">{day}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {statusInfo.icon}
                      <span className={`text-[10px] font-black uppercase tracking-widest opacity-60 ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                    <h4 className="font-bold text-base leading-none line-clamp-1">{item.business_name || 'Negocio Desconocido'}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{item.service_name || 'Servicio Desconocido'} • {formattedTime} HS</p>
                  </div>

                  {/* Overflow Menu Button */}
                  <button 
                    onClick={() => handleAppointmentAction(item.status === 'confirmed' || item.status === 'pending' ? 'cancel' : 'view', item.id)}
                    className="bg-slate-50 dark:bg-white/5 p-2 rounded-full text-slate-400 hover:bg-white/10 transition-colors"
                    aria-label={`Appointment options for ${item.business_name || 'appointment'} at ${formattedTime}`}
                  >
                    <span className="material-symbols-outlined text-xl">more_vert</span>
                  </button>
                </div>
              );
            })
          ) : (
            // --- EMPTY STATE MESSAGES ---
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <span className="material-symbols-outlined text-5xl mb-2 opacity-20">calendar_today</span>
              <p className="text-base font-bold mb-2">{activeTab === 'next' ? 'No tienes turnos próximos' : 'Tu historial de turnos está vacío'}</p>
              <p className="text-xs">¡Empieza a reservar tus citas!</p>
            </div>
          )}
        </div>
      </div>

      <BottomTabBar activeTab="appointments" />
    </div>
  );
};