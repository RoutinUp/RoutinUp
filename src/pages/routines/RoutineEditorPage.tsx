import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { routineService } from '../../services/routine.service';
import { exerciseService } from '../../services/exercise.service';
import { useAuthStore } from '../../store/useAuthStore';
import { WorkoutRoutine, WorkoutDay, WorkoutDayExercise, RoutineSetDetail } from '../../types/routine';
import { Exercise, MuscleGroup } from '../../types/exercise';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ExerciseImage } from '../../components/common/ExerciseImage';
import { FlexibleNumericInput } from '../../components/common/FlexibleNumericInput';
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Search,
  ChevronRight,
  Copy,
  Layers,
  Clock,
  Dumbbell,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

type MuscleFilterCategory =
  | 'todos'
  | 'pecho'
  | 'espalda'
  | 'piernas'
  | 'hombros'
  | 'brazos'
  | 'core'
  | 'otros';

const MUSCLE_FILTER_OPTIONS: {
  id: MuscleFilterCategory;
  label: string;
  matches: (mg: MuscleGroup) => boolean;
}[] = [
  { id: 'todos', label: 'Todos', matches: () => true },
  { id: 'pecho', label: 'Pecho', matches: (mg) => mg === 'pecho' },
  { id: 'espalda', label: 'Espalda', matches: (mg) => mg === 'espalda' },
  { id: 'piernas', label: 'Piernas', matches: (mg) => mg === 'piernas' },
  { id: 'hombros', label: 'Hombros', matches: (mg) => mg === 'hombros' },
  { id: 'brazos', label: 'Brazos', matches: (mg) => mg === 'biceps' || mg === 'triceps' },
  { id: 'core', label: 'Core / Abdomen', matches: (mg) => mg === 'core' },
  { id: 'otros', label: 'Otros', matches: (mg) => mg === 'cardio' || mg === 'cuerpo_completo' },
];

const MUSCLE_GROUP_DISPLAY_NAMES: Record<string, string> = {
  pecho: 'Pecho',
  espalda: 'Espalda',
  piernas: 'Piernas',
  hombros: 'Hombros',
  biceps: 'Bíceps (Brazos)',
  triceps: 'Tríceps (Brazos)',
  core: 'Abdomen / Core',
  cardio: 'Cardio',
  cuerpo_completo: 'Cuerpo Completo',
};

const ORDERED_MUSCLE_GROUPS: MuscleGroup[] = [
  'pecho',
  'espalda',
  'piernas',
  'hombros',
  'biceps',
  'triceps',
  'core',
  'cuerpo_completo',
  'cardio',
];

const ensureSetsConfig = (dayEx: WorkoutDayExercise): RoutineSetDetail[] => {
  if (dayEx.setsConfig && dayEx.setsConfig.length > 0) {
    return dayEx.setsConfig;
  }
  const count = Math.max(1, dayEx.targetSets || 4);
  const reps = dayEx.targetRepsMax || dayEx.targetRepsMin || 10;
  const weight = dayEx.targetWeight || 0;
  return Array.from({ length: count }, (_, i) => ({
    setNumber: i + 1,
    targetReps: reps,
    targetWeight: weight,
  }));
};

const hasVariedSets = (ex: WorkoutDayExercise): boolean => {
  if (!ex.setsConfig || ex.setsConfig.length <= 1) return false;
  const firstWeight = ex.setsConfig[0].targetWeight;
  const firstReps = ex.setsConfig[0].targetReps;
  return ex.setsConfig.some(
    (s) => s.targetWeight !== firstWeight || s.targetReps !== firstReps
  );
};

