import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { authService } from '../services/auth.service';
import { UserProfile, UpdateProfileInput } from '../types/user';
import { useActiveWorkoutStore } from './useActiveWorkoutStore';

interface AuthState {
  user: any | null;
  profile: UserProfile | null;
  isLoading: boolean;
  initialized: boolean;
  isPasswordRecovery: boolean;
  initialize: () => Promise<void>;
  setUser: (user: any, profile?: UserProfile | null) => void;
  updateProfile: (data: UpdateProfileInput) => Promise<UserProfile>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  setPasswordRecovery: (isRecovery: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  initialized: false,
  isPasswordRecovery: false,

  initialize: async () => {
    try {
      set({ isLoading: true });

      // 1. Obtener la sesión actual persistida de Supabase
      const session = await authService.getSession();
      if (session?.user) {
        const profile = await authService.getProfile(session.user.id);
        set({ user: session.user, profile, isLoading: false, initialized: true });
      } else {
        set({ user: null, profile: null, isLoading: false, initialized: true });
      }

      // 2. Suscribirse a los cambios de estado de autenticación en tiempo real
      supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (currentSession?.user) {
            const profile = await authService.getProfile(currentSession.user.id);
            set({ user: currentSession.user, profile, isLoading: false, initialized: true });
          }
        } else if (event === 'SIGNED_OUT') {
          // Limpiar todo el estado de usuario anterior
          useActiveWorkoutStore.getState().cancelWorkout();
          set({ user: null, profile: null, isLoading: false, initialized: true, isPasswordRecovery: false });
        } else if (event === 'PASSWORD_RECOVERY') {
          set({ isPasswordRecovery: true, isLoading: false, initialized: true });
        }
      });
    } catch (err) {
      console.error('Error inicializando autenticación con Supabase:', err);
      set({ user: null, profile: null, isLoading: false, initialized: true });
    }
  },

  setUser: (user, profile = null) => {
    set({ user, profile, isLoading: false });
  },

  refreshProfile: async () => {
    const { user } = get();
    if (user) {
      const profile = await authService.getProfile(user.id);
      set({ profile });
    }
  },

  updateProfile: async (data: UpdateProfileInput) => {
    const { user } = get();
    if (!user) throw new Error('No hay usuario autenticado en Supabase');
    const updated = await authService.updateProfile(user.id, data);
    set({ profile: updated });
    return updated;
  },

  setPasswordRecovery: (isRecovery: boolean) => {
    set({ isPasswordRecovery: isRecovery });
  },

  signOut: async () => {
    try {
      set({ isLoading: true });
      // Cancelar cualquier rutina en progreso en memoria
      useActiveWorkoutStore.getState().cancelWorkout();
      // Cerrar sesión en Supabase Auth
      await authService.signOut();
      // Limpiar estado
      set({ user: null, profile: null, isLoading: false, isPasswordRecovery: false });
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      set({ user: null, profile: null, isLoading: false });
    }
  }
}));