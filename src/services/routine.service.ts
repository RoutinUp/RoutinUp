import { supabase, isSupabaseConfigured } from '../config/supabase';
import { WorkoutRoutine } from '../types/routine';
import { exerciseService } from './exercise.service';

const getUserRoutinesKey = (userId?: string) => `gymtrack_user_routines_${userId || 'anonymous'}`;

// Semilla de rutinas predeterminadas: Push, Pull, Legs (solo para inicializar cuentas nuevas)
const DEFAULT_PRESET_ROUTINES: WorkoutRoutine[] = [
  {
    id: 'rot-push-pull-legs',
    userId: 'default-user',
    name: 'Push / Pull / Legs (PPL)',
    description: 'Rutina clásica de 3 días hipertrofia dividida por patrones de movimiento.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    days: [
      {
        id: 'day-push',
        routineId: 'rot-push-pull-legs',
        name: 'Día 1: Push (Pecho, Hombro, Tríceps)',
        dayOrder: 1,
        exercises: [
          {
            id: 'd-ex-1',
            workoutDayId: 'day-push',
            exerciseId: 'ex-pecho-01',
            exerciseOrder: 1,
            targetSets: 4,
            targetRepsMin: 8,
            targetRepsMax: 10,
            targetWeight: 80,
            restSeconds: 120,
            notes: 'Mantener escápulas retraídas y pies firmes.'
          },
          {
            id: 'd-ex-2',
            workoutDayId: 'day-push',
            exerciseId: 'ex-pecho-04',
            exerciseOrder: 2,
            targetSets: 3,
            targetRepsMin: 10,
            targetRepsMax: 12,
            targetWeight: 26,
            restSeconds: 90,
            notes: 'Banco a 30 grados, control en la bajada.'
          },
          {
            id: 'd-ex-3',
            workoutDayId: 'day-push',
            exerciseId: 'ex-hombros-03',
            exerciseOrder: 3,
            targetSets: 4,
            targetRepsMin: 12,
            targetRepsMax: 15,
            targetWeight: 10,
            restSeconds: 60,
            notes: 'Empujar con los codos hacia las paredes.'
          },
          {
            id: 'd-ex-4',
            workoutDayId: 'day-push',
            exerciseId: 'ex-triceps-02',
            exerciseOrder: 4,
            targetSets: 3,
            targetRepsMin: 10,
            targetRepsMax: 12,
            targetWeight: 25,
            restSeconds: 60,
            notes: 'Codos pegados a las costillas.'
          }
        ]
      },
      {
        id: 'day-pull',
        routineId: 'rot-push-pull-legs',
        name: 'Día 2: Pull (Espalda y Bíceps)',
        dayOrder: 2,
        exercises: [
          {
            id: 'd-ex-5',
            workoutDayId: 'day-pull',
            exerciseId: 'ex-espalda-01',
            exerciseOrder: 1,
            targetSets: 4,
            targetRepsMin: 6,
            targetRepsMax: 8,
            targetWeight: 0,
            restSeconds: 120,
            notes: 'Rango completo sin balanceo.'
          },
          {
            id: 'd-ex-6',
            workoutDayId: 'day-pull',
            exerciseId: 'ex-espalda-03',
            exerciseOrder: 2,
            targetSets: 4,
            targetRepsMin: 8,
            targetRepsMax: 10,
            targetWeight: 70,
            restSeconds: 90,
            notes: 'Espalda recta, traccionar al ombligo.'
          },
          {
            id: 'd-ex-7',
            workoutDayId: 'day-pull',
            exerciseId: 'ex-biceps-01',
            exerciseOrder: 3,
            targetSets: 3,
            targetRepsMin: 10,
            targetRepsMax: 12,
            targetWeight: 30,
            restSeconds: 60,
            notes: 'Sin balanceo del torso.'
          }
        ]
      },
      {
        id: 'day-legs',
        routineId: 'rot-push-pull-legs',
        name: 'Día 3: Legs (Piernas y Core)',
        dayOrder: 3,
        exercises: [
          {
            id: 'd-ex-8',
            workoutDayId: 'day-legs',
            exerciseId: 'ex-piernas-01',
            exerciseOrder: 1,
            targetSets: 4,
            targetRepsMin: 6,
            targetRepsMax: 8,
            targetWeight: 100,
            restSeconds: 150,
            notes: 'Romper paralelo con firmeza.'
          },
          {
            id: 'd-ex-9',
            workoutDayId: 'day-legs',
            exerciseId: 'ex-piernas-04',
            exerciseOrder: 2,
            targetSets: 4,
            targetRepsMin: 8,
            targetRepsMax: 10,
            targetWeight: 80,
            restSeconds: 90,
            notes: 'Bisagra de cadera profunda.'
          },
          {
            id: 'd-ex-10',
            workoutDayId: 'day-legs',
            exerciseId: 'ex-core-01',
            exerciseOrder: 3,
            targetSets: 3,
            targetRepsMin: 12,
            targetRepsMax: 15,
            targetWeight: 35,
            restSeconds: 60,
            notes: 'Enrollar la columna apretando el abdomen.'
          }
        ]
      }
    ]
  }
];

