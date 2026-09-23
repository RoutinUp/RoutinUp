import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { routineService } from '../../services/routine.service';
import { exerciseService } from '../../services/exercise.service';
import { useAuthStore } from '../../store/useAuthStore';
import {
  WorkoutRoutine,
  WorkoutDay,
  WorkoutDayExercise,
  RoutineSetDetail,
} from '../../types/routine';
import { Exercise, MuscleGroup } from '../../types/exercise';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ExerciseImage } from '../../components/common/ExerciseImage';
import { FlexibleNumericInput } from '../../components/common/FlexibleNumericInput';
import { geminiService } from '../../services/gemini.service';
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
  Sparkles,
  PenLine,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

type MuscleFilterCategory =
  | 'todos'
  | 'pecho'
  | 'espalda'
  | 'piernas'
  | 'hombros'
  | 'brazos'
  | 'core';

interface MuscleFilterOption {
  id: MuscleFilterCategory;
  label: string;
  matches: (group: MuscleGroup) => boolean;
}

const MUSCLE_FILTER_OPTIONS: MuscleFilterOption[] = [
  { id: 'todos', label: 'Todos', matches: () => true },
  { id: 'pecho', label: 'Pecho', matches: (g) => g === 'pecho' },
  { id: 'espalda', label: 'Espalda', matches: (g) => g === 'espalda' },
  {
    id: 'piernas',
    label: 'Piernas',
    matches: (g) =>
      ['piernas', 'cuadriceps', 'isquios', 'pantorrillas', 'gluteos'].includes(g),
  },
  { id: 'hombros', label: 'Hombros', matches: (g) => g === 'hombros' },
  {
    id: 'brazos',
    label: 'Brazos',
    matches: (g) => ['biceps', 'triceps', 'antebrazos'].includes(g),
  },
  { id: 'core', label: 'Core', matches: (g) => ['abdominales', 'core'].includes(g) },
];

