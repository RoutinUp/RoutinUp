import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorkoutDay } from '../types/routine';
import { WorkoutCard, SetCardData, RestCardData, WorkoutSession, LoggedExercise, LoggedSet } from '../types/workout';
import { workoutService } from '../services/workout.service';
import { calculateWeightSuggestion } from '../utils/weightSuggestion';
import confetti from 'canvas-confetti';

interface ActiveWorkoutState {
  isActive: boolean;
  routineName: string;
  dayName: string;
  workoutDayId?: string;
  startedAt: string;
  cards: WorkoutCard[];
  currentCardIndex: number;
  durationSeconds: number;
  isFinished: boolean;
  completedSessionSummary: WorkoutSession | null;
  newPRsList: any[];

  // Acciones
  startWorkout: (day: WorkoutDay, routineName: string, pastSessions: WorkoutSession[]) => void;
  completeSet: (cardIndex: number, weight: number, reps: number) => void;
  updateSetValues: (cardIndex: number, weight: number, reps: number) => void;
  goToNextCard: () => void;
  goToPreviousCard: () => void;
  jumpToCard: (index: number) => void;
  skipRest: () => void;
  skipCurrentExercise: (exerciseId: string, reason?: string) => void;
  tickTimer: () => void;
  finishWorkout: (userId?: string) => Promise<WorkoutSession>;
  cancelWorkout: () => void;
}

