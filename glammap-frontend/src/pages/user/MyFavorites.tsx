import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BottomTabBar } from '../../layouts/BottomTabBar';
import { favoriteService } from '../../api/services/favorite.service';
import { FiAlertCircle } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';

export const MyFavorites = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading, isError } = useQuery({
    queryKey: ['my-favorites'],
    queryFn: favoriteService.getMyFavorites,
  });

  const { mutate: toggleFav } = useMutation({
    mutationFn: (id: string) => favoriteService.toggle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-favorites'] }),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center px-6 py-12">
        <FiAlertCircle className="text-red-500 text-6xl mb-4" />
        <p className="text-red-400 text-lg">No se pudieron cargar tus favoritos.</p>
        <button onClick={() => window.location.reload()} className="mt-8 px-6 py-3 bg-primary text-slate-900 font-bold rounded-2xl">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display pb-24 transition-colors">
      <div className="p-6">
        <h1 className="text-3xl font-black uppercase mb-6 tracking-tighter">Favoritos</h1>

        <div className="grid gap-4">
          {favorites.length === 0 ? (
            <div className="text-center py-20 opacity-30">
              <span className="material-symbols-outlined text-6xl">heart_broken</span>
              <p className="mt-4 font-bold uppercase">No tienes favoritos aún</p>
              <p className="text-xs">Explora negocios y agrégalos a tu lista.</p>
            </div>
          ) : (
            favorites.map(fav => (
              <div
                key={fav.id}
                className="bg-white dark:bg-surface-dark rounded-[2rem] p-5 flex gap-4 shadow-sm border border-gray-100 dark:border-white/5 relative group"
              >
                <div
                  className="w-24 h-24 rounded-2xl bg-cover bg-center shrink-0"
                  style={{ backgroundImage: `url(${fav.banner_url ?? '/placeholder-image.png'})` }}
                />
                <div className="flex flex-col justify-center flex-1">
                  <p className="text-[10px] font-black text-primary uppercase">{fav.category ?? 'Categoría'}</p>
                  <h3 className="font-bold text-lg leading-tight line-clamp-1">{fav.name}</h3>
                  {fav.rating !== undefined && (
                    <div className="flex items-center gap-1 mt-1 text-yellow-500">
                      <span className="material-symbols-outlined text-sm">star</span>
                      <span className="text-sm font-bold text-slate-400">{fav.rating.toFixed(1)}</span>
                    </div>
                  )}
                  <button
                    onClick={() => navigate(`/business/${fav.id}`)}
                    className="mt-2 text-xs font-bold text-primary flex items-center gap-1"
                    aria-label={`Ver perfil de ${fav.name}`}
                  >
                    Ver Perfil <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </button>
                </div>

                <button
                  onClick={() => toggleFav(fav.id)}
                  className="absolute top-4 right-4 text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-colors"
                  aria-label={`Quitar ${fav.name} de favoritos`}
                >
                  <FaHeart className="text-xl fill-current" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomTabBar activeTab="favorites" />
    </div>
  );
};
