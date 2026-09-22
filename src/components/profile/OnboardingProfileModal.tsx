import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../common/Button';
import { User, Ruler, Weight, Camera, Sparkles, CheckCircle2 } from 'lucide-react';

export const OnboardingProfileModal: React.FC = () => {
  const { user, profile, updateProfile } = useAuthStore();

  const [displayName, setDisplayName] = useState(
    profile?.displayName || user?.user_metadata?.full_name || ''
  );
  const [heightCm, setHeightCm] = useState<number | ''>(
    profile?.heightCm || ''
  );
  const [bodyWeightKg, setBodyWeightKg] = useState<number | ''>(
    profile?.bodyWeightKg || ''
  );
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Solo se muestra si hay usuario logueado pero el perfil aún no está completado
  if (!user || profile?.isProfileCompleted) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMessage('Por favor, ingresa tu nombre');
      return;
    }
    if (!heightCm || Number(heightCm) <= 0) {
      setErrorMessage('Por favor, ingresa una altura válida en cm');
      return;
    }
    if (!bodyWeightKg || Number(bodyWeightKg) <= 0) {
      setErrorMessage('Por favor, ingresa tu peso corporal en kg');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await updateProfile({
        displayName: displayName.trim(),
        heightCm: Number(heightCm),
        bodyWeightKg: Number(bodyWeightKg),
        avatarUrl: avatarUrl.trim() || undefined,
        preferredWeightUnit: 'kg',
      });
    } catch (err: any) {
      console.error('Error guardando perfil:', err);
      setErrorMessage(err.message || 'Error al guardar el perfil en Supabase');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-gym-card border border-gym-border rounded-3xl shadow-2xl overflow-hidden p-6 text-left">
        {/* Encabezado */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-2.5 shadow-glow-primary">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Crea tu Perfil
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Completa tus datos personales para personalizar tu experiencia de entrenamiento.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 font-semibold text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Nombre */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Nombre Completo *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Ej: Lucas Rossi"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-gym-border rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Altura y Peso Corporal (Datos Biométricos) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Altura (cm) *
              </label>
              <div className="relative">
                <Ruler className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  required
                  min="50"
                  max="260"
                  step="1"
                  placeholder="178"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-gym-border rounded-xl text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Peso Corporal (kg) *
              </label>
              <div className="relative">
                <Weight className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  required
                  min="20"
                  max="300"
                  step="0.5"
                  placeholder="75.5"
                  value={bodyWeightKg}
                  onChange={(e) => setBodyWeightKg(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-gym-border rounded-xl text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <p className="text-[10px] text-gray-500 italic">
            * Tu peso corporal se guarda en tu perfil y es independiente de las cargas que levantes en tus rutinas.
          </p>

          {/* Foto de Perfil Opcional */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Foto de Perfil URL (Opcional)
            </label>
            <div className="relative">
              <Camera className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                placeholder="https://... (enlace a tu foto)"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-gym-border rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              fullWidth
              variant="primary"
              isLoading={isSubmitting}
              icon={<CheckCircle2 className="w-5 h-5 stroke-[2.5]" />}
            >
              GUARDAR Y COMENZAR
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};