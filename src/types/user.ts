export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  heightCm?: number;
  bodyWeightKg?: number;
  isProfileCompleted: boolean;
  preferredWeightUnit: 'kg' | 'lb';
  soundEnabled: boolean;
  hapticFeedbackEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileInput {
  displayName: string;
  heightCm: number;
  bodyWeightKg: number;
  avatarUrl?: string;
  preferredWeightUnit?: 'kg' | 'lb';
}