import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/useAuthStore';
import { APP_CONFIG } from '../../config/app.config';
import { Button } from '../../components/common/Button';
import { getAuthErrorMessage } from '../../utils/authErrors';
import { Dumbbell, Mail, Lock, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, initialize } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Si ya hay sesión activa, redirigir a la ruta privada deseada o al Home
  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    try {
      setIsLoading(true);
      setErrorMessage('');
      const { error } = await authService.signIn(email.trim(), password);

      if (error) {
        setErrorMessage(getAuthErrorMessage(error));
        return;
      }

      await initialize();
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setErrorMessage('');
      const { error } = await authService.signInWithGoogle();
      if (error) {
        setErrorMessage(getAuthErrorMessage(error));
      }
    } catch (err: any) {
      setErrorMessage(getAuthErrorMessage(err));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[88vh] flex flex-col justify-center max-w-sm mx-auto px-4 py-6 select-none">
      {/* Logotipo y Título de Marca */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-3 shadow-glow-primary">
          <Dumbbell className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          {APP_CONFIG.name}
        </h1>
        <p className="text-xs text-gray-400 mt-1 font-medium">
          {APP_CONFIG.tagline}
        </p>
      </div>

      {/* Contenedor del Formulario Mobile-First */}
      <div className="bg-gym-card border border-gym-border/80 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        {/* Selector Pestañas Login / Registro */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-900 border border-gym-border/60 text-xs font-bold">
          <div className="py-2 rounded-xl text-center bg-emerald-500 text-slate-950 font-black shadow-sm">
            Iniciar Sesión
          </div>
          <Link
            to="/register"
            className="py-2 rounded-xl text-center text-gray-400 hover:text-white transition-colors"
          >
            Registrarse
          </Link>
        </div>

        {/* Mensaje de Error en Español */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3.5">
          {/* Email */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-3 bg-slate-900 border border-gym-border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Contraseña
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] font-bold text-emerald-400 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-slate-900 border border-gym-border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
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

          {/* Botón Iniciar Sesión */}
          <Button
            type="submit"
            size="lg"
            fullWidth
            variant="primary"
            isLoading={isLoading}
            icon={<LogIn className="w-5 h-5 stroke-[2.5]" />}
          >
            INICIAR SESIÓN
          </Button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-gym-border/60"></div>
          <span className="flex-shrink mx-2 text-[10px] text-gray-500 font-bold uppercase">o con</span>
          <div className="flex-grow border-t border-gym-border/60"></div>
        </div>

        {/* Botón Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="w-full py-3 rounded-2xl bg-gym-cardLighter border border-gym-border text-xs font-bold text-white hover:bg-slate-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 shadow-sm"
        >
          {isGoogleLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93Z"
                />
              </svg>
              Continuar con Google
            </>
          )}
        </button>

        <div className="pt-1 text-center text-xs text-gray-400">
          ¿No tienes cuenta aún?{' '}
          <Link to="/register" className="text-emerald-400 font-bold hover:underline">
            Crear cuenta gratis
          </Link>
        </div>
      </div>

      <div className="text-center mt-5 text-[11px] text-gray-500/50 font-mono tracking-wider select-none">
        v{APP_CONFIG.version}
      </div>
    </div>
  );
};