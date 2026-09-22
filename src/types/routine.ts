import { Exercise } from './exercise';

export interface RoutineSetDetail {
  setNumber: number;
  targetReps: number;
  targetWeight: number;
}

export interface WorkoutDayExercise {
  id: string;
  workoutDayId: string;
  exerciseId: string;
  exercise?: Exercise;
  exerciseOrder: number;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  targetWeight: number; // en kg o unidad preferida
  restSeconds: number; // en segundos (ej. 120)
  notes?: string;
  setsConfig?: RoutineSetDetail[];
}

export interface WorkoutDay {
  id: string;
  routineId: string;
  name: string; // ej. "Lunes - Pecho y Tríceps", "Día 1 - Push"
  dayOrder: number;
  exercises: WorkoutDayExercise[];
}

export interface WorkoutRoutine {
  id: string;
  userId: string;
  name: string; // ej. "Push Pull Legs", "Torso Pierna"
  description?: string;
  isActive: boolean;
  days: WorkoutDay[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoutineInput {
  name: string;
  description?: string;
  days: {
    name: string;
    dayOrder: number;
    exercises: {
      exerciseId: string;
      exerciseOrder: number;
      targetSets: number;
      targetRepsMin: number;
      targetRepsMax: number;
      targetWeight: number;
      restSeconds: number;
      notes?: string;
      setsConfig?: RoutineSetDetail[];
    }[];
  }[];
}