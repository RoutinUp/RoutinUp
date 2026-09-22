/*
  =============================================================================
  GYMTRACK - SCRIPT SQL COMPLETO PARA SUPABASE
  Instrucciones:
  1. Ve a tu proyecto Supabase -> SQL Editor -> New Query.
  2. Pega todo el contenido de este archivo y presiona RUN.
  3. ¡Listo! Todas las tablas, triggers, RLS y catálogo de ejercicios quedarán creados.
  =============================================================================
*/

﻿-- ====================================================================
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

﻿-- ====================================================================
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

-- Inserción masiva de ejercicios globales
INSERT INTO public.exercises (
  name, slug, description, main_muscle_group, secondary_muscles,
  equipment, exercise_type, instructions, technique_tips, difficulty_level, is_custom
)
VALUES
(
    'Press banca con barra',
    'press-banca-barra',
    'Básico y compuesto por excelencia para fuerza y masa en pectorales.',
    'pecho',
    ARRAY['triceps','hombros']::TEXT[],
    'barra',
    'compuesto',
    ARRAY['Acuéstate sobre el banco plano con los ojos bajo la barra.','Agarra la barra a un ancho ligeramente mayor a hombros.','Retrae escápulas y apoya pies firmes.','Baja controladamente a la parte media del pecho.','Empuja extendiendo brazos sin bloquear codos bruscamente.']::TEXT[],
    'Mantén escápulas retraídas y glúteos pegados al banco.',
    'intermedio',
    false
  ),
(
    'Press inclinado con barra',
    'press-inclinado-barra',
    'Énfasis en el haz clavicular (pecho superior).',
    'pecho',
    ARRAY['hombros','triceps']::TEXT[],
    'barra',
    'compuesto',
    ARRAY['Ajusta el banco a 30-45 grados.','Baja la barra de forma controlada hacia la clavícula.','Empuja con fuerza hasta posición inicial.']::TEXT[],
    'Evita inclinar a más de 45° para no fatigar el hombro anterior.',
    'intermedio',
    false
  ),
(
    'Press con mancuernas',
    'press-mancuernas',
    'Mayor rango de movimiento y corrección de asimetrías.',
    'pecho',
    ARRAY['triceps','hombros']::TEXT[],
    'mancuernas',
    'compuesto',
    ARRAY['Túmbate en el banco con mancuernas al costado del pecho.','Baja sintiendo el estiramiento pectoral.','Empuja acercando mancuernas sin chocarlas.']::TEXT[],
    'Controla la fase excéntrica en 2-3 segundos.',
    'intermedio',
    false
  ),
(
    'Press inclinado con mancuernas',
    'press-inclinado-mancuernas',
    'Enfoque clavicular con libertad articular para muñecas y codos.',
    'pecho',
    ARRAY['hombros','triceps']::TEXT[],
    'mancuernas',
    'compuesto',
    ARRAY['Banco a 30 grados, desciende controlando los codos a 45 grados.','Empuja contrayendo la porción alta del pecho.']::TEXT[],
    'Ángulo de 30° es óptimo.',
    'intermedio',
    false
  ),
(
    'Aperturas con mancuernas',
    'aperturas-mancuernas',
    'Aislamiento para estirar las fibras pectorales bajo tensión.',
    'pecho',
    ARRAY['hombros']::TEXT[],
    'mancuernas',
    'aislamiento',
    ARRAY['Abre los brazos en un arco amplio con codos ligeramente flexionados.','Cierra contrayendo fuertemente los pectorales.']::TEXT[],
    'No bajes de la línea de los hombros si sientes molestia articular.',
    'principiante',
    false
  ),
(
    'Pec deck / Contractor',
    'pec-deck',
    'Máquina guiada con tensión constante en todo el recorrido.',
    'pecho',
    ARRAY['hombros']::TEXT[],
    'maquina',
    'aislamiento',
    ARRAY['Junta los brazos al centro manteniendo 1s de contracción pico.','Regresa lento controlando las placas.']::TEXT[],
    'Empuja con codos y pecho, no tirando de las manos.',
    'principiante',
    false
  ),