export const useActiveWorkoutStore = create<ActiveWorkoutState>()(
  persist(
    (set, get) => ({
      isActive: false,
      routineName: '',
      dayName: '',
      workoutDayId: undefined,
      startedAt: '',
      cards: [],
      currentCardIndex: 0,
      durationSeconds: 0,
      isFinished: false,
      completedSessionSummary: null,
      newPRsList: [],

      startWorkout: (day, routineName, pastSessions) => {
        const flatCards: WorkoutCard[] = [];
        const totalExercises = day.exercises.length;

        // Construir secuencia plana de tarjetas
        day.exercises.forEach((dayEx, exIndex) => {
          if (!dayEx.exercise) return;

          // Buscar desempeño anterior de este ejercicio en sesiones pasadas
          let pastExercise: LoggedExercise | null = null;
          for (const s of pastSessions) {
            const found = s.exercises.find((e) => e.exerciseId === dayEx.exerciseId && e.status === 'completed');
            if (found && found.sets.length > 0) {
              pastExercise = found;
              break;
            }
          }

          const suggestion = calculateWeightSuggestion(
            dayEx.exercise,
            dayEx.targetRepsMin,
            dayEx.targetRepsMax,
            dayEx.targetWeight,
            pastExercise
          );

          const lastSet = pastExercise?.sets?.[pastExercise.sets.length - 1];

          const totalSets = dayEx.setsConfig && dayEx.setsConfig.length > 0
            ? dayEx.setsConfig.length
            : dayEx.targetSets;

          for (let setNum = 1; setNum <= totalSets; setNum++) {
            const specificSet = dayEx.setsConfig?.find((s) => s.setNumber === setNum);
            const targetWeight = specificSet !== undefined ? specificSet.targetWeight : (dayEx.targetWeight || 0);
            const targetReps = specificSet !== undefined ? specificSet.targetReps : (dayEx.targetRepsMax || 10);

            // 1. Tarjeta de Serie
            const setCard: SetCardData = {
              kind: 'set',
              cardIndex: flatCards.length,
              totalCards: 0, // se actualiza al final
              exerciseId: dayEx.exerciseId,
              exercise: dayEx.exercise,
              exerciseOrder: exIndex + 1,
              totalExercisesInDay: totalExercises,
              setNumber: setNum,
              totalSets,
              targetRepsMin: specificSet ? specificSet.targetReps : dayEx.targetRepsMin,
              targetRepsMax: specificSet ? specificSet.targetReps : dayEx.targetRepsMax,
              targetWeight,
              restSeconds: dayEx.restSeconds,
              notes: dayEx.notes,
              lastPerformance: lastSet
                ? {
                    weight: lastSet.weight,
                    reps: lastSet.reps,
                    date: lastSet.completedAt,
                  }
                : undefined,
              suggestedWeight: suggestion.suggestedWeight,
              completed: false,
              loggedWeight: targetWeight,
              loggedReps: targetReps,
            };
            flatCards.push(setCard);

            // 2. Tarjeta de Descanso (salvo que sea la última serie del último ejercicio)
            const isLastSetOfLastExercise = exIndex === totalExercises - 1 && setNum === dayEx.targetSets;
            if (!isLastSetOfLastExercise) {
              const isLastSetOfThisExercise = setNum === dayEx.targetSets;
              const nextDayEx = isLastSetOfThisExercise ? day.exercises[exIndex + 1] : dayEx;

              const restCard: RestCardData = {
                kind: 'rest',
                cardIndex: flatCards.length,
                totalCards: 0,
                durationSeconds: dayEx.restSeconds,
                currentExerciseName: dayEx.exercise.name,
                nextExerciseName: nextDayEx?.exercise?.name || 'Próximo Ejercicio',
                nextSetNumber: isLastSetOfThisExercise ? 1 : setNum + 1,
                nextTotalSets: nextDayEx?.targetSets || 3,
                nextExerciseImage: nextDayEx?.exercise?.imageUrl,
                nextTargetWeight: nextDayEx?.targetWeight,
                nextTargetReps: `${nextDayEx?.targetRepsMin || 8}–${nextDayEx?.targetRepsMax || 12}`,
              };
              flatCards.push(restCard);
            }
          }
        });

        // Actualizar totalCards en cada tarjeta
        const total = flatCards.length;
        flatCards.forEach((c) => (c.totalCards = total));

        set({
          isActive: true,
          routineName,
          dayName: day.name,
          workoutDayId: day.id,
          startedAt: new Date().toISOString(),
          cards: flatCards,
          currentCardIndex: 0,
          durationSeconds: 0,
          isFinished: false,
          completedSessionSummary: null,
          newPRsList: [],
        });
      },

      completeSet: (cardIndex, weight, reps) => {
        const { cards, currentCardIndex } = get();
        const updated = [...cards];
        const card = updated[cardIndex];

        if (card && card.kind === 'set') {
          // Guardar o actualizar la serie sin duplicados
          updated[cardIndex] = {
            ...card,
            completed: true,
            loggedWeight: weight,
            loggedReps: reps,
          };

          // Avanzar a la siguiente tarjeta (la de descanso)
          const nextIndex = Math.min(cardIndex + 1, cards.length - 1);
          set({
            cards: updated,
            currentCardIndex: nextIndex,
          });
        }
      },

      updateSetValues: (cardIndex, weight, reps) => {
        const { cards } = get();
        const updated = [...cards];
        const card = updated[cardIndex];
        if (card && card.kind === 'set') {
          updated[cardIndex] = {
            ...card,
            loggedWeight: weight,
            loggedReps: reps,
          };
          set({ cards: updated });
        }
      },

      goToNextCard: () => {
        const { currentCardIndex, cards } = get();
        if (currentCardIndex < cards.length - 1) {
          set({ currentCardIndex: currentCardIndex + 1 });
        }
      },

      goToPreviousCard: () => {
        const { currentCardIndex } = get();
        // Retrocede estrictamente 1 en 1
        if (currentCardIndex > 0) {
          set({ currentCardIndex: currentCardIndex - 1 });
        }
      },

      jumpToCard: (index) => {
        const { cards } = get();
        if (index >= 0 && index < cards.length) {
          set({ currentCardIndex: index });
        }
      },

      skipRest: () => {
        const { currentCardIndex, cards } = get();
        if (currentCardIndex < cards.length - 1) {
          set({ currentCardIndex: currentCardIndex + 1 });
        }
      },

      skipCurrentExercise: (exerciseId, reason = 'Omitido por el usuario') => {
        const { cards, currentCardIndex } = get();
        const updated = [...cards];

        // Encontrar todas las tarjetas pertenecientes a este ejercicio y marcarlas
        let nextCardIndex = -1;
        for (let i = 0; i < updated.length; i++) {
          const c = updated[i];
          if (c.kind === 'set' && c.exerciseId === exerciseId) {
            // Omitir set
            updated[i] = {
              ...c,
              completed: false,
              notes: (c.notes ? c.notes + ' - ' : '') + `[${reason}]`,
            };
          }
          // Encontrar la primera tarjeta del siguiente ejercicio después del índice actual
          if (i > currentCardIndex && nextCardIndex === -1) {
            if (c.kind === 'set' && c.exerciseId !== exerciseId) {
              nextCardIndex = i;
            }
          }
        }

        // Si no hay más ejercicios, ir a la última tarjeta
        if (nextCardIndex === -1) {
          nextCardIndex = updated.length - 1;
        }

        set({
          cards: updated,
          currentCardIndex: nextCardIndex,
        });
      },

      tickTimer: () => {
        const { isActive, durationSeconds } = get();
        if (isActive) {
          set({ durationSeconds: durationSeconds + 1 });
        }
      },

      finishWorkout: async (userId) => {
        const { routineName, dayName, workoutDayId, startedAt, durationSeconds, cards } = get();

        // Agrupar sets por ejercicio
        const exercisesMap = new Map<string, LoggedExercise>();

        cards.forEach((card) => {
          if (card.kind === 'set') {
            if (!exercisesMap.has(card.exerciseId)) {
              exercisesMap.set(card.exerciseId, {
                exerciseId: card.exerciseId,
                exerciseName: card.exercise.name,
                exerciseOrder: card.exerciseOrder,
                status: 'completed',
                sets: [],
              });
            }

            const ex = exercisesMap.get(card.exerciseId)!;
            if (card.completed && (card.loggedReps || 0) > 0) {
              ex.sets.push({
                setNumber: card.setNumber,
                weight: card.loggedWeight || 0,
                reps: card.loggedReps || 0,
                targetRepsMin: card.targetRepsMin,
                targetRepsMax: card.targetRepsMax,
                targetWeight: card.targetWeight,
                completedAt: new Date().toISOString(),
              });
            }
          }
        });

        // Determinar status de cada ejercicio
        const loggedExercises: LoggedExercise[] = Array.from(exercisesMap.values()).map((ex) => {
          if (ex.sets.length === 0) {
            return {
              ...ex,
              status: 'skipped' as const,
              skippedReason: 'Omitido',
            };
          }
          return ex;
        });

        const sessionPayload: WorkoutSession = {
          id: 'sess-' + Math.random().toString(36).substring(2, 9),
          userId: userId || 'local-user',
          workoutDayId,
          routineName,
          dayName,
          startedAt: startedAt || new Date().toISOString(),
          completedAt: new Date().toISOString(),
          durationSeconds,
          totalVolume: 0,
          totalSetsCompleted: loggedExercises.reduce((acc, e) => acc + e.sets.length, 0),
          exercises: loggedExercises,
          status: 'completed',
        };

        const { session, newPRs } = await workoutService.saveWorkoutSession(sessionPayload, userId);

        // Disparar confeti de celebración
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }

        set({
          isActive: false,
          isFinished: true,
          completedSessionSummary: session,
          newPRsList: newPRs,
        });

        return session;
      },

      cancelWorkout: () => {
        set({
          isActive: false,
          cards: [],
          currentCardIndex: 0,
          durationSeconds: 0,
          isFinished: false,
          completedSessionSummary: null,
          newPRsList: [],
        });
      },
    }),
    {
      name: 'gymtrack_active_workout_state',
    }
  )
);