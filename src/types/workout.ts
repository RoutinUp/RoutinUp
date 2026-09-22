import { Exercise } from './exercise';

export type CardKind = 'set' | 'rest';

export interface SetCardData {
  kind: 'set';
  cardIndex: number;
  totalCards: number;
  exerciseId: string;
  exercise: Exercise;
  exerciseOrder: number;
  totalExercisesInDay: number;
  setNumber: number;
  totalSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  targetWeight: number;
  restSeconds: number;
  notes?: string;
  // Desempeño anterior y sugerencia
  lastPerformance?: {
    weight: number;
    reps: number;
    date: string;
  };
  suggestedWeight?: number;
  // Estado registrado para esta serie
  completed: boolean;
  loggedWeight?: number;
  loggedReps?: number;
  isPR?: boolean;
}

export interface RestCardData {
  kind: 'rest';
  cardIndex: number;
  totalCards: number;
  durationSeconds: number;
  currentExerciseName: string;
  nextExerciseName: string;
  nextSetNumber: number;
  nextTotalSets: number;
  nextExerciseImage?: string;
  nextTargetWeight?: number;
  nextTargetReps?: string;
}

export type WorkoutCard = SetCardData | RestCardData;

export interface LoggedSet {
  id?: string;
  setNumber: number;
  weight: number;
  reps: number;
  targetRepsMin: number;
  targetRepsMax: number;
  targetWeight: number;
  completedAt: string;
  isPR?: boolean;
}

export interface LoggedExercise {
  exerciseId: string;
  exerciseName: string;
  exerciseOrder: number;
  status: 'completed' | 'skipped';
  skippedReason?: string;
  sets: LoggedSet[];
}

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutDayId?: string;
  routineName: string;
  dayName: string;
  startedAt: string;
  completedAt?: string;
  durationSeconds: number;
  totalVolume: number;
  totalSetsCompleted: number;
  exercises: LoggedExercise[];
  status: 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  newPRs?: Array<{
    exerciseName: string;
    type: string;
    value: number;
    reps?: number;
  }>;
}