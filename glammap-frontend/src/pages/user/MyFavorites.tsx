import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomTabBar } from '../../layouts/BottomTabBar';
import api from '../../api/axiosInstance'; // Import API instance
import { FiAlertCircle, FiHeart, FiX } from 'react-icons/fi'; // Import icons
import { FaHeart } from 'react-icons/fa'; // For filled heart icon

// Define types for better clarity
interface FavoriteBusiness {
  id: string;
  name?: string;
  category?: string;
  rating?: number;
  img?: string;
}

export const MyFavorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch favorites data
  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/users/favorites');
        setFavorites(response.data);
      } catch (err: any) {
        console.error("Error fetching favorites:", err);
        setError(err.response?.data?.message || "No se pudieron cargar tus favoritos.");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  // Handler to remove a favorite
  const handleRemoveFavorite = async (businessId: string, businessName: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar ${businessName} de tus favoritos?`)) {
      return;
    }
    try {
      // API call to remove favorite
      await api.delete(`/users/favorites/${businessId}`); // Assuming a DELETE endpoint like this
      setFavorites(favorites.filter(f => f.id !== businessId));
      alert('Negocio eliminado de favoritos.');
    } catch (err: any) {
      console.error("Error removing favorite:", err);
      setError(err.response?.data?.message || "No se pudo eliminar el favorito.");
    }
  };

  // --- Render Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- Render Error State ---
  if (error) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center px-6 py-12">
        <FiAlertCircle className="text-red-500 text-6xl mb-4" />
        <p className="text-red-400 text-lg">Error</p>
        <p className="text-slate-400 text-center mt-2">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-8 px-6 py-3 bg-primary text-slate-900 font-bold rounded-2xl hover:scale-[1.02] transition-all" aria-label="Retry loading favorites">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display pb-24 transition-colors">
      <div className="p-6">
        <h1 className="text-3xl font-black uppercase mb-6 tracking-tighter">Favoritos</h1>

        <div className="grid gap-4">
          {favorites.length > 0 ? (
            favorites.map((fav) => (
              <div 
                key={fav.id} 
                className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 flex gap-4 shadow-sm border border-gray-100 dark:border-white/5 relative group"
              >
                <div 
                  className="w-24 h-24 rounded-2xl bg-cover bg-center shrink-0"
                  style={{ backgroundImage: `url(${fav.img || '/placeholder-image.png'})` }} // Fallback image
                />
                <div className="flex flex-col justify-center flex-1">
                  <p className="text-[10px] font-black text-primary uppercase">{fav.category || 'Categoría'}</p>
                  <h3 className="font-bold text-lg leading-tight line-clamp-1">{fav.name || 'Nombre Desconocido'}</h3>
                  <div className="flex items-center gap-1 mt-1 text-yellow-500">
                    <span className="material-symbols-outlined text-sm fill-current">star</span>
                    <span className="text-sm font-bold text-slate-400">{fav.rating !== undefined ? fav.rating.toFixed(1) : 'N/A'}</span>
                  </div>
                  <button 
                    onClick={() => navigate(`/business/${fav.id}`)}
                    className="mt-2 text-xs font-bold text-primary flex items-center gap-1"
                    aria-label={`View details for ${fav.name || 'business'}`}
                  >
                    Ver Perfil <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </button>
                </div>
                {/* Favorite Removal Button */}
                <button 
                  onClick={() => handleRemoveFavorite(fav.id, fav.name || 'business')}
                  className="absolute top-4 right-4 text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-colors"
                  aria-label={`Remove ${fav.name || 'business'} from favorites`}
                >
                  <FaHeart className="text-xl fill-current"/> {/* Using FaHeart for filled state */}
                </button>
              </div>
            ))
          ) : (
            // --- EMPTY STATE MESSAGE ---
            <div className="text-center py-20 opacity-30">
              <span className="material-symbols-outlined text-6xl">heart_broken</span>
              <p className="mt-4 font-bold uppercase">No tienes favoritos aún</p>
              <p className="text-xs">Explora negocios y agrégalos a tu lista.</p>
            </div>
          )}
        </div>
      </div>

      <BottomTabBar activeTab="favorites" />
    </div>
  );
};