import React, { useState } from 'react';
import { MuscleGroup } from '../../types/exercise';
import { Activity } from 'lucide-react';

export interface ExerciseImageProps {
  imageUrl?: string;
  name: string;
  muscleGroup: MuscleGroup;
  className?: string;
  priority?: boolean;
  variant?: 'auto' | 'thumbnail' | 'card' | 'badge';
}

interface MuscleMeta {
  color: string;
  bgTint: string;
  label: string;
  sublabel: string;
}

const getMuscleMeta = (muscle: MuscleGroup): MuscleMeta => {
  switch (muscle) {
    case 'pecho':
      return {
        color: '#10B981', // Emerald vibrante
        bgTint: 'rgba(16, 185, 129, 0.15)',
        label: 'Pecho',
        sublabel: 'Pectorales',
      };
    case 'espalda':
      return {
        color: '#06B6D4', // Cyan
        bgTint: 'rgba(6, 182, 212, 0.15)',
        label: 'Espalda',
        sublabel: 'Dorsales y Trapecio',
      };
    case 'hombros':
      return {
        color: '#F59E0B', // Amber
        bgTint: 'rgba(245, 158, 11, 0.15)',
        label: 'Hombros',
        sublabel: 'Deltoides',
      };
    case 'biceps':
      return {
        color: '#8B5CF6', // Violet
        bgTint: 'rgba(139, 92, 246, 0.15)',
        label: 'Bíceps',
        sublabel: 'Brazo Anterior',
      };
    case 'triceps':
      return {
        color: '#EC4899', // Pink / Rose
        bgTint: 'rgba(236, 72, 153, 0.15)',
        label: 'Tríceps',
        sublabel: 'Brazo Posterior',
      };
    case 'piernas':
      return {
        color: '#3B82F6', // Blue
        bgTint: 'rgba(59, 130, 246, 0.15)',
        label: 'Piernas',
        sublabel: 'Cuádriceps y Glúteos',
      };
    case 'core':
      return {
        color: '#EAB308', // Gold
        bgTint: 'rgba(234, 179, 8, 0.15)',
        label: 'Core',
        sublabel: 'Abdomen y Lumbar',
      };
    case 'cardio':
      return {
        color: '#EF4444', // Red
        bgTint: 'rgba(239, 68, 68, 0.15)',
        label: 'Cardio',
        sublabel: 'Resistencia Aeróbica',
      };
    case 'cuerpo_completo':
    default:
      return {
        color: '#6366F1', // Indigo
        bgTint: 'rgba(99, 102, 241, 0.15)',
        label: 'Cuerpo Completo',
        sublabel: 'Full Body Funcional',
      };
  }
};

/**
 * Silueta humana estilizada y centrada que ilumina los músculos ejercitados.
 */