(
    'Fondos para pecho (Dips)',
    'fondos-pecho',
    'Peso corporal con inclinación frontal para pectoral inferior.',
    'pecho',
    ARRAY['triceps','hombros']::TEXT[],
    'peso_corporal',
    'compuesto',
    ARRAY['Inclina el torso 30° hacia adelante en paralelas.','Baja a 90° de flexión y empuja fuerte.']::TEXT[],
    'Inclina el cuerpo al frente para enfocar pecho.',
    'avanzado',
    false
  ),
(
    'Cruce de poleas',
    'cruce-poleas',
    'Aislamiento continuo con cables para bombeo y congestión.',
    'pecho',
    ARRAY['hombros']::TEXT[],
    'polea',
    'aislamiento',
    ARRAY['Desde polea media o alta, cruza las manos al frente y abajo.','Siente la compresión pectoral en cada repetición.']::TEXT[],
    'Mantén codos fijos y aprieta 1 segundo al cruzar.',
    'intermedio',
    false
  ),
(
    'Dominadas',
    'dominadas',
    'Tracción vertical fundamental para amplitud de dorsal ancho.',
    'espalda',
    ARRAY['biceps','core']::TEXT[],
    'peso_corporal',
    'compuesto',
    ARRAY['Cuélgate con agarre prono a ancho superior a hombros.','Tracciona con los dorsales llevando el pecho hacia la barra.','Supera con la barbilla y baja con control total.']::TEXT[],
    'Evita balanceo y concéntrate en tirar con la espalda.',
    'intermedio',
    false
  ),
(
    'Jalón al pecho en polea',
    'jalon-pecho',
    'Tracción vertical guiada para dorsales con peso regulable.',
    'espalda',
    ARRAY['biceps']::TEXT[],
    'polea',
    'compuesto',
    ARRAY['Fija las piernas, toma la barra ancha y baja hacia el esternón superior.','Extiende los dorsales arriba al regresar.']::TEXT[],
    'Lleva los codos hacia las costillas.',
    'principiante',
    false
  ),
(
    'Remo con barra',
    'remo-barra',
    'Tracción horizontal pesada para grosor y densidad de espalda.',
    'espalda',
    ARRAY['biceps','core']::TEXT[],
    'barra',
    'compuesto',
    ARRAY['Inclina torso a 45° con columna neutra.','Tracciona la barra hacia el ombligo contrayendo escápulas.','Baja con control sin perder la postura.']::TEXT[],
    'Activa el core para no cargar la zona lumbar.',
    'intermedio',
    false
  ),
(
    'Remo con mancuerna a una mano',
    'remo-mancuerna',
    'Trabajo unilateral con gran recorrido y estabilidad lumbar.',
    'espalda',
    ARRAY['biceps']::TEXT[],
    'mancuernas',
    'compuesto',
    ARRAY['Apoya rodilla y mano en banco plano.','Tira la mancuerna en diagonal hacia la cadera con el codo.','Estira el dorsal al bajar.']::TEXT[],
    'No rotes el torso excesivamente.',
    'principiante',
    false
  ),
(
    'Remo sentado en polea (Gironda)',
    'remo-gironda',
    'Remo en polea baja para zona media de trapecios y romboides.',
    'espalda',
    ARRAY['biceps']::TEXT[],
    'polea',
    'compuesto',
    ARRAY['Espalda recta, tracciona el maneral V hacia el abdomen.','Aprieta escápulas y regresa despacio.']::TEXT[],
    'No balancees el cuerpo bruscamente.',
    'principiante',
    false
  ),
