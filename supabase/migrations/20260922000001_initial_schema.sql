-- ====================================================================
-- GYMTRACK - SCHEMA INICIAL DE BASE DE DATOS POSTGRESQL (SUPABASE)
-- ====================================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  height_cm NUMERIC(5,2),
  body_weight_kg NUMERIC(5,2),
  is_profile_completed BOOLEAN DEFAULT false,
  preferred_weight_unit TEXT DEFAULT 'kg' CHECK (preferred_weight_unit IN ('kg', 'lb')),
  sound_enabled BOOLEAN DEFAULT true,
  haptic_feedback_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger para auto-crear perfil al registrarse un usuario en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, is_profile_completed)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'avatar_url',
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. TABLA: EXERCISES (Biblioteca global y personalizados)
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT DEFAULT '',
  main_muscle_group TEXT NOT NULL,
  secondary_muscles TEXT[] DEFAULT '{}',
  equipment TEXT NOT NULL DEFAULT 'barra',
  exercise_type TEXT NOT NULL DEFAULT 'compuesto',
  instructions TEXT[] DEFAULT '{}',
  technique_tips TEXT DEFAULT '',
  difficulty_level TEXT NOT NULL DEFAULT 'intermedio',
  image_url TEXT,
  is_custom BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_exercises_muscle ON public.exercises(main_muscle_group);
CREATE INDEX IF NOT EXISTS idx_exercises_custom ON public.exercises(is_custom, created_by);

-- 3. TABLA: WORKOUT_ROUTINES
CREATE TABLE IF NOT EXISTS public.workout_routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_routines_user ON public.workout_routines(user_id);

-- 4. TABLA: WORKOUT_DAYS
CREATE TABLE IF NOT EXISTS public.workout_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_id UUID NOT NULL REFERENCES public.workout_routines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  day_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_workout_days_routine ON public.workout_days(routine_id);

-- 5. TABLA: WORKOUT_DAY_EXERCISES (Configuración de cada ejercicio en el día)
CREATE TABLE IF NOT EXISTS public.workout_day_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_day_id UUID NOT NULL REFERENCES public.workout_days(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  exercise_order INT NOT NULL DEFAULT 1,
  target_sets INT NOT NULL DEFAULT 3,
  target_reps_min INT NOT NULL DEFAULT 8,
  target_reps_max INT NOT NULL DEFAULT 12,
  target_weight NUMERIC(6,2) DEFAULT 0,
  rest_seconds INT NOT NULL DEFAULT 90,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_day_exercises_day ON public.workout_day_exercises(workout_day_id);

-- 6. TABLA: WORKOUT_SESSIONS (Sesiones ejecutadas)
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_day_id UUID REFERENCES public.workout_days(id) ON DELETE SET NULL,
  routine_name TEXT NOT NULL,
  day_name TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_seconds INT NOT NULL DEFAULT 0,
  total_volume NUMERIC(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON public.workout_sessions(user_id, started_at DESC);

-- 7. TABLA: SESSION_EXERCISES
CREATE TABLE IF NOT EXISTS public.session_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  exercise_order INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'skipped')),
  skipped_reason TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_session_exercises_session ON public.session_exercises(session_id);

-- 8. TABLA: SESSION_SETS (Series individuales registradas con peso de levantamiento)
CREATE TABLE IF NOT EXISTS public.session_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_exercise_id UUID NOT NULL REFERENCES public.session_exercises(id) ON DELETE CASCADE,
  set_number INT NOT NULL,
  weight NUMERIC(6,2) NOT NULL DEFAULT 0,
  reps INT NOT NULL DEFAULT 0,
  target_reps_min INT,
  target_reps_max INT,
  target_weight NUMERIC(6,2),
  completed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_pr BOOLEAN DEFAULT false,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_session_sets_exercise ON public.session_sets(session_exercise_id);

-- 9. TABLA: PERSONAL_RECORDS (Récords Personales)
CREATE TABLE IF NOT EXISTS public.personal_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL CHECK (record_type IN ('max_weight', 'max_reps', 'max_volume_set', 'max_session_volume')),
  value NUMERIC(10,2) NOT NULL,
  reps INT,
  session_set_id UUID REFERENCES public.session_sets(id) ON DELETE SET NULL,
  achieved_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pr_user_exercise ON public.personal_records(user_id, exercise_id);