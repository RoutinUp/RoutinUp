import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { routineService } from '../../services/routine.service';
import { workoutService } from '../../services/workout.service';
import { useAuthStore } from '../../store/useAuthStore';
import { useActiveWorkoutStore } from '../../store/useActiveWorkoutStore';
import { WorkoutRoutine, WorkoutDay } from '../../types/routine';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Plus, Play, Calendar, Trash2, Edit3, ChevronDown, ChevronUp, Dumbbell } from 'lucide-react';

export const RoutinesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { startWorkout } = useActiveWorkoutStore();

  const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
  const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(null);
  const [deleteRoutineId, setDeleteRoutineId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadRoutines = async () => {
    try {
      setIsLoading(true);
      const list = await routineService.getRoutines(user?.id);
      setRoutines(list);
      if (list.length > 0 && !expandedRoutineId) {
        setExpandedRoutineId(list[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoutines();
  }, [user]);

  const toggleExpand = (id: string) => {
    setExpandedRoutineId((prev) => (prev === id ? null : id));
  };

  const handleStartDay = async (day: WorkoutDay, routineName: string) => {
    const pastSessions = await workoutService.getWorkoutSessions(user?.id);
    startWorkout(day, routineName, pastSessions);
    navigate('/workout/active');
  };

  const [isDeleting, setIsDeleting] = useState(false);
  const [isImportingPreset, setIsImportingPreset] = useState(false);

  const handleDelete = async () => {
    if (!deleteRoutineId) return;
    const targetId = deleteRoutineId;
    // Actualización optimista inmediata en la UI
    setRoutines((prev) => prev.filter((r) => r.id !== targetId));
    setDeleteRoutineId(null);
    try {
      setIsDeleting(true);
      await routineService.deleteRoutine(targetId, user?.id);
    } catch (err) {
      console.error('Error eliminando rutina:', err);
      await loadRoutines();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImportPreset = async () => {
    try {
      setIsImportingPreset(true);
      const newRoutine = await routineService.importDefaultPreset(user?.id);
      setRoutines([newRoutine]);
      setExpandedRoutineId(newRoutine.id);
    } catch (err) {
      console.error('Error importando rutina base:', err);
    } finally {
      setIsImportingPreset(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Mis Rutinas</h1>
          <p className="text-xs text-gray-400">Planifica tus sesiones de entrenamiento</p>
        </div>
        <Link to="/routines/new">
          <Button size="sm" variant="primary" icon={<Plus className="w-4 h-4 stroke-[3]" />}>
            Crear
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span className="text-xs text-gray-400">Cargando tus rutinas...</span>
        </div>
      ) : routines.length === 0 ? (
        <div className="rounded-3xl bg-gym-card border border-gym-border/90 p-6 sm:p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-glow-primary">
            <Dumbbell className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-xs mx-auto">
            <h3 className="text-lg font-black text-white tracking-tight">
              No tienes ninguna rutina creada
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Crea tu propia rutina con series y pesos personalizados para cada ejercicio, o comienza con una plantilla probada.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
            <Link to="/routines/new" className="w-full">
              <Button size="lg" fullWidth variant="primary" icon={<Plus className="w-5 h-5 stroke-[2.5]" />}>
                CREAR NUEVA RUTINA
              </Button>
            </Link>
            <Button
              size="lg"
              fullWidth
              variant="secondary"
              isLoading={isImportingPreset}
              onClick={handleImportPreset}
            >
              Cargar Plantilla (PPL)
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {routines.map((routine) => {
            const isExpanded = expandedRoutineId === routine.id;
            return (
              <div
                key={routine.id}
                className="rounded-3xl bg-gym-card border border-gym-border/80 overflow-hidden transition-all shadow-md"
              >
                {/* Header de la Rutina */}
                <div
                  onClick={() => toggleExpand(routine.id)}
                  className="p-4 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">{routine.name}</h3>
                      <span className="text-xs text-gray-400">
                        {routine.days.length} {routine.days.length === 1 ? 'día' : 'días'} de entrenamiento
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link
                      to={`/routines/${routine.id}/edit`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Editar rutina"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteRoutineId(routine.id);
                      }}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Eliminar rutina"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="p-1 text-gray-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Días y Ejercicios Desplegados */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 space-y-2.5 border-t border-gym-border/40">
                    {routine.days.map((day) => (
                      <div
                        key={day.id}
                        className="p-3.5 rounded-2xl bg-gym-bg/80 border border-gym-border/60 flex items-center justify-between"
                      >
                        <div>
                          <h4 className="text-sm font-bold text-white">{day.name}</h4>
                          <span className="text-xs text-gray-400 block mt-0.5">
                            {day.exercises.length} ejercicios configurados
                          </span>
                        </div>

                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleStartDay(day, routine.name)}
                          icon={<Play className="w-3.5 h-3.5 fill-current" />}
                        >
                          INICIAR
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Confirmar Eliminar */}
      <Modal
        isOpen={Boolean(deleteRoutineId)}
        onClose={() => setDeleteRoutineId(null)}
        title="¿Eliminar rutina?"
      >
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-300">
            ¿Estás seguro de que deseas eliminar esta rutina? Esta acción no se puede deshacer.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="secondary" onClick={() => setDeleteRoutineId(null)}>
              CANCELAR
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              ELIMINAR
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};