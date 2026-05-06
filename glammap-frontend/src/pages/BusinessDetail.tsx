import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from "../api/axiosInstance"; // Import the configured API instance
import { FiX, FiAlertCircle } from 'react-icons/fi'; // For close and error icons
import { FaHeart, FaRegHeart } from 'react-icons/fa'; // For favorite icon
import { BottomTabBar } from '../layouts/BottomTabBar'; // Assuming BottomTabBar is part of the layout

// Assume necessary types are available, e.g., from ../types/index.ts
interface Business {
  id: string;
  name: string;
  category: string;
  address: string;
  rating_avg: number;
  banner_url: string;
  logo_url: string;
  distance: string | null;
  is_favorite?: boolean; // To show favorite status
  services?: Array<{ id: string; name: string; duration_minutes: number; price: number }>;
}

export const BusinessDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchBusinessDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch business details and services
        const response = await api.get(`/business/${id}`);
        setBusiness(response.data);
        // Assuming the backend might return a favorite status or we fetch it separately
        // For now, let's assume it's not returned directly and favorite status is managed elsewhere or on toggle
        // If business data includes favorite status, use it: setIsFavorite(response.data.is_favorite || false);
      } catch (err) {
        console.error("Error fetching business details:", err);
        setError("No se pudieron cargar los detalles del negocio.");
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessDetails();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!business) return;

    try {
      // Assume an API endpoint to toggle favorite status
      await api.post('/businesses/favorites/toggle', { businessId: business.id });
      setIsFavorite(!isFavorite);
      // You might want to re-fetch user favorites or update UI state more robustly
    } catch (err) {
      console.error("Error toggling favorite:", err);
      setError("No se pudo actualizar el estado de favorito.");
    }
  };

  const handleBookNow = () => {
    // TODO: Implement navigation to booking or open booking modal
    // For now, navigate to a placeholder or a relevant page
    if (business && business.services && business.services.length > 0) {
      // Example: Navigate to a booking page, potentially pre-selecting the business and first service
      navigate(`/appointments?businessId=${business.id}&serviceId=${business.services[0].id}`);
    } else {
      alert("Este negocio no tiene servicios configurados para reservar.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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

  if (!business) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 py-12">
        <p className="text-slate-400">No se encontró información del negocio.</p>
        <button onClick={() => navigate('/explore')} className="mt-8 px-6 py-3 bg-primary text-slate-950 font-bold rounded-2xl hover:scale-[1.02] transition-all">Volver a Explorar</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-display">
      {/* Header con Imagen */}
      <div className="relative h-72 w-full">
        <img 
            src={business.banner_url || 'https://via.placeholder.com/600x300?text=Business+Banner'} 
            alt={`${business.name} banner`} 
            className="w-full h-full object-cover"
        />
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-lg"
          aria-label="Go back"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <button 
          onClick={handleToggleFavorite} 
          className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-lg"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <FaHeart className={`text-xl ${isFavorite ? 'text-red-500' : 'text-white'}`}/>
        </button>
      </div>

      {/* Info Card */}
      <div className="relative -mt-10 bg-background rounded-t-[3rem] p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 flex items-center gap-4">
            {business.logo_url ? (
              <img src={business.logo_url} alt={`${business.name} logo`} className="w-16 h-16 rounded-full object-cover border-2 border-primary" />
            ) : (
              <div className="w-16 h-16 bg-primary/20 flex items-center justify-center rounded-full border-2 border-primary">
                <span className="material-symbols-outlined text-primary text-3xl">store</span>
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-black text-secondary uppercase tracking-tight line-clamp-1">{business.name}</h1>
              <div className="flex items-center mt-1 text-primary">
                <span className="material-symbols-outlined text-sm">star</span>
                <span className="font-bold ml-1">{business.rating_avg?.toFixed(1) || 'N/A'} ({business.reviewsCount || 0} reseñas)</span> {/* Assuming reviewsCount is available or fetched */}
              </div>
              <p className="text-sm text-slate-400 mt-1 line-clamp-1">{business.address}</p>
            </div>
          </div>
        </div>

        <section className="mt-8">
          <h3 className="text-lg font-black text-white mb-4">Servicios</h3>
          {business.services && business.services.length > 0 ? (
            business.services.map((service) => (
              <div key={service.id} className="flex justify-between items-center p-5 bg-white/5 rounded-3xl mb-3 shadow-sm border border-white/10">
                <div>
                  <p className="font-bold text-secondary">{service.name}</p>
                  <p className="text-slate-400 text-sm">{service.duration_minutes} min</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-primary text-lg">${service.price.toLocaleString('es-AR')}</p>
                  <button 
                    onClick={() => handleBookNow()} // This should ideally pass service.id and business.id
                    className="mt-1 text-xs font-bold uppercase tracking-wider text-primary underline"
                  >
                    Reservar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400">Este negocio no tiene servicios listados.</p>
          )}
        </section>

        {/* Primary CTA: Book Appointment */}
        <div className="mt-8 sticky bottom-24 z-20">
          <button
            onClick={handleBookNow} 
            className="w-full bg-primary text-slate-950 py-4 rounded-2xl font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">calendar_add_on</span>
            Reservar Cita
          </button>
        </div>
      </div>
      
      {/* Navigation Bar */}
      <footer className="sticky bottom-0 left-0 right-0 z-50">
        {/* The active tab logic needs to be correctly passed. */}
        {/* Assuming 'home' for explore page */}
        <BottomTabBar activeTab="home" />
      </footer>
    </div>
  );
};
