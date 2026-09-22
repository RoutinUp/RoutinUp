import React, { useEffect, useState } from 'react';
import { exerciseService } from '../../services/exercise.service';
import { workoutService } from '../../services/workout.service';
import { useAuthStore } from '../../store/useAuthStore';
import { Exercise } from '../../types/exercise';
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
import { Trophy, TrendingUp, Dumbbell, Award, Flame, ChevronRight } from 'lucide-react';

export const ProgressPage: React.FC = () => {
  const { user } = useAuthStore();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [progressData, setProgressData] = useState<ExerciseProgressPoint[]>([]);
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        const [exList, prList] = await Promise.all([
          exerciseService.getExercises(user?.id),
          workoutService.getPersonalRecords(user?.id),
        ]);
        setExercises(exList);
        setRecords(prList);

        if (exList.length > 0) {
          // Seleccionar por defecto Press banca o el primero
          const defaultEx = exList.find((e) => e.slug.includes('press-banca')) || exList[0];
          setSelectedExerciseId(defaultEx.id);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, [user]);

  useEffect(() => {
    if (!selectedExerciseId) return;

    const loadExerciseProgress = async () => {
      const data = await workoutService.getExerciseProgressData(selectedExerciseId, user?.id);
      setProgressData(data);
    };

    loadExerciseProgress();
  }, [selectedExerciseId, user]);

  const selectedExercise = exercises.find((e) => e.id === selectedExerciseId);

  // Estadísticas clave del ejercicio seleccionado
  const maxWeightEver = progressData.length > 0
    ? Math.max(...progressData.map((p) => p.maxWeight))
    : 0;

  const maxRepsEver = progressData.length > 0
    ? Math.max(...progressData.map((p) => p.repsAtMaxWeight))
    : 0;

  const max1RMEver = progressData.length > 0
    ? Math.max(...progressData.map((p) => p.estimatedOneRepMax))
    : 0;

  const totalVolumeEver = progressData.reduce((acc, p) => acc + p.totalVolume, 0);

  return (
    <div className="space-y-5 pb-20">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Progreso & Récords</h1>
        <p className="text-xs text-gray-400">Analiza tu evolución y superación de marcas</p>
      </div>

      {/* Selector de Ejercicio */}
      <div className="bg-gym-card border border-gym-border rounded-2xl p-3.5">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
          Seleccionar Ejercicio
        </label>
        <select
          value={selectedExerciseId}
          onChange={(e) => setSelectedExerciseId(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-900 border border-gym-border rounded-xl text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
        >
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name} ({ex.mainMuscleGroup})
            </option>
          ))}
        </select>
      </div>

      {/* Indicadores Clave del Ejercicio */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl bg-gym-card border border-gym-border/70 flex flex-col items-center text-center">
          <Dumbbell className="w-5 h-5 text-emerald-400 mb-1" />
          <span className="text-[10px] text-gray-400 uppercase font-bold">Peso Máximo</span>
          <span className="text-lg font-black text-white">{maxWeightEver} kg</span>
        </div>

        <div className="p-3 rounded-2xl bg-gym-card border border-gym-border/70 flex flex-col items-center text-center">
          <Flame className="w-5 h-5 text-amber-400 mb-1" />
          <span className="text-[10px] text-gray-400 uppercase font-bold">1RM Estimado</span>
          <span className="text-lg font-black text-amber-400">{max1RMEver} kg</span>
        </div>

        <div className="p-3 rounded-2xl bg-gym-card border border-gym-border/70 flex flex-col items-center text-center">
          <Award className="w-5 h-5 text-cyan-400 mb-1" />
          <span className="text-[10px] text-gray-400 uppercase font-bold">Mayor Reps</span>
          <span className="text-lg font-black text-white">{maxRepsEver} reps</span>
        </div>

        <div className="p-3 rounded-2xl bg-gym-card border border-gym-border/70 flex flex-col items-center text-center">
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

      {/* Vitrina de Récords Personales (PRs) */}
      <div className="rounded-3xl bg-gym-card border border-gym-border p-4 space-y-3">
        <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-400" />
          RÉCORDS PERSONALES (PRs)
        </h3>

        {records.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">
            Los récords de peso se registrarán y celebrarán automáticamente al entrenar.
          </p>
        ) : (
          <div className="space-y-2">
            {records.slice(0, 5).map((pr) => (
              <div
                key={pr.id}
                className="p-3 rounded-2xl bg-gym-bg border border-amber-500/20 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{pr.exerciseName}</h4>
                  <span className="text-[10px] text-gray-400">
                    {formatDateSpanish(pr.achievedAt)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-amber-400">
                    {pr.value} kg {pr.reps ? `× ${pr.reps}` : ''}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-gray-400 block">
                    Mayor Peso
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