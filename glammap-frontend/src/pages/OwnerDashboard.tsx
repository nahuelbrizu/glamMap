import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../api/axiosInstance";
import { useAuth } from '../context/AuthContext';
import { FiCalendar, FiUsers, FiClock, FiShoppingBag, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

// Define types for clarity
interface KpiData {
  totalRevenue?: string;
  activeAppointments?: string;
  newClients?: string;
  pendingTasks?: string;
}

interface Appointment {
  id: string;
  client_name: string;
  service_name: string;
  start_time: string;
  status: 'confirmado' | 'pendiente' | 'cancelado';
}

export const OwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOwnerDashboardData = async () => {
      if (!user) {
        navigate('/login'); // Redirect if user is not logged in
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Fetch KPIs specific to business owners
        const kpiResponse = await api.get('/business/dashboard/kpis'); // Example endpoint
        setKpis(kpiResponse.data);

        // Fetch upcoming appointments for the business
        const appointmentsResponse = await api.get('/appointments/business'); // Example endpoint
        setUpcomingAppointments(appointmentsResponse.data);

      } catch (err: any) {
        console.error("Error fetching owner dashboard data:", err);
        setError(err.response?.data?.message || "No se pudieron cargar los datos del panel.");
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerDashboardData();
  }, [user, navigate]);

  // --- Navigation Handlers ---
  const handleViewAllAppointments = () => {
    navigate('/appointments'); // Assuming this route shows all appointments for the logged-in user (owner)
  };

  const handleManageServices = () => {
    navigate('/owner/services'); // Navigate to the services management page
  };
  
  const handleBusinessStatusToggle = async () => {
    if (!user) return;
    setLoading(true); // Indicate action is in progress
    setError(null);
    try {
        // Assume an API endpoint to toggle business status (open/closed)
        // The backend needs to know which business to update, likely through the owner_id from user context
        const currentStatus = kpis?.businessStatus || 'abierto'; // Assuming kpis might contain this, or fetch separately
        const newStatus = currentStatus === 'abierto' ? 'cerrado' : 'abierto';
        
        await api.patch('/business/status', { status: newStatus }); // Example endpoint
        
        // Update local state for immediate feedback
        setKpis(prev => ({ ...prev, businessStatus: newStatus }));
        alert(`Negocio marcado como ${newStatus}.`);

    } catch (err: any) {
        console.error("Error updating business status:", err);
        setError(err.response?.data?.message || "No se pudo actualizar el estado del negocio.");
    } finally {
        setLoading(false);
    }
  };

  // --- Render Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- Render Error State ---
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 py-12">
        <FiAlertCircle className="text-red-500 text-6xl mb-4" />
        <p className="text-red-400 text-lg">Error</p>
        <p className="text-slate-400 text-center mt-2">{error}</p>
        <button onClick={() => navigate(-1)} className="mt-8 px-6 py-3 bg-primary text-slate-950 font-bold rounded-2xl hover:scale-[1.02] transition-all">Volver</button>
      </div>
    );
  }

  // --- Render Dashboard Content ---
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 pb-24">
      {/* Header de Bienvenida */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Mi Negocio: {user?.businessName || 'Tu Negocio'} 👋</h1> {/* Assuming businessName is available */} 
        <p className="text-slate-400 text-sm">Resumen de actividad para hoy, {new Date().toLocaleDateString('es-AR')}</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <KpiCard title="Ganancias Hoy" value={kpis?.totalRevenue || '$0'} icon={<FiTrendingUp />} color="text-emerald-400" />
        <KpiCard title="Turnos Pendientes" value={kpis?.pendingAppointments || '0'} icon={<FiClock />} color="text-amber-400" />
        <KpiCard title="Turnos Confirmados" value={kpis?.confirmedAppointments || '0'} icon={<FiCheckCircle />} color="text-emerald-400" />
        {/* Add more KPIs if available, e.g., new clients, revenue trends */} 
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Principal: Próximos Turnos */}
        <section className="lg:col-span-2 bg-slate-900/50 border border-white/5 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold">Próximos Turnos</h3>
            <button onClick={handleViewAllAppointments} className="text-primary text-sm font-medium">Ver agenda</button>
          </div>
          
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((appt) => (
                <AppointmentItem 
                  key={appt.id}
                  client={appt.client_name || 'Cliente Desconocido'}
                  service={appt.service_name || 'Servicio Desconocido'}
                  time={new Date(appt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  status={appt.status}
                />
              ))}
            </div>
          ) : (
            // --- EMPTY STATE FOR APPOINTMENTS ---
            <div className="text-center py-8 text-slate-500">
              <p className="mb-2">No hay turnos programados.</p>
              <p className="text-xs">¡Empieza a gestionar tus citas!</p>
            </div>
          )}
        </section>

        {/* Columna Lateral: Acciones y Estado */}
        <div className="space-y-6">
          <section className="bg-primary/10 border border-primary/20 rounded-2xl p-6">
            <h3 className="text-primary font-bold mb-2">Estado del Negocio</h3>
            {/* Display and toggle business status */}
            <p className="text-xs text-slate-400 mb-4">Tu negocio está actualmente <span className="font-bold">{kpis?.businessStatus || 'abierto'}</span>.</p> 
            <button 
              onClick={handleBusinessStatusToggle} 
              className="w-full py-3 bg-primary text-slate-950 rounded-xl font-bold text-sm hover:scale-[1.02] transition-all active:scale-95"
            >
              {kpis?.businessStatus === 'abierto' ? 'Cerrar por hoy' : 'Abrir ahora'}
            </button>
          </section>

          <section className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="font-bold mb-4 text-sm">Acciones Rápidas</h3>
            <div className="space-y-3">
              <QuickAction icon={<FiAlertCircle />} label="Reportar inasistencia" color="bg-red-500/20 text-red-400" onClick={handleReportNoShow} />
              <QuickAction icon={<FiCheckCircle />} label="Cierre de caja" color="bg-emerald-500/20 text-emerald-400" onClick={handleCashClosure} />
              <QuickAction icon={<FiShoppingBag />} label="Gestionar servicios" color="bg-blue-500/20 text-blue-400" onClick={handleManageServices} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// --- Subcomponentes ---

