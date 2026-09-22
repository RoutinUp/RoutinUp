import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/common/Button';
import { getAuthErrorMessage } from '../../utils/authErrors';
import { Dumbbell, Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { setPasswordRecovery } = useAuthStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password.length < 6) {
      setErrorMessage('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      const { error } = await authService.updateUserPassword(password);
      if (error) {
        setErrorMessage(getAuthErrorMessage(error));
        return;
      }
      setIsSuccess(true);
      setPasswordRecovery(false);
    } catch (err: any) {
      setErrorMessage(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center max-w-sm mx-auto px-4 py-6 select-none">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-3 shadow-glow-primary">
          <Dumbbell className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Nueva Contraseña
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Establece una nueva clave para tu cuenta
        </p>
      </div>

      <div className="bg-gym-card border border-gym-border/80 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="text-center space-y-4 py-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">¡Contraseña Actualizada!</h3>
              <p className="text-xs text-gray-300 mt-1">
                Tu clave ha sido restablecida correctamente. Ya puedes continuar con tus entrenamientos.
              </p>
            </div>
            <Button
              size="lg"
              fullWidth
              variant="primary"
              onClick={() => navigate('/', { replace: true })}
            >
              IR AL INICIO
            </Button>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Nueva Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-900 border border-gym-border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repite la nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-900 border border-gym-border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              fullWidth
              variant="primary"
              isLoading={isLoading}
            >
              ACTUALIZAR CONTRASEÑA
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};