import { supabase, isSupabaseConfigured } from '../config/supabase';
import { WorkoutRoutine } from '../types/routine';
import { exerciseService } from './exercise.service';
import { SEED_EXERCISES } from '../data/seedExercises';

const getUserRoutinesKey = (userId?: string) => `gymtrack_user_routines_${userId || 'anonymous'}`;

// Semilla de rutinas predeterminadas: Push, Pull, Legs (solo para inicializar cuentas nuevas)
const DEFAULT_PRESET_ROUTINES: WorkoutRoutine[] = [
  {
    id: 'rot-push-pull-legs',
    userId: 'default-user',
    name: 'Push / Pull / Legs (PPL - 3 Días)',
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
            exerciseId: 'ex-hombros-05',
            exerciseOrder: 3,
            targetSets: 3,
            targetRepsMin: 12,
            targetRepsMax: 15,
            targetWeight: 20,
            restSeconds: 60,
            notes: 'Separar las cuerdas hacia las orejas.'
          },
          {
            id: 'd-ex-8',
            workoutDayId: 'day-pull',
            exerciseId: 'ex-biceps-01',
            exerciseOrder: 4,
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
            id: 'd-ex-9',
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
            id: 'd-ex-10',
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
            id: 'd-ex-11',
            workoutDayId: 'day-legs',
            exerciseId: 'ex-piernas-05',
            exerciseOrder: 3,
            targetSets: 3,
            targetRepsMin: 12,
            targetRepsMax: 15,
            targetWeight: 45,
            restSeconds: 60,
            notes: 'Pausa de 1 segundo en la contracción.'
          },
          {
            id: 'd-ex-12',
            workoutDayId: 'day-legs',
            exerciseId: 'ex-core-01',
            exerciseOrder: 4,
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
  },
  {
    id: 'rot-torso-pierna-fullbody',
    userId: 'default-user',
    name: 'Torso / Pierna / Fullbody (3 Días)',
    description: 'Equilibrio perfecto de frecuencia y volumen muscular en 3 sesiones semanales.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    days: [
      {
        id: 'day-tpf-torso',
        routineId: 'rot-torso-pierna-fullbody',
        name: 'Día 1: Torso (Pecho, Espalda y Hombros)',
        dayOrder: 1,
        exercises: [
          {
            id: 'd-ex-13',
            workoutDayId: 'day-tpf-torso',
            exerciseId: 'ex-pecho-01',
            exerciseOrder: 1,
            targetSets: 4,
            targetRepsMin: 8,
            targetRepsMax: 10,
            targetWeight: 75,
            restSeconds: 120,
            notes: 'Control en el descenso.'
          },
          {
            id: 'd-ex-14',
            workoutDayId: 'day-tpf-torso',
            exerciseId: 'ex-espalda-02',
            exerciseOrder: 2,
            targetSets: 4,
            targetRepsMin: 8,
            targetRepsMax: 10,
            targetWeight: 60,
            restSeconds: 90,
            notes: 'Tracción vertical llevando codos a los costados.'
          },
          {
            id: 'd-ex-15',
            workoutDayId: 'day-tpf-torso',
            exerciseId: 'ex-hombros-01',
            exerciseOrder: 3,
            targetSets: 3,
            targetRepsMin: 8,
            targetRepsMax: 10,
            targetWeight: 45,
            restSeconds: 90,
            notes: 'Glúteos apretados y empuje vertical estricto.'
          },
          {
            id: 'd-ex-16',
            workoutDayId: 'day-tpf-torso',
            exerciseId: 'ex-espalda-05',
            exerciseOrder: 4,
            targetSets: 3,
            targetRepsMin: 10,
            targetRepsMax: 12,
            targetWeight: 55,
            restSeconds: 60,
            notes: 'Jalar al esternón bajo apretando omóplatos.'
          },
          {
            id: 'd-ex-17',
            workoutDayId: 'day-tpf-torso',
            exerciseId: 'ex-triceps-01',
            exerciseOrder: 5,
            targetSets: 3,
            targetRepsMin: 10,
            targetRepsMax: 12,
            targetWeight: 25,
            restSeconds: 60,
            notes: 'Codos cerrados durante el recorrido.'
          }
        ]
      },
      {
        id: 'day-tpf-pierna',
        routineId: 'rot-torso-pierna-fullbody',
        name: 'Día 2: Piernas y Core',
        dayOrder: 2,
        exercises: [
          {
            id: 'd-ex-18',
            workoutDayId: 'day-tpf-pierna',
            exerciseId: 'ex-piernas-01',
            exerciseOrder: 1,
            targetSets: 4,
            targetRepsMin: 6,
            targetRepsMax: 8,
            targetWeight: 90,
            restSeconds: 120,
            notes: 'Buena profundidad y estabilidad plantar.'
          },
          {
            id: 'd-ex-19',
            workoutDayId: 'day-tpf-pierna',
            exerciseId: 'ex-piernas-03',
            exerciseOrder: 2,
            targetSets: 3,
            targetRepsMin: 10,
            targetRepsMax: 12,
            targetWeight: 140,
            restSeconds: 90,
            notes: 'Pies al centro de la plataforma.'
          },
          {
            id: 'd-ex-20',
            workoutDayId: 'day-tpf-pierna',
            exerciseId: 'ex-piernas-06',
            exerciseOrder: 3,
            targetSets: 3,
            targetRepsMin: 10,
            targetRepsMax: 12,
            targetWeight: 40,
            restSeconds: 60,
            notes: 'Caderas pegadas al banco en todo momento.'
          },
          {
            id: 'd-ex-21',
            workoutDayId: 'day-tpf-pierna',
            exerciseId: 'ex-piernas-10',
            exerciseOrder: 4,
            targetSets: 4,
            targetRepsMin: 12,
            targetRepsMax: 15,
            targetWeight: 50,
            restSeconds: 45,
            notes: 'Pausa de 2 segundos arriba en máxima flexión.'
          },
          {
            id: 'd-ex-22',
            workoutDayId: 'day-tpf-pierna',
            exerciseId: 'ex-core-02',
            exerciseOrder: 5,
            targetSets: 3,
            targetRepsMin: 10,
            targetRepsMax: 12,
            targetWeight: 0,
            restSeconds: 60,
            notes: 'Evitar el balanceo, elevar la pelvis.'
          }
        ]
      },
      {
        id: 'day-tpf-fullbody',
        routineId: 'rot-torso-pierna-fullbody',
        name: 'Día 3: Fullbody (Cuerpo Completo)',
        dayOrder: 3,
        exercises: [
          {
            id: 'd-ex-23',
            workoutDayId: 'day-tpf-fullbody',
            exerciseId: 'ex-espalda-07',
            exerciseOrder: 1,
            targetSets: 3,
            targetRepsMin: 5,
            targetRepsMax: 6,
            targetWeight: 110,
            restSeconds: 150,
            notes: 'Espalda neutra y empuje contra el suelo.'
          },
          {
            id: 'd-ex-24',
            workoutDayId: 'day-tpf-fullbody',
            exerciseId: 'ex-pecho-04',
            exerciseOrder: 2,
            targetSets: 3,
            targetRepsMin: 8,
            targetRepsMax: 10,
            targetWeight: 24,
            restSeconds: 90,
            notes: 'Apertura de codos a 45 grados.'
          },
          {
            id: 'd-ex-25',
            workoutDayId: 'day-tpf-fullbody',
            exerciseId: 'ex-espalda-04',
            exerciseOrder: 3,
            targetSets: 3,
            targetRepsMin: 10,
            targetRepsMax: 12,
            targetWeight: 26,
            restSeconds: 60,
            notes: 'Traccionar hacia la cadera.'
          },
          {
            id: 'd-ex-26',
            workoutDayId: 'day-tpf-fullbody',
            exerciseId: 'ex-biceps-03',
            exerciseOrder: 4,
            targetSets: 3,
            targetRepsMin: 10,
            targetRepsMax: 12,
            targetWeight: 14,
            restSeconds: 60,
            notes: 'Agarre neutro estricto.'
          },
          {
            id: 'd-ex-27',
            workoutDayId: 'day-tpf-fullbody',
            exerciseId: 'ex-core-03',
            exerciseOrder: 5,
            targetSets: 3,
            targetRepsMin: 45,
            targetRepsMax: 60,
            targetWeight: 0,
            restSeconds: 60,
            notes: 'Tensión isométrica continua en todo el core.'
          }
        ]
      }
    ]
  },
  {
    id: 'rot-fuerza-5x5',
    userId: 'default-user',
    name: 'Fuerza Básica 5x5 (3 Días)',
    description: 'Rutina clásica de fuerza máxima basada en los levantamientos compuestos elementales.',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    days: [
      {
        id: 'day-5x5-a',
        routineId: 'rot-fuerza-5x5',
        name: 'Día 1: Fuerza A (Sentadilla, Banca, Remo)',
        dayOrder: 1,
        exercises: [
          {
            id: 'd-ex-28',
            workoutDayId: 'day-5x5-a',
            exerciseId: 'ex-piernas-01',
            exerciseOrder: 1,
            targetSets: 5,
            targetRepsMin: 5,
            targetRepsMax: 5,
            targetWeight: 100,
            restSeconds: 180,
            notes: '5 series pesadas manteniendo técnica estricta.'
          },
          {
            id: 'd-ex-29',
            workoutDayId: 'day-5x5-a',
            exerciseId: 'ex-pecho-01',
            exerciseOrder: 2,
            targetSets: 5,
            targetRepsMin: 5,
            targetRepsMax: 5,
            targetWeight: 85,
            restSeconds: 180,
            notes: 'Pausa breve en el pecho antes de empujar.'
          },
          {
            id: 'd-ex-30',
            workoutDayId: 'day-5x5-a',
            exerciseId: 'ex-espalda-03',
            exerciseOrder: 3,
            targetSets: 5,
            targetRepsMin: 5,
            targetRepsMax: 5,
            targetWeight: 75,
            restSeconds: 180,
            notes: 'Tronco firme paralelo al suelo.'
          },
          {
            id: 'd-ex-31',
            workoutDayId: 'day-5x5-a',
            exerciseId: 'ex-core-01',
            exerciseOrder: 4,
            targetSets: 3,
            targetRepsMin: 12,
            targetRepsMax: 15,
            targetWeight: 35,
            restSeconds: 60,
            notes: 'Trabajo accesorio de estabilidad abdominal.'
          }
        ]
      },
      {
        id: 'day-5x5-b',
        routineId: 'rot-fuerza-5x5',
        name: 'Día 2: Fuerza B (Sentadilla, Militar, Peso Muerto)',
        dayOrder: 2,
        exercises: [
          {
            id: 'd-ex-32',
            workoutDayId: 'day-5x5-b',
            exerciseId: 'ex-piernas-01',
            exerciseOrder: 1,
            targetSets: 5,
            targetRepsMin: 5,
            targetRepsMax: 5,
            targetWeight: 100,
            restSeconds: 180,
            notes: 'Mismo peso de trabajo para consolidar adaptación neuromuscular.'
          },
          {
            id: 'd-ex-33',
            workoutDayId: 'day-5x5-b',
            exerciseId: 'ex-hombros-01',
            exerciseOrder: 2,
            targetSets: 5,
            targetRepsMin: 5,
            targetRepsMax: 5,
            targetWeight: 55,
            restSeconds: 180,
            notes: 'Bloquear los codos arriba con la cabeza adelantada.'
          },
          {
            id: 'd-ex-34',
            workoutDayId: 'day-5x5-b',
            exerciseId: 'ex-espalda-07',
            exerciseOrder: 3,
            targetSets: 1,
            targetRepsMin: 5,
            targetRepsMax: 5,
            targetWeight: 130,
            restSeconds: 180,
            notes: '1 serie efectiva pesada de máxima intensidad.'
          },
          {
            id: 'd-ex-35',
            workoutDayId: 'day-5x5-b',
            exerciseId: 'ex-triceps-04',
            exerciseOrder: 4,
            targetSets: 3,
            targetRepsMin: 8,
            targetRepsMax: 10,
            targetWeight: 0,
            restSeconds: 90,
            notes: 'Fondos con peso corporal o lastre ligero.'
          }
        ]
      },
      {
        id: 'day-5x5-c',
        routineId: 'rot-fuerza-5x5',
        name: 'Día 3: Fuerza C (Sentadilla, Banca, Dominadas)',
        dayOrder: 3,
        exercises: [
          {
            id: 'd-ex-36',
            workoutDayId: 'day-5x5-c',
            exerciseId: 'ex-piernas-01',
            exerciseOrder: 1,
            targetSets: 5,
            targetRepsMin: 5,
            targetRepsMax: 5,
            targetWeight: 100,
            restSeconds: 180,
            notes: 'Cierre semanal de sentadillas de alta carga.'
          },
          {
            id: 'd-ex-37',
            workoutDayId: 'day-5x5-c',
            exerciseId: 'ex-pecho-01',
            exerciseOrder: 2,
            targetSets: 5,
            targetRepsMin: 5,
            targetRepsMax: 5,
            targetWeight: 85,
            restSeconds: 180,
            notes: 'Empujar con agresividad concéntrica.'
          },
          {
            id: 'd-ex-38',
            workoutDayId: 'day-5x5-c',
            exerciseId: 'ex-espalda-01',
            exerciseOrder: 3,
            targetSets: 5,
            targetRepsMin: 5,
            targetRepsMax: 5,
            targetWeight: 0,
            restSeconds: 150,
            notes: 'Dominadas con recorrido completo hasta pasar la barbilla.'
          },
          {
            id: 'd-ex-39',
            workoutDayId: 'day-5x5-c',
            exerciseId: 'ex-biceps-01',
            exerciseOrder: 4,
            targetSets: 3,
            targetRepsMin: 8,
            targetRepsMax: 10,
            targetWeight: 32,
            restSeconds: 60,
            notes: 'Aislamiento final para flexores de codo.'
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
      let routines: WorkoutRoutine[] = [];
      if (stored === null) {
        // Primera vez absoluta en modo local: ofrecer preset inicial
        routines = DEFAULT_PRESET_ROUTINES.map(r => ({ ...r, userId }));
        localStorage.setItem(getUserRoutinesKey(userId), JSON.stringify(routines));
      } else {
        routines = JSON.parse(stored);
      }

      return routines.map((r) => ({
        ...r,
        days: r.days.map((d) => ({
          ...d,
          exercises: d.exercises.map((e) => {
            const setsConfig = e.setsConfig && e.setsConfig.length > 0
              ? e.setsConfig
              : Array.from({ length: e.targetSets || 3 }, (_, idx) => ({
                  setNumber: idx + 1,
                  targetReps: e.targetRepsMin || 10,
                  targetWeight: e.targetWeight || 0,
                }));
            return {
              ...e,
              setsConfig,
              exercise: exerciseMap.get(e.exerciseId),
            };
          }),
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
              *
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

      // Si el usuario no tiene rutinas creadas (o las eliminó todas), retornar lista vacía
      if (data.length === 0) {
        localStorage.setItem(getUserRoutinesKey(userId), JSON.stringify([]));
        return [];
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
              .map((e: any) => {
                const rawSets = Array.isArray(e.sets_config) ? e.sets_config : [];
                const setsConfig = rawSets.length > 0
                  ? rawSets
                  : Array.from({ length: e.target_sets || 3 }, (_, idx) => ({
                      setNumber: idx + 1,
                      targetReps: e.target_reps_min || 10,
                      targetWeight: Number(e.target_weight) || 0,
                    }));

                return {
                  id: e.id,
                  workoutDayId: d.id,
                  exerciseId: e.exercise_id,
                  exercise: exerciseMap.get(e.exercise_id) || SEED_EXERCISES.find((s) => s.id === e.exercise_id || s.slug === e.exercise_id),
                  exerciseOrder: e.exercise_order,
                  targetSets: setsConfig.length || e.target_sets || 3,
                  targetRepsMin: e.target_reps_min,
                  targetRepsMax: e.target_reps_max,
                  targetWeight: Number(e.target_weight) || 0,
                  restSeconds: e.rest_seconds,
                  notes: e.notes || '',
                  setsConfig,
                };
              }),
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

    // Si la rutina que se guarda está marcada como activa, desmarcar cualquier otra primero
    if (routine.isActive) {
      const userKey = getUserRoutinesKey(userId);
      const stored = localStorage.getItem(userKey);
      if (stored) {
        try {
          const list: WorkoutRoutine[] = JSON.parse(stored);
          const updated = list.map((r) => (r.id !== routine.id ? { ...r, isActive: false } : r));
          localStorage.setItem(userKey, JSON.stringify(updated));
        } catch (e) {
          console.warn('Error clearing active routines in cache:', e);
        }
      }

      if (isSupabaseConfigured) {
        try {
          await supabase
            .from('workout_routines')
            .update({ is_active: false })
            .eq('user_id', userId);
        } catch (e) {
          console.warn('Error clearing active routines in Supabase:', e);
        }
      }
    }

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

    // Obtener catálogo completo de ejercicios de Supabase para mapear IDs
    const dbExercises = await exerciseService.getExercises(userId);
    const isUuid = (val?: string) =>
      Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

    const savedDayIds: string[] = [];

    // Guardar Días y TODOS sus ejercicios correspondientes
    for (let dayIdx = 0; dayIdx < routine.days.length; dayIdx++) {
      const day = routine.days[dayIdx];
      const isDayNew = day.id.startsWith('day-');
      const { data: dayData, error: dayError } = await supabase
        .from('workout_days')
        .upsert({
          id: isDayNew ? undefined : day.id,
          routine_id: realRoutineId,
          name: day.name,
          day_order: dayIdx + 1,
        })
        .select()
        .single();

      if (dayError || !dayData) {
        console.warn(`Error al guardar día "${day.name}" en Supabase:`, dayError);
        continue;
      }

      day.id = dayData.id;
      savedDayIds.push(dayData.id);

      const savedExerciseIds: string[] = [];

      for (let exIdx = 0; exIdx < day.exercises.length; exIdx++) {
        const ex = day.exercises[exIdx];
        const isExNew = ex.id.startsWith('d-ex-');

        // Resolver UUID de Supabase para el ejercicio
        const seedInfo = SEED_EXERCISES.find(
          (s) => s.id === ex.exerciseId || s.slug === ex.exerciseId
        );

        let resolvedExerciseId: string | null = isUuid(ex.exerciseId) ? ex.exerciseId : null;

        if (!resolvedExerciseId) {
          const matched = dbExercises.find(
            (d) =>
              d.id === ex.exerciseId ||
              (d.slug && (d.slug === ex.exerciseId || (ex.exercise && d.slug === ex.exercise.slug) || (seedInfo && d.slug === seedInfo.slug))) ||
              (d.name && ((ex.exercise && d.name.toLowerCase().trim() === ex.exercise.name.toLowerCase().trim()) || (seedInfo && d.name.toLowerCase().trim() === seedInfo.name.toLowerCase().trim())))
          );
          if (matched && isUuid(matched.id)) {
            resolvedExerciseId = matched.id;
          }
        }

        // Si el ejercicio aún no existe en Supabase, crearlo con is_custom=true y created_by=userId para cumplir con RLS
        if (!resolvedExerciseId) {
          const exName = ex.exercise?.name || seedInfo?.name || 'Ejercicio';
          const exSlug = ex.exercise?.slug || seedInfo?.slug || exName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
          const exMuscle = ex.exercise?.mainMuscleGroup || seedInfo?.mainMuscleGroup || 'cuerpo_completo';
          const exEquip = ex.exercise?.equipment || seedInfo?.equipment || 'otro';

          try {
            const { data: createdEx, error: insErr } = await supabase
              .from('exercises')
              .insert({
                name: exName,
                slug: exSlug,
                description: ex.exercise?.description || seedInfo?.description || '',
                main_muscle_group: exMuscle,
                secondary_muscles: ex.exercise?.secondaryMuscles || seedInfo?.secondaryMuscles || [],
                equipment: exEquip,
                exercise_type: ex.exercise?.exerciseType || seedInfo?.exerciseType || 'compuesto',
                instructions: ex.exercise?.instructions || seedInfo?.instructions || [],
                technique_tips: ex.exercise?.techniqueTips || seedInfo?.techniqueTips || '',
                difficulty_level: ex.exercise?.difficultyLevel || seedInfo?.difficultyLevel || 'intermedio',
                image_url: ex.exercise?.imageUrl || seedInfo?.imageUrl || '',
                is_custom: true,
                created_by: userId,
              })
              .select('id')
              .single();

            if (createdEx?.id) {
              resolvedExerciseId = createdEx.id;
              dbExercises.push({
                id: createdEx.id,
                name: exName,
                slug: exSlug,
                description: ex.exercise?.description || seedInfo?.description || '',
                mainMuscleGroup: exMuscle,
                secondaryMuscles: ex.exercise?.secondaryMuscles || seedInfo?.secondaryMuscles || [],
                equipment: exEquip,
                exerciseType: ex.exercise?.exerciseType || seedInfo?.exerciseType || 'compuesto',
                instructions: ex.exercise?.instructions || seedInfo?.instructions || [],
                techniqueTips: ex.exercise?.techniqueTips || seedInfo?.techniqueTips || '',
                difficultyLevel: ex.exercise?.difficultyLevel || seedInfo?.difficultyLevel || 'intermedio',
                imageUrl: ex.exercise?.imageUrl || seedInfo?.imageUrl || '',
                isCustom: true,
                createdBy: userId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            } else if (insErr) {
              console.warn(`Error al auto-insertar ejercicio "${exName}" en Supabase:`, insErr);
            }
          } catch (insErr) {
            console.warn(`Excepción al insertar ejercicio "${exName}" en Supabase:`, insErr);
          }
        }

        const targetExerciseId = resolvedExerciseId || (isUuid(ex.exerciseId) ? ex.exerciseId : null);

        if (!targetExerciseId) {
          console.warn(`No se pudo generar un UUID para el ejercicio "${ex.exercise?.name || ex.exerciseId}". Se mantendrá en la caché local.`);
          continue;
        }

        ex.exerciseId = targetExerciseId;
        if (seedInfo && !ex.exercise) {
          ex.exercise = seedInfo;
        }

        const exercisePayload: any = {
          id: isExNew ? undefined : ex.id,
          workout_day_id: dayData.id,
          exercise_id: targetExerciseId,
          exercise_order: exIdx + 1,
          target_sets: ex.setsConfig?.length || ex.targetSets || 3,
          target_reps_min: ex.targetRepsMin || 8,
          target_reps_max: ex.targetRepsMax || 12,
          target_weight: ex.targetWeight || 0,
          rest_seconds: ex.restSeconds || 90,
          notes: ex.notes || '',
          sets_config: ex.setsConfig || [],
        };

        const { data: savedEx, error: exError } = await supabase
          .from('workout_day_exercises')
          .upsert(exercisePayload)
          .select()
          .single();

        if (savedEx) {
          ex.id = savedEx.id;
          savedExerciseIds.push(savedEx.id);
        } else if (exError) {
          // Fallback resiliente si la columna sets_config aún no existe en Supabase
          if (exError.message?.includes('sets_config') || (exError as any).code === '42703') {
            delete exercisePayload.sets_config;
            const { data: retryEx } = await supabase
              .from('workout_day_exercises')
              .upsert(exercisePayload)
              .select()
              .single();
            if (retryEx) {
              ex.id = retryEx.id;
              savedExerciseIds.push(retryEx.id);
            }
          } else {
            console.warn(`Error al guardar ejercicio "${ex.exercise?.name || targetExerciseId}":`, exError);
          }
        }
      }

      // Eliminar ejercicios huérfanos o que fueron quitados de este día
      if (savedExerciseIds.length > 0) {
        try {
          await supabase
            .from('workout_day_exercises')
            .delete()
            .eq('workout_day_id', dayData.id)
            .not('id', 'in', `(${savedExerciseIds.join(',')})`);
        } catch (delErr) {
          console.warn('Error al limpiar ejercicios huérfanos en Supabase:', delErr);
        }
      }
    }

    // Eliminar días huérfanos de la rutina en Supabase
    if (savedDayIds.length > 0) {
      try {
        await supabase
          .from('workout_days')
          .delete()
          .eq('routine_id', realRoutineId)
          .not('id', 'in', `(${savedDayIds.join(',')})`);
      } catch (delDaysErr) {
        console.warn('Error al limpiar días huérfanos en Supabase:', delDaysErr);
      }
    }

    // Actualizar cache local asegurando que TODOS los días y ejercicios configurados persistan
    const userKey = getUserRoutinesKey(userId);
    const stored = localStorage.getItem(userKey);
    let list: WorkoutRoutine[] = stored ? JSON.parse(stored) : [];
    const index = list.findIndex((r) => r.id === routine.id || r.id === realRoutineId);
    const routineWithRealId: WorkoutRoutine = {
      ...routine,
      id: realRoutineId,
      updatedAt: new Date().toISOString(),
    };
    if (index >= 0) {
      list[index] = routineWithRealId;
    } else {
      list.push({
        ...routineWithRealId,
        createdAt: routine.createdAt || new Date().toISOString(),
      });
    }
    localStorage.setItem(userKey, JSON.stringify(list));

    return routineWithRealId;
  },

  // Marcar una rutina como activa exclusivamente (desmarcando todas las demás)
  async setActiveRoutine(routineId: string, userId?: string): Promise<void> {
    if (!userId) return;

    // 1. Actualizar siempre la caché local de inmediato
    const userKey = getUserRoutinesKey(userId);
    const stored = localStorage.getItem(userKey);
    if (stored) {
      try {
        const list: WorkoutRoutine[] = JSON.parse(stored);
        const updated = list.map((r) => ({
          ...r,
          isActive: r.id === routineId,
        }));
        localStorage.setItem(userKey, JSON.stringify(updated));
      } catch (e) {
        console.warn('Error updating local active routine:', e);
      }
    }

    if (!isSupabaseConfigured) return;

    try {
      // 2. En Supabase: desmarcar todas y marcar únicamente la seleccionada
      await supabase
        .from('workout_routines')
        .update({ is_active: false })
        .eq('user_id', userId);

      await supabase
        .from('workout_routines')
        .update({ is_active: true })
        .eq('id', routineId)
        .eq('user_id', userId);
    } catch (err) {
      console.warn('Error updating active routine in Supabase:', err);
    }
  },

  // Eliminar una rutina del usuario actual
  async deleteRoutine(routineId: string, userId?: string): Promise<void> {
    if (!userId) return;

    // 1. Limpiar siempre de la caché local de inmediato
    const userKey = getUserRoutinesKey(userId);
    const stored = localStorage.getItem(userKey);
    if (stored) {
      try {
        const list: WorkoutRoutine[] = JSON.parse(stored);
        const filtered = list.filter((r) => r.id !== routineId);
        localStorage.setItem(userKey, JSON.stringify(filtered));
      } catch (e) {
        console.warn('Error sincronizando localStorage tras borrado:', e);
      }
    }

    if (!isSupabaseConfigured) return;

    // Si es un ID temporal de preset, no existe en la base de datos remota
    if (routineId.startsWith('rot-')) return;

    // 2. Eliminar de Supabase (las tablas hijas se borran en cascada por FK ON DELETE CASCADE)
    const { error } = await supabase
      .from('workout_routines')
      .delete()
      .eq('id', routineId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting routine from Supabase:', error);
      throw error;
    }
  },

  // Obtener presets predeterminados (para importar si el usuario lo desea)
  getDefaultPresets(userId?: string): WorkoutRoutine[] {
    const seedMap = new Map(SEED_EXERCISES.map((e) => [e.id, e]));

    return DEFAULT_PRESET_ROUTINES.map((r, rIdx) => ({
      ...r,
      id: 'rot-' + Math.random().toString(36).substring(2, 9),
      userId: userId || 'anonymous',
      isActive: rIdx === 0,
      days: r.days.map((d) => ({
        ...d,
        id: 'day-' + Math.random().toString(36).substring(2, 9),
        exercises: d.exercises.map((e) => {
          const fullEx = seedMap.get(e.exerciseId);
          return {
            ...e,
            id: 'd-ex-' + Math.random().toString(36).substring(2, 9),
            exercise: fullEx,
            setsConfig: Array.from({ length: e.targetSets || 3 }, (_, idx) => ({
              setNumber: idx + 1,
              targetReps: e.targetRepsMin || 10,
              targetRepsMin: e.targetRepsMin || 8,
              targetRepsMax: e.targetRepsMax || 12,
              targetWeight: e.targetWeight || 0,
            })),
          };
        }),
      })),
    }));
  },

  // Importar y guardar preset predeterminado en la cuenta del usuario según índice
  async importPresetByIndex(index: number, userId?: string): Promise<WorkoutRoutine> {
    const presets = this.getDefaultPresets(userId);
    const selected = presets[index] || presets[0];

    // Marcar la rutina como activa al importarla
    selected.isActive = true;

    const saved = await this.saveRoutine(selected, userId);

    if (userId) {
      await this.setActiveRoutine(saved.id, userId);
    }

    return saved;
  },

  // Importar y guardar preset predeterminado en la cuenta del usuario
  async importDefaultPreset(userId?: string): Promise<WorkoutRoutine> {
    return await this.importPresetByIndex(0, userId);
  }
};