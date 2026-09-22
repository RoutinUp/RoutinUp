import React, { useState, useEffect } from 'react';
import { RestCardData } from '../../types/workout';
import { Button } from '../common/Button';
import { formatDuration } from '../../utils/formatters';
import { audioManager } from '../../utils/sound';
import { SkipForward, Plus, Minus, Bell, Flame } from 'lucide-react';

interface RestCardProps {
  card: RestCardData;
  onSkip: () => void;
  onCompleteRest: () => void;
}

export const RestCard: React.FC<RestCardProps> = ({
  card,
  onSkip,
  onCompleteRest,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(card.durationSeconds);
  const totalTime = card.durationSeconds;

  // Temporizador regresivo
  useEffect(() => {
    setTimeLeft(card.durationSeconds);
  }, [card.cardIndex, card.durationSeconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      audioManager.playRestFinished();
      onCompleteRest();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onCompleteRest]);

  const addTime = (secs: number) => {
    setTimeLeft((prev) => Math.max(5, prev + secs));
  };

  // Cálculo de progreso para barra/círculo
  const progressPercent = Math.min(100, Math.max(0, ((totalTime - timeLeft) / totalTime) * 100));

  return (
    <div className="w-full flex flex-col bg-gradient-to-b from-[#151D2A] to-[#0D131F] rounded-3xl border border-gym-border/80 shadow-2xl p-4 sm:p-5">
      {/* Header */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <Flame className="w-3.5 h-3.5" />
          RECUPERACIÓN
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Tiempo de Descanso</h2>
        <p className="text-xs text-gray-400">Respira profundamente y prepárate para la siguiente serie</p>
      </div>

      {/* Reloj Central Regresivo */}
      <div className="flex flex-col items-center justify-center my-3 sm:my-4">
        <div className="relative w-36 h-36 sm:w-48 sm:h-48 flex items-center justify-center">
          {/* Círculo SVG de progreso */}
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="#1E293B"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="#10B981"
              strokeWidth="6"
              strokeDasharray={276}
              strokeDashoffset={276 - (276 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Tiempo digital en el centro */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-4xl sm:text-5xl font-black text-white tracking-tighter font-mono">
              {formatDuration(timeLeft)}
            </span>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
              Restante
            </span>
          </div>
        </div>

        {/* Ajustes rápidos de tiempo (+30s / -30s) */}
        <div className="flex items-center gap-3 mt-3">
          <button
            type="button"
            onClick={() => addTime(-30)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 text-gray-300 hover:text-white text-xs font-bold active:scale-95 border border-gym-border/60 transition-all"
          >
            <Minus className="w-3.5 h-3.5" />
            30s
          </button>
          <button
            type="button"
            onClick={() => addTime(30)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 text-gray-300 hover:text-white text-xs font-bold active:scale-95 border border-gym-border/60 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            30s
          </button>
        </div>
      </div>

      {/* Anticipación del Próximo Ejercicio */}
      <div className="bg-gym-cardLighter/70 border border-gym-border/70 rounded-2xl p-3.5 mb-4">
        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
          A continuación:
        </span>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-black text-white">{card.nextExerciseName}</h4>
            <p className="text-xs text-gray-400">
              Serie {card.nextSetNumber} de {card.nextTotalSets} {card.nextTargetReps ? `· Meta: ${card.nextTargetReps} reps` : ''}
            </p>
          </div>
          {card.nextTargetWeight ? (
            <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-xs font-black text-white border border-slate-700">
              {card.nextTargetWeight} kg
            </span>
          ) : null}
        </div>
      </div>

      {/* Botón Saltar Descanso */}
      <Button
        size="lg"
        fullWidth
        variant="secondary"
        onClick={onSkip}
        icon={<SkipForward className="w-5 h-5 stroke-[2.5]" />}
      >
        SALTAR DESCANSO
      </Button>
    </div>
  );
};