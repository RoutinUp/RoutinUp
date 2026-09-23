import React from 'react';
import { WorkoutSession } from '../../types/workout';
import { Button } from '../common/Button';
import { formatDurationHuman, formatWeight } from '../../utils/formatters';
import { Trophy, CheckCircle, Clock, Dumbbell, Award, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WorkoutSummaryModalProps {
  session: WorkoutSession | null;
  newPRs?: any[];
  onClose: () => void;
}

export const WorkoutSummaryModal: React.FC<WorkoutSummaryModalProps> = ({
  session,
  newPRs = [],
  onClose,
}) => {
  const navigate = useNavigate();

  if (!session) return null;

  const totalExercises = session.exercises.length;
  const completedExercises = session.exercises.filter((e) => e.status === 'completed').length;
  const totalSets = session.exercises.reduce((acc, e) => acc + e.sets.length, 0);

  const handleGoHome = () => {
    onClose();
    navigate('/');
  };

  const handleGoHistory = () => {
    onClose();
    navigate('/history');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      style={{
        paddingTop: 'max(0.75rem, env(safe-area-inset-top, 12px))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 16px))',
      }}
    >
      <div className="w-full max-w-sm bg-gym-card border border-gym-border rounded-3xl shadow-2xl p-4 sm:p-6 text-center flex flex-col max-h-[90dvh] overflow-hidden my-auto">
        {/* Contenido desplazable para evitar recortes en pantallas de cualquier tamaño */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-0.5 space-y-3.5 overscroll-contain">
          {/* Ícono de Celebración */}
          <div>
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 mb-2 shadow-glow-primary">
              <Trophy className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              ¡RUTINA COMPLETADA!
            </h2>
            <p className="text-xs sm:text-sm font-bold text-emerald-400 mt-0.5">
              {session.routineName} · {session.dayName}
            </p>
          </div>

          {/* Métricas clave */}
          <div className="grid grid-cols-2 gap-2 my-2">
            <div className="bg-gym-bg/80 border border-gym-border/60 rounded-2xl p-2.5 flex flex-col items-center">
              <Clock className="w-4 h-4 text-gray-400 mb-0.5" />
              <span className="text-[10px] sm:text-xs text-gray-400 font-semibold">Duración</span>
              <span className="text-sm sm:text-base font-black text-white">
                {formatDurationHuman(session.durationSeconds)}
              </span>
            </div>

            <div className="bg-gym-bg/80 border border-gym-border/60 rounded-2xl p-2.5 flex flex-col items-center">
              <Dumbbell className="w-4 h-4 text-emerald-400 mb-0.5" />
              <span className="text-[10px] sm:text-xs text-gray-400 font-semibold">Volumen Total</span>
              <span className="text-sm sm:text-base font-black text-emerald-400">
                {formatWeight(session.totalVolume)}
              </span>
            </div>

            <div className="bg-gym-bg/80 border border-gym-border/60 rounded-2xl p-2.5 flex flex-col items-center">
              <CheckCircle className="w-4 h-4 text-gray-400 mb-0.5" />
              <span className="text-[10px] sm:text-xs text-gray-400 font-semibold">Ejercicios</span>
              <span className="text-sm sm:text-base font-black text-white">
                {completedExercises} / {totalExercises}
              </span>
            </div>

            <div className="bg-gym-bg/80 border border-gym-border/60 rounded-2xl p-2.5 flex flex-col items-center">
              <Award className="w-4 h-4 text-amber-400 mb-0.5" />
              <span className="text-[10px] sm:text-xs text-gray-400 font-semibold">Series Hechas</span>
              <span className="text-sm sm:text-base font-black text-white">
                {totalSets} series
              </span>
            </div>
          </div>

          {/* Celebración de Nuevos Récords si los hubo */}
          {newPRs.length > 0 && (
            <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-left">
              <div className="flex items-center gap-1.5 text-amber-400 font-black text-xs uppercase tracking-wider mb-1">
                <Trophy className="w-3.5 h-3.5" />
                ¡{newPRs.length} Nuevo{newPRs.length > 1 ? 's' : ''} Récord{newPRs.length > 1 ? 's' : ''} Personal!
              </div>
              <ul className="space-y-1 text-xs text-gray-300">
                {newPRs.map((pr, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span className="font-semibold text-white">{pr.exerciseName}:</span>
                    <span className="font-bold text-amber-400">{pr.value} kg × {pr.reps} reps</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Botones de Navegación Fijos (siempre visibles y clickeables en iPhone / iOS) */}
        <div
          className="flex-shrink-0 pt-3 border-t border-gym-border/40 space-y-2 mt-2"
          style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <Button
            size="lg"
            fullWidth
            variant="primary"
            onClick={handleGoHome}
            icon={<ArrowRight className="w-5 h-5 stroke-[2.5]" />}
          >
            VOLVER AL INICIO
          </Button>

          <Button
            size="md"
            fullWidth
            variant="ghost"
            onClick={handleGoHistory}
          >
            Ver en Historial
          </Button>
        </div>
      </div>
    </div>
  );
};