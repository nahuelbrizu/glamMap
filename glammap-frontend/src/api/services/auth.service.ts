import api from '../axiosInstance';
import type { AuthUser } from '../../context/AuthContext';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', payload).then(r => r.data),

  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', payload).then(r => r.data),

  getMe: () =>
    api.get<AuthUser>('/auth/me').then(r => r.data),

  verify: (token: string) =>
    api.get<{ valid: boolean; user: AuthUser }>('/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.data),
};
