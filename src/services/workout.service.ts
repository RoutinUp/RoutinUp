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

  // Obtener todos los récords personales del usuario actual
  async getPersonalRecords(userId?: string): Promise<PersonalRecord[]> {
    if (!userId) return [];

    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(getUserPRsKey(userId));
      return stored ? JSON.parse(stored) : [];
    }

    try {
      const { data, error } = await supabase
        .from('personal_records')
        .select(`
          id, user_id, exercise_id, record_type, value, reps, achieved_at,
          exercises (name)
        `)
        .eq('user_id', userId)
        .order('achieved_at', { ascending: false });

      if (error || !data) {
        const stored = localStorage.getItem(getUserPRsKey(userId));
        return stored ? JSON.parse(stored) : [];
      }

      const records: PersonalRecord[] = data.map((pr: any) => ({
        id: pr.id,
        userId: pr.user_id,
        exerciseId: pr.exercise_id,
        exerciseName: pr.exercises?.name || 'Ejercicio',
        recordType: pr.record_type,
        value: Number(pr.value),
        reps: pr.reps,
        achievedAt: pr.achieved_at,
      }));

      localStorage.setItem(getUserPRsKey(userId), JSON.stringify(records));
      return records;
    } catch {
      const stored = localStorage.getItem(getUserPRsKey(userId));
      return stored ? JSON.parse(stored) : [];
    }
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
          totalVolume += (set.weight || 0) * (set.reps || 0);

          // Verificar Récord de Peso Máximo (PR) en este ejercicio
          const existingMaxWeight = currentPRs.find(
            (pr) => pr.exerciseId === ex.exerciseId && pr.recordType === 'max_weight'
          );

          if (set.weight > 0 && (!existingMaxWeight || set.weight > existingMaxWeight.value)) {
            set.isPR = true;
            newPRs.push({
              exerciseId: ex.exerciseId,
              exerciseName: ex.exerciseName,
              type: 'Mayor Peso',
              value: set.weight,
              reps: set.reps,
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

  // Obtener puntos de evolución histórica para gráficos de un ejercicio
  async getExerciseProgressData(exerciseId: string, userId?: string): Promise<ExerciseProgressPoint[]> {
    const sessions = await this.getWorkoutSessions(userId);
    const points: ExerciseProgressPoint[] = [];

    // Recorrer de más antiguo a más nuevo
    const chronological = [...sessions].reverse();

    chronological.forEach((s) => {
      const match = s.exercises.find((e) => e.exerciseId === exerciseId && e.status === 'completed');
      if (match && match.sets.length > 0) {
        const completedSets = match.sets.filter((st) => st.reps > 0);
        if (completedSets.length > 0) {
          const maxWeightSet = completedSets.reduce((prev, curr) =>
            curr.weight > prev.weight ? curr : prev
          );

          let vol = 0;
          completedSets.forEach((st) => {
            vol += st.weight * st.reps;
          });

          // Fórmula de Brzycki para estimar 1RM
          const est1RM = maxWeightSet.reps === 1
            ? maxWeightSet.weight
            : Math.round(maxWeightSet.weight * (1 + maxWeightSet.reps / 30) * 10) / 10;

          points.push({
            date: s.startedAt,
            formattedDate: new Date(s.startedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
            maxWeight: maxWeightSet.weight,
            repsAtMaxWeight: maxWeightSet.reps,
            totalVolume: vol,
            totalSets: completedSets.length,
            estimatedOneRepMax: est1RM,
          });
        }
      }
    });

    return points;
  }
};