import api from '../axiosInstance';

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  business_id: string;
  business_name: string;
  service_name: string;
  start_time: string;
  status: AppointmentStatus;
  duration_minutes?: number;
}

export interface CreateAppointmentPayload {
  business_id: number;
  service_id: number;
  start_time: string;
  notes?: string;
}

export const appointmentService = {
  getMyAppointments: () =>
    api.get<Appointment[]>('/users/appointments').then(r => r.data),

  create: (payload: CreateAppointmentPayload) =>
    api.post<{ appointment: Appointment }>('/users/appointments', payload).then(r => r.data),

  cancel: (id: string | number) =>
    api.patch<{ appointment: Appointment }>(`/users/appointments/${id}/cancel`).then(r => r.data),

  getAvailableSlots: (businessId: string | number, date: string) =>
    api.get<string[]>('/users/appointments/slots', {
      params: { business_id: businessId, date },
    }).then(r => r.data),
};
