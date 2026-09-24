import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useActiveWorkoutStore } from '../../store/useActiveWorkoutStore';
import { routineService } from '../../services/routine.service';
import { workoutService } from '../../services/workout.service';
import { WorkoutRoutine, WorkoutDay } from '../../types/routine';
import { WorkoutSession } from '../../types/workout';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { CreateRoutineOptionsModal } from '../../components/routines/CreateRoutineOptionsModal';
import { PRESET_OPTIONS } from '../routines/RoutinesListPage';
import { APP_CONFIG } from '../../config/app.config';
import { formatDurationHuman, formatDateSpanish, formatWeight } from '../../utils/formatters';
import { Play, Plus, Dumbbell, Calendar, History, ArrowRight, Flame, Trophy, Star } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const { isActive, startWorkout } = useActiveWorkoutStore();

  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [importingIndex, setImportingIndex] = useState<number | null>(null);

  const displayName = profile?.displayName || user?.user_metadata?.full_name || 'Atleta';

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

  useEffect(() => {
    loadHomeData();
  }, [user]);

  // Si ya hay un entrenamiento en curso, ir directamente a él
  const handleResumeWorkout = () => {
    navigate('/workout/active');
  };

  // Determinar ÚNICAMENTE la rutina activa seleccionada por el usuario
  const activeRoutine = routines.find((r) => r.isActive) || null;

  // Determinar el día correspondiente a realizar en la rutina activa
  let nextDay: WorkoutDay | null = null;
  if (activeRoutine && activeRoutine.days && activeRoutine.days.length > 0) {
    const lastSession = recentSessions.find((s) => s.routineName === activeRoutine.name);
    if (lastSession) {
      const lastIdx = activeRoutine.days.findIndex((d) => d.name === lastSession.dayName);
      if (lastIdx >= 0) {
        nextDay = activeRoutine.days[(lastIdx + 1) % activeRoutine.days.length];
      } else {
        nextDay = activeRoutine.days[0];
      }
    } else {
      nextDay = activeRoutine.days[0];
    }
  }

  const handleStartWorkout = (day: WorkoutDay, routineName: string) => {
    startWorkout(day, routineName, recentSessions);
    navigate('/workout/active');
  };

  const handleImportPreset = async (index: number) => {
    try {
      setImportingIndex(index);
      await routineService.importPresetByIndex(index, user?.id);
      await loadHomeData();
      setIsTemplateModalOpen(false);
    } catch (err) {
      console.error('Error importando rutina base:', err);
    } finally {
      setImportingIndex(null);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Saludo y Encabezado Personalizado */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-gym-lime uppercase tracking-wider block">
            Bienvenido a {APP_CONFIG.name}
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Hola, {displayName} 👋
          </h1>
        </div>
      </div>

      {/* Si hay un entrenamiento activo minimizado */}
      {isActive && (
        <div className="p-4 rounded-3xl bg-gym-lime/15 border border-gym-lime/30 shadow-glow-lime flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gym-lime uppercase tracking-widest block">
              Entrenamiento en Progreso
            </span>
            <span className="text-base font-black text-white">Continúa tu rutina activa</span>
          </div>
          <Button size="sm" variant="primary" onClick={handleResumeWorkout}>
            CONTINUAR
          </Button>
        </div>
      )}

      {/* ESTADO INICIAL SI NO HAY RUTINA ACTIVA */}
      {!activeRoutine ? (
        <div className="rounded-3xl bg-gym-card border border-gym-border/90 p-6 sm:p-8 text-center space-y-5 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-gym-lime/15 border border-gym-lime/30 flex items-center justify-center text-gym-lime mx-auto shadow-glow-lime">
            <Dumbbell className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-xs mx-auto">
            <h3 className="text-lg font-black text-white tracking-tight">
              {routines.length === 0 ? 'No tienes ninguna rutina creada' : 'No tienes una rutina activa'}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {routines.length === 0
                ? 'Crea tu propia rutina con series y repeticiones a medida, o comienza al instante con una plantilla probada.'
                : 'Marca con una estrella tu rutina preferida en Mis Rutinas para ver tu próximo entrenamiento aquí.'}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
            <Button
              size="lg"
              fullWidth
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              icon={<Plus className="w-5 h-5 stroke-[2.5]" />}
            >
              CREAR NUEVA RUTINA
            </Button>
            {routines.length > 0 && (
              <Link to="/routines" className="w-full">
                <Button size="lg" fullWidth variant="secondary" icon={<Star className="w-5 h-5 fill-current" />}>
                  ELEGIR RUTINA ACTIVA
                </Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* TARJETA GRANDE: TU PRÓXIMA RUTINA */}
          {nextDay && (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#242738] via-[#1A1C28] to-[#13141C] border border-gym-border/80 shadow-2xl p-5">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Dumbbell className="w-32 h-32 text-gym-lime" />
              </div>

              <div className="relative z-10 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gym-lime/15 text-gym-lime border border-gym-lime/30 shadow-glow-lime">
                      <Flame className="w-3 h-3" />
                      TU PRÓXIMA RUTINA
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gym-lavender/15 text-gym-lavender border border-gym-lavender/30">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      {activeRoutine.name}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white mt-1.5 leading-tight">
                    {nextDay.name}
                  </h2>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">
                    {nextDay.exercises.length} ejercicios · ~{Math.round(nextDay.exercises.length * 8.5)} min
                  </p>
                </div>

                {/* Lista previa compacta de ejercicios */}
                <div className="space-y-1 py-1">
                  {nextDay.exercises.slice(0, 3).map((ex, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 text-xs text-gray-300">
                      <span className="font-semibold whitespace-normal break-words [word-break:break-word] flex-1 min-w-0">
                        {idx + 1}. {ex.exercise?.name || 'Ejercicio'}
                      </span>
                      <span className="text-gray-400 text-[11px] flex-shrink-0">
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
                  onClick={() => handleStartWorkout(nextDay!, activeRoutine.name)}
                  icon={<Play className="w-6 h-6 fill-current stroke-none" />}
                >
                  INICIAR RUTINA
                </Button>
              </div>
            </div>
          )}

          {/* SECCIÓN: DÍAS DE LA RUTINA ACTIVA */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                <Calendar className="w-5 h-5 text-gym-lime" />
                DÍAS DE {activeRoutine.name.toUpperCase()}
              </h3>
              <Link
                to="/routines"
                className="text-xs font-bold text-gym-lime hover:text-lime-300 transition-colors flex items-center gap-1"
              >
                Cambiar rutina
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Lista de días de la rutina activa */}
            <div className="grid grid-cols-1 gap-2.5">
              {activeRoutine.days.map((d) => {
                const isNext = nextDay?.id === d.id;
                return (
                  <div
                    key={d.id}
                    className={`flex items-center justify-between p-4 rounded-3xl border transition-all ${
                      isNext
                        ? 'bg-gym-card border-gym-lime/40 shadow-sm'
                        : 'bg-gym-card/60 border-gym-border/60 hover:border-gray-500'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{d.name}</h4>
                        {isNext && (
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gym-lime/15 text-gym-lime border border-gym-lime/30">
                            Siguiente
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 font-medium">
                        {d.exercises.length} {d.exercises.length === 1 ? 'ejercicio' : 'ejercicios'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleStartWorkout(d, activeRoutine.name)}
                      className="px-3.5 py-1.5 rounded-full bg-gym-lime/15 text-gym-lime border border-gym-lime/30 text-xs font-bold hover:bg-gym-lime hover:text-slate-950 transition-all flex items-center gap-1 shadow-sm"
                    >
                      <Play className="w-3 h-3 fill-current stroke-none" />
                      Iniciar
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Botón "+ CREAR OTRA RUTINA" */}
            <div className="pt-1">
              <Button
                size="md"
                fullWidth
                variant="secondary"
                onClick={() => setIsCreateModalOpen(true)}
                icon={<Plus className="w-4 h-4 stroke-[3]" />}
              >
                CREAR OTRA RUTINA
              </Button>
            </div>
          </div>
        </>
      )}

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
            <p className="text-xs text-gray-400 mt-1">¡Comienza tu primera sesión para construir tu historial!</p>
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

      {/* Modal Opciones de Creación */}
      <CreateRoutineOptionsModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSelectCreateBlank={() => navigate('/routines/new')}
        onSelectGenerateAI={() => navigate('/routines/new?mode=ai')}
        onSelectTemplate={() => setIsTemplateModalOpen(true)}
      />

      {/* Modal Plantillas Predeterminadas */}
      <Modal
        isOpen={isTemplateModalOpen}
        onClose={() => importingIndex === null && setIsTemplateModalOpen(false)}
        title="Plantillas Predeterminadas de 3 Días"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-400">
            Selecciona una rutina completa prediseñada con ejercicios, series, repeticiones y cargas iniciales:
          </p>

          <div className="space-y-3">
            {PRESET_OPTIONS.map((preset) => (
              <div
                key={preset.index}
                className="p-4 rounded-2xl bg-gym-bg border border-gym-border/80 hover:border-emerald-500/50 transition-all flex flex-col justify-between gap-3 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h4 className="text-sm font-black text-white">{preset.title}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed mb-2.5">
                    {preset.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {preset.days.map((day, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-900 text-gray-300 px-2 py-0.5 rounded-lg border border-gym-border font-medium"
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end border-t border-gym-border/40">
                  <Button
                    size="sm"
                    variant="primary"
                    isLoading={importingIndex === preset.index}
                    disabled={importingIndex !== null}
                    onClick={() => handleImportPreset(preset.index)}
                  >
                    Cargar Esta Plantilla
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              size="sm"
              variant="ghost"
              disabled={importingIndex !== null}
              onClick={() => setIsTemplateModalOpen(false)}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};