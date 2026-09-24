import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { OnboardingProfileModal } from './components/profile/OnboardingProfileModal';

// Páginas Públicas
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Páginas Protegidas
import { HomePage } from './pages/home/HomePage';
import { RoutinesListPage } from './pages/routines/RoutinesListPage';
import { RoutineEditorPage } from './pages/routines/RoutineEditorPage';
import { ExerciseLibraryPage } from './pages/exercises/ExerciseLibraryPage';
import { ActiveWorkoutPage } from './pages/workout/ActiveWorkoutPage';
import { HistoryListPage } from './pages/history/HistoryListPage';
import { ProgressPage } from './pages/progress/ProgressPage';
import { NutritionPage } from './pages/nutrition/NutritionPage';
import { SettingsPage } from './pages/settings/SettingsPage';

// Layout que oculta barras en el modo de entrenamiento activo o en páginas de autenticación
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { user, profile } = useAuthStore();

  const isWorkoutActiveMode = location.pathname.startsWith('/workout/active');
  const isAuthPage = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ].includes(location.pathname);

  if (isWorkoutActiveMode) {
    return <div className="min-h-screen bg-gym-bg text-gray-100">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gym-bg text-gray-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {!isAuthPage && user && <Header />}
      <main className={`flex-1 w-full max-w-md mx-auto px-4 ${isAuthPage ? 'pt-0' : 'pt-3 pb-8'}`}>
        {children}
      </main>
      {!isAuthPage && user && <BottomNav />}
      {/* Onboarding de perfil bloqueante para usuarios autenticados con perfil incompleto */}
      {user && !profile?.isProfileCompleted && <OnboardingProfileModal />}
    </div>
  );
};

export function App() {
  const { initialize, initialized, isPasswordRecovery } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gym-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <HashRouter>
      <AppLayout>
        <Routes>
          {/* Rutas Públicas de Autenticación */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Rutas Privadas Protegidas con Supabase Auth */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/routines"
            element={
              <ProtectedRoute>
                <RoutinesListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/routines/new"
            element={
              <ProtectedRoute>
                <RoutineEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/routines/:id/edit"
            element={
              <ProtectedRoute>
                <RoutineEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exercises"
            element={<Navigate to="/routines?tab=exercises" replace />}
          />
          <Route
            path="/nutrition"
            element={
              <ProtectedRoute>
                <NutritionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workout/active"
            element={
              <ProtectedRoute>
                <ActiveWorkoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history/:id"
            element={
              <ProtectedRoute>
                <HistoryListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <ProgressPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </HashRouter>
  );
}

export default App;