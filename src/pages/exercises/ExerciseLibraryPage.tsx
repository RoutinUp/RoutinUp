import React, { useEffect, useState } from 'react';
import { exerciseService } from '../../services/exercise.service';
import { useAuthStore } from '../../store/useAuthStore';
import { Exercise, MuscleGroup, CreateExerciseInput } from '../../types/exercise';
import { ExerciseImage } from '../../components/common/ExerciseImage';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Search, Plus, Dumbbell, Filter, Info, ChevronRight, Check } from 'lucide-react';

const MUSCLE_FILTERS: { id: MuscleGroup | 'todos'; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'pecho', label: 'Pecho' },
  { id: 'espalda', label: 'Espalda' },
  { id: 'hombros', label: 'Hombros' },
  { id: 'biceps', label: 'Bíceps' },
  { id: 'triceps', label: 'Tríceps' },
  { id: 'piernas', label: 'Piernas' },
  { id: 'core', label: 'Core' },
];

export const ExerciseLibraryPage: React.FC = () => {
  const { user } = useAuthStore();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'todos'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Formulario nuevo ejercicio
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newMuscle, setNewMuscle] = useState<MuscleGroup>('pecho');
  const [newEquipment, setNewEquipment] = useState<any>('barra');
  const [newType, setNewType] = useState<any>('compuesto');
  const [newTips, setNewTips] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadExercises = async () => {
    try {
      setIsLoading(true);
      const list = await exerciseService.getExercises(user?.id);
      setExercises(list);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, [user]);

  const filteredExercises = exercises.filter((ex) => {
    const matchesMuscle = selectedMuscle === 'todos' || ex.mainMuscleGroup === selectedMuscle;
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMuscle && matchesSearch;
  });

  const handleCreateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setIsSubmitting(true);
      const input: CreateExerciseInput = {
        name: newName.trim(),
        description: newDesc.trim(),
        mainMuscleGroup: newMuscle,
        equipment: newEquipment,
        exerciseType: newType,
        techniqueTips: newTips.trim(),
        difficultyLevel: 'intermedio',
        imageUrl: newImageUrl.trim() || undefined,
      };

      await exerciseService.createCustomExercise(input, user?.id);
      setIsCreateModalOpen(false);
      // Reset form
      setNewName('');
      setNewDesc('');
      setNewTips('');
      setNewImageUrl('');
      await loadExercises();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header y Botón Crear Ejercicio */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Biblioteca de Ejercicios
          </h1>
          <p className="text-xs text-gray-400">
            {exercises.length} ejercicios disponibles
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          icon={<Plus className="w-4 h-4 stroke-[3]" />}
        >
          Crear
        </Button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar ejercicio por nombre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gym-card border border-gym-border rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Filtros por Grupo Muscular con scroll horizontal suave */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {MUSCLE_FILTERS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setSelectedMuscle(m.id)}
            className={`
              px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all select-none
              ${selectedMuscle === m.id
                ? 'bg-emerald-500 text-slate-950 shadow-glow-primary'
                : 'bg-gym-card text-gray-300 border border-gym-border hover:border-gray-500'
              }
            `}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Lista de Ejercicios */}
      {filteredExercises.length === 0 ? (
        <div className="text-center py-10 rounded-2xl bg-gym-card border border-gym-border/60">
          <Dumbbell className="w-10 h-10 text-gray-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-400">No se encontraron ejercicios</p>
          <p className="text-xs text-gray-500 mt-1">Prueba con otro filtro o crea uno nuevo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredExercises.map((ex) => (
            <div
              key={ex.id}
              onClick={() => setSelectedExercise(ex)}
              className="p-3.5 rounded-2xl bg-gym-card border border-gym-border/70 hover:border-emerald-500/50 transition-all cursor-pointer flex items-center gap-3.5 group"
            >
              {/* Miniatura Ilustración Anatómica */}
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-900 border border-gym-border/80">
                <ExerciseImage
                  imageUrl={ex.imageUrl}
                  name={ex.name}
                  muscleGroup={ex.mainMuscleGroup}
                  secondaryMuscles={ex.secondaryMuscles}
                  variant="thumbnail"
                  className="w-full h-full"
                />
              </div>

              {/* Datos */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    {ex.mainMuscleGroup}
                  </span>
                  {ex.isCustom && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold">
                      Personalizado
                    </span>
                  )}
                </div>
                <h4 className="text-[clamp(0.95rem,3.5vw,1.1rem)] font-bold text-white whitespace-normal break-words [word-break:break-word] group-hover:text-emerald-400 transition-colors leading-snug">
                  {ex.name}
                </h4>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {ex.equipment} · {ex.exerciseType}
                </p>
              </div>

              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* Modal Detalle de Ejercicio */}
      {selectedExercise && (
        <Modal
          isOpen={Boolean(selectedExercise)}
          onClose={() => setSelectedExercise(null)}
          title={selectedExercise.name}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="w-full h-52 sm:h-60 rounded-2xl overflow-hidden bg-slate-900">
              <ExerciseImage
                imageUrl={selectedExercise.imageUrl}
                name={selectedExercise.name}
                muscleGroup={selectedExercise.mainMuscleGroup}
                secondaryMuscles={selectedExercise.secondaryMuscles}
                variant="card"
                className="w-full h-full"
              />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">
                {selectedExercise.mainMuscleGroup} · {selectedExercise.equipment}
              </span>
              <p className="text-sm text-gray-300 mt-1 leading-relaxed">
                {selectedExercise.description}
              </p>
            </div>

            {selectedExercise.techniqueTips && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                <strong className="block font-bold mb-0.5">Consejo de técnica:</strong>
                {selectedExercise.techniqueTips}
              </div>
            )}

            {selectedExercise.instructions.length > 0 && (
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Ejecución paso a paso:
                </h5>
                <ol className="space-y-1.5 list-decimal list-inside text-xs text-gray-300">
                  {selectedExercise.instructions.map((inst, idx) => (
                    <li key={idx} className="leading-snug">{inst}</li>
                  ))}
                </ol>
              </div>
            )}

            <Button
              size="md"
              fullWidth
              variant="secondary"
              onClick={() => setSelectedExercise(null)}
            >
              CERRAR
            </Button>
          </div>
        </Modal>
      )}

      {/* Modal Crear Ejercicio Personalizado */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Ejercicio Personalizado"
        maxWidth="md"
      >
        <form onSubmit={handleCreateExercise} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Nombre</label>
            <input
              type="text"
              required
              placeholder="Ej: Press Guillotina"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-gym-border rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Grupo Muscular</label>
              <select
                value={newMuscle}
                onChange={(e) => setNewMuscle(e.target.value as MuscleGroup)}
                className="w-full px-3 py-2 bg-slate-900 border border-gym-border rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="pecho">Pecho</option>
                <option value="espalda">Espalda</option>
                <option value="hombros">Hombros</option>
                <option value="biceps">Bíceps</option>
                <option value="triceps">Tríceps</option>
                <option value="piernas">Piernas</option>
                <option value="core">Core</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Equipamiento</label>
              <select
                value={newEquipment}
                onChange={(e) => setNewEquipment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-gym-border rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="barra">Barra</option>
                <option value="mancuernas">Mancuernas</option>
                <option value="maquina">Máquina</option>
                <option value="polea">Polea</option>
                <option value="peso_corporal">Peso Corporal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Descripción Breve</label>
            <textarea
              rows={2}
              placeholder="Detalle o función del ejercicio..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-900 border border-gym-border rounded-xl text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-gray-400 block mb-1">Consejo de Técnica</label>
            <input
              type="text"
              placeholder="Ej: Mantener pecho erguido y core apretado"
              value={newTips}
              onChange={(e) => setNewTips(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-900 border border-gym-border rounded-xl text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-gray-400 block mb-1">URL de Imagen (Opcional)</label>
            <input
              type="url"
              placeholder="https://... (o deja vacío para placeholder anatómico)"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-900 border border-gym-border rounded-xl text-xs text-white focus:outline-none"
            />
          </div>

          <div className="pt-2 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsCreateModalOpen(false)}
            >
              CANCELAR
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
            >
              GUARDAR
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};