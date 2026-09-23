import React from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { WorkoutCard } from '../../types/workout';
import { SetCard } from './SetCard';
import { RestCard } from './RestCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SwipeableDeckProps {
  cards: WorkoutCard[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onCompleteSet: (weight: number, reps: number) => void;
  onUpdateSet: (weight: number, reps: number) => void;
  onSkipRest: () => void;
  onRequestSkipExercise: (exerciseId: string) => void;
}

export const SwipeableDeck: React.FC<SwipeableDeckProps> = ({
  cards,
  currentIndex,
  onNext,
  onPrev,
  onCompleteSet,
  onUpdateSet,
  onSkipRest,
  onRequestSkipExercise,
}) => {
  const currentCard = cards[currentIndex];
  if (!currentCard) return null;

  // Umbral de swipe en píxeles
  const SWIPE_THRESHOLD = 70;

  const handleDragEnd = (_: any, info: PanInfo) => {
    // Si arrastró hacia la izquierda más allá del umbral -> avanzar
    if (info.offset.x < -SWIPE_THRESHOLD) {
      if (currentIndex < cards.length - 1) {
        onNext();
      }
    }
    // Si arrastró hacia la derecha más allá del umbral -> retroceder
    else if (info.offset.x > SWIPE_THRESHOLD) {
      if (currentIndex > 0) {
        onPrev();
      }
    }
  };

  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="w-full flex flex-col select-none relative">
      {/* 1. Barra de progreso superior discreta */}
      <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mb-2 flex-shrink-0">
        <div
          className="bg-emerald-500 h-full transition-all duration-300 rounded-full shadow-glow-primary"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 2. Área principal de la tarjeta con animación y swipe */}
      <div className="w-full relative flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.cardIndex}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.4}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, scale: 0.96, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.96, x: -20 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-full cursor-grab active:cursor-grabbing touch-pan-y"
          >
            {currentCard.kind === 'set' ? (
              <SetCard
                card={currentCard}
                onComplete={(w, r) => onCompleteSet(w, r)}
                onUpdate={(w, r) => onUpdateSet(w, r)}
                onSkipExercise={() => onRequestSkipExercise(currentCard.exerciseId)}
              />
            ) : (
              <RestCard
                card={currentCard}
                onSkip={onSkipRest}
                onCompleteRest={onNext}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. Controles visuales accesibles inferiores para navegar con o sin swipe */}
      <div className="flex items-center justify-between gap-3 py-3 mt-3 border-t border-gym-border/40 px-1">
        <button
          type="button"
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-gym-cardLighter border border-gym-border text-xs font-bold text-gray-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all select-none"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </button>

        <span className="text-xs font-bold text-gray-400">
          Paso <strong className="text-white">{currentIndex + 1}</strong> de {cards.length}
        </span>

        <button
          type="button"
          onClick={onNext}
          disabled={currentIndex >= cards.length - 1}
          className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-gym-cardLighter border border-gym-border text-xs font-bold text-gray-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all select-none"
        >
          Siguiente
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};