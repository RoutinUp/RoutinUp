import React, { useState } from 'react';
import { MuscleGroup } from '../../types/exercise';

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
        color: '#10B981', // Emerald
        bgTint: 'rgba(16, 185, 129, 0.14)',
        label: 'Pecho',
        sublabel: 'Pectorales',
      };
    case 'espalda':
      return {
        color: '#06B6D4', // Cyan
        bgTint: 'rgba(6, 182, 212, 0.14)',
        label: 'Espalda',
        sublabel: 'Dorsales y Trapecio',
      };
    case 'hombros':
      return {
        color: '#F59E0B', // Amber
        bgTint: 'rgba(245, 158, 11, 0.14)',
        label: 'Hombros',
        sublabel: 'Deltoides',
      };
    case 'biceps':
      return {
        color: '#8B5CF6', // Violet
        bgTint: 'rgba(139, 92, 246, 0.14)',
        label: 'Bíceps',
        sublabel: 'Brazo Anterior',
      };
    case 'triceps':
      return {
        color: '#F43F5E', // Rose
        bgTint: 'rgba(244, 63, 94, 0.14)',
        label: 'Tríceps',
        sublabel: 'Brazo Posterior',
      };
    case 'piernas':
      return {
        color: '#3B82F6', // Blue
        bgTint: 'rgba(59, 130, 246, 0.14)',
        label: 'Piernas',
        sublabel: 'Cuádriceps y Glúteos',
      };
    case 'core':
      return {
        color: '#EAB308', // Yellow
        bgTint: 'rgba(234, 179, 8, 0.14)',
        label: 'Core',
        sublabel: 'Abdomen y Lumbar',
      };
    case 'cardio':
      return {
        color: '#EF4444', // Red
        bgTint: 'rgba(239, 68, 68, 0.14)',
        label: 'Cardio',
        sublabel: 'Resistencia Aeróbica',
      };
    case 'cuerpo_completo':
    default:
      return {
        color: '#6366F1', // Indigo
        bgTint: 'rgba(99, 102, 241, 0.14)',
        label: 'Cuerpo Completo',
        sublabel: 'Full Body Funcional',
      };
  }
};

/**
 * Íconos SVG vectoriales minimalistas de líneas finas (strokeWidth 1.75-2)
 * para cada grupo muscular.
 */
