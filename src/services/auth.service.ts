import { supabase } from '../config/supabase';
import { UserProfile, UpdateProfileInput } from '../types/user';
import { getAppRedirectUrl } from '../utils/url';

export const authService = {
  // Obtener sesión actual de Supabase
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('Error fetching Supabase session:', error);
      return null;
    }
    return session;
  },

  // Obtener usuario autenticado actual
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      return null;
    }
    return user;
  },

  // Obtener perfil completo desde la tabla profiles
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching profile from Supabase:', error);
      return null;
    }

    const { data: { user } } = await supabase.auth.getUser();

    // Si aún no existe la fila en profiles (ej: antes de ejecutarse el trigger), crearla
    if (!data) {
      const initialProfile = {
        id: userId,
        display_name: user?.user_metadata?.full_name || user?.user_metadata?.name || '',
        avatar_url: user?.user_metadata?.avatar_url || null,
        is_profile_completed: false,
        preferred_weight_unit: 'kg',
      };
      await supabase.from('profiles').insert(initialProfile);

      return {
        id: userId,
        email: user?.email || '',
        displayName: initialProfile.display_name,
        avatarUrl: initialProfile.avatar_url || undefined,
        heightCm: undefined,
        bodyWeightKg: undefined,
        isProfileCompleted: false,
        preferredWeightUnit: 'kg',
        soundEnabled: true,
        hapticFeedbackEnabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // El perfil se considera completado si el flag es true o si tiene nombre, altura y peso
    const isCompleted = Boolean(
      data.is_profile_completed ||
      (data.display_name && data.height_cm && data.body_weight_kg)
    );

    return {
      id: data.id,
      email: user?.email || '',
      displayName: data.display_name || '',
      avatarUrl: data.avatar_url || undefined,
      heightCm: data.height_cm ? Number(data.height_cm) : undefined,
      bodyWeightKg: data.body_weight_kg ? Number(data.body_weight_kg) : undefined,
      isProfileCompleted: isCompleted,
      preferredWeightUnit: data.preferred_weight_unit || 'kg',
      soundEnabled: data.sound_enabled ?? true,
      hapticFeedbackEnabled: data.haptic_feedback_enabled ?? true,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  // Actualizar o crear perfil de usuario en Supabase (Onboarding o Ajustes)
  async updateProfile(userId: string, input: UpdateProfileInput): Promise<UserProfile> {
    const payload = {
      id: userId,
      display_name: input.displayName,
      height_cm: input.heightCm,
      body_weight_kg: input.bodyWeightKg,
      avatar_url: input.avatarUrl || null,
      is_profile_completed: true,
      preferred_weight_unit: input.preferredWeightUnit || 'kg',
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile in Supabase:', error);
      throw error;
    }

    const { data: { user } } = await supabase.auth.getUser();

    return {
      id: data.id,
      email: user?.email || '',
      displayName: data.display_name,
      avatarUrl: data.avatar_url || undefined,
      heightCm: Number(data.height_cm),
      bodyWeightKg: Number(data.body_weight_kg),
      isProfileCompleted: true,
      preferredWeightUnit: data.preferred_weight_unit || 'kg',
      soundEnabled: data.sound_enabled ?? true,
      hapticFeedbackEnabled: data.haptic_feedback_enabled ?? true,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  // Registro con Email y Contraseña (Supabase Auth Real)
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAppRedirectUrl(''),
      },
    });

    return { user: data.user, session: data.session, error };
  },

  // Iniciar Sesión con Email y Contraseña (Supabase Auth Real)
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { user: data.user, session: data.session, error };
  },

  // Iniciar Sesión con Google OAuth
  async signInWithGoogle() {
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getAppRedirectUrl(''),
      },
    });
  },

  // Cerrar Sesión (Supabase Auth Real)
  async signOut() {
    return await supabase.auth.signOut();
  },

  // Solicitar recuperación de contraseña (envía email)
  async resetPasswordForEmail(email: string) {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAppRedirectUrl('reset-password'),
    });
  },

  // Actualizar contraseña tras recuperación
  async updateUserPassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });
    return { data, error };
  },
};