(
    'Pullover en polea alta',
    'pullover-polea-alta',
    'Aislamiento de dorsales sin fatiga de bíceps.',
    'espalda',
    ARRAY['core','triceps']::TEXT[],
    'polea',
    'aislamiento',
    ARRAY['Brazos casi rectos, lleva la barra hacia los muslos en un arco.','Aprieta dorsales y regresa a la altura de ojos.']::TEXT[],
    'Tira con los codos manteniendo codos semi-rígidos.',
    'intermedio',
    false
  ),
(
    'Peso muerto convencional',
    'peso-muerto-convencional',
    'Fuerza total y masa para erectores espinales, glúteos y trapecios.',
    'espalda',
    ARRAY['piernas','core']::TEXT[],
    'barra',
    'compuesto',
    ARRAY['Pies al ancho de cadera, agarra la barra por fuera de piernas.','Espalda recta, empuja el piso extendiendo cadera y rodillas.','Ponte erguido y baja pegado a los muslos.']::TEXT[],
    'Nunca curves la espalda baja bajo carga.',
    'avanzado',
    false
  ),
(
    'Press militar con barra',
    'press-militar-barra',
    'Empuje vertical estricto para hombros y fuerza general de tren superior.',
    'hombros',
    ARRAY['triceps','core']::TEXT[],
    'barra',
    'compuesto',
    ARRAY['Barra en clavículas, glúteos y abdomen apretados.','Empuja la barra verticalmente por encima de la cabeza.','Bloquea brazos arriba y baja con control.']::TEXT[],
    'No arquees la zona lumbar al subir.',
    'intermedio',
    false
  ),
(
    'Press sentado con mancuernas',
    'press-hombros-mancuernas',
    'Aislamiento de deltoides con respaldo y rango independiente.',
    'hombros',
    ARRAY['triceps']::TEXT[],
    'mancuernas',
    'compuesto',
    ARRAY['Mancuernas a la altura de las orejas en banco a 85 grados.','Presiona hacia arriba en arco convergente.','Desciende controladamente sin chocar las mancuernas.']::TEXT[],
    'Mantén tensión continua sin relajar abajo.',
    'principiante',
    false
  ),
(
    'Elevaciones laterales',
    'elevaciones-laterales',
    'El ejercicio clave para dar amplitud en V con deltoides laterales.',
    'hombros',
    ARRAY['trapecio']::TEXT[],
    'mancuernas',
    'aislamiento',
    ARRAY['Eleva mancuernas hacia los lados guiando con codos hasta altura de hombros.','Baja resistiendo el peso en 2 segundos.']::TEXT[],
    'Piensa en empujar las paredes hacia los lados con los codos.',
    'principiante',
    false
  ),
(
    'Pájaros / Deltoides posterior',
    'pajaros-posteriores',
    'Aislamiento de deltoides posterior para equilibrio y salud de hombro.',
    'hombros',
    ARRAY['espalda']::TEXT[],
    'mancuernas',
    'aislamiento',
    ARRAY['Inclina torso hacia adelante con espalda recta casi horizontal.','Eleva las mancuernas a los lados contrayendo la parte posterior de hombros.']::TEXT[],
    'Usa pesos moderados sin impulsos del torso.',
    'intermedio',
    false
  ),
(
    'Face pull en polea',
    'face-pull',
    'Esencial para manguito rotador, trapecio y deltoides posterior.',
    'hombros',
    ARRAY['espalda']::TEXT[],
    'polea',
    'aislamiento',
    ARRAY['Cuerda a la altura de los ojos, tira hacia la frente separando manos.','Rota externamente los hombros contrayendo 1s atrás.']::TEXT[],
    'Codos altos y muñecas hacia atrás.',
    'principiante',
    false
  ),
(
    'Curl de bíceps con barra',
    'curl-barra',
    'Sobrecarga principal para ambas cabezas del bíceps braquial.',
    'biceps',
    ARRAY['antebrazos']::TEXT[],
    'barra',
    'aislamiento',
    ARRAY['Codos pegados a costillas, sube la barra flexionando codos.','Aprieta en la cima y desciende lento.']::TEXT[],
    'Sin balanceo de cadera ni tirones.',
    'principiante',
    false
  ),
