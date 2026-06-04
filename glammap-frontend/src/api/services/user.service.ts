import api from '../axiosInstance';
import type { AuthUser } from '../../context/AuthContext';

export interface UpdateProfilePayload {
  name: string;
  phone: string;
}

export const userService = {
  getProfile: () =>
    api.get<AuthUser>('/users/profile').then(r => r.data),

  updateProfile: (payload: UpdateProfilePayload) =>
    api.put<{ user: AuthUser }>('/users/profile', payload).then(r => r.data),

  updateNotificationPrefs: (prefs: Record<string, boolean>) =>
    api.patch('/users/settings/notifications', { prefs }).then(r => r.data),
};
