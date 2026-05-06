import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useAuth } from '../context/AuthContext';
import api from "../api/axiosInstance"; // Import the configured API instance
import { 
  FiUsers, FiShoppingBag, FiCalendar, FiTrendingUp, 
  FiClock, FiCheckCircle, FiAlertCircle 
} from 'react-icons/fi'; // Instalación: npm install react-icons

// Define types for better clarity
interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

interface AppointmentItemProps {
  client: string;
  service: string;
  time: string;
  status: 'confirmado' | 'pendiente' | 'cancelado'; // Added 'cancelado'
}

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  color: string;
}

export const DashboardGeneral = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for fetched data
  const [kpis, setKpis] = useState<any>(null); // Placeholder for KPI data
  const [upcomingAppointments, setUpcomingAppointments] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch KPIs (example endpoint, adjust as needed)
        const kpiResponse = await api.get('/dashboard/kpis'); 
        setKpis(kpiResponse.data);

        // Fetch upcoming appointments
        const appointmentsResponse = await api.get('/appointments'); // Assuming this endpoint fetches user appointments
        setUpcomingAppointments(appointmentsResponse.data);

      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.response?.data?.message || "No se pudieron cargar los datos del panel.");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if user is available
    if (user) {
      fetchDashboardData();
    } else {
      // If no user, redirect to login or onboarding (though ProtectedRoute should handle this)
      navigate('/login');
    }
  }, [user, navigate]);

  // --- Navigation Handlers ---
  const handleViewAgenda = () => {
    navigate('/appointments'); // Navigate to the appointments page
  };

  // Placeholder for other actions
  const handleBusinessStatusToggle = () => {
    alert("Toggling business status. API call needed.");
  };
  const handleReportNoShow = () => alert("Reporting no-show...");
  const handleCashClosure = () => alert("Processing cash closure...");
  const handleManageServices = () => navigate('/owner/services'); // Example navigation

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
        <h1 className="text-2xl font-bold">Hola, {user?.name || 'Usuario'} 👋</h1>
        <p className="text-slate-400 text-sm">Aquí tienes el resumen de hoy, {new Date().toLocaleDateString('es-AR')}</p>
      </header>

      {/* Grid de KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Replace with fetched KPI data */} 
        <KpiCard title="Ingresos Hoy" value={kpis?.todayRevenue || '$0'} icon={<FiTrendingUp />} color="text-emerald-400" />
        <KpiCard title="Turnos Activos" value={kpis?.activeAppointments || '0'} icon={<FiCalendar />} color="text-primary" />
        <KpiCard title="Nuevos Clientes" value={kpis?.newClients || '0'} icon={<FiUsers />} color="text-purple-400" />
        <KpiCard title="Pendientes" value={kpis?.pendingTasks || '0'} icon={<FiClock />} color="text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Principal: Actividad Reciente */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold">Próximos Turnos</h3>
              <button onClick={handleViewAgenda} className="text-primary text-sm font-medium">Ver agenda</button>
            </div>
            
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appt: any) => (
                  <AppointmentItem 
                    key={appt.id} 
                    client={appt.client_name || 'Cliente Desconocido'} // Assuming client_name is available or needs joining
                    service={appt.service_name || 'Servicio Desconocido'}
                    time={new Date(appt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    status={appt.status}
                  />
                ))}
              </div>
            ) : (
              // --- EMPTY STATE FOR APPOINTMENTS ---
              <div className="text-center py-8 text-slate-500">
                <p className="mb-2">No hay turnos programados para hoy.</p>
                <p className="text-xs">¡Empieza a agendar!</p>
              </div>
            )}
          </section>

          {/* Gráfico Visual (Placeholder) */}
          <section className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 h-64 flex flex-col items-center justify-center text-slate-500">
            <FiTrendingUp className="text-4xl mb-2 opacity-20" />
            <p className="text-sm">Gráfico de actividad semanal</p>
            <div className="w-full flex items-end justify-between px-10 mt-4 h-24">
               {/* Placeholder bars - replace with actual chart data */}
               {[40, 70, 45, 90, 65, 80, 30].map((h, i) => (
                 <div key={i} className="w-4 bg-primary/40 rounded-t-sm" style={{ height: `${h}%` }}></div>
               ))}
            </div>
          </section>
        </div>

        {/* Columna Lateral: Acciones y Estado */}
        <div className="space-y-6">
          <section className="bg-primary/10 border border-primary/20 rounded-2xl p-6">
            <h3 className="text-primary font-bold mb-2">Estado del Negocio</h3>
            {/* Dynamically set status and button text */}
            <p className="text-xs text-slate-400 mb-4">Tu negocio está actualmente {user?.businessStatus || 'abierto'}.</p> {/* Assuming user context has businessStatus */} 
            <button 
              onClick={handleBusinessStatusToggle} 
              className="w-full py-3 bg-primary text-slate-950 rounded-xl font-bold text-sm hover:scale-[1.02] transition-all active:scale-95"
            >
              {user?.businessStatus === 'abierto' ? 'Cerrar por hoy' : 'Abrir ahora'}
            </button>
          </section>

          <section className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="font-bold mb-4 text-sm">Reportes Rápidos</h3>
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

const QuickAction = ({ icon, label, color, onClick }: QuickActionProps) => (
  <button onClick={onClick} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-sm">
    <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
    <span className="flex-grow text-left">{label}</span>
    <span className="material-symbols-outlined text-slate-500">chevron_right</span>
  </button>
);
