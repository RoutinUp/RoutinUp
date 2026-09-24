import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell, User, LogOut } from 'lucide-react';
import { APP_CONFIG } from '../../config/app.config';
import { useAuthStore } from '../../store/useAuthStore';
import { getUserDisplayName, getUserAvatarUrl, getUserInitials } from '../../utils/user';

interface HeaderProps {
  showBack?: boolean;
  title?: string;
}

export const Header: React.FC<HeaderProps> = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = getUserDisplayName(user, profile) || 'Usuario';
  const avatarUrl = getUserAvatarUrl(user, profile);
  const initials = getUserInitials(user, profile);

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
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#121318]/95 border-b border-[#272833] px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between relative">
        {/* Logo y Nombre Centralizado */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-[#008000]/10 border border-[#008000]/25 flex items-center justify-center text-[#008000] group-hover:scale-105 transition-transform">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-zinc-100 block leading-none">
                Routin<span style={{ color: '#008000' }} className="text-[#008000]">UP</span>
              </span>
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-[#008000]/10 text-[#008000] border border-[#008000]/25 tracking-wider leading-none">
                BETA
              </span>
            </div>
            <span className="text-[10px] font-medium text-zinc-400 block mt-0.5">
              Workout Tracker
            </span>
          </div>
        </Link>

        {/* Avatar Circular con Menú Desplegable (DropdownMenu) */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
            className="w-8 h-8 rounded-full bg-[#181920] border border-[#272833] hover:border-[#008000]/60 transition-all overflow-hidden flex items-center justify-center text-zinc-100 font-bold text-xs select-none shadow-sm hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#008000]/30"
            title={displayName}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[#008000] font-bold text-[11px]">{initials}</span>
            )}
          </button>

          {/* Menú Desplegable (DropdownMenu) */}
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 py-1.5 rounded-2xl bg-[#181920] border border-[#272833] shadow-2xl z-50 animate-fade-in backdrop-blur-xl">
              <div className="px-3.5 py-2 border-b border-[#272833] mb-1">
                <span className="text-[11px] font-medium text-zinc-300 block truncate">
                  {displayName}
                </span>
                <span className="text-[9px] text-zinc-500 font-mono block">
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
                className="w-full px-3.5 py-2 text-left text-xs font-medium text-zinc-200 hover:text-white hover:bg-[#272833] flex items-center gap-2.5 transition-colors"
              >
                <div className="w-5 h-5 rounded-md bg-[#272833] text-zinc-300 flex items-center justify-center">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span>Mi cuenta</span>
              </button>

              <div className="my-1 border-t border-[#272833]" />

              {/* Opción 2: Cerrar sesión */}
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full px-3.5 py-2 text-left text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors"
              >
                <div className="w-5 h-5 rounded-md bg-red-500/15 text-red-400 flex items-center justify-center">
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