import { LoggedExercise } from '../types/workout';
import { Exercise } from '../types/exercise';

export interface WeightSuggestionResult {
  suggestedWeight: number;
  reason: string;
  previousWeight?: number;
  previousReps?: number;
  previousDate?: string;
  hasPreviousData: boolean;
}

export const calculateWeightSuggestion = (
  exercise: Exercise,
  targetRepsMin: number,
  targetRepsMax: number,
  baseTargetWeight: number,
  pastExerciseHistory?: LoggedExercise | null
): WeightSuggestionResult => {
  if (!pastExerciseHistory || pastExerciseHistory.sets.length === 0) {
    return {
      suggestedWeight: baseTargetWeight,
      reason: 'Basado en el peso objetivo configurado en tu rutina.',
      hasPreviousData: false,
    };
  }

  const completedSets = pastExerciseHistory.sets.filter((s) => s.reps > 0);
  if (completedSets.length === 0) {
    return {
      suggestedWeight: baseTargetWeight,
      reason: 'Sin registros previos completados.',
      hasPreviousData: false,
    };
  }

  // Tomamos el último set o el set más pesado
  const maxWeightSet = completedSets.reduce((prev, curr) =>
    curr.weight > prev.weight ? curr : prev
  );

  const lastSet = completedSets[completedSets.length - 1];
  const lastWeight = maxWeightSet.weight;
  const lastReps = maxWeightSet.reps;

  // Determinar incremento sugerido según si es compuesto o aislamiento
  const isCompound = exercise.exerciseType === 'compuesto';
  const increment = isCompound ? 2.5 : 1.25;

  // Si alcanzó el tope de repeticiones objetivo en sus series
  if (lastReps >= targetRepsMax) {
    const nextWeight = Math.round((lastWeight + increment) * 10) / 10;
    return {
      suggestedWeight: nextWeight,
      reason: `¡Excelente desempeño anterior (${lastWeight}kg × ${lastReps})! Superaste el objetivo (${targetRepsMax} reps). Sugerimos +${increment} kg.`,
      previousWeight: lastWeight,
      previousReps: lastReps,
      hasPreviousData: true,
    };
  }

  // Si estuvo dentro del rango
  if (lastReps >= targetRepsMin) {
    return {
      suggestedWeight: lastWeight,
      reason: `Buen rendimiento anterior (${lastWeight}kg × ${lastReps}). Mantén el peso hasta dominar las ${targetRepsMax} reps.`,
      previousWeight: lastWeight,
      previousReps: lastReps,
      hasPreviousData: true,
    };
  }

  // Si estuvo por debajo del rango mínimo
  return {
    suggestedWeight: lastWeight,
    reason: `En la sesión anterior lograste ${lastReps} reps de ${targetRepsMin} mínimas. Consolida este peso antes de incrementar.`,
    previousWeight: lastWeight,
    previousReps: lastReps,
    hasPreviousData: true,
  };
};