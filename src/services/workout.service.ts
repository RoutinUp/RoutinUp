import { supabase, isSupabaseConfigured } from '../config/supabase';
import { WorkoutSession, LoggedExercise, LoggedSet } from '../types/workout';
import { PersonalRecord, ExerciseProgressPoint } from '../types/progress';

// Claves aisladas por usuario para evitar cualquier fuga de datos entre cuentas
const getUserSessionsKey = (userId?: string) => `gymtrack_workout_sessions_${userId || 'anonymous'}`;
const getUserPRsKey = (userId?: string) => `gymtrack_personal_records_${userId || 'anonymous'}`;

export const workoutService = {
  // Obtener todas las sesiones de entrenamiento del usuario autenticado
  async getWorkoutSessions(userId?: string): Promise<WorkoutSession[]> {
    if (!userId) return [];

    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(getUserSessionsKey(userId));
      return stored ? JSON.parse(stored) : [];
    }

    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select(`
          id, routine_name, day_name, started_at, completed_at,
          duration_seconds, total_volume, status, notes,
          session_exercises (
            id, exercise_id, exercise_order, status, skipped_reason,
            exercises (name),
            session_sets (
              id, set_number, weight, reps, target_reps_min, target_reps_max,
              target_weight, completed_at, is_pr, notes
            )
          )
        `)
        .eq('user_id', userId)
        .order('started_at', { ascending: false });

      if (error || !data) {
        console.warn('Error fetching sessions from Supabase:', error);
        const stored = localStorage.getItem(getUserSessionsKey(userId));
        return stored ? JSON.parse(stored) : [];
      }

      const sessions: WorkoutSession[] = data.map((s: any) => ({
        id: s.id,
        userId,
        routineName: s.routine_name,
        dayName: s.day_name,
        startedAt: s.started_at,
        completedAt: s.completed_at,
        durationSeconds: s.duration_seconds,
        totalVolume: Number(s.total_volume) || 0,
        totalSetsCompleted: (s.session_exercises || []).reduce(
          (acc: number, ex: any) => acc + (ex.session_sets || []).length,
          0
        ),
        status: s.status,
        notes: s.notes || '',
        exercises: (s.session_exercises || [])
          .sort((a: any, b: any) => a.exercise_order - b.exercise_order)
          .map((se: any) => ({
            exerciseId: se.exercise_id,
            exerciseName: se.exercises?.name || 'Ejercicio',
            exerciseOrder: se.exercise_order,
            status: se.status,
            skippedReason: se.skipped_reason,
            sets: (se.session_sets || [])
              .sort((a: any, b: any) => a.set_number - b.set_number)
              .map((st: any) => ({
                id: st.id,
                setNumber: st.set_number,
                weight: Number(st.weight) || 0,
                reps: st.reps,
                targetRepsMin: st.target_reps_min,
                targetRepsMax: st.target_reps_max,
                targetWeight: Number(st.target_weight) || 0,
                completedAt: st.completed_at,
                isPR: st.is_pr,
              })),
          })),
      }));

      // Cachear localmente bajo el ID de este usuario específico
      localStorage.setItem(getUserSessionsKey(userId), JSON.stringify(sessions));
      return sessions;
    } catch (e) {
      console.warn('Error querying Supabase workout sessions:', e);
      const stored = localStorage.getItem(getUserSessionsKey(userId));
      return stored ? JSON.parse(stored) : [];
    }
  },

  // Obtener una sesión específica por ID
  async getSessionById(sessionId: string, userId?: string): Promise<WorkoutSession | null> {
    const sessions = await this.getWorkoutSessions(userId);
    return sessions.find((s) => s.id === sessionId) || null;
  },

  // Obtener último desempeño de un ejercicio para el usuario actual
  async getLastExercisePerformance(exerciseId: string, userId?: string): Promise<LoggedExercise | null> {
    const sessions = await this.getWorkoutSessions(userId);
    for (const session of sessions) {
      const match = session.exercises.find(
        (ex) => ex.exerciseId === exerciseId && ex.status === 'completed' && ex.sets.length > 0
      );
      if (match) return match;
    }
    return null;
  },

  // Obtener todos los récords personales del usuario actual agrupados de forma única por ejercicio
  async getPersonalRecords(userId?: string): Promise<PersonalRecord[]> {
    if (!userId) return [];

    // 1. Obtenemos las sesiones completadas, fuente primaria de verdad de todas las series realizadas
    const sessions = await this.getWorkoutSessions(userId);

    // Mapa para asegurar exactamente 1 entrada por ejercicio único
    const bestPRsMap = new Map<string, PersonalRecord>();

    // Extraer mejor marca histórica de todas las sesiones registradas
    sessions.forEach((s) => {
      s.exercises.forEach((ex) => {
        if (ex.status === 'completed' || (ex.sets && ex.sets.length > 0)) {
          ex.sets.forEach((set) => {
            const weight = Number(set.weight) || 0;
            const reps = Number(set.reps) || 0;
            if (weight > 0 && reps > 0) {
              const exerciseKey = (ex.exerciseName || ex.exerciseId).toLowerCase().trim();
              const existing = bestPRsMap.get(exerciseKey);

              const isBetter = !existing ||
                weight > existing.value ||
                (weight === existing.value && reps > (existing.reps || 0));

              if (isBetter) {
                bestPRsMap.set(exerciseKey, {
                  id: `pr-${ex.exerciseId}-${s.id}-${set.setNumber}`,
                  userId,
                  exerciseId: ex.exerciseId,
                  exerciseName: ex.exerciseName || 'Ejercicio',
                  recordType: 'max_weight',
                  value: weight,
                  reps: reps,
                  achievedAt: set.completedAt || s.completedAt || s.startedAt,
                });
              }
            }
          });
        }
      });
    });

    // 2. Complementar con la tabla personal_records de Supabase si estuviera configurada
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('personal_records')
          .select(`
            id, user_id, exercise_id, record_type, value, reps, achieved_at,
            exercises (name)
          `)
          .eq('user_id', userId);

        if (data && !error) {
          data.forEach((pr: any) => {
            const exerciseName = pr.exercises?.name || 'Ejercicio';
            const exerciseKey = exerciseName.toLowerCase().trim();
            const val = Number(pr.value) || 0;
            const reps = Number(pr.reps) || 0;

            if (val > 0) {
              const existing = bestPRsMap.get(exerciseKey);
              const isBetter = !existing ||
                val > existing.value ||
                (val === existing.value && reps > (existing.reps || 0));

              if (isBetter) {
                bestPRsMap.set(exerciseKey, {
                  id: pr.id,
                  userId: pr.user_id,
                  exerciseId: pr.exercise_id,
                  exerciseName,
                  recordType: pr.record_type,
                  value: val,
                  reps: reps,
                  achievedAt: pr.achieved_at,
                });
              }
            }
          });
        }
      } catch (err) {
        console.warn('Error al consultar personal_records en Supabase:', err);
      }
    }

    // Convertir a lista y ordenar por mayor peso descendente (o desempate por reps)
    const uniquePRs = Array.from(bestPRsMap.values()).sort((a, b) => {
      if (b.value !== a.value) return b.value - a.value;
      return (b.reps || 0) - (a.reps || 0);
    });

    localStorage.setItem(getUserPRsKey(userId), JSON.stringify(uniquePRs));
    return uniquePRs;
  },

  // Guardar un entrenamiento completado y calcular PRs para el usuario actual
  async saveWorkoutSession(session: WorkoutSession, userId?: string): Promise<{ session: WorkoutSession; newPRs: any[] }> {
    if (!userId) throw new Error('No hay usuario autenticado para guardar la sesión');

    const newPRs: any[] = [];
    const currentPRs = await this.getPersonalRecords(userId);

    // Calcular volumen total en kg (peso de series en session_sets)
    let totalVolume = 0;
    session.exercises.forEach((ex) => {
      if (ex.status === 'completed') {
        ex.sets.forEach((set) => {
          const setWeight = Number(set.weight) || 0;
          const setReps = Number(set.reps) || 0;
          totalVolume += setWeight * setReps;

          // Verificar si supera el récord histórico único de este ejercicio
          const existingPR = currentPRs.find(
            (pr) =>
              (pr.exerciseName && ex.exerciseName && pr.exerciseName.toLowerCase().trim() === ex.exerciseName.toLowerCase().trim()) ||
              pr.exerciseId === ex.exerciseId
          );

          const isNewPR = setWeight > 0 && (!existingPR ||
            setWeight > existingPR.value ||
            (setWeight === existingPR.value && setReps > (existingPR.reps || 0)));

          if (isNewPR) {
            set.isPR = true;
            newPRs.push({
              exerciseId: ex.exerciseId,
              exerciseName: ex.exerciseName,
              type: 'Mayor Peso',
              value: setWeight,
              reps: setReps,
            });
          }
        });
      }
    });

    session.userId = userId;
    session.totalVolume = totalVolume;
    session.completedAt = new Date().toISOString();
    session.newPRs = newPRs;

    // Guardar en Supabase PostgreSQL
    if (isSupabaseConfigured) {
      try {
        const { data: sessionData, error: sErr } = await supabase
          .from('workout_sessions')
          .insert({
            user_id: userId,
            workout_day_id: session.workoutDayId?.startsWith('day-') ? null : session.workoutDayId,
            routine_name: session.routineName,
            day_name: session.dayName,
            started_at: session.startedAt,
            completed_at: session.completedAt,
            duration_seconds: session.durationSeconds,
            total_volume: totalVolume,
            status: 'completed',
            notes: session.notes || '',
          })
          .select()
          .single();

        if (sessionData && !sErr) {
          session.id = sessionData.id;

          for (const ex of session.exercises) {
            const { data: exData } = await supabase
              .from('session_exercises')
              .insert({
                session_id: sessionData.id,
                exercise_id: ex.exerciseId.startsWith('ex-') ? null : ex.exerciseId,
                exercise_order: ex.exerciseOrder,
                status: ex.status,
                skipped_reason: ex.skippedReason || '',
              })
              .select()
              .single();

            if (exData && ex.status === 'completed') {
              for (const st of ex.sets) {
                await supabase.from('session_sets').insert({
                  session_exercise_id: exData.id,
                  set_number: st.setNumber,
                  weight: st.weight, // Peso de la serie (session_sets)
                  reps: st.reps,
                  target_reps_min: st.targetRepsMin,
                  target_reps_max: st.targetRepsMax,
                  target_weight: st.targetWeight,
                  is_pr: Boolean(st.isPR),
                  completed_at: st.completedAt,
                });
              }
            }
          }

          // Guardar PRs en Supabase
          for (const pr of newPRs) {
            if (!pr.exerciseId.startsWith('ex-')) {
              await supabase.from('personal_records').insert({
                user_id: userId,
                exercise_id: pr.exerciseId,
                record_type: 'max_weight',
                value: pr.value,
                reps: pr.reps,
                achieved_at: session.completedAt,
              });
            }
          }
        }
      } catch (err) {
        console.warn('Error saving session to Supabase:', err);
      }
    }

    // Actualizar caché local aislado de este usuario
    const userSessionsKey = getUserSessionsKey(userId);
    const stored = localStorage.getItem(userSessionsKey);
    const list: WorkoutSession[] = stored ? JSON.parse(stored) : [];
    list.unshift(session);
    localStorage.setItem(userSessionsKey, JSON.stringify(list));

    return { session, newPRs };
  },

  // Eliminar una sesión de entrenamiento
  async deleteWorkoutSession(sessionId: string, userId?: string): Promise<void> {
    if (!sessionId) return;

    if (isSupabaseConfigured && userId) {
      try {
        // En Supabase, por si no cuenta con ON DELETE CASCADE, eliminamos dependientes primero
        const { data: exercises } = await supabase
          .from('session_exercises')
          .select('id')
          .eq('session_id', sessionId);

        if (exercises && exercises.length > 0) {
          const exIds = exercises.map((e: any) => e.id);
          await supabase.from('session_sets').delete().in('session_exercise_id', exIds);
          await supabase.from('session_exercises').delete().eq('session_id', sessionId);
        }

        const { error } = await supabase
          .from('workout_sessions')
          .delete()
          .eq('id', sessionId)
          .eq('user_id', userId);

        if (error) {
          console.warn('Error deleting workout session from Supabase:', error);
        }
      } catch (err) {
        console.warn('Exception deleting workout session in Supabase:', err);
      }
    }

    // Actualizar almacenamiento local
    const userSessionsKey = getUserSessionsKey(userId);
    const stored = localStorage.getItem(userSessionsKey);
    if (stored) {
      try {
        const list: WorkoutSession[] = JSON.parse(stored);
        const filtered = list.filter((s) => s.id !== sessionId);
        localStorage.setItem(userSessionsKey, JSON.stringify(filtered));
      } catch (e) {
        console.error('Error updating local sessions on delete:', e);
      }
    }
  },

  // Obtener puntos de evolución histórica para gráficos de un ejercicio
  async getExerciseProgressData(exerciseId: string, userId?: string, exerciseName?: string): Promise<ExerciseProgressPoint[]> {
    const sessions = await this.getWorkoutSessions(userId);
    const points: ExerciseProgressPoint[] = [];

    // Recorrer de más antiguo a más nuevo
    const chronological = [...sessions].reverse();

    chronological.forEach((s) => {
      const match = s.exercises.find((e) => {
        const idMatches = Boolean(exerciseId && e.exerciseId === exerciseId);
        const nameMatches = Boolean(
          exerciseName &&
          e.exerciseName &&
          e.exerciseName.toLowerCase().trim() === exerciseName.toLowerCase().trim()
        );
        return (idMatches || nameMatches) && (e.status === 'completed' || (e.sets && e.sets.length > 0));
      });
      if (match && match.sets.length > 0) {
        const completedSets = match.sets.filter((st) => (Number(st.reps) || 0) > 0);
        if (completedSets.length > 0) {
          // Seleccionar la serie con mayor peso; si empatan en peso, elegir la de MAYOR número de repeticiones
          const maxWeightSet = completedSets.reduce((prev, curr) => {
            const prevW = Number(prev.weight) || 0;
            const currW = Number(curr.weight) || 0;
            const prevR = Number(prev.reps) || 0;
            const currR = Number(curr.reps) || 0;
            if (currW > prevW) return curr;
            if (currW === prevW && currR > prevR) return curr;
            return prev;
          });

          let best1RM = 0;
          let vol = 0;
          completedSets.forEach((st) => {
            const w = Number(st.weight) || 0;
            const r = Number(st.reps) || 0;
            vol += w * r;

            // Fórmula de Brzycki para estimar 1RM por serie
            const est1RM = r === 1
              ? w
              : Math.round(w * (1 + r / 30) * 10) / 10;
            if (est1RM > best1RM) {
              best1RM = est1RM;
            }
          });

          points.push({
            date: s.startedAt,
            formattedDate: new Date(s.startedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
            maxWeight: Number(maxWeightSet.weight) || 0,
            repsAtMaxWeight: Number(maxWeightSet.reps) || 0,
            totalVolume: vol,
            totalSets: completedSets.length,
            estimatedOneRepMax: best1RM,
          });
        }
      }
    });

    return points;
  }
};