(
    'Curl con mancuernas alterno',
    'curl-mancuernas-alterno',
    'Supinación activa para máxima contracción del bíceps.',
    'biceps',
    ARRAY['antebrazos']::TEXT[],
    'mancuernas',
    'aislamiento',
    ARRAY['Sube la mancuerna girando la palma hacia arriba (supinación).','Baja controlando y alterna de brazo.']::TEXT[],
    'Comienza a supinar desde el primer tercio del movimiento.',
    'principiante',
    false
  ),
(
    'Curl martillo',
    'curl-martillo',
    'Trabaja braquial anterior y braquiorradial para engrosar el brazo.',
    'biceps',
    ARRAY['antebrazos']::TEXT[],
    'mancuernas',
    'aislamiento',
    ARRAY['Palmas enfrentadas en todo momento (agarre neutro).','Flexiona llevando mancuernas hacia hombros sin rotar muñecas.']::TEXT[],
    'Hombros firmes y codos bloqueados en posición.',
    'principiante',
    false
  ),
(
    'Curl inclinado con mancuernas',
    'curl-inclinado',
    'Estiramiento máximo de la cabeza larga en banco inclinado.',
    'biceps',
    ARRAY['antebrazos']::TEXT[],
    'mancuernas',
    'aislamiento',
    ARRAY['Acuéstate en banco a 45-60 grados con brazos colgando.','Haz curl sin adelantar los codos.']::TEXT[],
    'Siente el estiramiento profundo antes de cada repetición.',
    'intermedio',
    false
  ),
(
    'Curl predicador en banco Scott',
    'curl-predicador',
    'Aisla el bíceps imposibilitando cualquier impulso del cuerpo.',
    'biceps',
    ARRAY['antebrazos']::TEXT[],
    'barra',
    'aislamiento',
    ARRAY['Brazos apoyados en la almohadilla, sube hasta la vertical.','Baja hasta casi extensión completa sin bloquear codos.']::TEXT[],
    'No despegues los codos de la almohadilla.',
    'intermedio',
    false
  ),
(
    'Press francés con barra Z',
    'press-frances-barra-z',
    'Desarrollo masivo de cabeza medial y larga del tríceps.',
    'triceps',
    ARRAY['pecho']::TEXT[],
    'barra',
    'aislamiento',
    ARRAY['Tumbado en banco plano con barra Z en alto.','Flexiona solo codos bajando la barra a la coronilla o trasnuca.','Extiende los antebrazos contrayendo tríceps.']::TEXT[],
    'Mantén codos cerrados hacia adentro sin abrir hacia afuera.',
    'intermedio',
    false
  ),
(
    'Extensión de tríceps en polea (Pushdown)',
    'pushdown-polea',
    'Aislamiento constante y congestión para cabeza lateral.',
    'triceps',
    ARRAY[]::TEXT[],
    'polea',
    'aislamiento',
    ARRAY['Codos pegados a costillas, empuja la barra o cuerda hacia abajo.','Extiende por completo y regresa hasta ángulo de 90°.']::TEXT[],
    'Los codos deben quedar fijos como bisagras.',
    'principiante',
    false
  ),
(
    'Extensión trasnuca con mancuerna',
    'extension-trasnuca',
    'Máxima elongación y trabajo de la cabeza larga del tríceps.',
    'triceps',
    ARRAY[]::TEXT[],
    'mancuernas',
    'aislamiento',
    ARRAY['Sostén mancuerna con ambas manos sobre la cabeza.','Baja la mancuerna detrás de la nuca flexionando codos.','Extiende hacia arriba sin mover la espalda.']::TEXT[],
    'Codos lo más apuntados al techo posible.',
    'intermedio',
    false
  ),
