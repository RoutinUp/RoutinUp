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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-gym-card border border-gym-border rounded-3xl shadow-2xl overflow-hidden p-6 text-center flex flex-col justify-between max-h-[92vh]">
        {/* Ícono de Celebración */}
        <div>
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 mb-3 shadow-glow-primary">
            <Trophy className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            ¡RUTINA COMPLETADA!
          </h2>
          <p className="text-sm font-bold text-emerald-400 mt-0.5">
            {session.routineName} · {session.dayName}
          </p>
        </div>

        {/* Métricas clave */}
        <div className="grid grid-cols-2 gap-2.5 my-4">
          <div className="bg-gym-bg/80 border border-gym-border/60 rounded-2xl p-3 flex flex-col items-center">
            <Clock className="w-5 h-5 text-gray-400 mb-1" />
            <span className="text-xs text-gray-400 font-semibold">Duración</span>
            <span className="text-base font-black text-white">
              {formatDurationHuman(session.durationSeconds)}
            </span>
          </div>

          <div className="bg-gym-bg/80 border border-gym-border/60 rounded-2xl p-3 flex flex-col items-center">
            <Dumbbell className="w-5 h-5 text-emerald-400 mb-1" />
            <span className="text-xs text-gray-400 font-semibold">Volumen Total</span>
            <span className="text-base font-black text-emerald-400">
              {formatWeight(session.totalVolume)}
            </span>
          </div>

          <div className="bg-gym-bg/80 border border-gym-border/60 rounded-2xl p-3 flex flex-col items-center">
            <CheckCircle className="w-5 h-5 text-gray-400 mb-1" />
            <span className="text-xs text-gray-400 font-semibold">Ejercicios</span>
            <span className="text-base font-black text-white">
              {completedExercises} / {totalExercises}
            </span>
          </div>

          <div className="bg-gym-bg/80 border border-gym-border/60 rounded-2xl p-3 flex flex-col items-center">
            <Award className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-xs text-gray-400 font-semibold">Series Hechas</span>
            <span className="text-base font-black text-white">
              {totalSets} series
            </span>
          </div>
        </div>

        {/* Celebración de Nuevos Récords si los hubo */}
        {newPRs.length > 0 && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-left">
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

        {/* Botones de Navegación */}
        <div className="space-y-2 pt-2">
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