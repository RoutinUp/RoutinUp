import React, { useEffect, useState } from 'react';
import { exerciseService } from '../../services/exercise.service';
import { workoutService } from '../../services/workout.service';
import { routineService } from '../../services/routine.service';
import { useAuthStore } from '../../store/useAuthStore';
import { Exercise } from '../../types/exercise';
import { WorkoutRoutine } from '../../types/routine';
import { ExerciseProgressPoint, PersonalRecord } from '../../types/progress';
import { formatWeight, formatDateSpanish } from '../../utils/formatters';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import {
  Trophy,
  TrendingUp,
  Dumbbell,
  Award,
  Flame,
  ChevronRight,
  Star,
  Search,
  Sparkles,
  Layers,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export const ProgressPage: React.FC = () => {
  const { user } = useAuthStore();
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>('');
  const [selectedDayId, setSelectedDayId] = useState<string>('');
  const [allCatalogExercises, setAllCatalogExercises] = useState<Exercise[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [progressData, setProgressData] = useState<ExerciseProgressPoint[]>([]);
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        const [allExercises, prList, userRoutines, userSessions] = await Promise.all([
          exerciseService.getExercises(user?.id),
          workoutService.getPersonalRecords(user?.id),
          routineService.getRoutines(user?.id),
          workoutService.getWorkoutSessions(user?.id),
        ]);

        setAllCatalogExercises(allExercises);
        setRoutines(userRoutines);
        setRecords(prList);

        // Identificar rutina activa o primera rutina guardada
        const activeRoutine = userRoutines.find((r) => r.isActive) || userRoutines[0] || null;
        const initialRoutineId = activeRoutine?.id || '';
        const initialDay = activeRoutine?.days?.[0] || null;
        const initialDayId = initialDay?.id || '';
        const initialExerciseId = initialDay?.exercises?.[0]?.exerciseId || '';

        setSelectedRoutineId(initialRoutineId);
        setSelectedDayId(initialDayId);

        // Agrupar ejercicios activos en rutinas o historial
        const activeExerciseIds = new Set<string>();
        const activeExerciseNames = new Set<string>();

        userRoutines.forEach((routine) => {
          routine.days?.forEach((day) => {
            day.exercises?.forEach((ex) => {
              if (ex.exerciseId) activeExerciseIds.add(ex.exerciseId);
              if (ex.exercise?.id) activeExerciseIds.add(ex.exercise.id);
              if (ex.exercise?.slug) activeExerciseIds.add(ex.exercise.slug);
              if (ex.exercise?.name) activeExerciseNames.add(ex.exercise.name.toLowerCase().trim());
            });
          });
        });

        userSessions.forEach((session) => {
          session.exercises?.forEach((ex) => {
            if (ex.exerciseId) activeExerciseIds.add(ex.exerciseId);
            if (ex.exerciseName) activeExerciseNames.add(ex.exerciseName.toLowerCase().trim());
          });
        });

        prList.forEach((pr) => {
          if (pr.exerciseId) activeExerciseIds.add(pr.exerciseId);
          if (pr.exerciseName) activeExerciseNames.add(pr.exerciseName.toLowerCase().trim());
        });

        const relevantExercisesMap = new Map<string, Exercise>();

        allExercises.forEach((ex) => {
          const idMatches = activeExerciseIds.has(ex.id) || (ex.slug && activeExerciseIds.has(ex.slug));
          const nameMatches = activeExerciseNames.has(ex.name.toLowerCase().trim());
          if (idMatches || nameMatches) {
            relevantExercisesMap.set(ex.id, ex);
          }
        });

        userRoutines.forEach((routine) => {
          routine.days?.forEach((day) => {
            day.exercises?.forEach((dayEx) => {
              if (dayEx.exercise && dayEx.exercise.id) {
                const alreadyIncluded = Array.from(relevantExercisesMap.values()).some(
                  (e) => e.name.toLowerCase().trim() === dayEx.exercise!.name.toLowerCase().trim()
                );
                if (!alreadyIncluded) {
                  relevantExercisesMap.set(dayEx.exercise.id, dayEx.exercise);
                }
              }
            });
          });
        });

        const filteredList = Array.from(relevantExercisesMap.values()).sort((a, b) =>
          a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
        );

        setExercises(filteredList);

        if (initialExerciseId) {
          setSelectedExerciseId(initialExerciseId);
        } else if (filteredList.length > 0) {
          const defaultEx = filteredList.find((e) => e.slug.includes('press-banca')) || filteredList[0];
          setSelectedExerciseId(defaultEx.id);
        } else if (allExercises.length > 0) {
          setSelectedExerciseId(allExercises[0].id);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, [user]);

  // Selección de rutina
  const handleSelectRoutine = (routineId: string) => {
    setSelectedRoutineId(routineId);
    const routine = routines.find((r) => r.id === routineId);
    if (routine && routine.days.length > 0) {
      const firstDay = routine.days[0];
      setSelectedDayId(firstDay.id);
      if (firstDay.exercises.length > 0) {
        setSelectedExerciseId(firstDay.exercises[0].exerciseId);
      }
    } else {
      setSelectedDayId('');
    }
  };

  // Selección de día dentro de la rutina activa
  const handleSelectDay = (dayId: string) => {
    setSelectedDayId(dayId);
    const routine = routines.find((r) => r.id === selectedRoutineId) || routines[0];
    const day = routine?.days.find((d) => d.id === dayId);
    if (day && day.exercises.length > 0) {
      setSelectedExerciseId(day.exercises[0].exerciseId);
    }
  };

  const selectedRoutine = routines.find((r) => r.id === selectedRoutineId) || routines[0] || null;
  const currentDays = selectedRoutine?.days || [];
  const selectedDay = currentDays.find((d) => d.id === selectedDayId) || currentDays[0] || null;
  const currentDayExercises = selectedDay?.exercises || [];

  const selectedExercise =
    exercises.find((e) => e.id === selectedExerciseId) ||
    allCatalogExercises.find((e) => e.id === selectedExerciseId) ||
    currentDayExercises.find((e) => e.exerciseId === selectedExerciseId)?.exercise;

  useEffect(() => {
    if (!selectedExerciseId) {
      setProgressData([]);
      return;
    }

    const loadExerciseProgress = async () => {
      const exName = selectedExercise?.name;
      const data = await workoutService.getExerciseProgressData(selectedExerciseId, user?.id, exName);
      setProgressData(data);
    };

    loadExerciseProgress();
  }, [selectedExerciseId, user, selectedExercise?.name]);

  // PR match para este ejercicio seleccionado
  const prMatch = records.find(
    (r) =>
      Boolean(selectedExercise && r.exerciseName && r.exerciseName.toLowerCase().trim() === selectedExercise.name.toLowerCase().trim()) ||
      r.exerciseId === selectedExerciseId
  );

  // 1. Peso Máximo absoluto de todo el historial
  const maxWeightFromData = progressData.length > 0
    ? Math.max(...progressData.map((p) => p.maxWeight))
    : 0;
  const maxWeightEver = Math.max(maxWeightFromData, prMatch?.value || 0);

  // 2. Mayor Reps logradas en la mejor serie (con el peso máximo)
  const maxRepsEver = (() => {
    const topPoints = progressData.filter((p) => p.maxWeight === maxWeightEver);
    const fromPoints = topPoints.length > 0
      ? Math.max(...topPoints.map((p) => p.repsAtMaxWeight))
      : 0;
    const fromPR = (prMatch && prMatch.value === maxWeightEver) ? (prMatch.reps || 0) : 0;
    const result = Math.max(fromPoints, fromPR);
    if (result > 0) return result;
    return progressData.length > 0 ? Math.max(...progressData.map((p) => p.repsAtMaxWeight)) : (prMatch?.reps || 0);
  })();

  // 3. 1RM Estimado máximo absoluto
  const max1RMFromData = progressData.length > 0
    ? Math.max(...progressData.map((p) => p.estimatedOneRepMax))
    : 0;
  const pr1RM = prMatch
    ? (prMatch.reps === 1 ? prMatch.value : Math.round(prMatch.value * (1 + (prMatch.reps || 1) / 30) * 10) / 10)
    : 0;
  const max1RMEver = Math.max(max1RMFromData, pr1RM);

  // 4. Volumen Total acumulado
  const totalVolumeEver = progressData.reduce((acc, p) => acc + p.totalVolume, 0);

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Progreso & Récords</h1>
        <p className="text-xs text-gray-400">Analiza tu evolución y superación de marcas por rutina y ejercicios</p>
      </div>

      {/* 1. SECTOR SUPERIOR: EXPLORADOR POR RUTINA Y DÍAS */}
      <div className="bg-gym-card border border-gym-border rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-gym-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-black uppercase tracking-wider text-gray-300">
              Estructura de Entrenamiento
            </span>
          </div>

          {/* Selector desplegable de rutinas si hay más de 1 */}
          {routines.length > 1 && (
            <select
              value={selectedRoutineId}
              onChange={(e) => handleSelectRoutine(e.target.value)}
              className="px-2.5 py-1 text-xs font-bold bg-slate-900 border border-gym-border rounded-xl text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {routines.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.isActive ? '⭐ ' : ''}{r.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {routines.length === 0 ? (
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-gym-border text-center space-y-1">
            <p className="text-xs font-bold text-gray-300">No tienes rutinas guardadas todavía.</p>
            <p className="text-[11px] text-gray-500">
              Crea una rutina en "Mis Rutinas" o selecciona un ejercicio abajo para ver su evolución.
            </p>
          </div>
        ) : (
          <>
            {/* Nombre y Badge de Rutina Seleccionada */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                {selectedRoutine?.isActive && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                {selectedRoutine?.name || 'Rutina'}
              </h2>
              {selectedRoutine?.isActive && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  Rutina Activa
                </span>
              )}
            </div>

            {/* Pestañas de Días de la Rutina */}
            {currentDays.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {currentDays.map((day) => {
                  const isDaySelected = day.id === selectedDayId;
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => handleSelectDay(day.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 ${
                        isDaySelected
                          ? 'bg-emerald-500 text-black shadow-glow-primary font-black'
                          : 'bg-slate-900 text-gray-300 hover:text-white border border-gym-border/80'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      {day.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Lista de Tarjetas de Ejercicios del Día Seleccionado */}
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Ejercicios de este día (Toca uno para ver su evolución completa):
              </span>

              {currentDayExercises.length === 0 ? (
                <p className="text-xs text-gray-500 italic py-2">
                  No hay ejercicios configurados en este día.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {currentDayExercises.map((dayEx, idx) => {
                    const exName = dayEx.exercise?.name || 'Ejercicio';
                    const isSelected = selectedExerciseId === dayEx.exerciseId;
                    const exPR = records.find(
                      (r) =>
                        Boolean(dayEx.exercise?.name && r.exerciseName && r.exerciseName.toLowerCase().trim() === dayEx.exercise.name.toLowerCase().trim()) ||
                        r.exerciseId === dayEx.exerciseId
                    );

                    return (
                      <button
                        key={dayEx.id || `${dayEx.exerciseId}-${idx}`}
                        type="button"
                        onClick={() => setSelectedExerciseId(dayEx.exerciseId)}
                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/40 shadow-glow-primary/20'
                            : 'border-gym-border/70 bg-slate-900/70 hover:border-gray-600 hover:bg-slate-900'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                              {dayEx.exercise?.mainMuscleGroup || 'Fuerza'}
                            </span>
                            {isSelected && (
                              <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded-md">
                                <CheckCircle2 className="w-3 h-3" /> Viendo
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs sm:text-sm font-black text-white leading-tight whitespace-normal break-words">
                            {exName}
                          </h4>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-gym-border/40 flex items-center justify-between text-[11px]">
                          {exPR ? (
                            <span className="text-gray-300 font-semibold flex items-center gap-1">
                              <span className="text-amber-400">🔥 PR:</span>
                              <strong className="text-amber-400 font-bold">{exPR.value} kg × {exPR.reps} reps</strong>
                            </span>
                          ) : (
                            <span className="text-gray-500 italic text-[10px]">
                              Meta: {dayEx.targetSets}×{dayEx.targetRepsMin || 8}–{dayEx.targetRepsMax || 12}
                            </span>
                          )}
                          <ChevronRight className="w-3.5 h-3.5 text-gray-500 ml-1 flex-shrink-0" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* 2. SELECTOR SECUNDARIO: CONSULTAR CUALQUIER EJERCICIO DEL CATÁLOGO */}
      <div className="bg-gym-card border border-gym-border rounded-2xl p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-emerald-400" />
            Ver otro ejercicio del catálogo
          </label>
          <span className="text-[10px] text-gray-500">Catálogo general</span>
        </div>
        <select
          value={selectedExerciseId}
          onChange={(e) => setSelectedExerciseId(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-900 border border-gym-border rounded-xl text-sm font-bold text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="" disabled>-- Selecciona un ejercicio para ver su progreso --</option>
          {allCatalogExercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name} ({ex.mainMuscleGroup})
            </option>
          ))}
        </select>
      </div>

      {/* 3. VISTA DE EVOLUCIÓN DEL EJERCICIO SELECCIONADO */}
      <div className="space-y-4">
        {/* Cabecera del ejercicio bajo análisis */}
        <div className="bg-gym-card border border-emerald-500/40 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2 shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-0.5">
              Ejercicio Seleccionado
            </span>
            <h3 className="text-base sm:text-lg font-black text-white whitespace-normal break-words">
              {selectedExercise?.name || 'Selecciona un ejercicio'}
            </h3>
          </div>
          {selectedExercise?.mainMuscleGroup && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-800 text-gray-300 border border-gym-border">
              {selectedExercise.mainMuscleGroup}
            </span>
          )}
        </div>

        {/* 4 Indicadores Clave del Ejercicio */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-2xl bg-gym-card border border-gym-border/70 flex flex-col items-center text-center shadow-sm">
            <Dumbbell className="w-5 h-5 text-emerald-400 mb-1" />
            <span className="text-[10px] text-gray-400 uppercase font-bold">Peso Máximo</span>
            <span className="text-lg font-black text-white">{maxWeightEver} kg</span>
          </div>

          <div className="p-3 rounded-2xl bg-gym-card border border-gym-border/70 flex flex-col items-center text-center shadow-sm">
            <Flame className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-[10px] text-gray-400 uppercase font-bold">1RM Estimado</span>
            <span className="text-lg font-black text-amber-400">{max1RMEver} kg</span>
          </div>

          <div className="p-3 rounded-2xl bg-gym-card border border-gym-border/70 flex flex-col items-center text-center shadow-sm">
            <Award className="w-5 h-5 text-cyan-400 mb-1" />
            <span className="text-[10px] text-gray-400 uppercase font-bold">Mayor Reps</span>
            <span className="text-lg font-black text-white">{maxRepsEver} reps</span>
          </div>

          <div className="p-3 rounded-2xl bg-gym-card border border-gym-border/70 flex flex-col items-center text-center shadow-sm">
            <TrendingUp className="w-5 h-5 text-purple-400 mb-1" />
            <span className="text-[10px] text-gray-400 uppercase font-bold">Volumen Total</span>
            <span className="text-lg font-black text-white">{formatWeight(totalVolumeEver)}</span>
          </div>
        </div>

        {/* Gráfico 1: Evolución del Peso Máximo por Fecha */}
        <div className="rounded-3xl bg-gym-card border border-gym-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Evolución de Carga (kg)
            </h3>
            <span className="text-[10px] font-bold text-gray-400">Por fecha</span>
          </div>

          {progressData.length === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-gray-500 text-xs">
              <span>Aún no hay suficientes registros de este ejercicio.</span>
              <span className="text-[11px] text-gray-600 mt-1">Completa entrenamientos para trazar la curva.</span>
            </div>
          ) : (
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="formattedDate" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151D2A',
                      borderColor: '#2A3649',
                      borderRadius: '1rem',
                      color: '#FFF',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${val} kg`, 'Peso']}
                  />
                  <Line
                    type="monotone"
                    dataKey="maxWeight"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#10B981' }}
                    activeDot={{ r: 6, fill: '#34D399' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Gráfico 2: Volumen por Sesión (kg) */}
        <div className="rounded-3xl bg-gym-card border border-gym-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-cyan-400" />
              Volumen por Entrenamiento (kg)
            </h3>
            <span className="text-[10px] font-bold text-gray-400">Series × Reps × Peso</span>
          </div>

          {progressData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-500 text-xs">
              Sin datos de volumen registrados aún.
            </div>
          ) : (
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="formattedDate" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151D2A',
                      borderColor: '#2A3649',
                      borderRadius: '1rem',
                      color: '#FFF',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${val} kg`, 'Volumen']}
                  />
                  <Bar dataKey="totalVolume" fill="#06B6D4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* 4. VITRINA DE RÉCORDS PERSONALES (PRs) ÚNICOS */}
      <div className="rounded-3xl bg-gym-card border border-gym-border p-4 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            RÉCORDS PERSONALES (PRs)
          </h3>
          <span className="text-[10px] font-bold text-gray-400">Mejor marca por ejercicio</span>
        </div>

        {records.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">
            Los récords de peso se registrarán y celebrarán automáticamente al entrenar.
          </p>
        ) : (
          <div className="space-y-2">
            {records.map((pr) => (
              <div
                key={pr.id}
                onClick={() => pr.exerciseId && setSelectedExerciseId(pr.exerciseId)}
                className="p-3 rounded-2xl bg-gym-bg border border-amber-500/20 hover:border-amber-500/50 flex items-center justify-between transition-colors cursor-pointer"
                title="Toca para ver la evolución de este ejercicio"
              >
                <div>
                  <h4 className="text-xs font-bold text-white whitespace-normal break-words">
                    {pr.exerciseName}
                  </h4>
                  <span className="text-[10px] text-gray-400">
                    {formatDateSpanish(pr.achievedAt)}
                  </span>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className="text-sm font-black text-amber-400">
                    {pr.value} kg {pr.reps ? `× ${pr.reps} reps` : ''}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-gray-400 block">
                    Mayor Marca
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};