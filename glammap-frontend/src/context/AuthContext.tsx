import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (token: string, role: string, userData?: any) => void; // Added userData parameter
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get('token');
        const urlRole = params.get('role');

        if (urlToken) {
          localStorage.setItem('token', urlToken);
          if (urlRole) localStorage.setItem('userRole', urlRole);
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        const token = localStorage.getItem('token');

        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          try {
            const res = await api.get('/auth/me');
            // Combine fetched user data with role from localStorage if needed, or rely on backend data
            // Ensure role is correctly set for the user object
            setUser({ ...res.data, role: urlRole || localStorage.getItem('userRole') || res.data.role });
          } catch (err: any) {
            if (err.response?.status === 401 || err.response?.status === 403) {
              console.error("Invalid or expired session");
              logout();
            } else {
              console.error("Server or connection error during session validation:", err.message);
            }
          }
        }
      } catch (error) {
        console.error("Critical error in initAuth:", error);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  // Modified login function to accept and set user data including role
  const login = async (token: string, role: string, userData?: any) => {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    try {
      // Fetch fresh user data if not provided, or use provided data
      let fetchedUser = userData;
      if (!userData || !userData.id) { // If userData is incomplete or not provided
         const res = await api.get('/auth/me');
         fetchedUser = res.data;
      }
      
      // Ensure role is set correctly from login parameters or fetched data
      const finalRole = role || fetchedUser?.role || 'client';
      setUser({ ...fetchedUser, role: finalRole });
      localStorage.setItem('userRole', finalRole);

    } catch (error) {
      console.error("Error logging in:", error);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children} 
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};