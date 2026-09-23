import React from 'react';
import { Modal } from '../common/Modal';
import { PlusCircle, Sparkles, Layers, ChevronRight } from 'lucide-react';

interface CreateRoutineOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCreateBlank: () => void;
  onSelectGenerateAI: () => void;
  onSelectTemplate: () => void;
}

export const CreateRoutineOptionsModal: React.FC<CreateRoutineOptionsModalProps> = ({
  isOpen,
  onClose,
  onSelectCreateBlank,
  onSelectGenerateAI,
  onSelectTemplate,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Rutina" maxWidth="md">
      <div className="space-y-4">
        <p className="text-xs text-gray-400">
          ¿Cómo deseas estructurar tu entrenamiento? Elige una de las siguientes opciones:
        </p>

        <div className="space-y-3">
          {/* Opción 1: Crear desde Cero */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectCreateBlank();
            }}
            className="w-full text-left p-4 rounded-2xl bg-gym-bg border border-gym-border/80 hover:border-emerald-500/60 hover:bg-slate-900 transition-all flex items-center justify-between group cursor-pointer shadow-sm"
          >
            <div className="flex items-start gap-3.5 pr-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <PlusCircle className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors">
                    Crear desde Cero
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-gray-300 border border-gym-border">
                    Manual
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Diseña tu rutina seleccionando manualmente cada ejercicio, días, series, repeticiones y cargas.
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>

          {/* Opción 2: Generar con IA */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectGenerateAI();
            }}
            className="w-full text-left p-4 rounded-2xl bg-gym-bg border border-gym-border/80 hover:border-amber-500/60 hover:bg-slate-900 transition-all flex items-center justify-between group cursor-pointer shadow-sm"
          >
            <div className="flex items-start gap-3.5 pr-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="text-sm font-black text-white group-hover:text-amber-400 transition-colors">
                    Generar con IA (Gemini)
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Inteligente
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Describe en lenguaje natural tu objetivo, días disponibles y nivel, y la IA creará tu rutina al instante.
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>

          {/* Opción 3: Cargar Plantilla Predeterminada */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectTemplate();
            }}
            className="w-full text-left p-4 rounded-2xl bg-gym-bg border border-gym-border/80 hover:border-cyan-500/60 hover:bg-slate-900 transition-all flex items-center justify-between group cursor-pointer shadow-sm"
          >
            <div className="flex items-start gap-3.5 pr-2">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors">
                    Cargar Plantilla Predeterminada
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    3 Días
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Elige entre rutinas probadas de 3 días (PPL, Torso/Pierna/Fullbody, o Fuerza 5x5) con ejercicios y pesos precargados.
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
