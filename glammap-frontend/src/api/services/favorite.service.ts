import api from '../axiosInstance';

export interface FavoriteBusiness {
  id: string;
  name: string;
  category?: string;
  rating?: number;
  banner_url?: string;
}

export const favoriteService = {
  getMyFavorites: () =>
    api.get<FavoriteBusiness[]>('/users/favorites').then(r => r.data),

  toggle: (businessId: string | number) =>
    api.post<{ status: 'added' | 'removed' }>('/users/favorites/toggle', { businessId }).then(r => r.data),
};
