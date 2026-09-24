import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, Utensils, History, TrendingUp } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Inicio', icon: Home, end: true },
    { to: '/routines', label: 'Rutinas y Ej.', icon: Dumbbell, end: false, title: 'Rutinas y Ejercicios' },
    { to: '/nutrition', label: 'Nutrición', icon: Utensils, end: false, title: 'Nutrición' },
    { to: '/history', label: 'Historial', icon: History, end: false, title: 'Historial' },
    { to: '/progress', label: 'Progreso', icon: TrendingUp, end: false, title: 'Progreso' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gym-bg/95 backdrop-blur-xl border-t border-gym-border/60 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={item.title}
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-1 transition-all duration-200 select-none
              ${isActive
                ? 'text-gym-lime font-bold'
                : 'text-gray-400 hover:text-gray-200 font-medium'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-2xl transition-all ${isActive ? 'bg-gym-lime/15 shadow-glow-lime' : ''}`}>
                  <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] text-gym-lime' : 'stroke-2'}`} />
                </div>
                <span className="text-[10px] tracking-tight truncate max-w-full px-0.5">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};