(
    'Fondos para tríceps en paralelas',
    'fondos-triceps',
    'Empuje vertical con torso erguido para tríceps masivos.',
    'triceps',
    ARRAY['pecho','hombros']::TEXT[],
    'peso_corporal',
    'compuesto',
    ARRAY['Cuerpo vertical en barras paralelas con codos cerrados.','Baja a 90° y empuja extendiendo codos con fuerza.']::TEXT[],
    'Cuerpo recto para focalizar tríceps (no inclinar el torso).',
    'avanzado',
    false
  ),
(
    'Sentadilla trasera con barra',
    'sentadilla-trasera',
    'El pilar fundamental de la fuerza y desarrollo del tren inferior.',
    'piernas',
    ARRAY['core','gluteos']::TEXT[],
    'barra',
    'compuesto',
    ARRAY['Barra en trapecios, pies a ancho de hombros con puntas ligeramente abiertas.','Rompe paralelo bajando con control llevando rodillas en dirección de puntas.','Empuja el suelo firmemente para subir a posición inicial.']::TEXT[],
    'Talones pegados al piso y pecho erguido.',
    'avanzado',
    false
  ),
(
    'Sentadilla frontal con barra',
    'sentadilla-frontal',
    'Mayor verticalidad del torso y enfoque directo en cuádriceps y core.',
    'piernas',
    ARRAY['core']::TEXT[],
    'barra',
    'compuesto',
    ARRAY['Barra descansando en deltoides anteriores con codos altos.','Desciende profundo manteniendo el torso totalmente vertical.','Empuja el suelo ascendiendo con codos apuntando al frente.']::TEXT[],
    'Mantén los codos altos para que la barra no ruede hacia adelante.',
    'avanzado',
    false
  ),
(
    'Prensa de piernas 45°',
    'prensa-piernas-45',
    'Gran sobrecarga para cuádriceps y glúteos con bajo estrés espinal.',
    'piernas',
    ARRAY['gluteos']::TEXT[],
    'maquina',
    'compuesto',
    ARRAY['Espalda y glúteos pegados al respaldo.','Baja la plataforma hasta flexión profunda sin despegar el coxis.','Empuja sin bloquear las rodillas en la cima.']::TEXT[],
    'Nunca bloquees las rodillas por completo.',
    'principiante',
    false
  ),
(
    'Peso muerto rumano (RDL)',
    'peso-muerto-rumano',
    'Máxima tensión e hipertrofia para isquiotibiales y glúteos.',
    'piernas',
    ARRAY['espalda','gluteos']::TEXT[],
    'barra',
    'compuesto',
    ARRAY['Rodillas semi-flexionadas pero fijas.','Empuja la cadera hacia atrás bajando la barra rozando piernas.','Extiende cadera con fuerza de glúteos para volver erguido.']::TEXT[],
    'Espalda totalmente recta; el movimiento es de bisagra de cadera.',
    'intermedio',
    false
  ),
(
    'Extensión de cuádriceps',
    'extension-cuadriceps',
    'Aislamiento para acortamiento máximo del cuádriceps.',
    'piernas',
    ARRAY[]::TEXT[],
    'maquina',
    'aislamiento',
    ARRAY['Almohadilla en tibias bajas, extiende piernas hacia arriba.','Aprieta 1 segundo arriba y baja en 2-3 segundos.']::TEXT[],
    'Sujeta firmemente las agarraderas laterales.',
    'principiante',
    false
  ),
(
    'Curl femoral tumbado',
    'curl-femoral-tumbado',
    'Flexión de rodilla directa para isquiotibiales.',
    'piernas',
    ARRAY[]::TEXT[],
    'maquina',
    'aislamiento',
    ARRAY['Boca abajo con almohadilla tras tobillos.','Flexiona rodillas acercando talones a glúteos.','Baja controlando sin soltar el peso de golpe.']::TEXT[],
    'Mantén la pelvis pegada al banco.',
    'principiante',
    false
  ),
