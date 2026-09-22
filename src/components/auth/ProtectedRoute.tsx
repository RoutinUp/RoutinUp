import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Dumbbell } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { user, isLoading, initialized } = useAuthStore();

  // Pantalla de carga mientras Supabase determina la sesión
  if (isLoading || !initialized) {
    return (
      <div className="min-h-screen bg-gym-bg flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 animate-pulse">
          <Dumbbell className="w-8 h-8" />
        </div>
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Cargando sesión...
        </span>
      </div>
    );
  }

  // Si no hay usuario autenticado, redirigir a Login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};