export const RoutineEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const isEditing = Boolean(id && id !== 'new');

  const [routineName, setRoutineName] = useState('');
  const [description, setDescription] = useState('');
  const [days, setDays] = useState<WorkoutDay[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // Registro de qué ejercicios tienen activado el desglose individual por serie
  const [customizedExercises, setCustomizedExercises] = useState<Record<string, boolean>>({});

  // Modal para seleccionar ejercicio
  const [isSelectExerciseModalOpen, setIsSelectExerciseModalOpen] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedMuscleCategory, setSelectedMuscleCategory] =
    useState<MuscleFilterCategory>('todos');

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const initData = async () => {
      const exercises = await exerciseService.getExercises(user?.id);
      setAllExercises(exercises);

      if (isEditing && id) {
        const found = await routineService.getRoutineById(id, user?.id);
        if (found) {
          setRoutineName(found.name);
          setDescription(found.description || '');

          const customMap: Record<string, boolean> = {};
          const normalizedDays = found.days.map((d) => ({
            ...d,
            exercises: d.exercises.map((ex) => {
              const config = ensureSetsConfig(ex);
              if (hasVariedSets(ex)) {
                customMap[ex.id] = true;
              }
              return {
                ...ex,
                targetSets: config.length,
                setsConfig: config,
              };
            }),
          }));

          setCustomizedExercises(customMap);
          setDays(normalizedDays);
          return;
        }
      }

      // Si es nueva rutina, inicializar con un día por defecto
      setRoutineName('Nueva Rutina');
      setDays([
        {
          id: 'day-' + Math.random().toString(36).substring(2, 9),
          routineId: '',
          name: 'Día 1: Entrenamiento',
          dayOrder: 1,
          exercises: [],
        },
      ]);
    };

    initData();
  }, [id, isEditing, user]);

  const handleAddDay = () => {
    const newDayNum = days.length + 1;
    const newDay: WorkoutDay = {
      id: 'day-' + Math.random().toString(36).substring(2, 9),
      routineId: id || '',
      name: `Día ${newDayNum}`,
      dayOrder: newDayNum,
      exercises: [],
    };
    setDays([...days, newDay]);
    setActiveDayIndex(days.length);
  };

  const handleRemoveDay = (index: number) => {
    if (days.length <= 1) return;
    const updated = days.filter((_, i) => i !== index);
    setDays(updated);
    setActiveDayIndex(Math.max(0, index - 1));
  };

  const handleUpdateDayName = (newName: string) => {
    const updated = [...days];
    if (updated[activeDayIndex]) {
      updated[activeDayIndex].name = newName;
      setDays(updated);
    }
  };

  const handleSelectExercise = (exercise: Exercise) => {
    const currentDay = days[activeDayIndex];
    if (!currentDay) return;

    const defaultSets = 4;
    const defaultReps = 10;
    const defaultWeight = 50;
    const initialSetsConfig: RoutineSetDetail[] = Array.from(
      { length: defaultSets },
      (_, i) => ({
        setNumber: i + 1,
        targetReps: defaultReps,
        targetWeight: defaultWeight,
      })
    );

    const newExercise: WorkoutDayExercise = {
      id: 'd-ex-' + Math.random().toString(36).substring(2, 9),
      workoutDayId: currentDay.id,
      exerciseId: exercise.id,
      exercise,
      exerciseOrder: currentDay.exercises.length + 1,
      targetSets: defaultSets,
      targetRepsMin: 8,
      targetRepsMax: defaultReps,
      targetWeight: defaultWeight,
      restSeconds: 90,
      notes: '',
      setsConfig: initialSetsConfig,
    };

    const updated = [...days];
    updated[activeDayIndex].exercises.push(newExercise);
    setDays(updated);
    setIsSelectExerciseModalOpen(false);
    setExerciseSearch('');
  };

  const handleUpdateExerciseConfig = (
    exIndex: number,
    field: keyof WorkoutDayExercise,
    value: any
  ) => {
    const updated = [...days];
    const currentDay = updated[activeDayIndex];
    if (currentDay && currentDay.exercises[exIndex]) {
      (currentDay.exercises[exIndex] as any)[field] = value;
      setDays(updated);
    }
  };

  const handleRemoveExercise = (exIndex: number) => {
    const updated = [...days];
    const currentDay = updated[activeDayIndex];
    if (currentDay) {
      currentDay.exercises = currentDay.exercises.filter((_, i) => i !== exIndex);
      setDays(updated);
    }
  };

  // --- Alternar modo simple vs. modo desglosado por serie ---
  const toggleCustomSets = (exerciseId: string, exIndex: number) => {
    const willBeCustom = !customizedExercises[exerciseId];
    setCustomizedExercises((prev) => ({
      ...prev,
      [exerciseId]: willBeCustom,
    }));

    // Si vuelve a modo simple, sincronizar el peso general con el de la serie 1
    if (!willBeCustom) {
      const updated = [...days];
      const currentDay = updated[activeDayIndex];
      if (currentDay && currentDay.exercises[exIndex]) {
        const ex = currentDay.exercises[exIndex];
        const sets = ensureSetsConfig(ex);
        const uniformWeight = sets[0]?.targetWeight ?? ex.targetWeight ?? 0;
        ex.targetWeight = uniformWeight;
        ex.setsConfig = sets.map((s) => ({ ...s, targetWeight: uniformWeight }));
        setDays(updated);
      }
    }
  };

  // --- Handlers para MODO SIMPLE (peso y repeticiones uniformes) ---
  const handleSimpleSetsChange = (exIndex: number, newCount: number) => {
    const updated = [...days];
    const currentDay = updated[activeDayIndex];
    if (!currentDay || !currentDay.exercises[exIndex]) return;

    const ex = currentDay.exercises[exIndex];
    const safeCount = Math.max(1, newCount);
    ex.targetSets = safeCount;

    const currentSets = ensureSetsConfig(ex);
    const baseWeight = ex.targetWeight || (currentSets[0]?.targetWeight ?? 0);
    const baseReps = ex.targetRepsMax || ex.targetRepsMin || (currentSets[0]?.targetReps ?? 10);

    const nextSets: RoutineSetDetail[] = Array.from({ length: safeCount }, (_, idx) => ({
      setNumber: idx + 1,
      targetReps: currentSets[idx]?.targetReps ?? baseReps,
      targetWeight: currentSets[idx]?.targetWeight ?? baseWeight,
    }));

    ex.setsConfig = nextSets;
    setDays(updated);
  };

  const handleSimpleWeightChange = (exIndex: number, newWeight: number) => {
    const updated = [...days];
    const currentDay = updated[activeDayIndex];
    if (!currentDay || !currentDay.exercises[exIndex]) return;

    const ex = currentDay.exercises[exIndex];
    ex.targetWeight = newWeight;

    const currentSets = ensureSetsConfig(ex);
    ex.setsConfig = currentSets.map((s) => ({
      ...s,
      targetWeight: newWeight,
    }));

    setDays(updated);
  };

  const handleSimpleRepsMinChange = (exIndex: number, newReps: number) => {
    const updated = [...days];
    const currentDay = updated[activeDayIndex];
    if (!currentDay || !currentDay.exercises[exIndex]) return;

    const ex = currentDay.exercises[exIndex];
    ex.targetRepsMin = newReps;
    if (ex.targetRepsMax < newReps) {
      ex.targetRepsMax = newReps;
    }

    const currentSets = ensureSetsConfig(ex);
    ex.setsConfig = currentSets.map((s) => ({
      ...s,
      targetReps: newReps,
    }));

    setDays(updated);
  };

  const handleSimpleRepsMaxChange = (exIndex: number, newReps: number) => {
    const updated = [...days];
    const currentDay = updated[activeDayIndex];
    if (!currentDay || !currentDay.exercises[exIndex]) return;

    const ex = currentDay.exercises[exIndex];
    ex.targetRepsMax = newReps;
    if (ex.targetRepsMin > newReps) {
      ex.targetRepsMin = newReps;
    }

    const currentSets = ensureSetsConfig(ex);
    ex.setsConfig = currentSets.map((s) => ({
      ...s,
      targetReps: newReps,
    }));

    setDays(updated);
  };

  // --- Handlers para MODO AVANZADO (desglose por serie) ---
  const handleAddSet = (exIndex: number) => {
    const updated = [...days];
    const currentDay = updated[activeDayIndex];
    if (!currentDay || !currentDay.exercises[exIndex]) return;

    const ex = currentDay.exercises[exIndex];
    const currentSets = ensureSetsConfig(ex);
    const lastSet = currentSets[currentSets.length - 1];

    const newSet: RoutineSetDetail = {
      setNumber: currentSets.length + 1,
      targetReps: lastSet ? lastSet.targetReps : 10,
      targetWeight: lastSet ? lastSet.targetWeight : 0,
    };

    const nextSets = [...currentSets, newSet];
    ex.setsConfig = nextSets;
    ex.targetSets = nextSets.length;
    setDays(updated);
  };

  const handleRemoveSet = (exIndex: number, setIdx: number) => {
    const updated = [...days];
    const currentDay = updated[activeDayIndex];
    if (!currentDay || !currentDay.exercises[exIndex]) return;

    const ex = currentDay.exercises[exIndex];
    const currentSets = ensureSetsConfig(ex);
    if (currentSets.length <= 1) return;

    const nextSets = currentSets
      .filter((_, idx) => idx !== setIdx)
      .map((s, idx) => ({ ...s, setNumber: idx + 1 }));

    ex.setsConfig = nextSets;
    ex.targetSets = nextSets.length;
    setDays(updated);
  };

  const handleUpdateSetField = (
    exIndex: number,
    setIdx: number,
    field: 'targetReps' | 'targetWeight',
    value: number
  ) => {
    const updated = [...days];
    const currentDay = updated[activeDayIndex];
    if (!currentDay || !currentDay.exercises[exIndex]) return;

    const ex = currentDay.exercises[exIndex];
    const currentSets = [...ensureSetsConfig(ex)];

    if (currentSets[setIdx]) {
      currentSets[setIdx] = {
        ...currentSets[setIdx],
        [field]: value,
      };
      ex.setsConfig = currentSets;

      if (setIdx === 0) {
        if (field === 'targetWeight') ex.targetWeight = value;
        if (field === 'targetReps') {
          ex.targetRepsMin = value;
          ex.targetRepsMax = value;
        }
      }
      setDays(updated);
    }
  };

  const handleCopyWeightToAll = (exIndex: number, weight: number) => {
    const updated = [...days];
    const currentDay = updated[activeDayIndex];
    if (!currentDay || !currentDay.exercises[exIndex]) return;

    const ex = currentDay.exercises[exIndex];
    const currentSets = ensureSetsConfig(ex).map((s) => ({
      ...s,
      targetWeight: weight,
    }));

    ex.setsConfig = currentSets;
    ex.targetWeight = weight;
    setDays(updated);
  };

  const handleCopyRepsToAll = (exIndex: number, reps: number) => {
    const updated = [...days];
    const currentDay = updated[activeDayIndex];
    if (!currentDay || !currentDay.exercises[exIndex]) return;

    const ex = currentDay.exercises[exIndex];
    const currentSets = ensureSetsConfig(ex).map((s) => ({
      ...s,
      targetReps: reps,
    }));

    ex.setsConfig = currentSets;
    ex.targetRepsMin = reps;
    ex.targetRepsMax = reps;
    setDays(updated);
  };

  const handleSaveRoutine = async () => {
    if (!routineName.trim()) return;

    try {
      setIsSaving(true);

      const normalizedDays: WorkoutDay[] = days.map((day) => ({
        ...day,
        exercises: day.exercises.map((ex) => {
          const sets = ensureSetsConfig(ex);
          return {
            ...ex,
            targetSets: sets.length,
            targetWeight: sets[0]?.targetWeight ?? ex.targetWeight ?? 0,
            targetRepsMin: sets[0]?.targetReps ?? ex.targetRepsMin ?? 10,
            targetRepsMax: sets[0]?.targetReps ?? ex.targetRepsMax ?? 10,
            setsConfig: sets,
          };
        }),
      }));

      const payload: WorkoutRoutine = {
        id: isEditing && id ? id : 'rot-' + Math.random().toString(36).substring(2, 9),
        userId: user?.id || 'local-user',
        name: routineName.trim(),
        description: description.trim(),
        isActive: true,
        days: normalizedDays,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await routineService.saveRoutine(payload, user?.id);
      navigate('/routines');
    } catch (err) {
      console.error('Error saving routine:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const currentDay = days[activeDayIndex];

  // Filtro y agrupación de ejercicios para el modal selector
  const activeFilterConfig = useMemo(() => {
    return (
      MUSCLE_FILTER_OPTIONS.find((opt) => opt.id === selectedMuscleCategory) ||
      MUSCLE_FILTER_OPTIONS[0]
    );
  }, [selectedMuscleCategory]);

  const filteredExercisesForModal = useMemo(() => {
    const query = exerciseSearch.trim().toLowerCase();
    return allExercises.filter((ex) => {
      const matchesCategory = activeFilterConfig.matches(ex.mainMuscleGroup);
      const matchesQuery =
        !query ||
        ex.name.toLowerCase().includes(query) ||
        ex.mainMuscleGroup.toLowerCase().includes(query) ||
        ex.equipment.toLowerCase().includes(query);

      return matchesCategory && matchesQuery;
    });
  }, [allExercises, exerciseSearch, activeFilterConfig]);

  const groupedExercisesForModal = useMemo(() => {
    const groups: { muscle: MuscleGroup; title: string; exercises: Exercise[] }[] = [];

    ORDERED_MUSCLE_GROUPS.forEach((mg) => {
      const matches = filteredExercisesForModal.filter((ex) => ex.mainMuscleGroup === mg);
      if (matches.length > 0) {
        groups.push({
          muscle: mg,
          title: MUSCLE_GROUP_DISPLAY_NAMES[mg] || mg,
          exercises: matches,
        });
      }
    });

    return groups;
  }, [filteredExercisesForModal]);

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/routines')}
          className="p-2 rounded-xl bg-gym-card text-gray-300 hover:text-white border border-gym-border transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black text-white">
          {isEditing ? 'Editar Rutina' : 'Crear Rutina'}
        </h1>
        <Button
          size="sm"
          variant="primary"
          onClick={handleSaveRoutine}
          isLoading={isSaving}
          icon={<Save className="w-4 h-4" />}
        >
          Guardar
        </Button>
      </div>

      {/* Nombre y Descripción */}
      <div className="bg-gym-card border border-gym-border rounded-3xl p-4 space-y-3">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
            Nombre de la Rutina
          </label>
          <input
            type="text"
            required
            value={routineName}
            onChange={(e) => setRoutineName(e.target.value)}
            placeholder="Ej: Push / Pull / Legs"
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-gym-border rounded-xl text-base font-bold text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
            Descripción (Opcional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Enfoque en hipertrofia y progresión de cargas"
            className="w-full px-3.5 py-2 bg-slate-900 border border-gym-border rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Pestañas de Días */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {days.map((day, idx) => (
            <button
              key={day.id}
              type="button"
              onClick={() => setActiveDayIndex(idx)}
              className={`
                px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all select-none
                ${
                  activeDayIndex === idx
                    ? 'bg-emerald-500 text-slate-950 shadow-glow-primary'
                    : 'bg-gym-card text-gray-300 border border-gym-border hover:border-gray-500'
                }
              `}
            >
              {day.name}
            </button>
          ))}
          <button
            type="button"
            onClick={handleAddDay}
            className="px-3 py-2 rounded-2xl bg-slate-800 text-emerald-400 hover:bg-slate-700 text-xs font-bold flex items-center gap-1 border border-gym-border transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            Día
          </button>
        </div>

        {/* Editor del Día Activo */}
        {currentDay && (
          <div className="bg-gym-card border border-gym-border rounded-3xl p-4 space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-gym-border/40 pb-3">
              <input
                type="text"
                value={currentDay.name}
                onChange={(e) => handleUpdateDayName(e.target.value)}
                className="text-base font-black text-white bg-transparent focus:outline-none border-b border-dashed border-gray-600 focus:border-emerald-500 w-full"
              />
              {days.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveDay(activeDayIndex)}
                  className="text-xs text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 flex items-center gap-1 transition-colors"
                  title="Eliminar este día"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Lista de Ejercicios en el Día */}
            <div className="space-y-4">
              {currentDay.exercises.length === 0 ? (
                <div className="text-center py-8 text-gray-400 border border-dashed border-gym-border/80 rounded-2xl p-4">
                  <Dumbbell className="w-8 h-8 text-gray-600 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold text-gray-300">
                    Este día no tiene ejercicios todavía.
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Presiona el botón de abajo para explorar el catálogo y añadir tu primer ejercicio.
                  </p>
                </div>
              ) : (
                currentDay.exercises.map((dayEx, exIdx) => {
                  const ex =
                    dayEx.exercise || allExercises.find((e) => e.id === dayEx.exerciseId);
                  const sets = ensureSetsConfig(dayEx);
                  const isCustom = Boolean(customizedExercises[dayEx.id]);

                  return (
                    <div
                      key={dayEx.id}
                      className="p-4 rounded-2xl bg-gym-bg border border-gym-border/80 space-y-3.5 shadow-sm"
                    >
                      {/* Cabecera del Ejercicio */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-gym-border flex-shrink-0 shadow-inner">
                            {ex && (
                              <ExerciseImage
                                imageUrl={ex.imageUrl}
                                name={ex.name}
                                muscleGroup={ex.mainMuscleGroup}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                {exIdx + 1}.{' '}
                                {MUSCLE_GROUP_DISPLAY_NAMES[ex?.mainMuscleGroup || ''] ||
                                  ex?.mainMuscleGroup}
                              </span>
                              {ex?.equipment && (
                                <span className="text-[10px] font-semibold text-gray-400 uppercase">
                                  · {ex.equipment}
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-white truncate mt-0.5">
                              {ex?.name || 'Ejercicio'}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Botón Toggle: Modo Simple vs Modo Avanzado Desglosado */}
                          <button
                            type="button"
                            onClick={() => toggleCustomSets(dayEx.id, exIdx)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all select-none ${
                              isCustom
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                                : 'bg-slate-900 text-gray-400 border border-gym-border hover:text-white hover:border-gray-500'
                            }`}
                            title={
                              isCustom
                                ? 'Cambiar a peso uniforme (Modo Simple)'
                                : 'Personalizar peso y repeticiones por cada serie'
                            }
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">
                              {isCustom ? 'Series Desglosadas' : 'Desglosar Series'}
                            </span>
                            {isCustom ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveExercise(exIdx)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors flex-shrink-0"
                            title="Eliminar ejercicio de la rutina"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* VISTA 1: MODO SIMPLE POR DEFECTO (Configuración rápida con peso y reps globales) */}
                      {!isCustom && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-4 gap-2 text-center text-xs">
                            <div className="bg-gym-card p-2 rounded-xl border border-gym-border/60">
                              <span className="text-[10px] text-gray-400 font-bold block mb-1">
                                Series
                              </span>
                              <FlexibleNumericInput
                                value={dayEx.targetSets || 4}
                                onChange={(val) => handleSimpleSetsChange(exIdx, val)}
                                min={1}
                                max={20}
                                step={1}
                                fallbackValue={4}
                                autoSelectOnFocus
                                className="w-full text-center font-black text-white bg-slate-900 border border-gym-border/80 rounded-lg py-1 text-sm focus:border-emerald-500 focus:outline-none"
                              />
                            </div>

                            <div className="bg-gym-card p-2 rounded-xl border border-gym-border/60">
                              <span className="text-[10px] text-gray-400 font-bold block mb-1">
                                Reps Mín
                              </span>
                              <FlexibleNumericInput
                                value={dayEx.targetRepsMin || 8}
                                onChange={(val) => handleSimpleRepsMinChange(exIdx, val)}
                                min={1}
                                max={50}
                                step={1}
                                fallbackValue={8}
                                autoSelectOnFocus
                                className="w-full text-center font-black text-white bg-slate-900 border border-gym-border/80 rounded-lg py-1 text-sm focus:border-emerald-500 focus:outline-none"
                              />
                            </div>

                            <div className="bg-gym-card p-2 rounded-xl border border-gym-border/60">
                              <span className="text-[10px] text-gray-400 font-bold block mb-1">
                                Reps Máx
                              </span>
                              <FlexibleNumericInput
                                value={dayEx.targetRepsMax || 10}
                                onChange={(val) => handleSimpleRepsMaxChange(exIdx, val)}
                                min={1}
                                max={50}
                                step={1}
                                fallbackValue={10}
                                autoSelectOnFocus
                                className="w-full text-center font-black text-white bg-slate-900 border border-gym-border/80 rounded-lg py-1 text-sm focus:border-emerald-500 focus:outline-none"
                              />
                            </div>

                            <div className="bg-gym-card p-2 rounded-xl border border-gym-border/60">
                              <span className="text-[10px] text-gray-400 font-bold block mb-1">
                                Peso (kg)
                              </span>
                              <FlexibleNumericInput
                                value={dayEx.targetWeight || 0}
                                onChange={(val) => handleSimpleWeightChange(exIdx, val)}
                                min={0}
                                max={999}
                                step={0.5}
                                fallbackValue={0}
                                autoSelectOnFocus
                                className="w-full text-center font-black text-emerald-400 bg-slate-900 border border-gym-border/80 rounded-lg py-1 text-sm focus:border-emerald-500 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
                            <span className="truncate">
                              💡 Peso uniforme de{' '}
                              <strong className="text-emerald-400 font-bold">
                                {dayEx.targetWeight || 0} kg
                              </strong>{' '}
                              para las {dayEx.targetSets || 4} series.
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleCustomSets(dayEx.id, exIdx)}
                              className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline flex-shrink-0 ml-2"
                            >
                              Personalizar por serie →
                            </button>
                          </div>
                        </div>
                      )}

                      {/* VISTA 2: MODO AVANZADO DESGLOSADO (Configuración individual de peso y repeticiones por cada serie) */}
                      {isCustom && (
                        <div className="bg-slate-950/60 rounded-xl border border-gym-border/60 p-3 space-y-2.5">
                          <div className="flex items-center justify-between text-xs pb-1.5 border-b border-gym-border/40 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <Layers className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="font-bold text-white tracking-wide text-xs">
                                DESGLOSE INDIVIDUAL ({sets.length} SERIES)
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px]">
                              {sets.length > 1 && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopyWeightToAll(exIdx, sets[0]?.targetWeight ?? 0)
                                    }
                                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 hover:underline transition-colors"
                                    title="Copiar el peso de la Serie 1 a todas las demás"
                                  >
                                    <Copy className="w-3 h-3" />
                                    Mismo peso
                                  </button>
                                  <span className="text-gray-600">|</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopyRepsToAll(exIdx, sets[0]?.targetReps ?? 10)
                                    }
                                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 hover:underline transition-colors"
                                    title="Copiar las repeticiones de la Serie 1 a todas las demás"
                                  >
                                    <Copy className="w-3 h-3" />
                                    Mismas reps
                                  </button>
                                  <span className="text-gray-600">|</span>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() => toggleCustomSets(dayEx.id, exIdx)}
                                className="text-gray-400 hover:text-white font-bold hover:underline"
                              >
                                Volver a modo simple
                              </button>
                            </div>
                          </div>

                          {/* Encabezado de columnas del desglose */}
                          <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-gray-400 px-1 uppercase tracking-wider">
                            <div className="col-span-2 text-center">Serie</div>
                            <div className="col-span-4 text-center">Reps</div>
                            <div className="col-span-4 text-center">Peso (kg)</div>
                            <div className="col-span-2 text-center">Borrar</div>
                          </div>

                          {/* Filas de Series con inputs fluidos */}
                          <div className="space-y-1.5">
                            {sets.map((set, setIdx) => (
                              <div
                                key={set.setNumber}
                                className="grid grid-cols-12 gap-2 items-center bg-gym-card/80 hover:bg-gym-card p-1.5 rounded-xl border border-gym-border/50 transition-colors"
                              >
                                <div className="col-span-2 text-center">
                                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-900 border border-gym-border text-xs font-black text-emerald-400">
                                    S{set.setNumber}
                                  </span>
                                </div>

                                <div className="col-span-4">
                                  <FlexibleNumericInput
                                    value={set.targetReps}
                                    onChange={(val) =>
                                      handleUpdateSetField(exIdx, setIdx, 'targetReps', val)
                                    }
                                    min={1}
                                    max={100}
                                    step={1}
                                    fallbackValue={10}
                                    placeholder="10"
                                    autoSelectOnFocus
                                    className="w-full text-center font-black text-white bg-slate-900 border border-gym-border rounded-lg py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                                  />
                                </div>

                                <div className="col-span-4">
                                  <FlexibleNumericInput
                                    value={set.targetWeight}
                                    onChange={(val) =>
                                      handleUpdateSetField(exIdx, setIdx, 'targetWeight', val)
                                    }
                                    min={0}
                                    max={999}
                                    step={0.5}
                                    fallbackValue={0}
                                    placeholder="0"
                                    autoSelectOnFocus
                                    className="w-full text-center font-black text-emerald-400 bg-slate-900 border border-gym-border rounded-lg py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                                  />
                                </div>

                                <div className="col-span-2 flex justify-center">
                                  <button
                                    type="button"
                                    disabled={sets.length <= 1}
                                    onClick={() => handleRemoveSet(exIdx, setIdx)}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      sets.length <= 1
                                        ? 'text-gray-600 cursor-not-allowed'
                                        : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                                    }`}
                                    title={
                                      sets.length <= 1
                                        ? 'Debe haber al menos 1 serie'
                                        : 'Eliminar esta serie'
                                    }
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Botón "+ Agregar Serie" */}
                          <button
                            type="button"
                            onClick={() => handleAddSet(exIdx)}
                            className="w-full py-2 border border-dashed border-gym-border hover:border-emerald-500/80 rounded-xl text-xs font-bold text-gray-300 hover:text-emerald-400 bg-slate-900/40 hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[3] text-emerald-400" />
                            Agregar Serie ({sets.length + 1})
                          </button>
                        </div>
                      )}

                      {/* Parámetros Generales: Descanso y Notas */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="bg-gym-card/70 p-2.5 rounded-xl border border-gym-border/60 flex items-center justify-between sm:justify-start gap-2">
                          <div className="flex items-center gap-1.5 text-gray-400">
                            <Clock className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[11px] font-bold">Descanso:</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FlexibleNumericInput
                              value={dayEx.restSeconds || 90}
                              onChange={(val) =>
                                handleUpdateExerciseConfig(exIdx, 'restSeconds', val)
                              }
                              min={15}
                              max={600}
                              step={15}
                              fallbackValue={90}
                              autoSelectOnFocus
                              className="w-14 text-center font-black text-white bg-slate-900 border border-gym-border/80 rounded-lg py-1 text-xs focus:border-emerald-500 focus:outline-none"
                            />
                            <span className="text-[10px] text-gray-400 font-bold">seg</span>
                          </div>
                        </div>

                        <div className="sm:col-span-2 bg-gym-card/70 p-2.5 rounded-xl border border-gym-border/60 flex items-center gap-2">
                          <span className="text-[11px] font-bold text-gray-400 flex-shrink-0">
                            Nota:
                          </span>
                          <input
                            type="text"
                            placeholder="Ej: Mantener escápulas retraídas, pausa 1s..."
                            value={dayEx.notes || ''}
                            onChange={(e) =>
                              handleUpdateExerciseConfig(exIdx, 'notes', e.target.value)
                            }
                            className="w-full text-xs text-gray-200 bg-transparent focus:outline-none placeholder-gray-500"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Botón "+ Agregar Ejercicio" */}
              <Button
                size="md"
                fullWidth
                variant="secondary"
                onClick={() => setIsSelectExerciseModalOpen(true)}
                icon={<Plus className="w-4 h-4 stroke-[3]" />}
              >
                AGREGAR EJERCICIO
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Selector Visual y Categorizado de Ejercicios */}
      <Modal
        isOpen={isSelectExerciseModalOpen}
        onClose={() => {
          setIsSelectExerciseModalOpen(false);
          setExerciseSearch('');
        }}
        title="Seleccionar Ejercicio"
        maxWidth="md"
      >
        <div className="space-y-3.5">
          {/* Buscador */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, músculo o equipamiento..."
              value={exerciseSearch}
              onChange={(e) => setExerciseSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-gym-border rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Categorización / Filtros por Grupo Muscular */}
          <div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
              {MUSCLE_FILTER_OPTIONS.map((cat) => {
                const isActive = selectedMuscleCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedMuscleCategory(cat.id)}
                    className={`
                      px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all select-none
                      ${
                        isActive
                          ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                          : 'bg-slate-900 text-gray-300 border border-gym-border hover:border-gray-500 hover:text-white'
                      }
                    `}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lista de ejercicios agrupados por grupo muscular */}
          <div className="max-h-96 overflow-y-auto space-y-4 pr-1 scrollbar-none">
            {groupedExercisesForModal.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Dumbbell className="w-7 h-7 text-gray-600 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-gray-300">
                  No se encontraron ejercicios
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Intenta buscar con otro término o selecciona otra categoría.
                </p>
              </div>
            ) : (
              groupedExercisesForModal.map((group) => (
                <div key={group.muscle} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-gray-300 uppercase tracking-wider py-1 px-1 border-b border-gym-border/40">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {group.title}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold lowercase tracking-normal">
                      {group.exercises.length}{' '}
                      {group.exercises.length === 1 ? 'ejercicio' : 'ejercicios'}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {group.exercises.map((ex) => (
                      <div
                        key={ex.id}
                        onClick={() => handleSelectExercise(ex)}
                        className="p-2.5 rounded-xl bg-slate-900/90 border border-gym-border hover:border-emerald-500/80 hover:bg-slate-850 transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-950 flex-shrink-0 border border-gym-border/60">
                            <ExerciseImage
                              imageUrl={ex.imageUrl}
                              name={ex.name}
                              muscleGroup={ex.mainMuscleGroup}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                              {ex.name}
                            </h5>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                              <span className="capitalize">{ex.equipment}</span>
                              <span>·</span>
                              <span className="capitalize text-gray-500">
                                {ex.difficultyLevel}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};