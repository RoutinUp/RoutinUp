export interface PersonalRecord {
  id: string;
  userId: string;
  exerciseId: string;
  exerciseName?: string;
  recordType: 'max_weight' | 'max_reps' | 'max_volume_set' | 'max_session_volume';
  value: number;
  reps?: number;
  achievedAt: string;
  sessionSetId?: string;
}

export interface ExerciseProgressPoint {
  date: string;
  formattedDate: string;
  maxWeight: number;
  repsAtMaxWeight: number;
  totalVolume: number;
  totalSets: number;
  estimatedOneRepMax: number;
}

export interface UserStats {
  totalWorkouts: number;
  totalVolume: number;
  totalSets: number;
  totalTimeMinutes: number;
  prsAchieved: number;
}