(
    'Hip thrust con barra',
    'hip-thrust',
    'El ejercicio de mayor activación y carga para glúteos.',
    'piernas',
    ARRAY['gluteos']::TEXT[],
    'barra',
    'compuesto',
    ARRAY['Espalda media en borde del banco, barra acolchada en pelvis.','Empuja talones extendiendo cadera hasta quedar horizontal.','Aprieta glúteos 1s arriba con mentón recogido.']::TEXT[],
    'Mira siempre al frente para no arquear cuello ni lumbares.',
    'intermedio',
    false
  ),
(
    'Zancadas con mancuernas',
    'zancadas-mancuernas',
    'Trabajo dinámico unilateral para fuerza de piernas y estabilidad.',
    'piernas',
    ARRAY['gluteos','core']::TEXT[],
    'mancuernas',
    'compuesto',
    ARRAY['Paso amplio adelante flexionando ambas rodillas a 90°.','Empuja con pierna delantera para regresar erguido.']::TEXT[],
    'Torso firme sin tambaleos laterales.',
    'intermedio',
    false
  ),
(
    'Sentadilla búlgara',
    'sentadilla-bulgara',
    'Gran estímulo unilateral en banco para glúteo y cuádriceps.',
    'piernas',
    ARRAY['gluteos']::TEXT[],
    'mancuernas',
    'compuesto',
    ARRAY['Pie trasero elevado en banco, desciende la rodilla al suelo.','Sube empujando desde el talón delantero.']::TEXT[],
    'Inclina levemente el torso al frente para activar glúteo.',
    'avanzado',
    false
  ),
(
    'Elevación de talones / Gemelos',
    'gemelos-de-pie',
    'Estiramiento y contracción completa para gemelos.',
    'piernas',
    ARRAY[]::TEXT[],
    'maquina',
    'aislamiento',
    ARRAY['Punta de pies en plataforma, baja talones al máximo estiramiento.','Ponte de puntillas al tope y pausa 1s.']::TEXT[],
    'Pausa en el fondo para evitar el rebote elástico del tendón.',
    'principiante',
    false
  ),
(
    'Crunch en polea alta',
    'crunch-polea',
    'Sobrecarga progresiva con peso para recto abdominal.',
    'core',
    ARRAY[]::TEXT[],
    'polea',
    'aislamiento',
    ARRAY['Arrodillado con cuerda tras nuca, enrolla la columna hacia los muslos.','Aprieta abdomen abajo y regresa con control.']::TEXT[],
    'Flexiona la columna, no te sientes sobre los talones.',
    'intermedio',
    false
  ),
(
    'Elevaciones de piernas colgado',
    'elevaciones-piernas',
    'Excelente para abdomen bajo y flexores de cadera.',
    'core',
    ARRAY['antebrazos']::TEXT[],
    'peso_corporal',
    'aislamiento',
    ARRAY['Colgado de barra, eleva piernas flexionando la pelvis hacia el pecho.','Baja sin balanceos.']::TEXT[],
    'Retroverte la pelvis para activar los abdominales.',
    'avanzado',
    false
  ),
(
    'Plancha isométrica',
    'plancha',
    'Fuerza estática y estabilidad para todo el cinturón abdominal.',
    'core',
    ARRAY['gluteos','hombros']::TEXT[],
    'peso_corporal',
    'aislamiento',
    ARRAY['Sobre antebrazos y puntas de pies formando una línea recta.','Aprieta glúteos y ombligo hacia adentro.']::TEXT[],
    'No dejes caer la cadera ni la subas en pirámide.',
    'principiante',
    false
  ),
(
    'Rueda abdominal (Ab wheel)',
    'rueda-abdominal',
    'Anti-extensión máxima para abdominales de acero.',
    'core',
    ARRAY['espalda','triceps']::TEXT[],
    'otro',
    'aislamiento',
    ARRAY['De rodillas, rueda hacia adelante extendiendo el cuerpo.','Tira con el abdomen para regresar a la posición inicial.']::TEXT[],
    'Aprieta glúteos para evitar dolor lumbar.',
    'avanzado',
    false
  )
ON CONFLICT DO NOTHING;