export const HumanAnatomySilhouette: React.FC<{
  muscleGroup: MuscleGroup;
  className?: string;
}> = ({ muscleGroup, className = 'w-full h-full' }) => {
  const meta = getMuscleMeta(muscleGroup);
  const activeColor = meta.color;

  const isChest = muscleGroup === 'pecho' || muscleGroup === 'cuerpo_completo';
  const isBack = muscleGroup === 'espalda' || muscleGroup === 'cuerpo_completo';
  const isShoulders = muscleGroup === 'hombros' || muscleGroup === 'cuerpo_completo';
  const isBiceps = muscleGroup === 'biceps' || muscleGroup === 'cuerpo_completo';
  const isTriceps = muscleGroup === 'triceps' || muscleGroup === 'cuerpo_completo';
  const isCore = muscleGroup === 'core' || muscleGroup === 'cuerpo_completo';
  const isLegs = muscleGroup === 'piernas' || muscleGroup === 'cuerpo_completo';
  const isCardio = muscleGroup === 'cardio';

  const baseMuscleColor = '#334155'; // Gris pizarra oscuro para músculos en reposo
  const deepBaseColor = '#1E293B'; // Tono más oscuro para fondo/profundidad anatómica

  return (
    <svg
      viewBox="0 0 200 230"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} select-none`}
    >
      <defs>
        {/* Filtro de resplandor para el músculo iluminado */}
        <filter id={`glow-${muscleGroup}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor={activeColor} floodOpacity="0.65" />
        </filter>
      </defs>

      {/* Silueta Humana Base */}
      {/* 1. Cabeza y Cuello */}
      <circle cx="100" cy="24" r="14" fill={deepBaseColor} />
      <path d="M93 37H107L116 48H84L93 37Z" fill={baseMuscleColor} />

      {/* 2. Trapecio */}
      <path
        d="M84 48L100 44L116 48L126 58H74L84 48Z"
        fill={isBack ? activeColor : deepBaseColor}
        filter={isBack ? `url(#glow-${muscleGroup})` : undefined}
        className="transition-colors duration-300"
      />

      {/* 3. Hombros / Deltoides */}
      <path
        d="M74 58 C64 62 56 74 60 86 C64 92 72 90 77 82 Z"
        fill={isShoulders ? activeColor : baseMuscleColor}
        filter={isShoulders ? `url(#glow-${muscleGroup})` : undefined}
        className="transition-colors duration-300"
      />
      <path
        d="M126 58 C136 62 144 74 140 86 C136 92 128 90 123 82 Z"
        fill={isShoulders ? activeColor : baseMuscleColor}
        filter={isShoulders ? `url(#glow-${muscleGroup})` : undefined}
        className="transition-colors duration-300"
      />

      {/* 4. Bíceps y Tríceps (Brazos) */}
      <path
        d="M59 86 C55 96 53 112 57 122 C61 124 66 118 68 108 Z"
        fill={isBiceps || isTriceps ? activeColor : baseMuscleColor}
        filter={isBiceps || isTriceps ? `url(#glow-${muscleGroup})` : undefined}
        className="transition-colors duration-300"
      />
      <path
        d="M141 86 C145 96 147 112 143 122 C139 124 134 118 132 108 Z"
        fill={isBiceps || isTriceps ? activeColor : baseMuscleColor}
        filter={isBiceps || isTriceps ? `url(#glow-${muscleGroup})` : undefined}
        className="transition-colors duration-300"
      />

      {/* Antebrazos */}
      <path
        d="M57 122 C54 132 55 146 59 154 C63 155 67 148 67 138 Z"
        fill={isBiceps ? activeColor : deepBaseColor}
        className="transition-colors duration-300"
      />
      <path
        d="M143 122 C146 132 145 146 141 154 C137 155 133 148 133 138 Z"
        fill={isBiceps ? activeColor : deepBaseColor}
        className="transition-colors duration-300"
      />

      {/* 5. Espalda / Dorsales (visibles en los laterales del torso) */}
      <path
        d="M73 80 C68 96 73 114 83 122 C85 110 81 92 77 82 Z"
        fill={isBack ? activeColor : deepBaseColor}
        filter={isBack ? `url(#glow-${muscleGroup})` : undefined}
        className="transition-colors duration-300"
      />
      <path
        d="M127 80 C132 96 127 114 117 122 C115 110 119 92 123 82 Z"
        fill={isBack ? activeColor : deepBaseColor}
        filter={isBack ? `url(#glow-${muscleGroup})` : undefined}
        className="transition-colors duration-300"
      />

      {/* 6. Pecho (Pectorales Mayor y Menor Iluminados) */}
      <path
        d="M79 59 C88 59 98 65 98 82 C86 84 76 76 75 66 Z"
        fill={isChest ? activeColor : baseMuscleColor}
        filter={isChest ? `url(#glow-${muscleGroup})` : undefined}
        className="transition-colors duration-300"
      />
      <path
        d="M121 59 C112 59 102 65 102 82 C114 84 124 76 125 66 Z"
        fill={isChest ? activeColor : baseMuscleColor}
        filter={isChest ? `url(#glow-${muscleGroup})` : undefined}
        className="transition-colors duration-300"
      />

      {/* 7. Core / Abdominales (Six-pack simétrico) */}
      <rect
        x="85"
        y="88"
        width="13"
        height="9"
        rx="2"
        fill={isCore ? activeColor : baseMuscleColor}
        filter={isCore ? `url(#glow-${muscleGroup})` : undefined}
        className="transition-colors duration-300"
      />
      <rect
        x="102"
        y="88"
        width="13"
        height="9"
        rx="2"
        fill={isCore ? activeColor : baseMuscleColor}
        filter={isCore ? `url(#glow-${muscleGroup})` : undefined}
        className="transition-colors duration-300"
      />
      <rect
        x="85"
        y="100"
        width="13"
        height="9"
        rx="2"
        fill={isCore ? activeColor : baseMuscleColor}
        filter={isCore ? `url(#glow-${muscleGroup})` : undefined}
        className="transition-colors duration-300"
      />
      <rect
        x="102"
        y="100"
        width="13"
        height="9"
        rx="2"
        fill={isCore ? activeColor : baseMuscleColor}
        filter={isCore ? `url(#glow-${muscleGroup})` : undefined}
        className="transition-colors duration-300"
      />
      <rect
        x="86"
        y="112"
        width="12"
        height="9"
        rx="2"
        fill={isCore ? activeColor : baseMuscleColor}
        filter={isCore ? `url(#glow-${muscleGroup})` : undefined}
        className="transition-colors duration-300"
      />
      <rect
        x="102"
        y="112"
        width="12"
        height="9"
        rx="2"
        fill={isCore ? activeColor : baseMuscleColor}
        filter={isCore ? `url(#glow-${muscleGroup})` : undefined}
        className="transition-colors duration-300"
      />

      {/* 8. Pelvis / Cintura */}
      <path d="M84 124 H116 L121 138 H79 L84 124 Z" fill={deepBaseColor} />

      {/* 9. Piernas / Cuádriceps y Glúteos */}
      <path
        d="M82 138 C75 152 73 178 78 198 C85 200 91 180 94 158 Z"
        fill={isLegs ? activeColor : baseMuscleColor}
        filter={isLegs ? `url(#glow-${muscleGroup})` : undefined}
        className="transition-colors duration-300"
      />
      <path
        d="M118 138 C125 152 127 178 122 198 C115 200 109 180 106 158 Z"
        fill={isLegs ? activeColor : baseMuscleColor}
        filter={isLegs ? `url(#glow-${muscleGroup})` : undefined}
        className="transition-colors duration-300"
      />

      {/* Vasto medial / interior muslo */}
      <path
        d="M86 160 C90 176 92 190 88 198 C84 198 84 186 84 172 Z"
        fill={isLegs ? activeColor : deepBaseColor}
        className="transition-colors duration-300"
      />
      <path
        d="M114 160 C110 176 108 190 112 198 C116 198 116 186 116 172 Z"
        fill={isLegs ? activeColor : deepBaseColor}
        className="transition-colors duration-300"
      />

      {/* Gemelos / Pantorrillas */}
      <path
        d="M78 200 C76 210 78 224 82 228 C86 228 88 216 87 202 Z"
        fill={isLegs ? activeColor : deepBaseColor}
        className="transition-colors duration-300"
      />
      <path
        d="M122 200 C124 210 122 224 118 228 C114 228 112 216 113 202 Z"
        fill={isLegs ? activeColor : deepBaseColor}
        className="transition-colors duration-300"
      />

      {/* Efecto especial para cardio: Pulso central en el pecho */}
      {isCardio && (
        <g filter={`url(#glow-${muscleGroup})`}>
          <path
            d="M82 72 H92 L96 64 L100 80 L104 68 L108 72 H118"
            stroke={activeColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}
    </svg>
  );
};

export const ExerciseImage: React.FC<ExerciseImageProps> = ({
  imageUrl,
  name,
  muscleGroup,
  className = '',
  priority = false,
  variant = 'auto',
}) => {
  const [imageError, setImageError] = useState(false);
  const meta = getMuscleMeta(muscleGroup);

  // Si hay imagen real de URL y no falló, renderizarla
  if (imageUrl && !imageError) {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-slate-900 border border-gym-border/60 ${className}`}>
        <img
          src={imageUrl}
          alt={name}
          loading={priority ? 'eager' : 'lazy'}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
        />
        {variant !== 'thumbnail' && variant !== 'badge' && (
          <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md bg-black/60 text-white border border-white/10 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }}></span>
            {meta.label}
          </div>
        )}
      </div>
    );
  }

  // 1. MODO THUMBNAIL / BADGE (para listas, editores y selectores compactos)
  const isThumbnail =
    variant === 'thumbnail' ||
    variant === 'badge' ||
    className.includes('w-11') ||
    className.includes('w-12') ||
    className.includes('w-14') ||
    className.includes('w-16');

  if (isThumbnail) {
    return (
      <div
        className={`w-full h-full rounded-xl flex items-center justify-center relative select-none overflow-hidden p-1 ${className}`}
        style={{
          backgroundColor: '#0D131F',
          border: `1px solid ${meta.color}35`,
          boxShadow: `inset 0 0 10px ${meta.color}10`,
        }}
        title={`${name} (${meta.label})`}
      >
        <HumanAnatomySilhouette
          muscleGroup={muscleGroup}
          className="w-full h-full max-h-full object-contain drop-shadow-sm"
        />
      </div>
    );
  }

  // 2. MODO CARD COMPLETA (para pantalla de entrenamiento activo o modal de detalle)
  return (
    <div
      className={`w-full h-full relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#131B28] via-[#0E141F] to-[#0A0D15] border border-gym-border/80 flex flex-col items-center justify-center select-none p-3 ${className}`}
    >
      {/* Resplandor radial de acento visual según el grupo muscular */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${meta.color} 0%, transparent 68%)`,
        }}
      />

      {/* Trama sutil de micropuntos de fondo */}
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

      {/* Badge flotante en la esquina superior izquierda */}
      <div className="absolute top-2.5 left-2.5 z-10">
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md"
          style={{
            backgroundColor: `${meta.color}18`,
            color: meta.color,
            border: `1px solid ${meta.color}35`,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: meta.color }} />
          {meta.label}
        </div>
      </div>

      {/* Badge esquina superior derecha */}
      <div className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-lg bg-black/40 border border-white/5 text-gray-400">
        <Activity className="w-3.5 h-3.5" style={{ color: meta.color }} />
      </div>

      {/* Ilustración de la Silueta Humana Centrada con Músculos Iluminados */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center my-auto">
        <div className="flex items-center justify-center h-32 sm:h-36 w-full max-h-[80%]">
          <HumanAnatomySilhouette
            muscleGroup={muscleGroup}
            className="h-full w-auto max-w-[80%] drop-shadow-md"
          />
        </div>

        <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">
          {meta.sublabel}
        </span>
      </div>
    </div>
  );
};