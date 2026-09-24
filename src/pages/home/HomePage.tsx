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
import { getUserGreeting } from '../../utils/user';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Play, Plus, Dumbbell, Calendar, History, ArrowRight, Flame, Star } from 'lucide-react';

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
    <div className="space-y-6 pb-20 select-none">
      {/* Saludo y Encabezado Dinámico con Supabase */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-gym-primary uppercase tracking-widest block">
            Bienvenido a {APP_CONFIG.name}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 tracking-tight mt-0.5">
            {getUserGreeting(user, profile)}
          </h1>
        </div>
      </div>

      {/* Si hay un entrenamiento activo minimizado */}
      {isActive && (
        <Card className="border-gym-primary/40 bg-gym-primary/10 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-gym-primary uppercase tracking-widest block">
                Entrenamiento en Progreso
              </span>
              <span className="text-sm sm:text-base font-bold text-zinc-100">Continúa tu rutina activa</span>
            </div>
            <Button size="sm" variant="primary" onClick={handleResumeWorkout}>
              CONTINUAR
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ESTADO INICIAL SI NO HAY RUTINA ACTIVA */}
      {!activeRoutine ? (
        <Card className="p-6 sm:p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-gym-primary/10 border border-gym-primary/20 flex items-center justify-center text-gym-primary mx-auto">
            <Dumbbell className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-xs mx-auto">
            <h3 className="text-lg font-black text-zinc-100 tracking-tight">
              {routines.length === 0 ? 'No tienes ninguna rutina creada' : 'No tienes una rutina activa'}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
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
        </Card>
      ) : (
        <>
          {/* TARJETA GRANDE: TU PRÓXIMA RUTINA (shadcn Card) */}
          {nextDay && (
            <Card className="relative overflow-hidden border-[#27272A] bg-[#18181B] shadow-sm">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <Dumbbell className="w-32 h-32 text-gym-primary" />
              </div>

              <CardContent className="p-5 sm:p-6 space-y-4 relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant="default" className="gap-1">
                      <Flame className="w-3 h-3" />
                      TU PRÓXIMA RUTINA
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      {activeRoutine.name}
                    </Badge>
                  </div>
                  <h2 className="text-2xl font-black text-zinc-100 mt-1 leading-tight">
                    {nextDay.name}
                  </h2>
                  <p className="text-xs text-zinc-400 font-medium mt-1">
                    {nextDay.exercises.length} ejercicios · ~{Math.round(nextDay.exercises.length * 8.5)} min estimados
                  </p>
                </div>

                {/* Lista previa compacta de ejercicios */}
                <div className="space-y-1.5 py-1">
                  {nextDay.exercises.slice(0, 3).map((ex, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 text-xs text-zinc-300">
                      <span className="font-medium whitespace-normal break-words [word-break:break-word] flex-1 min-w-0">
                        {idx + 1}. {ex.exercise?.name || 'Ejercicio'}
                      </span>
                      <span className="text-zinc-500 text-[11px] flex-shrink-0">
                        {ex.targetSets} series · {ex.targetRepsMin}–{ex.targetRepsMax} reps
                      </span>
                    </div>
                  ))}
                  {nextDay.exercises.length > 3 && (
                    <span className="text-[11px] text-zinc-500 block italic">
                      + {nextDay.exercises.length - 3} ejercicios más
                    </span>
                  )}
                </div>

                {/* BOTÓN GIGANTE "INICIAR RUTINA" con bordes redondeados (16px) e impacto visual */}
                <Button
                  size="xl"
                  fullWidth
                  variant="primary"
                  onClick={() => handleStartWorkout(nextDay!, activeRoutine.name)}
                  className="rounded-2xl font-black tracking-wider text-zinc-950 bg-gym-primary hover:bg-lime-400 shadow-md hover:shadow-gym-primary/20 py-4 transition-transform active:scale-[0.99]"
                  icon={<Play className="w-5 h-5 fill-current stroke-none" />}
                >
                  INICIAR RUTINA
                </Button>
              </CardContent>
            </Card>
          )}

          {/* SECCIÓN: DÍAS DE LA RUTINA ACTIVA */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-zinc-200 tracking-wider uppercase flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gym-primary" />
                DÍAS DE {activeRoutine.name.toUpperCase()}
              </h3>
              <Link
                to="/routines"
                className="text-xs font-bold text-gym-primary hover:text-lime-400 transition-colors flex items-center gap-1"
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
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      isNext
                        ? 'bg-[#18181B] border-gym-primary/40 shadow-sm'
                        : 'bg-[#18181B] border-[#27272A] hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-zinc-100">{d.name}</h4>
                        {isNext && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gym-primary/10 text-gym-primary border border-gym-primary/20">
                            Siguiente
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-400 font-medium">
                        {d.exercises.length} {d.exercises.length === 1 ? 'ejercicio' : 'ejercicios'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleStartWorkout(d, activeRoutine.name)}
                      className="px-3.5 py-1.5 rounded-full bg-gym-primary/10 text-gym-primary border border-gym-primary/20 text-xs font-bold hover:bg-gym-primary hover:text-zinc-950 transition-all flex items-center gap-1 shadow-sm"
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
          <h3 className="text-sm font-black text-zinc-200 tracking-wider uppercase flex items-center gap-1.5">
            <History className="w-4 h-4 text-gym-primary" />
            ENTRENAMIENTOS RECIENTES
          </h3>
          <Link
            to="/history"
            className="text-xs font-bold text-gym-primary hover:text-lime-400 transition-colors"
          >
            Historial completo
          </Link>
        </div>

        {recentSessions.length === 0 ? (
          <Card className="text-center py-6 px-4">
            <p className="text-sm text-zinc-400">Aún no has registrado ningún entrenamiento.</p>
            <p className="text-xs text-zinc-500 mt-1">¡Comienza tu primera sesión para construir tu historial!</p>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {recentSessions.slice(0, 3).map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-2xl bg-[#18181B] border border-[#27272A] flex items-center justify-between hover:border-zinc-700 transition-colors"
              >
                <div>
                  <span className="text-[10px] font-bold text-gym-primary uppercase tracking-wider block">
                    {formatDateSpanish(s.startedAt)}
                  </span>
                  <h4 className="text-sm font-bold text-zinc-100">{s.routineName} · {s.dayName}</h4>
                  <span className="text-xs text-zinc-400">
                    {formatDurationHuman(s.durationSeconds)} · {formatWeight(s.totalVolume)}
                  </span>
                </div>
                <Link
                  to={`/history/${s.id}`}
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 bg-[#27272A] hover:bg-zinc-700 transition-colors"
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

      {/* Modal Selector de Plantillas Predeterminadas */}
      <Modal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        title="Plantillas de Rutina (3 Días)"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-400">
            Selecciona una rutina probada para importarla a tu cuenta:
          </p>

          <div className="space-y-3">
            {PRESET_OPTIONS.map((preset) => (
              <div
                key={preset.index}
                className="p-4 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-2.5 hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-zinc-100">{preset.title}</h4>
                  <Badge variant="default">
                    {preset.badge}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {preset.description}
                </p>
                <div className="space-y-1 py-1">
                  {preset.days.map((dayName, dIdx) => (
                    <div key={dIdx} className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gym-primary" />
                      <span>{dayName}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-1">
                  <Button
                    size="sm"
                    fullWidth
                    variant="primary"
                    isLoading={importingIndex === preset.index}
                    onClick={() => handleImportPreset(preset.index)}
                  >
                    USAR ESTA PLANTILLA
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};