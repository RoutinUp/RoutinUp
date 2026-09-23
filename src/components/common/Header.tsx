import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, User } from 'lucide-react';
import { APP_CONFIG } from '../../config/app.config';
import { useAuthStore } from '../../store/useAuthStore';

interface HeaderProps {
  showBack?: boolean;
  title?: string;
}

export const Header: React.FC<HeaderProps> = () => {
  const { user, profile } = useAuthStore();
  const displayName = profile?.displayName || user?.user_metadata?.full_name || 'Atleta';

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-gym-bg/90 border-b border-gym-border/40 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Logo y Nombre Centralizado */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black tracking-tight text-white block leading-none">
                {APP_CONFIG.name}
              </span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 tracking-wider leading-none shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                BETA
              </span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest block mt-0.5">
              Pro Fitness
            </span>
          </div>
        </Link>

        {/* Acceso a Perfil y Configuración */}
        <div className="flex items-center gap-2">
          <Link
            to="/settings"
            className="flex items-center gap-2 p-1.5 pl-2.5 rounded-2xl bg-gym-card border border-gym-border/80 hover:border-emerald-500/50 transition-all select-none"
            title="Mi Perfil y Ajustes"
          >
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-white block leading-none truncate max-w-[100px]">
                {displayName}
              </span>
              {profile?.bodyWeightKg && (
                <span className="text-[10px] font-semibold text-emerald-400 leading-none">
                  {profile.bodyWeightKg} kg
                </span>
              )}
            </div>

            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs overflow-hidden flex-shrink-0">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                displayName.charAt(0).toUpperCase() || <User className="w-4 h-4" />
              )}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};