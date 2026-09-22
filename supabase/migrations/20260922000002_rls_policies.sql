-- ====================================================================
-- GYMTRACK - POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- ====================================================================

-- 1. PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver su propio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. EXERCISES
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquier usuario autenticado puede ver ejercicios del sistema o sus propios ejercicios"
  ON public.exercises FOR SELECT
  USING (is_custom = false OR created_by = auth.uid());

CREATE POLICY "Los usuarios pueden crear sus propios ejercicios personalizados"
  ON public.exercises FOR INSERT
  WITH CHECK (auth.uid() = created_by AND is_custom = true);

CREATE POLICY "Los usuarios pueden editar sus propios ejercicios personalizados"
  ON public.exercises FOR UPDATE
  USING (auth.uid() = created_by AND is_custom = true);

CREATE POLICY "Los usuarios pueden eliminar sus propios ejercicios personalizados"
  ON public.exercises FOR DELETE
  USING (auth.uid() = created_by AND is_custom = true);

-- 3. WORKOUT_ROUTINES
ALTER TABLE public.workout_routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden gestionar sus propias rutinas"
  ON public.workout_routines FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. WORKOUT_DAYS
ALTER TABLE public.workout_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden gestionar días de sus rutinas"
  ON public.workout_days FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_routines r
      WHERE r.id = workout_days.routine_id AND r.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workout_routines r
      WHERE r.id = workout_days.routine_id AND r.user_id = auth.uid()
    )
  );

-- 5. WORKOUT_DAY_EXERCISES
ALTER TABLE public.workout_day_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden gestionar ejercicios en los días de sus rutinas"
  ON public.workout_day_exercises FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_days d
      JOIN public.workout_routines r ON r.id = d.routine_id
      WHERE d.id = workout_day_exercises.workout_day_id AND r.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workout_days d
      JOIN public.workout_routines r ON r.id = d.routine_id
      WHERE d.id = workout_day_exercises.workout_day_id AND r.user_id = auth.uid()
    )
  );

-- 6. WORKOUT_SESSIONS
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden gestionar sus propias sesiones de entrenamiento"
  ON public.workout_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. SESSION_EXERCISES
ALTER TABLE public.session_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden gestionar ejercicios de sus sesiones"
  ON public.session_exercises FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions s
      WHERE s.id = session_exercises.session_id AND s.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workout_sessions s
      WHERE s.id = session_exercises.session_id AND s.user_id = auth.uid()
    )
  );

-- 8. SESSION_SETS
ALTER TABLE public.session_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden gestionar series de sus sesiones"
  ON public.session_sets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.session_exercises se
      JOIN public.workout_sessions s ON s.id = se.session_id
      WHERE se.id = session_sets.session_exercise_id AND s.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.session_exercises se
      JOIN public.workout_sessions s ON s.id = se.session_id
      WHERE se.id = session_sets.session_exercise_id AND s.user_id = auth.uid()
    )
  );

-- 9. PERSONAL_RECORDS
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver y gestionar sus propios récords personales"
  ON public.personal_records FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);