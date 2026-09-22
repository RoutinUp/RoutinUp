const fs = require('fs');
const path = require('path');

const chestBack = require('./data_chest_back.cjs');
const armsShoulders = require('./data_arms_shoulders.cjs');
const legsCore = require('./data_legs_core.cjs');

const allExercises = [...chestBack, ...armsShoulders, ...legsCore].map(ex => ({
  ...ex,
  isCustom: false,
  createdBy: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
}));

console.log(`Total exercises gathered: ${allExercises.length}`);

// 1. Generate src/data/seedExercises.ts
const tsContent = `// Catálogo inicial de ejercicios comunes del gimnasio
import { Exercise } from '../types/exercise';

export const SEED_EXERCISES: Exercise[] = ${JSON.stringify(allExercises, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '../src/data/seedExercises.ts'), tsContent, 'utf-8');
console.log('Generated src/data/seedExercises.ts');

// 2. Generate supabase/migrations/20260922000003_seed_exercises.sql
let sqlRows = allExercises.map(ex => {
  const sec = "ARRAY[" + ex.secondaryMuscles.map(m => `'${m}'`).join(',') + "]::TEXT[]";
  const inst = "ARRAY[" + ex.instructions.map(i => `'${i.replace(/'/g, "''")}'`).join(',') + "]::TEXT[]";
  return `(
    '${ex.name.replace(/'/g, "''")}',
    '${ex.slug}',
    '${ex.description.replace(/'/g, "''")}',
    '${ex.mainMuscleGroup}',
    ${sec},
    '${ex.equipment}',
    '${ex.exerciseType}',
    ${inst},
    '${ex.techniqueTips.replace(/'/g, "''")}',
    '${ex.difficultyLevel}',
    false
  )`;
}).join(',\n');

const sqlMigration = `-- Inserción masiva de ejercicios globales
INSERT INTO public.exercises (
  name, slug, description, main_muscle_group, secondary_muscles,
  equipment, exercise_type, instructions, technique_tips, difficulty_level, is_custom
)
VALUES
${sqlRows}
ON CONFLICT DO NOTHING;
`;

fs.writeFileSync(path.join(__dirname, '../supabase/migrations/20260922000003_seed_exercises.sql'), sqlMigration, 'utf-8');
console.log('Generated supabase/migrations/20260922000003_seed_exercises.sql');

// 3. Generate supabase/seed.sql (Full consolidated file for 1-click execution in Supabase)
const schema1 = fs.readFileSync(path.join(__dirname, '../supabase/migrations/20260922000001_initial_schema.sql'), 'utf-8');
const schema2 = fs.readFileSync(path.join(__dirname, '../supabase/migrations/20260922000002_rls_policies.sql'), 'utf-8');
const consolidated = `/*
  =============================================================================
  GYMTRACK - SCRIPT SQL COMPLETO PARA SUPABASE
  Instrucciones:
  1. Ve a tu proyecto Supabase -> SQL Editor -> New Query.
  2. Pega todo el contenido de este archivo y presiona RUN.
  3. ¡Listo! Todas las tablas, triggers, RLS y catálogo de ejercicios quedarán creados.
  =============================================================================
*/

${schema1}

${schema2}

${sqlMigration}
`;

fs.writeFileSync(path.join(__dirname, '../supabase/seed.sql'), consolidated, 'utf-8');
console.log('Generated consolidated supabase/seed.sql');