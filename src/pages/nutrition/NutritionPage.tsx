import React from 'react';
import { Utensils, Sparkles, Flame, Apple, Scale, ChevronRight, BellRing } from 'lucide-react';
import { APP_CONFIG } from '../../config/app.config';

export const NutritionPage: React.FC = () => {
  return (
    <div className="space-y-5 pb-12 animate-fade-in select-none">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-gym-primary uppercase tracking-widest block">
            Salud y Rendimiento
          </span>
          <h1 className="text-2xl font-black text-zinc-100 tracking-tight">
            Nutrición
          </h1>
        </div>

        {/* Píldora de Estado */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#008000]/15 text-[#008000] border border-[#008000]/30 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3 h-3" />
          Próximamente
        </span>
      </div>

      {/* Tarjeta Hero Principal con Estética de Bloque */}
      <div className="relative overflow-hidden rounded-[20px] bg-[#181920] border border-[#272833] p-6 sm:p-7 shadow-sm">
        <div className="relative z-10 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#008000]/15 border border-[#008000]/30 flex items-center justify-center text-[#008000]">
            <Utensils className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight leading-snug">
              Alcanza tu mejor versión con nutrición inteligente
            </h2>
            <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
              Estamos desarrollando un módulo de nutrición avanzado que se sincronizará automáticamente con el gasto calórico de tus rutinas de entrenamiento.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121318] border border-[#272833] text-xs font-medium text-zinc-400">
            <BellRing className="w-3.5 h-3.5 text-[#008000]" />
            <span>Disponible en la próxima actualización de Routin<span style={{ color: '#008000' }} className="text-[#008000] font-black">UP</span></span>
          </div>
        </div>
      </div>

      {/* Avance de Módulos Próximos */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1">
          Lo que viene para ti
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {/* Módulo 1 */}
          <div className="p-4 rounded-[20px] bg-[#181920] border border-[#272833] flex items-center gap-4 hover:border-[#008000]/40 transition-colors group">
            <div className="w-11 h-11 rounded-2xl bg-[#008000]/15 text-[#008000] border border-[#008000]/30 flex items-center justify-center flex-shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-zinc-100 group-hover:text-[#008000] transition-colors">
                  Control de Macros y Calorías
                </h4>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#008000]/15 text-[#008000] border border-[#008000]/30">
                  En desarrollo
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                Registro rápido de proteínas, carbohidratos y grasas con metas ajustadas a tu peso corporal.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-[#008000] transition-colors flex-shrink-0" />
          </div>

          {/* Módulo 2 */}
          <div className="p-4 rounded-[20px] bg-[#181920] border border-[#272833] flex items-center gap-4 hover:border-[#008000]/40 transition-colors group">
            <div className="w-11 h-11 rounded-2xl bg-[#008000]/15 text-[#008000] border border-[#008000]/30 flex items-center justify-center flex-shrink-0">
              <Apple className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-zinc-100 group-hover:text-[#008000] transition-colors">
                  Planes de Alimentación y Recetas
                </h4>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                  Planificado
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                Guías de comidas fitness para volumen limpio, definición muscular y recomposición corporal.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-[#008000] transition-colors flex-shrink-0" />
          </div>

          {/* Módulo 3 */}
          <div className="p-4 rounded-[20px] bg-[#181920] border border-[#272833] flex items-center gap-4 hover:border-[#008000]/40 transition-colors group">
            <div className="w-11 h-11 rounded-2xl bg-[#008000]/15 text-[#008000] border border-[#008000]/30 flex items-center justify-center flex-shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-zinc-100 group-hover:text-[#008000] transition-colors">
                  Gasto Energético Dinámico
                </h4>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                  Planificado
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                Cálculo del balance energético diario alimentado directamente por tus series y entrenamientos completados.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-[#008000] transition-colors flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
};
