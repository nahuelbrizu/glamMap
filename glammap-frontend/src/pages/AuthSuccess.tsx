import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";

export const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, user } = useAuth(); // Get user from auth context to determine role for redirection

  useEffect(() => {
    // 1. Extract the token and role from the URL sent by the backend
    const token = searchParams.get('token');
    const role = searchParams.get('role');

    if (token) {
      // 2. Save to browser's local storage using the login function from AuthContext
      login(token, role || 'client'); // Use 'client' as default role if not provided
      
      // 3. Small delay to allow the user to see the success message (optional)
      setTimeout(() => {
        // Redirect based on role, ensuring consistency with AppRouter's logic
        let redirectPath = '/explore'; // Default redirect
        if (role === 'admin') {
          redirectPath = '/admin';
        } else if (role === 'business') {
          redirectPath = '/dashboard'; // Or '/owner/dashboard' depending on exact role mapping
        }
        // If role is 'client' or null, it defaults to '/explore'
        navigate(redirectPath);
      }, 1500);
    } else {
      // If no token is found, something went wrong; redirect to login
      navigate('/login');
    }
  }, [searchParams, navigate, login, user]); // Added user to dependencies to re-evaluate redirect if user state changes

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background font-display">
      {/* Spinner or Loading Animation with your primary color */}
      <div 
        className="relative flex items-center justify-center w-16 h-16"
        aria-label="Loading and authentication success indicator"
      >
        <div className="w-16 h-16 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
        <span className="absolute material-symbols-outlined text-primary text-4xl">done</span>
      </div>
      
      <h2 className="mt-6 text-xl font-black text-secondary">
        ¡Acceso exitoso!
      </h2>
      <p className="text-slate-500 animate-pulse">Configurando tu experiencia...</p>
    </div>
  );
};