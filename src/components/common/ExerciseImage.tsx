import React, { useState } from 'react';
import { MuscleGroup } from '../../types/exercise';
import { Dumbbell, Activity } from 'lucide-react';

interface ExerciseImageProps {
  imageUrl?: string;
  name: string;
  muscleGroup: MuscleGroup;
  className?: string;
  priority?: boolean;
}

export const ExerciseImage: React.FC<ExerciseImageProps> = ({
  imageUrl,
  name,
  muscleGroup,
  className = '',
  priority = false,
}) => {
  const [imageError, setImageError] = useState(false);

  // Colores de acento visual según grupo muscular
  const getMuscleColor = (muscle: MuscleGroup) => {
    switch (muscle) {
      case 'pecho':
        return { fill: '#10B981', label: 'Pectorales', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'espalda':
        return { fill: '#06B6D4', label: 'Dorsales / Espalda', bg: 'rgba(6, 182, 212, 0.15)' };
      case 'hombros':
        return { fill: '#F59E0B', label: 'Deltoides', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'biceps':
        return { fill: '#8B5CF6', label: 'Bíceps', bg: 'rgba(139, 92, 246, 0.15)' };
      case 'triceps':
        return { fill: '#EC4899', label: 'Tríceps', bg: 'rgba(236, 72, 153, 0.15)' };
      case 'piernas':
        return { fill: '#3B82F6', label: 'Cuádriceps / Glúteos', bg: 'rgba(59, 130, 246, 0.15)' };
      case 'core':
        return { fill: '#EAB308', label: 'Abdomen / Core', bg: 'rgba(234, 179, 8, 0.15)' };
      default:
        return { fill: '#10B981', label: 'Fitness', bg: 'rgba(16, 185, 129, 0.15)' };
    }
  };

  const muscleMeta = getMuscleColor(muscleGroup);

  if (imageUrl && !imageError) {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-gym-card border border-gym-border/60 ${className}`}>
        <img
          src={imageUrl}
          alt={name}
          loading={priority ? 'eager' : 'lazy'}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-black/60 text-white border border-white/10 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: muscleMeta.fill }}></span>
          {muscleGroup}
        </div>
      </div>
    );
  }

  // Placeholder anatómico SVG estilizado que destaca el grupo muscular
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#182234] to-[#0F172A] border border-gym-border/80 flex flex-col items-center justify-center select-none ${className}`}
      style={{ minHeight: '180px' }}
    >
      {/* Patrón de cuadrícula tenue de fondo */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Ilustración anatómica vectorial estilizada */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">
        <svg
          viewBox="0 0 200 220"
          className="w-32 h-36 max-h-[70%] drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Silueta Humana Base en Gris Oscuro */}
          <circle cx="100" cy="30" r="16" fill="#334155" />
          {/* Cuello y Trapecio */}
          <path d="M92 46H108L118 60H82L92 46Z" fill="#334155" />
          
          {/* Hombros / Deltoides */}
          <path
            d="M74 60 C66 64 60 76 64 88 C68 94 74 92 78 82 Z"
            fill={muscleGroup === 'hombros' ? muscleMeta.fill : '#334155'}
            className="transition-colors duration-500"
          />
          <path
            d="M126 60 C134 64 140 76 136 88 C132 94 126 92 122 82 Z"
            fill={muscleGroup === 'hombros' ? muscleMeta.fill : '#334155'}
            className="transition-colors duration-500"
          />

          {/* Bíceps y Tríceps */}
          <path
            d="M62 88 C58 98 56 112 60 120 C64 122 68 116 70 106 Z"
            fill={muscleGroup === 'biceps' || muscleGroup === 'triceps' ? muscleMeta.fill : '#334155'}
          />
          <path
            d="M138 88 C142 98 144 112 140 120 C136 122 132 116 130 106 Z"
            fill={muscleGroup === 'biceps' || muscleGroup === 'triceps' ? muscleMeta.fill : '#334155'}
          />

          {/* Pecho (Pectorales Mayor y Menor) */}
          <path
            d="M80 62 C88 62 98 68 98 84 C86 86 76 78 76 68 Z"
            fill={muscleGroup === 'pecho' ? muscleMeta.fill : '#334155'}
            className="transition-colors duration-500"
          />
          <path
            d="M120 62 C112 62 102 68 102 84 C114 86 124 78 124 68 Z"
            fill={muscleGroup === 'pecho' ? muscleMeta.fill : '#334155'}
            className="transition-colors duration-500"
          />

          {/* Espalda / Dorsal Ancho */}
          <path
            d="M74 80 C70 96 74 114 84 122 C86 110 82 92 78 82 Z"
            fill={muscleGroup === 'espalda' ? muscleMeta.fill : '#1E293B'}
          />
          <path
            d="M126 80 C130 96 126 114 116 122 C114 110 118 92 122 82 Z"
            fill={muscleGroup === 'espalda' ? muscleMeta.fill : '#1E293B'}
          />

          {/* Core / Abdominales */}
          <rect
            x="86"
            y="90"
            width="12"
            height="10"
            rx="2"
            fill={muscleGroup === 'core' ? muscleMeta.fill : '#334155'}
          />
          <rect
            x="102"
            y="90"
            width="12"
            height="10"
            rx="2"
            fill={muscleGroup === 'core' ? muscleMeta.fill : '#334155'}
          />
          <rect
            x="86"
            y="104"
            width="12"
            height="10"
            rx="2"
            fill={muscleGroup === 'core' ? muscleMeta.fill : '#334155'}
          />
          <rect
            x="102"
            y="104"
            width="12"
            height="10"
            rx="2"
            fill={muscleGroup === 'core' ? muscleMeta.fill : '#334155'}
          />

          {/* Piernas / Cuádriceps y Glúteos */}
          <path
            d="M84 126 C78 140 76 166 80 186 C86 188 92 168 94 146 Z"
            fill={muscleGroup === 'piernas' ? muscleMeta.fill : '#334155'}
          />
          <path
            d="M116 126 C122 140 124 166 120 186 C114 188 108 168 106 146 Z"
            fill={muscleGroup === 'piernas' ? muscleMeta.fill : '#334155'}
          />
        </svg>

        {/* Nombre del Músculo y Ejercicio */}
        <div className="mt-2 text-center">
          <span
            className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase"
            style={{ backgroundColor: muscleMeta.bg, color: muscleMeta.fill }}
          >
            {muscleMeta.label}
          </span>
          <p className="text-xs text-gray-400 font-medium mt-1 truncate max-w-[200px]">
            {name}
          </p>
        </div>
      </div>

      {/* Badge esquina */}
      <div className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/40 border border-white/5 text-gray-400">
        <Activity className="w-3.5 h-3.5" style={{ color: muscleMeta.fill }} />
      </div>
    </div>
  );
};