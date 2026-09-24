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
import { getUserGreeting, getUserDisplayName, getUserAvatarUrl, getUserInitials } from '../../utils/user';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Play, Plus, Dumbbell, Calendar, History, ArrowRight, Flame, Star, Sparkles } from 'lucide-react';

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

  const now = new Date();
  const currentMonthYear = now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const currentDayOfWeek = (now.getDay() + 6) % 7; // Lunes = 0, Domingo = 6
  const monday = new Date(now);
  monday.setDate(now.getDate() - currentDayOfWeek);

  const weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map((label, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    return {
      label,
      dateNumber: d.getDate(),
      isToday: d.toDateString() === now.toDateString(),
    };
  });

  const userName = getUserDisplayName(user, profile) || 'Atleta';
  const userInitials = getUserInitials(user, profile);
  const avatarUrl = getUserAvatarUrl(user, profile);

  const dayBlockColors = [
    {
      bg: 'bg-[#D8F84A]',
      text: 'text-[#0A0A0C]',
      badgeBg: 'bg-black/10 text-[#0A0A0C] border-black/15',
      badgeNext: 'bg-black text-[#D8F84A]',
      btnBg: 'bg-black text-white hover:bg-zinc-900',
    },
    {
      bg: 'bg-[#D4B8FE]',
      text: 'text-[#0A0A0C]',
      badgeBg: 'bg-black/10 text-[#0A0A0C] border-black/15',
      badgeNext: 'bg-black text-[#D4B8FE]',
      btnBg: 'bg-black text-white hover:bg-zinc-900',
    },
    {
      bg: 'bg-[#FF9B80]',
      text: 'text-[#0A0A0C]',
      badgeBg: 'bg-black/10 text-[#0A0A0C] border-black/15',
      badgeNext: 'bg-black text-[#FF9B80]',
      btnBg: 'bg-black text-white hover:bg-zinc-900',
    },
    {
      bg: 'bg-[#93C5FD]',
      text: 'text-[#0A0A0C]',
      badgeBg: 'bg-black/10 text-[#0A0A0C] border-black/15',
      badgeNext: 'bg-black text-[#93C5FD]',
      btnBg: 'bg-black text-white hover:bg-zinc-900',
    },
  ];

  return (
    <div className="space-y-5 pb-20 select-none">
      {/* Saludo y Encabezado Dinámico con Supabase (Estilo Referencia Screen 1) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {getUserGreeting(user, profile)}
            </h1>
            <p className="text-xs text-zinc-400 font-medium mt-0.5 flex items-center gap-1.5">
              <span>💚</span> ¡Que tengas un día de entrenamiento productivo!
            </p>
          </div>
          <Link
            to="/settings"
            className="w-10 h-10 rounded-full bg-[#181920] border border-[#272833] flex items-center justify-center text-zinc-300 hover:text-white hover:border-[#008000] transition-colors"
            title="Mi perfil"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={userName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-xs font-black text-[#008000]">{userInitials}</span>
            )}
          </Link>
        </div>

        {/* Píldoras de estado del usuario (como en la referencia) */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#D4B8FE]/20 text-[#D4B8FE] border border-[#D4B8FE]/30 select-none">
            {activeRoutine ? activeRoutine.name : 'Sin rutina activa'}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FF8A65]/20 text-[#FF8A65] border border-[#FF8A65]/30 select-none">
            {recentSessions.length} {recentSessions.length === 1 ? 'entrenamiento completado' : 'entrenamientos completados'}
          </span>
        </div>
      </div>

      {/* Franja de Calendario Semanal (Estilo Referencia Screen 1) */}
      <div className="p-3.5 rounded-[20px] bg-[#181920] border border-[#272833] space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-400 px-1">
          <span className="capitalize text-zinc-300">{currentMonthYear}</span>
          <span className="text-[10px] text-zinc-500 font-semibold">Semana en curso</span>
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
          {weekDays.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{d.label}</span>
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  d.isToday
                    ? 'bg-white text-zinc-950 shadow-lg scale-105 ring-2 ring-white/30'
                    : 'bg-[#121318] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {d.dateNumber}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Si hay un entrenamiento activo minimizado (Estilo Royal Blue de la Referencia) */}
      {isActive && (
        <div className="rounded-[20px] bg-[#5055E8] text-white p-4 sm:p-5 flex items-center justify-between shadow-xl border border-white/10">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
                Entrenamiento en Progreso
              </span>
            </div>
            <span className="text-sm sm:text-base font-black text-white">Continúa tu rutina activa</span>
          </div>
          <button
            type="button"
            onClick={handleResumeWorkout}
            className="px-4 py-2 rounded-xl bg-black text-white font-black text-xs hover:bg-zinc-900 transition-all shadow-md active:scale-95"
          >
            CONTINUAR →
          </button>
        </div>
      )}

      {/* ESTADO INICIAL SI NO HAY RUTINA ACTIVA */}
      {!activeRoutine ? (
        <Card className="p-6 sm:p-8 text-center space-y-5 rounded-[20px] bg-[#181920] border-[#272833]">
          <div className="w-14 h-14 rounded-2xl bg-[#008000]/10 border border-[#008000]/25 flex items-center justify-center text-[#008000] mx-auto">
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
          {/* TARJETA DE BLOQUE DE COLOR COMPLETO: TU PRÓXIMA RUTINA (Full Color Block Card - Estilo Referencia) */}
          {nextDay && (
            <div className="relative overflow-hidden rounded-[20px] bg-[#D4B8FE] p-5 sm:p-6 text-[#0A0A0C] shadow-xl border border-black/10">
              <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                <Dumbbell className="w-36 h-36 text-black" />
              </div>

              <div className="relative z-10 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black text-[#D4B8FE] shadow-sm select-none">
                      <Flame className="w-3 h-3 fill-current" />
                      TU PRÓXIMA RUTINA
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-black/10 text-[#0A0A0C] border border-black/15 select-none">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      {activeRoutine.name}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-black/10 text-[#0A0A0C] border border-black/15 select-none">
                      Enfoque: {nextDay.name}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#0A0A0C] tracking-tight leading-tight mt-1">
                    {nextDay.name}
                  </h2>
                  <p className="text-xs text-[#0A0A0C]/80 font-bold mt-1">
                    {nextDay.exercises.length} ejercicios · ~{Math.round(nextDay.exercises.length * 8.5)} min estimados · {nextDay.exercises.reduce((acc, ex) => acc + ex.targetSets, 0)} series totales
                  </p>
                </div>

                {/* Lista previa compacta de ejercicios en bloque */}
                <div className="space-y-1.5 py-1">
                  {nextDay.exercises.slice(0, 3).map((ex, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 text-xs font-bold text-[#0A0A0C]/90 bg-black/5 px-3.5 py-2 rounded-xl border border-black/5"
                    >
                      <span className="whitespace-normal break-words [word-break:break-word] flex-1 min-w-0">
                        {idx + 1}. {ex.exercise?.name || 'Ejercicio'}
                      </span>
                      <span className="text-[#0A0A0C]/75 text-[11px] font-black flex-shrink-0">
                        {ex.targetSets} series · {ex.targetRepsMin}–{ex.targetRepsMax} reps
                      </span>
                    </div>
                  ))}
                  {nextDay.exercises.length > 3 && (
                    <span className="text-[11px] text-[#0A0A0C]/70 block font-bold italic px-1">
                      + {nextDay.exercises.length - 3} ejercicios más configurados
                    </span>
                  )}
                </div>

                {/* BOTÓN INTERNO EN CONTRASTE OSCURO */}
                <button
                  type="button"
                  onClick={() => handleStartWorkout(nextDay!, activeRoutine.name)}
                  className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-black hover:bg-zinc-900 active:scale-[0.99] text-white font-black text-sm tracking-wider uppercase py-4 shadow-md transition-all select-none"
                >
                  <Play className="w-4 h-4 fill-current stroke-none" />
                  INICIAR ENTRENAMIENTO
                </button>
              </div>
            </div>
          )}

          {/* SECCIÓN: DÍAS DE LA RUTINA ACTIVA (Tarjetas por bloques coloridos estilo Screen 3) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-zinc-200 tracking-wider uppercase flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#008000]" />
                DÍAS DE {activeRoutine.name.toUpperCase()}
              </h3>
              <Link
                to="/routines"
                className="text-xs font-bold text-[#008000] hover:text-green-500 transition-colors flex items-center gap-1"
              >
                Cambiar rutina
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Lista de días de la rutina activa en bloques coloridos */}
            <div className="grid grid-cols-1 gap-3">
              {activeRoutine.days.map((d, dIdx) => {
                const isNext = nextDay?.id === d.id;
                const color = dayBlockColors[dIdx % dayBlockColors.length];
                return (
                  <div
                    key={d.id}
                    className={`flex items-center justify-between p-4 sm:p-5 rounded-[20px] transition-all shadow-md ${color.bg} ${color.text} ${
                      isNext ? 'ring-2 ring-white/40 shadow-lg' : ''
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-black tracking-tight">{d.name}</h4>
                        {isNext && (
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${color.badgeNext}`}>
                            Siguiente
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${color.badgeBg}`}>
                          {d.exercises.length} {d.exercises.length === 1 ? 'ejercicio' : 'ejercicios'}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${color.badgeBg}`}>
                          ~{Math.round(d.exercises.length * 8.5)} min
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleStartWorkout(d, activeRoutine.name)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md active:scale-95 ${color.btnBg}`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current stroke-none" />
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
            <History className="w-4 h-4 text-[#008000]" />
            ENTRENAMIENTOS RECIENTES
          </h3>
          <Link
            to="/history"
            className="text-xs font-bold text-[#008000] hover:text-green-500 transition-colors"
          >
            Historial completo
          </Link>
        </div>

        {recentSessions.length === 0 ? (
          <Card className="text-center py-6 px-4 rounded-[20px] bg-[#181920] border-[#272833]">
            <p className="text-sm text-zinc-400">Aún no has registrado ningún entrenamiento.</p>
            <p className="text-xs text-zinc-500 mt-1">¡Comienza tu primera sesión para construir tu historial!</p>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {recentSessions.slice(0, 3).map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-[20px] bg-[#181920] border border-[#272833] flex items-center justify-between hover:border-zinc-700 transition-colors"
              >
                <div>
                  <span className="text-[10px] font-bold text-[#008000] uppercase tracking-wider block">
                    {formatDateSpanish(s.startedAt)}
                  </span>
                  <h4 className="text-sm font-bold text-zinc-100">{s.routineName} · {s.dayName}</h4>
                  <span className="text-xs text-zinc-400">
                    {formatDurationHuman(s.durationSeconds)} · {formatWeight(s.totalVolume)}
                  </span>
                </div>
                <Link
                  to={`/history/${s.id}`}
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 bg-[#272833] hover:bg-zinc-700 transition-colors"
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
                className="p-4 rounded-[20px] bg-[#181920] border border-[#272833] space-y-2.5 hover:border-zinc-700 transition-all"
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
                      <span className="w-1.5 h-1.5 rounded-full bg-[#008000]" />
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