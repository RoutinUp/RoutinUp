import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useActiveWorkoutStore } from '../../store/useActiveWorkoutStore';
import { routineService } from '../../services/routine.service';
import { workoutService } from '../../services/workout.service';
import { WorkoutRoutine, WorkoutDay } from '../../types/routine';
import { WorkoutSession } from '../../types/workout';
import { Button } from '../../components/common/Button';
import { APP_CONFIG } from '../../config/app.config';
import { formatDurationHuman, formatDateSpanish, formatWeight } from '../../utils/formatters';
import { Play, Plus, Dumbbell, Calendar, History, ArrowRight, Flame, Trophy } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const { isActive, startWorkout } = useActiveWorkoutStore();

  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const displayName = profile?.displayName || user?.user_metadata?.full_name || 'Atleta';

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setIsLoading(true);
        const [loadedRoutines, loadedSessions] = await Promise.all([
          routineService.getRoutines(user?.id),
          workoutService.getWorkoutSessions(user?.id),
        ]);
        setRoutines(loadedRoutines);
        setRecentSessions(loadedSessions);
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeData();
  }, [user]);

  // Si ya hay un entrenamiento en curso, ir directamente a él
  const handleResumeWorkout = () => {
    navigate('/workout/active');
  };

  // Determinar la próxima rutina sugerida
  const activeRoutine = routines.find((r) => r.isActive) || routines[0];
  const nextDay: WorkoutDay | null = activeRoutine?.days?.[0] || null;

  const handleStartWorkout = (day: WorkoutDay, routineName: string) => {
    startWorkout(day, routineName, recentSessions);
    navigate('/workout/active');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Saludo y Encabezado Personalizado */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
            Bienvenido a {APP_CONFIG.name}
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Hola, {displayName} 👋
          </h1>
        </div>
      </div>

      {/* Si hay un entrenamiento activo minimizado */}
      {isActive && (
        <div className="p-4 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 shadow-glow-primary flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-widest block">
              Entrenamiento en Progreso
            </span>
            <span className="text-base font-black text-white">Continúa tu rutina activa</span>
          </div>
          <Button size="sm" variant="primary" onClick={handleResumeWorkout}>
            CONTINUAR
          </Button>
        </div>
      )}

      {/* TARJETA GRANDE: TU PRÓXIMA RUTINA */}
      {nextDay && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E293B] via-[#151D2A] to-[#0D131F] border border-gym-border/80 shadow-2xl p-5">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Dumbbell className="w-32 h-32 text-emerald-400" />
          </div>

          <div className="relative z-10 space-y-4">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Flame className="w-3 h-3" />
                TU PRÓXIMA RUTINA
              </span>
              <h2 className="text-2xl font-black text-white mt-1.5 leading-tight">
                {nextDay.name}
              </h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                {activeRoutine?.name} · {nextDay.exercises.length} ejercicios · ~{Math.round(nextDay.exercises.length * 8.5)} min
              </p>
            </div>

            {/* Lista previa compacta de ejercicios */}
            <div className="space-y-1 py-1">
              {nextDay.exercises.slice(0, 3).map((ex, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs text-gray-300">
                  <span className="font-semibold truncate max-w-[200px]">
                    {idx + 1}. {ex.exercise?.name || 'Ejercicio'}
                  </span>
                  <span className="text-gray-400 text-[11px]">
                    {ex.targetSets} series · {ex.targetRepsMin}–{ex.targetRepsMax} reps
                  </span>
                </div>
              ))}
              {nextDay.exercises.length > 3 && (
                <span className="text-[11px] text-gray-400 block italic">
                  + {nextDay.exercises.length - 3} ejercicios más
                </span>
              )}
            </div>

            {/* BOTÓN GIGANTE "INICIAR RUTINA" */}
            <Button
              size="xl"
              fullWidth
              variant="primary"
              onClick={() => handleStartWorkout(nextDay, activeRoutine.name)}
              icon={<Play className="w-6 h-6 fill-current stroke-none" />}
            >
              INICIAR RUTINA
            </Button>
          </div>
        </div>
      )}

      {/* SECCIÓN: MIS RUTINAS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-1.5">
            <Calendar className="w-5 h-5 text-emerald-400" />
            MIS RUTINAS
          </h3>
          <Link
            to="/routines"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
          >
            Ver todas
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Carrusel / Lista rápida de días de rutinas */}
        <div className="grid grid-cols-1 gap-2.5">
          {routines.flatMap((r) =>
            r.days.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-gym-card border border-gym-border/70 hover:border-gray-500 transition-all"
              >
                <div>
                  <h4 className="text-sm font-bold text-white">{d.name}</h4>
                  <span className="text-[11px] text-gray-400 font-medium">
                    {r.name} · {d.exercises.length} ejercicios
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleStartWorkout(d, r.name)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500 hover:text-slate-950 transition-all flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Iniciar
                </button>
              </div>
            ))
          )}
        </div>

        {/* Botón "+ CREAR RUTINA" */}
        <Link to="/routines/new" className="block pt-1">
          <Button size="md" fullWidth variant="secondary" icon={<Plus className="w-4 h-4 stroke-[3]" />}>
            CREAR NUEVA RUTINA
          </Button>
        </Link>
      </div>

      {/* SECCIÓN: ENTRENAMIENTOS RECIENTES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-1.5">
            <History className="w-5 h-5 text-emerald-400" />
            ENTRENAMIENTOS RECIENTES
          </h3>
          <Link
            to="/history"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Historial completo
          </Link>
        </div>

        {recentSessions.length === 0 ? (
          <div className="text-center py-6 px-4 rounded-2xl bg-gym-card border border-gym-border/60">
            <p className="text-sm text-gray-400">Aún no has registrado ningún entrenamiento.</p>
            <p className="text-xs text-gray-400 mt-1">¡Presiona "INICIAR RUTINA" para comenzar tu primer día!</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentSessions.slice(0, 3).map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-2xl bg-gym-card border border-gym-border/60 flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    {formatDateSpanish(s.startedAt)}
                  </span>
                  <h4 className="text-sm font-bold text-white">{s.routineName} · {s.dayName}</h4>
                  <span className="text-xs text-gray-400">
                    {formatDurationHuman(s.durationSeconds)} · {formatWeight(s.totalVolume)}
                  </span>
                </div>
                <Link
                  to={`/history/${s.id}`}
                  className="p-2 rounded-xl text-gray-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};