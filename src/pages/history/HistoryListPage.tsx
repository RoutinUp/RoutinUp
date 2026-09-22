import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { workoutService } from '../../services/workout.service';
import { useAuthStore } from '../../store/useAuthStore';
import { WorkoutSession } from '../../types/workout';
import { formatDurationHuman, formatDateSpanish, formatWeight } from '../../utils/formatters';
import { History, Calendar, Clock, Dumbbell, Award, ChevronDown, ChevronUp, ArrowLeft, Trophy } from 'lucide-react';

export const HistoryListPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(id || null);
  const [isLoading, setIsLoading] = useState(true);

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

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Historial de Entrenamientos</h1>
        <p className="text-xs text-gray-400">Revisa tus sesiones y el detalle de cada serie realizada</p>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12 rounded-3xl bg-gym-card border border-gym-border/70 p-6">
          <History className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No hay entrenamientos guardados</h3>
          <p className="text-xs text-gray-400 mt-1 mb-4">
            Completa tu primera rutina para empezar a construir tu historial de récords.
          </p>
          <Link
            to="/"
            className="inline-block px-5 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider"
          >
            Ir al Inicio
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const isExpanded = selectedSessionId === session.id;
            return (
              <div
                key={session.id}
                className="rounded-3xl bg-gym-card border border-gym-border/80 overflow-hidden shadow-md transition-all"
              >
                {/* Cabecera del Entrenamiento */}
                <div
                  onClick={() => toggleSession(session.id)}
                  className="p-4 cursor-pointer select-none flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                        {formatDateSpanish(session.startedAt)}
                      </span>
                      {session.newPRs && session.newPRs.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black flex items-center gap-0.5">
                          <Trophy className="w-3 h-3" /> {session.newPRs.length} PR
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-black text-white mt-0.5">
                      {session.routineName} · {session.dayName}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        {formatDurationHuman(session.durationSeconds)}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <Dumbbell className="w-3 h-3" />
                        {formatWeight(session.totalVolume)}
                      </span>
                      <span>·</span>
                      <span>{session.exercises.length} ejercicios</span>
                    </div>
                  </div>

                  <div className="p-2 text-gray-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {/* Desglose Detallado de Ejercicios y Series Realizadas */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 space-y-3 border-t border-gym-border/40">
                    {session.exercises.map((ex, exIdx) => (
                      <div
                        key={exIdx}
                        className="p-3 rounded-2xl bg-gym-bg/90 border border-gym-border/60 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white">
                            {ex.exerciseOrder}. {ex.exerciseName}
                          </h4>
                          {ex.status === 'skipped' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                              Omitido
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400">
                              {ex.sets.length} series
                            </span>
                          )}
                        </div>

                        {/* Series individuales */}
                        {ex.sets.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                            {ex.sets.map((st) => (
                              <div
                                key={st.setNumber}
                                className={`p-2 rounded-xl border text-center text-xs ${
                                  st.isPR
                                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                                    : 'bg-gym-card border-gym-border/60 text-gray-300'
                                }`}
                              >
                                <span className="text-[10px] text-gray-400 block font-semibold">
                                  Serie {st.setNumber} {st.isPR && '🏆'}
                                </span>
                                <strong className="text-sm font-black text-white block mt-0.5">
                                  {st.weight} kg × {st.reps}
                                </strong>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};