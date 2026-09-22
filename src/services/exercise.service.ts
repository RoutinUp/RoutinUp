import { supabase, isSupabaseConfigured } from '../config/supabase';
import { Exercise, CreateExerciseInput, MuscleGroup } from '../types/exercise';
import { SEED_EXERCISES } from '../data/seedExercises';

const CUSTOM_EXERCISES_KEY = 'gymtrack_custom_exercises';

export const exerciseService = {
  // Obtener todos los ejercicios disponibles (globales + personalizados del usuario)
  async getExercises(userId?: string): Promise<Exercise[]> {
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(CUSTOM_EXERCISES_KEY);
      const custom: Exercise[] = stored ? JSON.parse(stored) : [];
      return [...SEED_EXERCISES, ...custom];
    }

    try {
      let query = supabase
        .from('exercises')
        .select('*')
        .order('name');

      if (userId) {
        query = query.or(`is_custom.eq.false,created_by.eq.${userId}`);
      } else {
        query = query.eq('is_custom', false);
      }

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        // Fallback a semillas locales si la tabla aún no se ha poblado
        return SEED_EXERCISES;
      }

      return data.map((d) => ({
        id: d.id,
        name: d.name,
        slug: d.slug,
        description: d.description,
        mainMuscleGroup: d.main_muscle_group as MuscleGroup,
        secondaryMuscles: d.secondary_muscles || [],
        equipment: d.equipment,
        exerciseType: d.exercise_type,
        instructions: d.instructions || [],
        techniqueTips: d.technique_tips || '',
        difficultyLevel: d.difficulty_level,
        imageUrl: d.image_url,
        isCustom: d.is_custom,
        createdBy: d.created_by,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }));
    } catch (err) {
      console.warn('Error fetching exercises from Supabase, using fallback seeds:', err);
      return SEED_EXERCISES;
    }
  },

  // Obtener un ejercicio por ID
  async getExerciseById(id: string): Promise<Exercise | null> {
    const list = await this.getExercises();
    return list.find((e) => e.id === id) || null;
  },

  // Crear ejercicio personalizado
  async createCustomExercise(input: CreateExerciseInput, userId?: string): Promise<Exercise> {
    const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    if (!isSupabaseConfigured || !userId) {
      const newEx: Exercise = {
        id: 'cust-' + Math.random().toString(36).substring(2, 9),
        name: input.name,
        slug,
        description: input.description,
        mainMuscleGroup: input.mainMuscleGroup,
        secondaryMuscles: input.secondaryMuscles || [],
        equipment: input.equipment,
        exerciseType: input.exerciseType,
        instructions: input.instructions || [],
        techniqueTips: input.techniqueTips || '',
        difficultyLevel: input.difficultyLevel,
        imageUrl: input.imageUrl,
        isCustom: true,
        createdBy: userId || 'local-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const stored = localStorage.getItem(CUSTOM_EXERCISES_KEY);
      const custom: Exercise[] = stored ? JSON.parse(stored) : [];
      custom.push(newEx);
      localStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(custom));
      return newEx;
    }

    const { data, error } = await supabase
      .from('exercises')
      .insert({
        name: input.name,
        slug,
        description: input.description,
        main_muscle_group: input.mainMuscleGroup,
        secondary_muscles: input.secondaryMuscles || [],
        equipment: input.equipment,
        exercise_type: input.exerciseType,
        instructions: input.instructions || [],
        technique_tips: input.techniqueTips || '',
        difficulty_level: input.difficultyLevel,
        image_url: input.imageUrl,
        is_custom: true,
        created_by: userId,
      })
      .select()
      .single();

    if (error || !data) {
      throw error || new Error('No se pudo crear el ejercicio personalizado');
    }

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      mainMuscleGroup: data.main_muscle_group as MuscleGroup,
      secondaryMuscles: data.secondary_muscles || [],
      equipment: data.equipment,
      exerciseType: data.exercise_type,
      instructions: data.instructions || [],
      techniqueTips: data.technique_tips || '',
      difficultyLevel: data.difficulty_level,
      imageUrl: data.image_url,
      isCustom: true,
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
};