-- Migración 000004: Agregar columna sets_config a workout_day_exercises
-- Permite almacenar configuraciones personalizadas de peso y repeticiones por cada serie individual

ALTER TABLE public.workout_day_exercises 
ADD COLUMN IF NOT EXISTS sets_config JSONB DEFAULT '[]'::jsonb;