const MUSCLE_GROUP_DISPLAY_NAMES: Record<string, string> = {
  pecho: 'Pecho',
  espalda: 'Espalda',
  piernas: 'Piernas',
  cuadriceps: 'Cuádriceps',
  isquios: 'Isquios',
  pantorrillas: 'Pantorrillas',
  gluteos: 'Glúteos',
  hombros: 'Hombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  antebrazos: 'Antebrazos',
  abdominales: 'Abdominales',
  core: 'Core',
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

const PROMPT_SUGGESTIONS = [
  {
    title: 'Torso / Pierna (2 Días)',
    prompt:
      'Crea una rutina de 2 días:\nDía 1: Torso (Press banca con barra 4x8 con 70kg, Remo con barra 4x8 con 60kg, Press militar con mancuernas 3x10 con 18kg, Curl de bíceps 3x12 con 12kg).\nDía 2: Pierna (Sentadilla con barra 4x8 con 80kg, Peso muerto rumano 4x10 con 70kg, Prensa de piernas 3x12 con 120kg, Elevación de talones 4x15 con 40kg).',
  },
  {
    title: 'Hipertrofia Pecho y Tríceps',
    prompt:
      'Crea una rutina para pecho y tríceps con enfoque en hipertrofia. Incluye Press banca plano, Press inclinado con mancuernas, Fondos en paralelas y Extensiones de tríceps en polea alta.',
  },
  {
    title: 'Fuerza Piernas y Core',
    prompt:
      'Diseña una rutina de fuerza para piernas y abdomen con Sentadilla trasera pesada, Peso muerto rumano, Prensa de piernas y Plancha abdominal.',
  },
  {
    title: 'Espalda Densidad y Bíceps',
    prompt:
      'Genera una rutina de espalda y bíceps con Dominadas lastradas, Remo con barra T, Jalón al pecho y Curl martillo.',
  },
];

const getDraftStorageKey = (routineId?: string) =>
  `routineup_draft_routine_${routineId || 'new'}`;

const ensureSetsConfig = (dayEx: WorkoutDayExercise): RoutineSetDetail[] => {
  if (dayEx.setsConfig && dayEx.setsConfig.length > 0) {
    return dayEx.setsConfig.map((s, idx) => {
      const repsMin = s.targetRepsMin ?? s.targetReps ?? dayEx.targetRepsMin ?? 8;
      const repsMax = s.targetRepsMax ?? s.targetReps ?? dayEx.targetRepsMax ?? 10;
      return {
        setNumber: s.setNumber || idx + 1,
        targetRepsMin: repsMin,
        targetRepsMax: repsMax,
        targetReps: s.targetReps ?? repsMax,
        targetWeight: s.targetWeight ?? dayEx.targetWeight ?? 0,
      };
    });
  }
  const count = Math.max(1, dayEx.targetSets || 4);
  const repsMin = dayEx.targetRepsMin ?? 8;
  const repsMax = dayEx.targetRepsMax ?? 10;
  const weight = dayEx.targetWeight || 0;
  return Array.from({ length: count }, (_, i) => ({
    setNumber: i + 1,
    targetRepsMin: repsMin,
    targetRepsMax: repsMax,
    targetReps: repsMax,
    targetWeight: weight,
  }));
};

const hasVariedSets = (ex: WorkoutDayExercise): boolean => {
  if (!ex.setsConfig || ex.setsConfig.length <= 1) return false;
  const first = ex.setsConfig[0];
  const firstWeight = first.targetWeight ?? 0;
  const firstMin = first.targetRepsMin ?? first.targetReps ?? 10;
  const firstMax = first.targetRepsMax ?? first.targetReps ?? 10;
  return ex.setsConfig.some(
    (s) =>
      (s.targetWeight ?? 0) !== firstWeight ||
      (s.targetRepsMin ?? s.targetReps ?? 10) !== firstMin ||
      (s.targetRepsMax ?? s.targetReps ?? 10) !== firstMax
  );
};

export const RoutineEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();

  const isEditing = Boolean(id && id !== 'new');
  const isInitializedRef = useRef(false);

  // Modo de creación: 'manual' o 'ai' (SOLO disponible al crear una rutina nueva)
  const [creationMode, setCreationMode] = useState<'manual' | 'ai'>(() => {
    return searchParams.get('mode') === 'ai' ? 'ai' : 'manual';
  });
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingWithAI, setIsGeneratingWithAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

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
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const initData = async () => {
      const exercises = await exerciseService.getExercises(user?.id);
      setAllExercises(exercises);

      const draftKey = getDraftStorageKey(id && id !== 'new' ? id : undefined);
      let draftData: any = null;
      try {
        const storedDraft = localStorage.getItem(draftKey);
        if (storedDraft) {
          draftData = JSON.parse(storedDraft);
        }
      } catch (err) {
        console.warn('Error reading draft from localStorage:', err);
      }

      if (isEditing && id) {
        if (draftData && Array.isArray(draftData.days) && draftData.days.length > 0) {
          setRoutineName(draftData.routineName || 'Mi Rutina');
          setDescription(draftData.description || '');
          setDays(draftData.days);
          setCustomizedExercises(draftData.customizedExercises || {});
          if (typeof draftData.activeDayIndex === 'number') {
            setActiveDayIndex(draftData.activeDayIndex);
          }
          return;
        }

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

      // Si es nueva rutina:
      if (draftData && Array.isArray(draftData.days) && draftData.days.length > 0) {
        setRoutineName(draftData.routineName || 'Nueva Rutina');
        setDescription(draftData.description || '');
        setDays(draftData.days);
        setCustomizedExercises(draftData.customizedExercises || {});
        if (typeof draftData.activeDayIndex === 'number') {
          setActiveDayIndex(draftData.activeDayIndex);
        }
        if (draftData.creationMode) {
          setCreationMode(draftData.creationMode);
        }
        if (draftData.aiPrompt) {
          setAiPrompt(draftData.aiPrompt);
        }
        return;
      }

      // Si es nueva rutina sin borrador previo, inicializar con un día por defecto
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
  }, [id, isEditing]);

  // Persistir borrador en localStorage para no perder progreso ante esperas o re-renders
  useEffect(() => {
    if (!isInitializedRef.current) return;
    if (days.length === 0 && !routineName) return;

    const draftKey = getDraftStorageKey(id && id !== 'new' ? id : undefined);
    try {
      const payload = {
        routineName,
        description,
        days,
        customizedExercises,
        activeDayIndex,
        creationMode,
        aiPrompt,
        updatedAt: Date.now(),
      };
      localStorage.setItem(draftKey, JSON.stringify(payload));
    } catch (err) {
      console.warn('Error saving routine draft to localStorage:', err);
    }
  }, [
    id,
    routineName,
    description,
    days,
    customizedExercises,
    activeDayIndex,
    creationMode,
    aiPrompt,
  ]);

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

    if (!willBeCustom) {
      const updated = [...days];
      const currentDay = updated[activeDayIndex];
      if (currentDay && currentDay.exercises[exIndex]) {
        const ex = currentDay.exercises[exIndex];
        const sets = ensureSetsConfig(ex);
        const uniformWeight = sets[0]?.targetWeight ?? ex.targetWeight ?? 0;
        const uniformRepsMin =
          sets[0]?.targetRepsMin ?? sets[0]?.targetReps ?? ex.targetRepsMin ?? 8;
        const uniformRepsMax =
          sets[0]?.targetRepsMax ?? sets[0]?.targetReps ?? ex.targetRepsMax ?? 10;
        ex.targetWeight = uniformWeight;
        ex.targetRepsMin = uniformRepsMin;
        ex.targetRepsMax = uniformRepsMax;
        ex.targetSets = sets.length;
        ex.setsConfig = sets.map((s) => ({
          ...s,
          targetWeight: uniformWeight,
          targetRepsMin: uniformRepsMin,
          targetRepsMax: uniformRepsMax,
          targetReps: uniformRepsMax,
        }));
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
    const baseRepsMin = ex.targetRepsMin || (currentSets[0]?.targetRepsMin ?? 8);
    const baseRepsMax = ex.targetRepsMax || (currentSets[0]?.targetRepsMax ?? 10);

    const nextSets: RoutineSetDetail[] = Array.from({ length: safeCount }, (_, idx) => ({
      setNumber: idx + 1,
      targetRepsMin: currentSets[idx]?.targetRepsMin ?? baseRepsMin,
      targetRepsMax: currentSets[idx]?.targetRepsMax ?? baseRepsMax,
      targetReps: currentSets[idx]?.targetReps ?? baseRepsMax,
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
      targetRepsMin: newReps,
      targetRepsMax: Math.max(s.targetRepsMax ?? newReps, newReps),
      targetReps: Math.max(s.targetRepsMax ?? newReps, newReps),
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
      targetRepsMin: Math.min(s.targetRepsMin ?? newReps, newReps),
      targetRepsMax: newReps,
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
      targetRepsMin: lastSet
        ? (lastSet.targetRepsMin ?? lastSet.targetReps ?? 8)
        : ex.targetRepsMin || 8,
      targetRepsMax: lastSet
        ? (lastSet.targetRepsMax ?? lastSet.targetReps ?? 10)
        : ex.targetRepsMax || 10,
      targetReps: lastSet
        ? (lastSet.targetRepsMax ?? lastSet.targetReps ?? 10)
        : ex.targetRepsMax || 10,
      targetWeight: lastSet ? lastSet.targetWeight : ex.targetWeight || 0,
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
    field: 'targetReps' | 'targetRepsMin' | 'targetRepsMax' | 'targetWeight',
    value: number
  ) => {
    const updated = [...days];
    const currentDay = updated[activeDayIndex];
    if (!currentDay || !currentDay.exercises[exIndex]) return;

    const ex = currentDay.exercises[exIndex];
    const currentSets = [...ensureSetsConfig(ex)];

    if (currentSets[setIdx]) {
      const set = { ...currentSets[setIdx] };
      if (field === 'targetWeight') {
        set.targetWeight = value;
      } else if (field === 'targetRepsMin') {
        set.targetRepsMin = value;
        if ((set.targetRepsMax ?? 0) < value) {
          set.targetRepsMax = value;
        }
        set.targetReps = set.targetRepsMax ?? value;
      } else if (field === 'targetRepsMax') {
        set.targetRepsMax = value;
        if ((set.targetRepsMin ?? value) > value) {
          set.targetRepsMin = value;
        }
        set.targetReps = value;
      } else if (field === 'targetReps') {
        set.targetReps = value;
        set.targetRepsMin = value;
        set.targetRepsMax = value;
      }

      currentSets[setIdx] = set;
      ex.setsConfig = currentSets;

      if (setIdx === 0) {
        if (field === 'targetWeight') ex.targetWeight = value;
        if (field === 'targetRepsMin') ex.targetRepsMin = value;
        if (field === 'targetRepsMax') {
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

  const handleCopyRepsToAll = (
    exIndex: number,
    repsMin: number,
    repsMax: number
  ) => {
    const updated = [...days];
    const currentDay = updated[activeDayIndex];
    if (!currentDay || !currentDay.exercises[exIndex]) return;

    const ex = currentDay.exercises[exIndex];
    const currentSets = ensureSetsConfig(ex).map((s) => ({
      ...s,
      targetRepsMin: repsMin,
      targetRepsMax: repsMax,
      targetReps: repsMax,
    }));

    ex.setsConfig = currentSets;
    ex.targetRepsMin = repsMin;
    ex.targetRepsMax = repsMax;
    setDays(updated);
  };

  // --- GENERACIÓN CON IA (GEMINI) ---
  const handleGenerateRoutineWithAI = async () => {
    if (!geminiService.isConfigured()) {
      setAiError('El servicio de generación con IA no está disponible temporalmente.');
      return;
    }

    if (!aiPrompt.trim()) {
      setAiError('Por favor escribe o pega una descripción de tu rutina.');
      return;
    }

    try {
      setIsGeneratingWithAI(true);
      setAiError(null);
      setAiSuccessMessage(null);

      const generated = await geminiService.generateRoutineFromText(aiPrompt);

      // 1. Asignar nombre
      setRoutineName(generated.nombre || 'Rutina Generada con IA');
      setDescription(
        `Generada con Gemini IA a partir de: "${aiPrompt.substring(0, 50)}..."`
      );

      // 2. Mapear cada día y sus respectivos ejercicios devueltos por Gemini
      const customMap: Record<string, boolean> = {};
      let totalExercisesCount = 0;

      const daysSource =
        generated.days && generated.days.length > 0
          ? generated.days
          : generated.routine || [];

      const createdDays: WorkoutDay[] = daysSource.map((aiDay, dayIdx) => {
        const dayId = 'day-' + Math.random().toString(36).substring(2, 9);
        const dayName = aiDay.dayName || `Día ${dayIdx + 1}: Entrenamiento`;

        const mappedExercises: WorkoutDayExercise[] = (aiDay.exercises || []).map(
          (aiEx, exIdx) => {
            totalExercisesCount++;
            const muscle = geminiService.mapToMuscleGroup(aiEx.grupoMuscular);

            // Buscar si el ejercicio coincide con el catálogo existente
            const normalizedAiName = aiEx.nombre.toLowerCase().trim();
            const matchedCatalogEx = allExercises.find((catEx) => {
              const catName = catEx.name.toLowerCase().trim();
              return (
                catName === normalizedAiName ||
                catName.includes(normalizedAiName) ||
                normalizedAiName.includes(catName)
              );
            });

            const dayExId = 'd-ex-' + Math.random().toString(36).substring(2, 9);

            const setsConfig: RoutineSetDetail[] =
              aiEx.series && aiEx.series.length > 0
                ? aiEx.series.map((s, sIdx) => {
                    const rMin = (s as any).repsMin || s.reps || 8;
                    const rMax = (s as any).repsMax || s.reps || 10;
                    return {
                      setNumber: sIdx + 1,
                      targetRepsMin: rMin,
                      targetRepsMax: rMax,
                      targetReps: s.reps || rMax,
                      targetWeight: s.peso || 0,
                    };
                  })
                : Array.from({ length: 4 }, (_, sIdx) => ({
                    setNumber: sIdx + 1,
                    targetRepsMin: 8,
                    targetRepsMax: 10,
                    targetReps: 10,
                    targetWeight: 0,
                  }));

            // Si los pesos o repeticiones varían entre series, activar el modo de desglose individual
            const firstWeight = setsConfig[0]?.targetWeight ?? 0;
            const firstRepsMin = setsConfig[0]?.targetRepsMin ?? 8;
            const firstRepsMax = setsConfig[0]?.targetRepsMax ?? 10;
            const varies = setsConfig.some(
              (s) =>
                s.targetWeight !== firstWeight ||
                s.targetRepsMin !== firstRepsMin ||
                s.targetRepsMax !== firstRepsMax
            );
            if (varies) {
              customMap[dayExId] = true;
            }

            // Si no existe en el catálogo, crear objeto sintético de ejercicio
            const finalExercise: Exercise = matchedCatalogEx || {
              id: 'ai-ex-' + Math.random().toString(36).substring(2, 9),
              name: aiEx.nombre,
              slug: aiEx.nombre.toLowerCase().replace(/\s+/g, '-'),
              description: `Ejercicio generado por IA (${aiEx.grupoMuscular})`,
              mainMuscleGroup: muscle,
              secondaryMuscles: [],
              equipment: 'otro',
              exerciseType: 'aislamiento',
              instructions: [],
              techniqueTips: '',
              difficultyLevel: 'intermedio',
              isCustom: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            return {
              id: dayExId,
              workoutDayId: dayId,
              exerciseId: finalExercise.id,
              exercise: finalExercise,
              exerciseOrder: exIdx + 1,
              targetSets: setsConfig.length,
              targetRepsMin: setsConfig[0]?.targetRepsMin ?? 8,
              targetRepsMax: setsConfig[0]?.targetRepsMax ?? 10,
              targetWeight: setsConfig[0]?.targetWeight ?? 0,
              restSeconds: 90,
              notes: '',
              setsConfig,
            };
          }
        );

        return {
          id: dayId,
          routineId: id || '',
          name: dayName,
          dayOrder: dayIdx + 1,
          exercises: mappedExercises,
        };
      });

      // 3. Cargar todos los días generados en el estado
      setDays(createdDays);
      setActiveDayIndex(0);
      setCustomizedExercises((prev) => ({ ...prev, ...customMap }));

      // 4. Cambiar automáticamente al formulario manual para revisión
      setCreationMode('manual');
      setAiSuccessMessage(
        `¡Rutina "${generated.nombre}" generada con ${createdDays.length} ${
          createdDays.length === 1 ? 'día' : 'días'
        } y ${totalExercisesCount} ejercicios! Revisa y ajusta cada día antes de guardar.`
      );
    } catch (err: any) {
      console.error('Error generando rutina con IA:', err);
      setAiError(err.message || 'Ocurrió un error al procesar tu rutina con Google Gemini.');
    } finally {
      setIsGeneratingWithAI(false);
    }
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
            targetRepsMin:
              sets[0]?.targetRepsMin ?? sets[0]?.targetReps ?? ex.targetRepsMin ?? 8,
            targetRepsMax:
              sets[0]?.targetRepsMax ?? sets[0]?.targetReps ?? ex.targetRepsMax ?? 10,
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

      // Limpiar borrador de localStorage al guardar con éxito
      const draftKey = getDraftStorageKey(id && id !== 'new' ? id : undefined);
      localStorage.removeItem(draftKey);
      if (isEditing) {
        localStorage.removeItem(getDraftStorageKey(undefined));
      }

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

      {/* Selector de Modo de Creación: EXCLUSIVO en creación (!isEditing) */}
      {!isEditing && (
        <div className="bg-gym-card border border-gym-border rounded-2xl p-1.5 flex items-center gap-1.5 shadow-sm">
          <button
            type="button"
            onClick={() => setCreationMode('manual')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all select-none ${
              creationMode === 'manual'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-glow-primary'
                : 'text-gray-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <PenLine className="w-4 h-4" />
            <span>Crear manualmente</span>
          </button>
          <button
            type="button"
            onClick={() => setCreationMode('ai')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all select-none ${
              creationMode === 'ai'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black shadow-glow-primary'
                : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
            }`}
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Generar con IA</span>
          </button>
        </div>
      )}

      {/* VISTA 1: MODO GENERAR CON IA */}
      {!isEditing && creationMode === 'ai' && (
        <div className="space-y-4">
          <div className="bg-gym-card border border-emerald-500/30 rounded-3xl p-5 space-y-4 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-black uppercase tracking-wider border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  Google Gemini AI
                </div>
                <h2 className="text-base font-black text-white">
                  Generar rutina desde lenguaje natural
                </h2>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Pega o escribe tu rutina tal como la piensas o te la dio tu entrenador.
                  Gemini estructurará los ejercicios, series y pesos por serie automáticamente.
                </p>
              </div>
            </div>

            {/* Sugerencias de ejemplo */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray-400 block">
                O prueba con uno de estos ejemplos:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PROMPT_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug.title}
                    type="button"
                    onClick={() => setAiPrompt(sug.prompt)}
                    className="px-2.5 py-1 rounded-xl bg-slate-900 border border-gym-border hover:border-emerald-500 text-[11px] font-semibold text-gray-300 hover:text-emerald-400 transition-colors"
                  >
                    💡 {sug.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea para escribir la rutina */}
            <div className="space-y-1.5">
              <textarea
                rows={5}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ejemplo: Rutina de Pecho y Bíceps. Press de banca plano 4x10 con 80kg, Press inclinado con mancuernas 3x10 con 26kg, Aperturas en polea 3x12 con 15kg, Curl con barra Z piramidal: serie 1 30kg x 12, serie 2 35kg x 10, serie 3 40kg x 8..."
                className="w-full px-3.5 py-3 bg-slate-900 border border-gym-border rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
              />
            </div>

            {/* Aviso si la IA no está disponible */}
            {!geminiService.isConfigured() && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p>
                  El servicio de generación con IA no está disponible temporalmente. Puedes utilizar la opción{' '}
                  <button
                    type="button"
                    onClick={() => setCreationMode('manual')}
                    className="underline font-bold text-amber-200 hover:text-white"
                  >
                    Crear manualmente
                  </button>{' '}
                  para armar tu rutina.
                </p>
              </div>
            )}

            {/* Error banner si hubo fallo */}
            {aiError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="font-semibold">{aiError}</p>
              </div>
            )}

            {/* Botón de acción */}
            <div className="flex items-center justify-end pt-1">
              <Button
                size="md"
                variant="primary"
                onClick={handleGenerateRoutineWithAI}
                isLoading={isGeneratingWithAI}
                disabled={!aiPrompt.trim() || !geminiService.isConfigured()}
                icon={<Sparkles className="w-4 h-4" />}
              >
                {isGeneratingWithAI ? 'Generando con Gemini...' : 'GENERAR RUTINA'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* VISTA 2: FORMULARIO MANUAL ESTÁNDAR (O REVISIÓN TRAS IA) */}
      {(isEditing || creationMode === 'manual') && (
        <>
          {/* Mensaje de éxito tras generación con IA */}
          {aiSuccessMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs text-emerald-300 animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <p className="font-semibold">{aiSuccessMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setAiSuccessMessage(null)}
                className="text-gray-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}

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
                        Presiona el botón de abajo para explorar el catálogo o usa la opción "Generar con IA".
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
                            <div className="flex items-center gap-3 flex-1 min-w-0">
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
                              <div className="flex-1 min-w-0">
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
                                <h4 className="text-sm font-bold text-white whitespace-normal break-words leading-snug mt-0.5">
                                  {ex?.name || 'Ejercicio'}
                                </h4>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
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

                          {/* VISTA 2: MODO AVANZADO DESGLOSADO (Configuración individual por serie) */}
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
                                          handleCopyRepsToAll(
                                            exIdx,
                                            sets[0]?.targetRepsMin ?? sets[0]?.targetReps ?? 8,
                                            sets[0]?.targetRepsMax ?? sets[0]?.targetReps ?? 10
                                          )
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
                              <div className="grid grid-cols-12 gap-1.5 sm:gap-2 text-[10px] font-bold text-gray-400 px-1 uppercase tracking-wider text-center">
                                <div className="col-span-2">Serie</div>
                                <div className="col-span-3">Reps Mín</div>
                                <div className="col-span-3">Reps Máx</div>
                                <div className="col-span-3">Peso (kg)</div>
                                <div className="col-span-1"></div>
                              </div>

                              {/* Filas de Series con inputs fluidos */}
                              <div className="space-y-1.5">
                                {sets.map((set, setIdx) => (
                                  <div
                                    key={set.setNumber}
                                    className="grid grid-cols-12 gap-1.5 sm:gap-2 items-center bg-gym-card/80 hover:bg-gym-card p-1.5 rounded-xl border border-gym-border/50 transition-colors"
                                  >
                                    <div className="col-span-2 text-center">
                                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-900 border border-gym-border text-xs font-black text-emerald-400">
                                        S{set.setNumber}
                                      </span>
                                    </div>

                                    <div className="col-span-3">
                                      <FlexibleNumericInput
                                        value={set.targetRepsMin ?? set.targetReps ?? 8}
                                        onChange={(val) =>
                                          handleUpdateSetField(exIdx, setIdx, 'targetRepsMin', val)
                                        }
                                        min={1}
                                        max={100}
                                        step={1}
                                        fallbackValue={8}
                                        placeholder="8"
                                        autoSelectOnFocus
                                        className="w-full text-center font-black text-white bg-slate-900 border border-gym-border rounded-lg py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                                      />
                                    </div>

                                    <div className="col-span-3">
                                      <FlexibleNumericInput
                                        value={set.targetRepsMax ?? set.targetReps ?? 10}
                                        onChange={(val) =>
                                          handleUpdateSetField(exIdx, setIdx, 'targetRepsMax', val)
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

                                    <div className="col-span-3">
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

                                    <div className="col-span-1 flex justify-center">
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
        </>
      )}

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
                        <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                          <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-950 flex-shrink-0 border border-gym-border/60">
                            <ExerciseImage
                              imageUrl={ex.imageUrl}
                              name={ex.name}
                              muscleGroup={ex.mainMuscleGroup}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors whitespace-normal break-words leading-tight">
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