export const MuscleGroupIcon: React.FC<{
  muscleGroup: MuscleGroup;
  color?: string;
  className?: string;
}> = ({ muscleGroup, color, className = 'w-6 h-6' }) => {
  const meta = getMuscleMeta(muscleGroup);
  const strokeColor = color || meta.color;

  switch (muscleGroup) {
    case 'pecho':
      return (
        <svg
          viewBox="0 0 32 32"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          {/* Clavículas / Cuello */}
          <path d="M7 11C11 12.5 13.5 12.5 16 11.5C18.5 12.5 21 12.5 25 11" />
          {/* Esternón vertical */}
          <path d="M16 12V22" strokeDasharray="1 2" />
          {/* Pectoral Izquierdo */}
          <path d="M8 13C12 13 15 14.5 15 20C12 21.5 9 20.5 7.5 18C6.5 15.5 7.2 13.8 8 13Z" fill={meta.bgTint} />
          {/* Pectoral Derecho */}
          <path d="M24 13C20 13 17 14.5 17 20C20 21.5 23 20.5 24.5 18C25.5 15.5 24.8 13.8 24 13Z" fill={meta.bgTint} />
        </svg>
      );

    case 'espalda':
      return (
        <svg
          viewBox="0 0 32 32"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          {/* Columna vertebral */}
          <path d="M16 7V26" strokeDasharray="1.5 2" />
          {/* Trapecio superior */}
          <path d="M11 9L16 7L21 9" />
          {/* Dorsales V-Taper Izquierdo */}
          <path d="M9 11C13.5 13 15 17 15 23C12.5 23 10 20 8.5 15C8 13.5 8.5 12 9 11Z" fill={meta.bgTint} />
          {/* Dorsales V-Taper Derecho */}
          <path d="M23 11C18.5 13 17 17 17 23C19.5 23 22 20 23.5 15C24 13.5 23.5 12 23 11Z" fill={meta.bgTint} />
        </svg>
      );

    case 'hombros':
      return (
        <svg
          viewBox="0 0 32 32"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          {/* Cuello y Trapecio */}
          <path d="M13 10C14 12 15 12.5 16 12.5C17 12.5 18 12 19 10" />
          <path d="M11 13H21" />
          {/* Deltoide Izquierdo (cap lateral y anterior) */}
          <path d="M10 13C7 14 5 17 5 20C6 22.5 8.5 22.5 10.5 20C11 17 11 14.5 10 13Z" fill={meta.bgTint} />
          {/* Deltoide Derecho (cap lateral y anterior) */}
          <path d="M22 13C25 14 27 17 27 20C26 22.5 23.5 22.5 21.5 20C21 17 21 14.5 22 13Z" fill={meta.bgTint} />
          {/* Línea pectoral superior */}
          <path d="M11 19C13 21 19 21 21 19" />
        </svg>
      );

    case 'biceps':
      return (
        <svg
          viewBox="0 0 32 32"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          {/* Brazo en flexión: hombro, bíceps picudo y antebrazo */}
          <path d="M8 16L11 11C12.5 9.5 15 10 16 12.5" />
          {/* Pico del bíceps */}
          <path d="M16 12.5C18 11.5 21 12.5 22 15.5C22 18.5 19 20 16 19.5" fill={meta.bgTint} />
          {/* Codo y antebrazo inferior */}
          <path d="M10 13L9 19C9 22 12.5 23 16 23L23 23" />
          <path d="M16 23C20.5 23 23 21.5 23 18" />
        </svg>
      );

    case 'triceps':
      return (
        <svg
          viewBox="0 0 32 32"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          {/* Brazo posterior y herradura del tríceps */}
          <path d="M11 9C14.5 9 16 11.5 16 15" />
          {/* Herradura del tríceps lateral / largo */}
          <path d="M16 14C19 15.5 20 19 19 23C17.5 26 14.5 26 13 26" fill={meta.bgTint} />
          <path d="M13 26L11 21L11 12" />
          <path d="M15 16C17 17.5 17 20 16 22" />
        </svg>
      );

    case 'piernas':
      return (
        <svg
          viewBox="0 0 32 32"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          {/* Cadera */}
          <path d="M9 9H23" />
          {/* Muslo Izquierdo / Cuádriceps */}
          <path d="M10 10C8.5 15 9 19.5 11 24C12 24.5 13.5 24 14.5 21.5C14 17 13.5 12.5 12.5 10" fill={meta.bgTint} />
          {/* Muslo Derecho / Cuádriceps */}
          <path d="M22 10C23.5 15 23 19.5 21 24C20 24.5 18.5 24 17.5 21.5C18 17 18.5 12.5 19.5 10" fill={meta.bgTint} />
          {/* Rodillas / Rótulas */}
          <path d="M11 25H13" />
          <path d="M19 25H21" />
          {/* Gota del vasto medial */}
          <path d="M13 17C14 19 14 21 13.5 22.5" />
          <path d="M19 17C18 19 18 21 18.5 22.5" />
        </svg>
      );

    case 'core':
      return (
        <svg
          viewBox="0 0 32 32"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          {/* Silueta del torso y cintura */}
          <path d="M9 8C10.5 14 9.5 20.5 11 26" />
          <path d="M23 8C21.5 14 22.5 20.5 21 26" />
          {/* Línea alba */}
          <path d="M16 8V25" />
          {/* Abdominales simétricos tipo grid */}
          <rect x="11.5" y="10" width="3.5" height="3.5" rx="1" fill={meta.bgTint} />
          <rect x="17" y="10" width="3.5" height="3.5" rx="1" fill={meta.bgTint} />
          <rect x="11.5" y="15" width="3.5" height="3.5" rx="1" fill={meta.bgTint} />
          <rect x="17" y="15" width="3.5" height="3.5" rx="1" fill={meta.bgTint} />
          <rect x="12" y="20" width="3" height="3.5" rx="1" fill={meta.bgTint} />
          <rect x="17" y="20" width="3" height="3.5" rx="1" fill={meta.bgTint} />
        </svg>
      );

    case 'cardio':
      return (
        <svg
          viewBox="0 0 32 32"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          {/* Línea de pulso cardíaco ECG dinámica */}
          <path d="M4 16H8L11 9L15 23L19 13L21 18L23 16H28" />
          <circle cx="15" cy="23" r="1.5" fill={strokeColor} />
          <circle cx="11" cy="9" r="1.5" fill={strokeColor} />
        </svg>
      );

    case 'cuerpo_completo':
    default:
      return (
        <svg
          viewBox="0 0 32 32"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          {/* Cabeza */}
          <circle cx="16" cy="6.5" r="2.5" fill={meta.bgTint} />
          {/* Torso & Línea atlética */}
          <path d="M16 10V19" />
          <path d="M10 13L16 11L22 13" />
          {/* Extremidades inferiores */}
          <path d="M16 19L12.5 27" />
          <path d="M16 19L19.5 27" />
          {/* Extremidades superiores */}
          <path d="M10 13L8 18" />
          <path d="M22 13L24 18" />
        </svg>
      );
  }
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
        className={`w-full h-full rounded-xl flex items-center justify-center relative select-none transition-all ${className}`}
        style={{
          backgroundColor: '#0D131F',
          border: `1px solid ${meta.color}35`,
          boxShadow: `inset 0 0 12px ${meta.color}10`,
        }}
        title={`${name} (${meta.label})`}
      >
        <MuscleGroupIcon muscleGroup={muscleGroup} className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-sm" />
      </div>
    );
  }

  // 2. MODO CARD COMPLETA (para pantalla de entrenamiento activo o modal de detalle)
  return (
    <div
      className={`w-full h-full relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#131B28] via-[#0E141F] to-[#0A0D15] border border-gym-border/80 flex flex-col items-center justify-center select-none p-4 ${className}`}
    >
      {/* Resplandor radial de acento visual sutil según el grupo muscular */}
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

      {/* Ilustración central limpia y estilizada en SVG */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto py-2">
        <div
          className="p-4 rounded-3xl backdrop-blur-sm border transition-transform duration-300 hover:scale-105"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            borderColor: `${meta.color}30`,
            boxShadow: `0 8px 24px -6px ${meta.color}25`,
          }}
        >
          <MuscleGroupIcon muscleGroup={muscleGroup} className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md" />
        </div>

        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-3">
          {meta.sublabel}
        </span>
      </div>
    </div>
  );
};