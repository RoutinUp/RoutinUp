import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { APP_CONFIG } from '../../config/app.config';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Card } from '../../components/ui/card';
import { getUserDisplayName, getUserAvatarUrl, getUserInitials } from '../../utils/user';
import {
  LogOut,
  Edit3,
  Ruler,
  Weight,
  AlertCircle
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile, signOut } = useAuthStore();
  const [unit, setUnit] = useState<'kg' | 'lb'>('kg');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Estado para modal de edición de perfil
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editHeight, setEditHeight] = useState<number | ''>('');
  const [editWeight, setEditWeight] = useState<number | ''>('');
  const [editAvatar, setEditAvatar] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editError, setEditError] = useState('');

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleOpenEditProfile = () => {
    setEditName(profile?.displayName || user?.user_metadata?.full_name || '');
    setEditHeight(profile?.heightCm || '');
    setEditWeight(profile?.bodyWeightKg || '');
    setEditAvatar(profile?.avatarUrl || '');
    setEditError('');
    setIsEditProfileModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setEditError('El nombre no puede estar vacío');
      return;
    }
    if (!editHeight || Number(editHeight) <= 0) {
      setEditError('Ingresa una altura válida en cm');
      return;
    }
    if (!editWeight || Number(editWeight) <= 0) {
      setEditError('Ingresa un peso corporal válido en kg');
      return;
    }

    try {
      setIsSavingProfile(true);
      setEditError('');
      await updateProfile({
        displayName: editName.trim(),
        heightCm: Number(editHeight),
        bodyWeightKg: Number(editWeight),
        avatarUrl: editAvatar.trim() || undefined,
        preferredWeightUnit: unit,
      });
      setIsEditProfileModalOpen(false);
    } catch (err: any) {
      setEditError(err.message || 'Error al actualizar el perfil en Supabase');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const displayName = getUserDisplayName(user, profile) || 'Usuario';
  const email = user?.email || '';
  const avatarUrl = getUserAvatarUrl(user, profile);
  const initials = getUserInitials(user, profile);

  return (
    <div className="space-y-4 pb-20 select-none">
      <div>
        <h1 className="text-2xl font-black text-zinc-100 tracking-tight">Ajustes & Perfil</h1>
        <p className="text-xs text-zinc-400">Configuración general y datos biométricos</p>
      </div>

      {/* Tarjeta de Perfil Real */}
      <Card className="p-4 space-y-3.5 border-[#27272A] bg-[#18181B] shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gym-primary/10 border border-gym-primary/20 flex items-center justify-center text-gym-primary font-bold text-xl overflow-hidden">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">{displayName}</h3>
              {email && <span className="text-xs text-zinc-400 block">{email}</span>}
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenEditProfile}
            className="p-2.5 rounded-xl bg-[#27272A] text-zinc-300 hover:text-white hover:bg-zinc-700 border border-[#27272A] transition-all flex items-center gap-1.5 text-xs font-semibold"
            title="Editar perfil"
          >
            <Edit3 className="w-3.5 h-3.5 text-gym-primary" />
            Editar
          </button>
        </div>

        {/* Biometría del Perfil: Altura y Peso Corporal */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-gym-border/40">
          <div className="p-2.5 rounded-xl bg-gym-bg/80 border border-gym-border/60 flex items-center gap-2">
            <Ruler className="w-4 h-4 text-gray-400" />
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Altura</span>
              <span className="text-xs font-bold text-white">
                {profile?.heightCm ? `${profile.heightCm} cm` : 'Sin definir'}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-gym-bg/80 border border-gym-border/60 flex items-center gap-2">
            <Weight className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Peso Corporal</span>
              <span className="text-xs font-bold text-emerald-400">
                {profile?.bodyWeightKg ? `${profile.bodyWeightKg} kg` : 'Sin definir'}
              </span>
            </div>
          </div>
        </div>

        {user && (
          <div className="pt-1">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Cerrar sesión
            </button>
          </div>
        )}
      </Card>

      {/* Preferencias de Entrenamiento */}
      <div className="p-4 rounded-3xl bg-gym-card border border-gym-border/80 space-y-3">
        <h3 className="text-sm font-bold text-white">Preferencias de Entrenamiento</h3>

        {/* Unidad de Peso */}
        <div className="flex items-center justify-between py-1">
          <div>
            <span className="text-xs font-bold text-gray-200 block">Unidad de Peso para Series</span>
            <span className="text-[11px] text-gray-400">Kilogramos o libras en ejercicios</span>
          </div>
          <div className="flex bg-slate-900 p-1 rounded-xl border border-gym-border">
            <button
              type="button"
              onClick={() => setUnit('kg')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                unit === 'kg' ? 'bg-emerald-500 text-slate-950' : 'text-gray-400'
              }`}
            >
              kg
            </button>
            <button
              type="button"
              onClick={() => setUnit('lb')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                unit === 'lb' ? 'bg-emerald-500 text-slate-950' : 'text-gray-400'
              }`}
            >
              lb
            </button>
          </div>
        </div>

        {/* Sonido de Temporizador */}
        <div className="flex items-center justify-between py-1 border-t border-gym-border/40">
          <div>
            <span className="text-xs font-bold text-gray-200 block">Campana de Fin de Descanso</span>
            <span className="text-[11px] text-gray-400">Aviso acústico al llegar a 00:00</span>
          </div>
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Información de Marca Centralizada */}
      <div className="p-4 rounded-3xl bg-gym-card border border-gym-border/80 space-y-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <h4 className="text-sm font-black text-white">
            Routin<span style={{ color: '#008000' }} className="text-[#008000]">UP</span>
          </h4>
          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#008000]/15 text-[#008000] border border-[#008000]/30 tracking-wider">
            BETA
          </span>
        </div>
        <p className="text-xs text-gray-400">{APP_CONFIG.description}</p>
        <div className="text-[10px] text-gray-500 pt-1 font-mono">
          v{APP_CONFIG.version} · Producción Supabase
        </div>
      </div>

      {/* Footer discreto con la versión */}
      <footer className="text-center pt-1 pb-4 text-[11px] text-gray-500/60 font-mono tracking-wider select-none">
        Routin<span style={{ color: '#008000' }} className="text-[#008000]">UP</span> v{APP_CONFIG.version}
      </footer>

      {/* Modal Editar Perfil */}
      <Modal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        title="Editar Perfil"
        maxWidth="md"
      >
        <form onSubmit={handleSaveProfile} className="space-y-3.5 text-left">
          {editError && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {editError}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-gym-border rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Altura (cm) *
              </label>
              <input
                type="number"
                required
                min="50"
                max="260"
                step="1"
                placeholder="178"
                value={editHeight}
                onChange={(e) => setEditHeight(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-gym-border rounded-xl text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Peso Corporal (kg) *
              </label>
              <input
                type="number"
                required
                min="20"
                max="300"
                step="0.5"
                placeholder="75.5"
                value={editWeight}
                onChange={(e) => setEditWeight(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-gym-border rounded-xl text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Foto de Perfil URL (Opcional)
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={editAvatar}
              onChange={(e) => setEditAvatar(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-gym-border rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsEditProfileModalOpen(false)}
            >
              CANCELAR
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSavingProfile}
            >
              GUARDAR
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};