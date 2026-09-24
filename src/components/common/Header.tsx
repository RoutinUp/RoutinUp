import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell, User, LogOut, Shield } from 'lucide-react';
import { APP_CONFIG } from '../../config/app.config';
import { useAuthStore } from '../../store/useAuthStore';

interface HeaderProps {
  showBack?: boolean;
  title?: string;
}

export const Header: React.FC<HeaderProps> = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = profile?.displayName || user?.user_metadata?.full_name || 'Atleta';
  const initial = displayName.charAt(0).toUpperCase() || 'A';

  // Cerrar el dropdown al hacer clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-gym-bg/90 border-b border-gym-border/40 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between relative">
        {/* Logo y Nombre Centralizado */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-2xl bg-gym-lime/15 border border-gym-lime/30 flex items-center justify-center text-gym-lime group-hover:scale-105 transition-transform shadow-glow-lime">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black tracking-tight text-white block leading-none">
                {APP_CONFIG.name}
              </span>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-gym-lime/15 text-gym-lime border border-gym-lime/30 tracking-wider leading-none shadow-[0_0_8px_rgba(163,230,53,0.25)]">
                BETA
              </span>
            </div>
            <span className="text-[10px] font-semibold text-gym-lime uppercase tracking-widest block mt-0.5">
              Pro Fitness
            </span>
          </div>
        </Link>

        {/* Avatar Circular con Menú Desplegable (Dropdown) */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-800 border-2 border-gym-lime/40 hover:border-gym-lime transition-all overflow-hidden flex items-center justify-center text-white font-bold text-xs sm:text-sm select-none shadow-sm hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gym-lime/50"
            title={displayName}
          >
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gym-lime font-black">{initial}</span>
            )}
          </button>

          {/* Menú Desplegable */}
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 py-1.5 rounded-2xl bg-gym-card border border-gym-border/90 shadow-2xl z-50 animate-fade-in backdrop-blur-xl">
              <div className="px-3.5 py-2 border-b border-gym-border/40 mb-1">
                <span className="text-[11px] font-bold text-gray-400 block truncate">
                  {displayName}
                </span>
                <span className="text-[9px] text-gym-lime font-mono block">
                  v{APP_CONFIG.version}
                </span>
              </div>

              {/* Opción 1: Mi cuenta */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/settings');
                }}
                className="w-full px-3.5 py-2 text-left text-xs font-bold text-gray-200 hover:text-white hover:bg-slate-800/80 flex items-center gap-2.5 transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-gym-electric/15 text-gym-electric flex items-center justify-center">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span>Mi cuenta</span>
              </button>

              <div className="my-1 border-t border-gym-border/40" />

              {/* Opción 2: Cerrar sesión */}
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full px-3.5 py-2 text-left text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center">
                  <LogOut className="w-3.5 h-3.5" />
                </div>
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};