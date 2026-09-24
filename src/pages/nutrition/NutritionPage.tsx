import React from 'react';
import { Utensils, Sparkles, Flame, Apple, Scale, ChevronRight, BellRing } from 'lucide-react';
import { APP_CONFIG } from '../../config/app.config';

export const NutritionPage: React.FC = () => {
  return (
    <div className="space-y-5 pb-12 animate-fade-in select-none">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-gym-lime uppercase tracking-widest block">
            Salud y Rendimiento
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Nutrición
          </h1>
        </div>

        {/* Píldora de Estado */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gym-lime/15 text-gym-lime border border-gym-lime/30 text-xs font-black uppercase tracking-wider shadow-glow-lime">
          <Sparkles className="w-3 h-3 animate-spin" />
          Próximamente
        </span>
      </div>

      {/* Tarjeta Hero Principal con Estética Minimalista Pastel / Neón */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A1C28] via-[#161824] to-[#12131D] border border-gym-border/80 p-6 sm:p-7 shadow-2xl">
        {/* Resplandor radial de fondo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gym-lime/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gym-lavender/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gym-lime/15 border border-gym-lime/30 flex items-center justify-center text-gym-lime shadow-glow-lime">
            <Utensils className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
              Alcanza tu mejor versión con nutrición inteligente
            </h2>
            <p className="text-sm text-gray-300 mt-2 leading-relaxed">
              Estamos desarrollando un módulo de nutrición avanzado que se sincroniza automáticamente con el gasto calórico de tus rutinas de entrenamiento.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-xs font-semibold text-gray-300">
            <BellRing className="w-3.5 h-3.5 text-gym-electric" />
            <span>Disponible en la próxima actualización de {APP_CONFIG.name}</span>
          </div>
        </div>
      </div>

      {/* Avance de Módulos Próximos */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">
          Lo que viene para ti
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {/* Módulo 1 */}
          <div className="p-4 rounded-3xl bg-gym-card border border-gym-border/80 flex items-center gap-4 hover:border-gym-lime/40 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-gym-lime/15 text-gym-lime border border-gym-lime/30 flex items-center justify-center flex-shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white group-hover:text-gym-lime transition-colors">
                  Control de Macros y Calorías
                </h4>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gym-lime/15 text-gym-lime border border-gym-lime/30">
                  En desarrollo
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                Registro rápido de proteínas, carbohidratos y grasas con metas ajustadas a tu peso corporal.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gym-lime transition-colors flex-shrink-0" />
          </div>

          {/* Módulo 2 */}
          <div className="p-4 rounded-3xl bg-gym-card border border-gym-border/80 flex items-center gap-4 hover:border-gym-electric/40 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-gym-electric/15 text-gym-electric border border-gym-electric/30 flex items-center justify-center flex-shrink-0">
              <Apple className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white group-hover:text-gym-electric transition-colors">
                  Planes de Alimentación y Recetas
                </h4>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gym-electric/15 text-gym-electric border border-gym-electric/30">
                  Planificado
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                Guías de comidas fitness para volumen limpio, definición muscular y recomposición corporal.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gym-electric transition-colors flex-shrink-0" />
          </div>

          {/* Módulo 3 */}
          <div className="p-4 rounded-3xl bg-gym-card border border-gym-border/80 flex items-center gap-4 hover:border-gym-lavender/40 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-gym-lavender/15 text-gym-lavender border border-gym-lavender/30 flex items-center justify-center flex-shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white group-hover:text-gym-lavender transition-colors">
                  Gasto Energético Dinámico
                </h4>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gym-lavender/15 text-gym-lavender border border-gym-lavender/30">
                  Planificado
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                Cálculo del balance energético diario alimentado directamente por tus series y entrenamientos completados.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gym-lavender transition-colors flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
};
