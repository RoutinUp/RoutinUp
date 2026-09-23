import React, { useState, useEffect } from 'react';
import { SetCardData } from '../../types/workout';
import { ExerciseImage } from '../common/ExerciseImage';
import { QuickNumberStepper } from './QuickNumberStepper';
import { Button } from '../common/Button';
import { Check, Sparkles, History, AlertCircle, FastForward } from 'lucide-react';
import { formatWeight } from '../../utils/formatters';

interface SetCardProps {
  card: SetCardData;
  onComplete: (weight: number, reps: number) => void;
  onUpdate: (weight: number, reps: number) => void;
  onSkipExercise: () => void;
}

export const SetCard: React.FC<SetCardProps> = ({
  card,
  onComplete,
  onUpdate,
  onSkipExercise,
}) => {
  const [weight, setWeight] = useState<number>(card.loggedWeight ?? card.targetWeight ?? 0);
  const [reps, setReps] = useState<number>(card.loggedReps ?? card.targetRepsMax ?? 10);

  useEffect(() => {
    setWeight(card.loggedWeight ?? card.targetWeight ?? 0);
    setReps(card.loggedReps ?? card.targetRepsMax ?? 10);
  }, [card.cardIndex, card.loggedWeight, card.loggedReps, card.targetWeight, card.targetRepsMax]);

  const handleWeightChange = (newWeight: number) => {
    setWeight(newWeight);
    onUpdate(newWeight, reps);
  };

  const handleRepsChange = (newReps: number) => {
    setReps(newReps);
    onUpdate(weight, newReps);
  };

  const applySuggestedWeight = () => {
    if (card.suggestedWeight !== undefined) {
      handleWeightChange(card.suggestedWeight);
    }
  };

  const isRepsOutOfTarget = reps < card.targetRepsMin || reps > card.targetRepsMax;

  return (
    <div className="w-full flex flex-col bg-gym-card rounded-3xl border border-gym-border/80 shadow-2xl p-3.5 sm:p-5">
      {/* 1. Header del Ejercicio y Serie */}
      <div className="flex items-center justify-between gap-3 border-b border-gym-border/40 pb-2.5 flex-shrink-0">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">
            Ejercicio {card.exerciseOrder} de {card.totalExercisesInDay}
          </span>
          <h2 className="text-[clamp(1rem,4vw,1.35rem)] font-black text-white tracking-tight leading-snug whitespace-normal break-words [word-break:break-word]">
            {card.exercise.name}
          </h2>
        </div>
        <div className="px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-xs sm:text-sm tracking-wider flex items-center gap-1 flex-shrink-0">
          Serie {card.setNumber} / {card.totalSets}
        </div>
      </div>

      {/* 2. Ilustración Vectorial */}
      <div className="my-3 h-40 sm:h-52 rounded-2xl overflow-hidden bg-slate-900 border border-gym-border/50 flex-shrink-0">
        <ExerciseImage
          imageUrl={card.exercise.imageUrl}
          name={card.exercise.name}
          muscleGroup={card.exercise.mainMuscleGroup}
          variant="card"
          priority
          className="w-full h-full"
        />
      </div>

      {/* 3. Metas, Historial Previo y Sugerencia de Peso */}
      <div className="space-y-1.5 mb-2">
        {/* Metas configuradas */}
        <div className="flex items-center justify-between text-xs px-2.5 py-1 rounded-xl bg-gym-bg/80 border border-gym-border/50">
          <span className="text-gray-400 font-semibold text-[11px] sm:text-xs">
            🎯 Objetivo: <strong className="text-white font-bold">{card.targetRepsMin}–{card.targetRepsMax} reps</strong>
          </span>
          <span className="text-gray-400 font-semibold text-[11px] sm:text-xs">
            ⏱️ Descanso: <strong className="text-white font-bold">{card.restSeconds}s</strong>
          </span>
        </div>

        {/* Historial anterior & Sugerencia */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
          {card.lastPerformance ? (
            <div className="flex items-center gap-1 text-gray-400 bg-slate-800/60 px-2 py-0.5 rounded-lg text-[11px]">
              <History className="w-3 h-3 text-gray-400" />
              <span>Último: <strong className="text-gray-200">{card.lastPerformance.weight} kg × {card.lastPerformance.reps}</strong></span>
            </div>
          ) : (
            <div className="text-gray-500 italic text-[10px]">Primer entrenamiento de este ejercicio</div>
          )}

          {card.suggestedWeight !== undefined && card.suggestedWeight !== weight && (
            <button
              type="button"
              onClick={applySuggestedWeight}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold hover:bg-amber-500/25 transition-all text-[10px]"
            >
              <Sparkles className="w-3 h-3" />
              Sugerido: {card.suggestedWeight} kg <span className="underline ml-0.5">Aplicar</span>
            </button>
          )}
        </div>

        {/* Notas personales del ejercicio si existen */}
        {card.notes && (
          <p className="text-[10px] text-gray-400 bg-slate-900/60 px-2 py-1 rounded-lg border-l-2 border-emerald-500 italic whitespace-normal break-words [word-break:break-word]">
            "{card.notes}"
          </p>
        )}
      </div>

      {/* 4. Inputs Ergonómicos de Peso y Repeticiones */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2.5">
        <QuickNumberStepper
          label="Peso"
          value={weight}
          onChange={handleWeightChange}
          step={2.5}
          quickIncrements={[1, 2.5, 5]}
          unit="kg"
        />
        <QuickNumberStepper
          label="Repeticiones"
          value={reps}
          onChange={handleRepsChange}
          step={1}
          min={1}
          quickIncrements={[1, 2]}
          unit="reps"
        />
      </div>

      {/* Indicador no punitivo si reps salen del rango */}
      {isRepsOutOfTarget && (
        <div className="mb-2 text-center">
          <span className="inline-flex items-center gap-1 text-[10px] text-amber-400/90 font-medium">
            <AlertCircle className="w-3 h-3" />
            Objetivo: {card.targetRepsMin}–{card.targetRepsMax} | Registrando: {reps} reps
          </span>
        </div>
      )}

      {/* 5. Botón de Acción Principal y Saltar Ejercicio */}
      <div className="space-y-1.5 pt-0.5">
        <Button
          size="lg"
          fullWidth
          variant={card.completed ? 'secondary' : 'primary'}
          onClick={() => onComplete(weight, reps)}
          icon={<Check className="w-5 h-5 stroke-[3]" />}
        >
          {card.completed ? 'ACTUALIZAR SERIE' : 'COMPLETAR SERIE'}
        </Button>

        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={onSkipExercise}
            className="text-[11px] font-semibold text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1 py-0.5 px-3 rounded-lg hover:bg-red-500/10"
          >
            <FastForward className="w-3.5 h-3.5" />
            Saltar ejercicio
          </button>
        </div>
      </div>
    </div>
  );
};