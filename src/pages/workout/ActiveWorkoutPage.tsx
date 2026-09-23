import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveWorkoutStore } from '../../store/useActiveWorkoutStore';
import { useAuthStore } from '../../store/useAuthStore';
import { SwipeableDeck } from '../../components/workout/SwipeableDeck';
import { SkipExerciseModal } from '../../components/workout/SkipExerciseModal';
import { WorkoutSummaryModal } from '../../components/workout/WorkoutSummaryModal';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { formatDuration } from '../../utils/formatters';
import { X, CheckCircle2, Clock } from 'lucide-react';

export const ActiveWorkoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    isActive,
    routineName,
    dayName,
    cards,
    currentCardIndex,
    durationSeconds,
    isFinished,
    completedSessionSummary,
    newPRsList,
    completeSet,
    updateSetValues,
    goToNextCard,
    goToPreviousCard,
    skipRest,
    skipCurrentExercise,
    tickTimer,
    finishWorkout,
    cancelWorkout,
  } = useActiveWorkoutStore();

  const [isSkipModalOpen, setIsSkipModalOpen] = useState(false);
  const [exerciseToSkip, setExerciseToSkip] = useState<{ id: string; name: string } | null>(null);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  // Tick de cronómetro cada segundo
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, tickTimer]);

  // Si no hay entrenamiento activo y no acaba de terminar, volver al home
  useEffect(() => {
    if (!isActive && !isFinished) {
      navigate('/');
    }
  }, [isActive, isFinished, navigate]);

  const handleRequestSkip = (exerciseId: string) => {
    const card = cards.find((c) => c.kind === 'set' && c.exerciseId === exerciseId);
    if (card && card.kind === 'set') {
      setExerciseToSkip({ id: exerciseId, name: card.exercise.name });
      setIsSkipModalOpen(true);
    }
  };

  const handleConfirmSkip = () => {
    if (exerciseToSkip) {
      skipCurrentExercise(exerciseToSkip.id);
      setIsSkipModalOpen(false);
    }
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      await finishWorkout(user?.id);
    } finally {
      setIsFinishing(false);
    }
  };

  const handleConfirmCancel = () => {
    cancelWorkout();
    setIsCancelConfirmOpen(false);
    navigate('/');
  };

  if (!isActive && !isFinished) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-gym-bg flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* 1. Header Minimalista de Entrenamiento Activo (Fijo arriba) */}
      <header className="sticky top-0 z-30 px-3.5 sm:px-4 py-2.5 sm:py-3 bg-gym-bg/95 backdrop-blur-md border-b border-gym-border/40 flex items-center justify-between flex-shrink-0 shadow-sm">
        <button
          type="button"
          onClick={() => setIsCancelConfirmOpen(true)}
          className="p-2 rounded-xl bg-gym-card hover:bg-slate-800 text-gray-400 hover:text-white border border-gym-border/60 transition-colors"
          title="Cancelar sesión"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Info y Cronómetro de Sesión */}
        <div className="text-center">
          <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider block truncate max-w-[200px] sm:max-w-none">
            {routineName} · {dayName}
          </span>
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-mono text-sm font-black mt-0.5">
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(durationSeconds)}
          </div>
        </div>

        {/* Botón Finalizar Rutina */}
        <Button
          size="sm"
          variant="primary"
          onClick={handleFinish}
          isLoading={isFinishing}
          icon={<CheckCircle2 className="w-4 h-4" />}
        >
          FINALIZAR
        </Button>
      </header>

      {/* 2. Área Central: Mazo de Tarjetas Deslizables con flujo vertical nativo */}
      <main className="flex-1 w-full max-w-md mx-auto px-3.5 py-3 sm:px-4 sm:py-4 flex flex-col pb-8">
        {cards.length > 0 && (
          <SwipeableDeck
            cards={cards}
            currentIndex={currentCardIndex}
            onNext={goToNextCard}
            onPrev={goToPreviousCard}
            onCompleteSet={(w, r) => completeSet(currentCardIndex, w, r)}
            onUpdateSet={(w, r) => updateSetValues(currentCardIndex, w, r)}
            onSkipRest={skipRest}
            onRequestSkipExercise={handleRequestSkip}
          />
        )}
      </main>

      {/* Modal Confirmar Saltar Ejercicio */}
      {exerciseToSkip && (
        <SkipExerciseModal
          isOpen={isSkipModalOpen}
          onClose={() => setIsSkipModalOpen(false)}
          onConfirm={handleConfirmSkip}
          exerciseName={exerciseToSkip.name}
        />
      )}

      {/* Modal Confirmar Cancelar Entrenamiento */}
      <Modal
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        title="¿Cancelar entrenamiento?"
      >
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-300">
            ¿Estás seguro de que deseas salir? El progreso no guardado de esta sesión se descartará.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsCancelConfirmOpen(false)}>
              CONTINUAR
            </Button>
            <Button variant="danger" onClick={handleConfirmCancel}>
              SALIR
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Resumen al Finalizar */}
      {isFinished && (
        <WorkoutSummaryModal
          session={completedSessionSummary}
          newPRs={newPRsList}
          onClose={() => cancelWorkout()}
        />
      )}
    </div>
  );
};