export const routineService = {
  // Obtener todas las rutinas del usuario con sus ejercicios hidratados
  async getRoutines(userId?: string): Promise<WorkoutRoutine[]> {
    if (!userId) return [];

    const allExercises = await exerciseService.getExercises(userId);
    const exerciseMap = new Map(allExercises.map((e) => [e.id, e]));

    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(getUserRoutinesKey(userId));
      let routines: WorkoutRoutine[] = stored ? JSON.parse(stored) : [];
      if (routines.length === 0) {
        routines = DEFAULT_PRESET_ROUTINES.map(r => ({ ...r, userId }));
        localStorage.setItem(getUserRoutinesKey(userId), JSON.stringify(routines));
      }

      return routines.map((r) => ({
        ...r,
        days: r.days.map((d) => ({
          ...d,
          exercises: d.exercises.map((e) => ({
            ...e,
            exercise: exerciseMap.get(e.exerciseId),
          })),
        })),
      }));
    }

    try {
      const { data, error } = await supabase
        .from('workout_routines')
        .select(`
          id, name, description, is_active, created_at, updated_at,
          workout_days (
            id, name, day_order, created_at, updated_at,
            workout_day_exercises (
              id, exercise_id, exercise_order, target_sets, target_reps_min,
              target_reps_max, target_weight, rest_seconds, notes
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error || !data) {
        console.warn('Error fetching routines from Supabase:', error);
        const stored = localStorage.getItem(getUserRoutinesKey(userId));
        return stored ? JSON.parse(stored) : [];
      }

      // Si el usuario es nuevo en Supabase y no tiene rutinas creadas, sugerir el preset PPL inicial
      if (data.length === 0) {
        return DEFAULT_PRESET_ROUTINES.map((r) => ({
          ...r,
          userId,
          days: r.days.map((d) => ({
            ...d,
            exercises: d.exercises.map((e) => ({
              ...e,
              exercise: exerciseMap.get(e.exerciseId),
            })),
          })),
        }));
      }

      const routines: WorkoutRoutine[] = data.map((r: any) => ({
        id: r.id,
        userId,
        name: r.name,
        description: r.description,
        isActive: r.is_active,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        days: (r.workout_days || [])
          .sort((a: any, b: any) => a.day_order - b.day_order)
          .map((d: any) => ({
            id: d.id,
            routineId: r.id,
            name: d.name,
            dayOrder: d.day_order,
            exercises: (d.workout_day_exercises || [])
              .sort((a: any, b: any) => a.exercise_order - b.exercise_order)
              .map((e: any) => ({
                id: e.id,
                workoutDayId: d.id,
                exerciseId: e.exercise_id,
                exercise: exerciseMap.get(e.exercise_id),
                exerciseOrder: e.exercise_order,
                targetSets: e.target_sets,
                targetRepsMin: e.target_reps_min,
                targetRepsMax: e.target_reps_max,
                targetWeight: Number(e.target_weight) || 0,
                restSeconds: e.rest_seconds,
                notes: e.notes || '',
              })),
          })),
      }));

      localStorage.setItem(getUserRoutinesKey(userId), JSON.stringify(routines));
      return routines;
    } catch (err) {
      console.warn('Error fetching routines from Supabase:', err);
      const stored = localStorage.getItem(getUserRoutinesKey(userId));
      return stored ? JSON.parse(stored) : [];
    }
  },

  // Obtener una rutina por ID
  async getRoutineById(routineId: string, userId?: string): Promise<WorkoutRoutine | null> {
    const list = await this.getRoutines(userId);
    return list.find((r) => r.id === routineId) || null;
  },

  // Guardar (crear o actualizar) una rutina completa
  async saveRoutine(routine: WorkoutRoutine, userId?: string): Promise<WorkoutRoutine> {
    if (!userId) throw new Error('Usuario no autenticado para guardar la rutina');

    if (!isSupabaseConfigured) {
      const userKey = getUserRoutinesKey(userId);
      const stored = localStorage.getItem(userKey);
      let list: WorkoutRoutine[] = stored ? JSON.parse(stored) : [];
      const index = list.findIndex((r) => r.id === routine.id);
      if (index >= 0) {
        list[index] = { ...routine, updatedAt: new Date().toISOString() };
      } else {
        list.push({ ...routine, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      }
      localStorage.setItem(userKey, JSON.stringify(list));
      return routine;
    }

    // Persistir en Supabase
    const isNew = routine.id.startsWith('rot-');
    const { data: routineData, error: routineError } = await supabase
      .from('workout_routines')
      .upsert({
        id: isNew ? undefined : routine.id,
        user_id: userId,
        name: routine.name,
        description: routine.description || '',
        is_active: routine.isActive,
      })
      .select()
      .single();

    if (routineError || !routineData) {
      throw routineError || new Error('Error al guardar la rutina en Supabase');
    }

    const realRoutineId = routineData.id;

    // Guardar Días y ejercicios
    for (let dayIdx = 0; dayIdx < routine.days.length; dayIdx++) {
      const day = routine.days[dayIdx];
      const isDayNew = day.id.startsWith('day-');
      const { data: dayData } = await supabase
        .from('workout_days')
        .upsert({
          id: isDayNew ? undefined : day.id,
          routine_id: realRoutineId,
          name: day.name,
          day_order: dayIdx + 1,
        })
        .select()
        .single();

      if (dayData) {
        for (let exIdx = 0; exIdx < day.exercises.length; exIdx++) {
          const ex = day.exercises[exIdx];
          const isExNew = ex.id.startsWith('d-ex-');
          await supabase.from('workout_day_exercises').upsert({
            id: isExNew ? undefined : ex.id,
            workout_day_id: dayData.id,
            exercise_id: ex.exerciseId,
            exercise_order: exIdx + 1,
            target_sets: ex.targetSets,
            target_reps_min: ex.targetRepsMin,
            target_reps_max: ex.targetRepsMax,
            target_weight: ex.targetWeight,
            rest_seconds: ex.restSeconds,
            notes: ex.notes || '',
          });
        }
      }
    }

    return routine;
  },

  // Eliminar una rutina del usuario actual
  async deleteRoutine(routineId: string, userId?: string): Promise<void> {
    if (!userId) return;

    if (!isSupabaseConfigured) {
      const userKey = getUserRoutinesKey(userId);
      const stored = localStorage.getItem(userKey);
      let list: WorkoutRoutine[] = stored ? JSON.parse(stored) : [];
      list = list.filter((r) => r.id !== routineId);
      localStorage.setItem(userKey, JSON.stringify(list));
      return;
    }

    await supabase.from('workout_routines').delete().eq('id', routineId).eq('user_id', userId);
  }
};