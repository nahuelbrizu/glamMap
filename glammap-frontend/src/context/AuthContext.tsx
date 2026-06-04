import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export type UserRole = 'client' | 'owner' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (token: string, userData?: Partial<AuthUser>) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function setAuthHeader(token: string) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

function clearAuthHeader() {
  delete api.defaults.headers.common['Authorization'];
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        setAuthHeader(token);
        const { data } = await api.get<AuthUser>('/auth/me');
        setUser(data);
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } }).response?.status;
        if (status === 401 || status === 403) {
          clearAuth();
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const clearAuth = () => {
    localStorage.removeItem('token');
    clearAuthHeader();
    setUser(null);
  };

  const login = async (token: string, userData?: Partial<AuthUser>) => {
    localStorage.setItem('token', token);
    setAuthHeader(token);

    try {
      const { data } = await api.get<AuthUser>('/auth/me');
      setUser({ ...data, ...userData });
    } catch {
      clearAuth();
    }
  };

  const logout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.get<AuthUser>('/auth/me');
      setUser(data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 401 || status === 403) {
        clearAuth();
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
