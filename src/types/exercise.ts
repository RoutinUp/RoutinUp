export type MuscleGroup = 
  | 'pecho'
  | 'espalda'
  | 'hombros'
  | 'biceps'
  | 'triceps'
  | 'piernas'
  | 'core'
  | 'cardio'
  | 'cuerpo_completo';

export type EquipmentType = 
  | 'barra'
  | 'mancuernas'
  | 'maquina'
  | 'polea'
  | 'peso_corporal'
  | 'kettlebell'
  | 'bandas'
  | 'otro';

export type ExerciseDifficulty = 'principiante' | 'intermedio' | 'avanzado';

export interface Exercise {
  id: string;
  name: string;
  slug: string;
  description: string;
  mainMuscleGroup: MuscleGroup;
  secondaryMuscles: string[];
  equipment: EquipmentType;
  exerciseType: 'compuesto' | 'aislamiento' | 'calistenia' | 'otro';
  instructions: string[];
  techniqueTips: string;
  difficultyLevel: ExerciseDifficulty;
  imageUrl?: string;
  isCustom: boolean;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExerciseInput {
  name: string;
  description: string;
  mainMuscleGroup: MuscleGroup;
  secondaryMuscles?: string[];
  equipment: EquipmentType;
  exerciseType: 'compuesto' | 'aislamiento' | 'calistenia' | 'otro';
  instructions?: string[];
  techniqueTips?: string;
  difficultyLevel: ExerciseDifficulty;
  imageUrl?: string;
}