const KpiCard = ({ title, value, icon, color }: KpiCardProps) => (
  <div className="bg-slate-900/50 border border-white/5 p-5 rounded-2xl flex flex-col justify-between h-full">
    <div className={`text-xl mb-3 ${color}`}>{icon}</div>
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{title}</p>
  </div>
);

const AppointmentItem = ({ client, service, time, status }: AppointmentItemProps) => {
  // Determine status color and icon
  let statusColor = 'text-amber-400'; // Default for 'pendiente'
  let statusIcon = <FiClock className='text-amber-400' />;

  if (status === 'confirmado') {
    statusColor = 'text-emerald-400';
    statusIcon = <FiCheckCircle className='text-emerald-400' />;
  } else if (status === 'cancelado') {
    statusColor = 'text-red-400';
    statusIcon = <FiAlertCircle className='text-red-400' />;
  }

  // Extract first letter of each word in client name for avatar initials
  const initials = client.split(' ').map((n: string) => n[0]).join('');

  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs">
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold">{client}</p>
          <p className="text-xs text-slate-500">{service}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold">{time}hs</p>
        <div className="flex items-center justify-end gap-1">
          {statusIcon}
          <span className={`text-[10px] uppercase font-bold ${statusColor}`}>
            {status}
          </span>
        </div>
      </div>
    </div>
  );
};

const QuickAction = ({ icon, label, color, onClick }: QuickActionProps & {onClick: () => void}) => (
  <button onClick={onClick} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-sm">
    <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
    <span className="flex-grow text-left">{label}</span>
    <span className="material-symbols-outlined text-slate-500">chevron_right</span>
  </button>
);
