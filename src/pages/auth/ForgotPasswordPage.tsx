import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { APP_CONFIG } from '../../config/app.config';
import { Button } from '../../components/common/Button';
import { getAuthErrorMessage } from '../../utils/authErrors';
import { Dumbbell, Mail, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setIsLoading(true);
      setErrorMessage('');
      const { error } = await authService.resetPasswordForEmail(email.trim());
      if (error) {
        setErrorMessage(getAuthErrorMessage(error));
        return;
      }
      setSuccessMessage(true);
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
          Recuperar Contraseña
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Ingresa tu correo para recibir un enlace de restablecimiento
        </p>
      </div>

      <div className="bg-gym-card border border-gym-border/80 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage ? (
          <div className="text-center space-y-4 py-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Correo Enviado</h3>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                Si el correo <strong className="text-emerald-400">{email}</strong> está registrado, recibirás un enlace para restablecer tu contraseña.
              </p>
            </div>
            <Link to="/login" className="block pt-2">
              <Button size="md" fullWidth variant="primary">
                VOLVER AL LOGIN
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
              icon={<Send className="w-4 h-4" />}
            >
              ENVIAR ENLACE
            </Button>

            <div className="text-center pt-1">
              <Link
                to="/login"
                className="text-xs font-bold text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Regresar a Iniciar Sesión
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};