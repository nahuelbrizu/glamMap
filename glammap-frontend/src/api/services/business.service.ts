import api from '../axiosInstance';

export interface Business {
  id: string;
  name: string;
  category: string;
  address: string;
  rating_avg: number;
  banner_url: string;
  logo_url?: string;
  distance?: string | null;
  position: { lat: number; lng: number };
}

export interface BusinessDetail extends Business {
  description?: string;
  phone?: string;
  services: Service[];
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
}

export interface CreateBusinessPayload {
  name: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  description?: string;
}

export const businessService = {
  explore: (params?: { lat?: number; lng?: number; distance?: number }) =>
    api.get<Business[]>('/business/explore', { params }).then(r => r.data),

  getById: (id: string | number) =>
    api.get<BusinessDetail>(`/business/${id}`).then(r => r.data),

  create: (payload: CreateBusinessPayload) =>
    api.post<{ business: BusinessDetail }>('/business', payload).then(r => r.data),

  exploreMap: (params: { lat: number; lng: number; category?: string }) =>
    api.get<Business[]>('/users/explore-map', { params }).then(r => r.data),
};
