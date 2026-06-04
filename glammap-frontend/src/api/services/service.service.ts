import api from '../axiosInstance';

export interface Service {
  id: number;
  business_id: number;
  name: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
}

export interface CreateServicePayload {
  name: string;
  price: number;
  duration_minutes: number;
}

export interface UpdateServicePayload {
  name?: string;
  price?: number;
  duration_minutes?: number;
}

export const serviceService = {
  getOwnerServices: (): Promise<Service[]> =>
    api.get<Service[]>('/owner/services').then(r => r.data),

  createService: (data: CreateServicePayload): Promise<Service> =>
    api.post<Service>('/owner/services', data).then(r => r.data),

  updateService: (id: number, data: UpdateServicePayload): Promise<Service> =>
    api.put<Service>(`/owner/services/${id}`, data).then(r => r.data),

  deleteService: (id: number): Promise<void> =>
    api.delete(`/owner/services/${id}`).then(() => undefined),
};
