import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { routineService } from '../../services/routine.service';
import { exerciseService } from '../../services/exercise.service';
import { useAuthStore } from '../../store/useAuthStore';
import { WorkoutRoutine, WorkoutDay, WorkoutDayExercise } from '../../types/routine';
import { Exercise, MuscleGroup } from '../../types/exercise';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ExerciseImage } from '../../components/common/ExerciseImage';
import { Plus, Trash2, Save, ArrowLeft, GripVertical, Clock, Dumbbell, Search, ChevronRight } from 'lucide-react';

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

  // Modal para seleccionar ejercicio
  const [isSelectExerciseModalOpen, setIsSelectExerciseModalOpen] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [exerciseFilterMuscle, setExerciseFilterMuscle] = useState<MuscleGroup | 'todos'>('todos');

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
          setDays(found.days);
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

    const newExercise: WorkoutDayExercise = {
      id: 'd-ex-' + Math.random().toString(36).substring(2, 9),
      workoutDayId: currentDay.id,
      exerciseId: exercise.id,
      exercise,
      exerciseOrder: currentDay.exercises.length + 1,
      targetSets: 4,
      targetRepsMin: 8,
      targetRepsMax: 10,
      targetWeight: 50,
      restSeconds: 90,
      notes: '',
    };

    const updated = [...days];
    updated[activeDayIndex].exercises.push(newExercise);
    setDays(updated);
    setIsSelectExerciseModalOpen(false);
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

  const handleSaveRoutine = async () => {
    if (!routineName.trim()) return;

    try {
      setIsSaving(true);
      const payload: WorkoutRoutine = {
        id: isEditing && id ? id : 'rot-' + Math.random().toString(36).substring(2, 9),
        userId: user?.id || 'local-user',
        name: routineName.trim(),
        description: description.trim(),
        isActive: true,
        days,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await routineService.saveRoutine(payload, user?.id);
      navigate('/routines');
    } finally {
      setIsSaving(false);
    }
  };

  const currentDay = days[activeDayIndex];

  const filteredExercisesForModal = allExercises.filter((ex) => {
    const matchesMuscle =
      exerciseFilterMuscle === 'todos' || ex.mainMuscleGroup === exerciseFilterMuscle;
    const matchesQuery =
      ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
      ex.mainMuscleGroup.toLowerCase().includes(exerciseSearch.toLowerCase());
    return matchesMuscle && matchesQuery;
  });

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/routines')}
          className="p-2 rounded-xl bg-gym-card text-gray-300 hover:text-white border border-gym-border"
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
            placeholder="Ej: Enfoque en hipertrofia y fuerza"
            className="w-full px-3.5 py-2 bg-slate-900 border border-gym-border rounded-xl text-xs text-white focus:outline-none"
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
                ${activeDayIndex === idx
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
            className="px-3 py-2 rounded-2xl bg-slate-800 text-emerald-400 hover:bg-slate-700 text-xs font-bold flex items-center gap-1 border border-gym-border"
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
                  className="text-xs text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Lista de Ejercicios en el Día */}
            <div className="space-y-3">
              {currentDay.exercises.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <p className="text-xs">Este día no tiene ejercicios todavía.</p>
                </div>
              ) : (
                currentDay.exercises.map((dayEx, exIdx) => {
                  const ex = dayEx.exercise || allExercises.find((e) => e.id === dayEx.exerciseId);
                  return (
                    <div
                      key={dayEx.id}
                      className="p-3.5 rounded-2xl bg-gym-bg border border-gym-border/80 space-y-3"
                    >
                      {/* Cabecera del Ejercicio */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-gym-border flex-shrink-0">
                            {ex && (
                              <ExerciseImage
                                imageUrl={ex.imageUrl}
                                name={ex.name}
                                muscleGroup={ex.mainMuscleGroup}
                                className="w-full h-full"
                              />
                            )}
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-emerald-400">
                              {exIdx + 1}. {ex?.mainMuscleGroup}
                            </span>
                            <h4 className="text-sm font-bold text-white">{ex?.name || 'Ejercicio'}</h4>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(exIdx)}
                          className="p-1.5 text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Parámetros: Series, Reps, Peso, Descanso */}
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div className="bg-gym-card p-2 rounded-xl border border-gym-border/60">
                          <span className="text-[10px] text-gray-400 font-bold block">Series</span>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={dayEx.targetSets}
                            onChange={(e) =>
                              handleUpdateExerciseConfig(exIdx, 'targetSets', parseInt(e.target.value) || 1)
                            }
                            className="w-full text-center font-black text-white bg-transparent focus:outline-none mt-0.5 text-sm"
                          />
                        </div>

                        <div className="bg-gym-card p-2 rounded-xl border border-gym-border/60">
                          <span className="text-[10px] text-gray-400 font-bold block">Reps Mín</span>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={dayEx.targetRepsMin}
                            onChange={(e) =>
                              handleUpdateExerciseConfig(exIdx, 'targetRepsMin', parseInt(e.target.value) || 1)
                            }
                            className="w-full text-center font-black text-white bg-transparent focus:outline-none mt-0.5 text-sm"
                          />
                        </div>

                        <div className="bg-gym-card p-2 rounded-xl border border-gym-border/60">
                          <span className="text-[10px] text-gray-400 font-bold block">Reps Máx</span>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={dayEx.targetRepsMax}
                            onChange={(e) =>
                              handleUpdateExerciseConfig(exIdx, 'targetRepsMax', parseInt(e.target.value) || 1)
                            }
                            className="w-full text-center font-black text-white bg-transparent focus:outline-none mt-0.5 text-sm"
                          />
                        </div>

                        <div className="bg-gym-card p-2 rounded-xl border border-gym-border/60">
                          <span className="text-[10px] text-gray-400 font-bold block">Peso (kg)</span>
                          <input
                            type="number"
                            step="2.5"
                            value={dayEx.targetWeight}
                            onChange={(e) =>
                              handleUpdateExerciseConfig(exIdx, 'targetWeight', parseFloat(e.target.value) || 0)
                            }
                            className="w-full text-center font-black text-emerald-400 bg-transparent focus:outline-none mt-0.5 text-sm"
                          />
                        </div>
                      </div>

                      {/* Descanso y Notas */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1 bg-gym-card p-2 rounded-xl border border-gym-border/60 flex flex-col justify-center">
                          <span className="text-[10px] text-gray-400 font-bold block">Descanso</span>
                          <div className="flex items-center justify-center gap-1 mt-0.5">
                            <input
                              type="number"
                              step="15"
                              value={dayEx.restSeconds}
                              onChange={(e) =>
                                handleUpdateExerciseConfig(exIdx, 'restSeconds', parseInt(e.target.value) || 60)
                              }
                              className="w-12 text-center font-black text-white bg-transparent focus:outline-none text-xs"
                            />
                            <span className="text-[10px] text-gray-400 font-bold">seg</span>
                          </div>
                        </div>

                        <div className="col-span-2 bg-gym-card p-2 rounded-xl border border-gym-border/60 flex flex-col justify-center">
                          <span className="text-[10px] text-gray-400 font-bold block">Nota personal</span>
                          <input
                            type="text"
                            placeholder="Ej: Mantener escápulas retraídas"
                            value={dayEx.notes || ''}
                            onChange={(e) =>
                              handleUpdateExerciseConfig(exIdx, 'notes', e.target.value)
                            }
                            className="w-full text-xs text-gray-200 bg-transparent focus:outline-none mt-0.5"
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

      {/* Modal Selector Visual de Ejercicios */}
      <Modal
        isOpen={isSelectExerciseModalOpen}
        onClose={() => setIsSelectExerciseModalOpen(false)}
        title="Seleccionar Ejercicio"
        maxWidth="md"
      >
        <div className="space-y-3">
          {/* Buscador */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={exerciseSearch}
              onChange={(e) => setExerciseSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-gym-border rounded-xl text-xs text-white focus:outline-none"
            />
          </div>

          {/* Lista de ejercicios con miniatura */}
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {filteredExercisesForModal.map((ex) => (
              <div
                key={ex.id}
                onClick={() => handleSelectExercise(ex)}
                className="p-2.5 rounded-xl bg-slate-900 border border-gym-border hover:border-emerald-500 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-950 flex-shrink-0">
                    <ExerciseImage
                      imageUrl={ex.imageUrl}
                      name={ex.name}
                      muscleGroup={ex.mainMuscleGroup}
                      className="w-full h-full"
                    />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{ex.name}</h5>
                    <span className="text-[10px] text-gray-400 uppercase">{ex.mainMuscleGroup} · {ex.equipment}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};