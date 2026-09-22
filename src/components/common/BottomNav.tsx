import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, BookOpen, History, TrendingUp } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Inicio', icon: Home, end: true },
    { to: '/routines', label: 'Rutinas', icon: Calendar, end: false },
    { to: '/exercises', label: 'Ejercicios', icon: BookOpen, end: false },
    { to: '/history', label: 'Historial', icon: History, end: false },
    { to: '/progress', label: 'Progreso', icon: TrendingUp, end: false },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gym-bg/95 backdrop-blur-lg border-t border-gym-border/60 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-1 transition-all duration-200 select-none
              ${isActive
                ? 'text-emerald-400 font-bold'
                : 'text-gray-400 hover:text-gray-200 font-medium'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-emerald-500/15' : ''}`}>
                  <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                </div>
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};