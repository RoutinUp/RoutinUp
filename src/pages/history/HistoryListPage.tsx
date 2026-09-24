import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { workoutService } from '../../services/workout.service';
import { useAuthStore } from '../../store/useAuthStore';
import { WorkoutSession } from '../../types/workout';
import { formatDurationHuman, formatDateSpanish, formatWeight } from '../../utils/formatters';
import { History, Clock, Dumbbell, ChevronDown, ChevronUp, Trophy, Trash2 } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

export const HistoryListPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(id || null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionToDelete, setSessionToDelete] = useState<WorkoutSession | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    try {
      setIsDeleting(true);
      await workoutService.deleteWorkoutSession(sessionToDelete.id, user?.id);
      setSessions((prev) => prev.filter((s) => s.id !== sessionToDelete.id));
      if (selectedSessionId === sessionToDelete.id) {
        setSelectedSessionId(null);
      }
      setSessionToDelete(null);
    } catch (error) {
      console.error('Error deleting session:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true);
        const data = await workoutService.getWorkoutSessions(user?.id);
        setSessions(data);
        if (id) {
          setSelectedSessionId(id);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [user, id]);

  const toggleSession = (sessionId: string) => {
    setSelectedSessionId((prev) => (prev === sessionId ? null : sessionId));
  };

  return (
    <div className="space-y-5 pb-20 select-none">
      <div>
        <span className="text-[10px] font-bold text-gym-primary uppercase tracking-widest block">
          Registro de Actividad
        </span>
        <h1 className="text-2xl font-black text-zinc-100 tracking-tight">
          Historial de Entrenamientos
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Revisa tus sesiones pasadas con métricas de tiempo, volumen y series registradas
        </p>
      </div>

      {sessions.length === 0 ? (
        <Card className="text-center py-12 p-6">
          <History className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-100">No hay entrenamientos guardados</h3>
          <p className="text-xs text-zinc-400 mt-1 mb-5">
            Completa tu primera rutina para empezar a construir tu historial de récords.
          </p>
          <Link to="/">
            <Button variant="primary" size="md">
              IR AL INICIO
            </Button>
          </Link>
        </Card>
      ) : (
        /* Timeline Container */
        <div className="relative pl-6 ml-2 border-l border-[#27272A] space-y-4">
          {sessions.map((session) => {
            const isExpanded = selectedSessionId === session.id;
            return (
              <div key={session.id} className="relative group">
                {/* Timeline Node Dot */}
                <div
                  className={`absolute -left-[31px] top-4 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                    isExpanded
                      ? 'bg-gym-primary border-gym-primary shadow-[0_0_8px_rgba(132,204,22,0.4)]'
                      : 'bg-[#18181B] border-[#3F3F46] group-hover:border-gym-primary'
                  }`}
                />

                {/* Timeline Card */}
                <Card className="overflow-hidden border-[#27272A] bg-[#18181B] shadow-sm hover:border-zinc-700 transition-all">
                  {/* Cabecera del Entrenamiento */}
                  <div
                    onClick={() => toggleSession(session.id)}
                    className="p-4 cursor-pointer select-none flex items-center justify-between"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gym-primary">
                          {formatDateSpanish(session.startedAt)}
                        </span>
                        {session.newPRs && session.newPRs.length > 0 && (
                          <Badge variant="default" className="text-[9px] gap-1">
                            <Trophy className="w-2.5 h-2.5" /> {session.newPRs.length} PR
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-zinc-100 truncate">
                        {session.routineName} · {session.dayName}
                      </h3>

                      {/* Métricas destacadas: Fecha, Tiempo y Volumen */}
                      <div className="flex items-center gap-2 text-xs flex-wrap pt-0.5">
                        <Badge variant="secondary" className="gap-1 font-mono text-zinc-300">
                          <Clock className="w-3 h-3 text-gym-primary" />
                          {formatDurationHuman(session.durationSeconds)}
                        </Badge>
                        <Badge variant="default" className="gap-1 font-mono">
                          <Dumbbell className="w-3 h-3" />
                          {formatWeight(session.totalVolume)}
                        </Badge>
                        <span className="text-[11px] text-zinc-400">
                          {session.exercises.length} ejercicios
                        </span>
                      </div>
                    </div>

                    <div className="p-1.5 rounded-lg text-zinc-400 group-hover:text-zinc-200">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Desglose Detallado de Ejercicios y Series Realizadas */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 space-y-3 border-t border-[#27272A]">
                      {session.exercises.map((ex, exIdx) => (
                        <div
                          key={exIdx}
                          className="p-3.5 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-zinc-100">
                              {ex.exerciseOrder}. {ex.exerciseName}
                            </h4>
                            {ex.status === 'skipped' ? (
                              <Badge variant="destructive" className="text-[9px]">
                                Omitido
                              </Badge>
                            ) : (
                              <span className="text-[11px] text-zinc-400 font-medium">
                                {ex.sets.length} series
                              </span>
                            )}
                          </div>

                          {/* Series individuales */}
                          {ex.sets.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
                              {ex.sets.map((st) => (
                                <div
                                  key={st.setNumber}
                                  className={`p-2 rounded-lg border text-center text-xs ${
                                    st.isPR
                                      ? 'bg-gym-primary/10 border-gym-primary/30 text-gym-primary font-bold'
                                      : 'bg-[#18181B] border-[#27272A] text-zinc-300'
                                  }`}
                                >
                                  <span className="text-[10px] text-zinc-500 block font-semibold">
                                    Serie {st.setNumber} {st.isPR && '🏆'}
                                  </span>
                                  <strong className="text-sm font-bold text-zinc-100 block mt-0.5">
                                    {st.weight} kg × {st.reps}
                                  </strong>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Botón para eliminar entrenamiento */}
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSessionToDelete(session);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Borrar entrenamiento
                        </button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de confirmación para eliminar sesión */}
      <Modal
        isOpen={!!sessionToDelete}
        onClose={() => !isDeleting && setSessionToDelete(null)}
        title="¿Eliminar entrenamiento?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-zinc-300 leading-relaxed">
            ¿Estás seguro de que deseas eliminar este registro de entrenamiento ({sessionToDelete?.routineName} · {sessionToDelete?.dayName})? Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSessionToDelete(null)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteSession}
              isLoading={isDeleting}
              icon={<Trash2 className="w-4 h-4" />}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};