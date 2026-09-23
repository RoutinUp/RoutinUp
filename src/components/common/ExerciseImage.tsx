import React, { useState } from 'react';
import Model, { IExerciseData, Muscle } from 'react-body-highlighter';
import { MuscleGroup } from '../../types/exercise';
import { Activity } from 'lucide-react';

export interface ExerciseImageProps {
  imageUrl?: string;
  name: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles?: string[];
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

export const getMuscleMeta = (muscle: MuscleGroup): MuscleMeta => {
  switch (muscle) {
    case 'pecho':
      return {
        color: '#10B981', // Emerald
        bgTint: 'rgba(16, 185, 129, 0.15)',
        label: 'Pecho',
        sublabel: 'Pectoral Mayor y Menor',
      };
    case 'espalda':
      return {
        color: '#06B6D4', // Cyan
        bgTint: 'rgba(6, 182, 212, 0.15)',
        label: 'Espalda',
        sublabel: 'Dorsales, Trapecio y Lumbar',
      };
    case 'hombros':
      return {
        color: '#F59E0B', // Amber
        bgTint: 'rgba(245, 158, 11, 0.15)',
        label: 'Hombros',
        sublabel: 'Deltoides Anterior, Lateral y Posterior',
      };
    case 'biceps':
      return {
        color: '#8B5CF6', // Violet
        bgTint: 'rgba(139, 92, 246, 0.15)',
        label: 'Bíceps',
        sublabel: 'Bíceps Braquial y Braquial Anterior',
      };
    case 'triceps':
      return {
        color: '#EC4899', // Pink
        bgTint: 'rgba(236, 72, 153, 0.15)',
        label: 'Tríceps',
        sublabel: 'Tríceps Braquial (3 cabezas)',
      };
    case 'piernas':
      return {
        color: '#3B82F6', // Blue
        bgTint: 'rgba(59, 130, 246, 0.15)',
        label: 'Piernas',
        sublabel: 'Cuádriceps, Isquiotibiales y Glúteos',
      };
    case 'core':
      return {
        color: '#EAB308', // Gold
        bgTint: 'rgba(234, 179, 8, 0.15)',
        label: 'Core',
        sublabel: 'Recto Abdominal y Oblicuos',
      };
    case 'cardio':
      return {
        color: '#EF4444', // Red
        bgTint: 'rgba(239, 68, 68, 0.15)',
        label: 'Cardio',
        sublabel: 'Activación Aeróbica Integral',
      };
    case 'cuerpo_completo':
    default:
      return {
        color: '#6366F1', // Indigo
        bgTint: 'rgba(99, 102, 241, 0.15)',
        label: 'Cuerpo Completo',
        sublabel: 'Activación Muscular Global',
      };
  }
};

/**
 * Mapeo inteligente y biomecánico del grupo muscular principal y nombre del ejercicio
 * a los identificadores anatómicos de react-body-highlighter.
 */
export const getPrimaryMuscles = (muscleGroup: MuscleGroup, exerciseName: string = ''): Muscle[] => {
  const normName = exerciseName.toLowerCase();

  switch (muscleGroup) {
    case 'pecho':
      return ['chest'];

    case 'espalda':
      if (normName.includes('trapecio') || normName.includes('encogimiento')) {
        return ['trapezius'];
      }
      if (normName.includes('lumbar') || normName.includes('hiperextens')) {
        return ['lower-back'];
      }
      if (normName.includes('peso muerto')) {
        return ['lower-back', 'hamstring', 'gluteal', 'trapezius'];
      }
      return ['upper-back', 'trapezius'];

    case 'hombros':
      if (normName.includes('posterior') || normName.includes('pajaro') || normName.includes('pájaro')) {
        return ['back-deltoids', 'trapezius'];
      }
      if (normName.includes('frontal')) {
        return ['front-deltoids'];
      }
      if (normName.includes('lateral') || normName.includes('elevacion') || normName.includes('elevación')) {
        return ['front-deltoids', 'back-deltoids'];
      }
      return ['front-deltoids', 'back-deltoids'];

    case 'biceps':
      return ['biceps'];

    case 'triceps':
      return ['triceps'];

    case 'piernas':
      if (normName.includes('gemelo') || normName.includes('pantorrilla') || normName.includes('talon') || normName.includes('talón')) {
        return ['calves'];
      }
      if (normName.includes('femoral') || normName.includes('isquio') || normName.includes('rumano')) {
        return ['hamstring', 'gluteal'];
      }
      if (normName.includes('cuadriceps') || normName.includes('cuádriceps') || normName.includes('extension') || normName.includes('extensión')) {
        return ['quadriceps'];
      }
      if (normName.includes('gluteo') || normName.includes('glúteo') || normName.includes('hip thrust') || normName.includes('puente')) {
        return ['gluteal'];
      }
      if (normName.includes('aductor') || normName.includes('adductor')) {
        return ['adductor'];
      }
      if (normName.includes('abductor')) {
        return ['abductors'];
      }
      if (normName.includes('prensa') || normName.includes('sentadilla') || normName.includes('hack') || normName.includes('zancada') || normName.includes('estocada')) {
        return ['quadriceps', 'gluteal'];
      }
      return ['quadriceps', 'hamstring', 'gluteal', 'calves'];

    case 'core':
      if (normName.includes('oblicuo') || normName.includes('lateral') || normName.includes('rusa')) {
        return ['obliques'];
      }
      if (normName.includes('lumbar') || normName.includes('hiperextens')) {
        return ['lower-back'];
      }
      return ['abs', 'obliques'];

    case 'cardio':
      return ['quadriceps', 'calves', 'hamstring'];

    case 'cuerpo_completo':
    default:
      return ['chest', 'upper-back', 'quadriceps', 'abs'];
  }
};

/**
 * Mapeo de músculos secundarios a partir de la lista del ejercicio o deducción biomecánica.
 */
export const getSecondaryMuscles = (
  secondaryMusclesList: string[] = [],
  primaryMuscles: Muscle[],
  exerciseName: string = ''
): Muscle[] => {
  const normName = exerciseName.toLowerCase();
  const secondarySet = new Set<Muscle>();

  // 1. Mapeo a partir de los datos explícitos del ejercicio
  secondaryMusclesList.forEach((sec) => {
    const s = sec.toLowerCase().trim();
    if (s.includes('tricep')) secondarySet.add('triceps');
    else if (s.includes('bicep')) secondarySet.add('biceps');
    else if (s.includes('hombro') || s.includes('deltoide')) {
      secondarySet.add('front-deltoids');
      secondarySet.add('back-deltoids');
    } else if (s.includes('pecho') || s.includes('pectoral')) {
      secondarySet.add('chest');
    } else if (s.includes('espalda') || s.includes('dorsal')) {
      secondarySet.add('upper-back');
    } else if (s.includes('trapecio')) {
      secondarySet.add('trapezius');
    } else if (s.includes('lumbar') || s.includes('lumbares')) {
      secondarySet.add('lower-back');
    } else if (s.includes('core') || s.includes('abdom')) {
      secondarySet.add('abs');
      secondarySet.add('obliques');
    } else if (s.includes('glute')) {
      secondarySet.add('gluteal');
    } else if (s.includes('antebrazo')) {
      secondarySet.add('forearm');
    } else if (s.includes('cuadricep') || s.includes('cuádricep')) {
      secondarySet.add('quadriceps');
    } else if (s.includes('femoral') || s.includes('isquio')) {
      secondarySet.add('hamstring');
    } else if (s.includes('gemelo') || s.includes('pantorrilla')) {
      secondarySet.add('calves');
    } else if (s.includes('aductor')) {
      secondarySet.add('adductor');
    } else if (s.includes('abductor')) {
      secondarySet.add('abductors');
    } else if (s.includes('pierna')) {
      secondarySet.add('quadriceps');
      secondarySet.add('hamstring');
    }
  });

  // 2. Si no hay secundarios explícitos, deducir según ejercicios compuestos comunes
  if (secondarySet.size === 0) {
    if (
      normName.includes('press banca') ||
      normName.includes('press plano') ||
      normName.includes('flexion') ||
      normName.includes('flexión') ||
      normName.includes('push up') ||
      normName.includes('fondos')
    ) {
      secondarySet.add('triceps');
      secondarySet.add('front-deltoids');
    } else if (normName.includes('press inclinado')) {
      secondarySet.add('front-deltoids');
      secondarySet.add('triceps');
    } else if (
      normName.includes('press militar') ||
      normName.includes('press hombros') ||
      normName.includes('press de hombros')
    ) {
      secondarySet.add('triceps');
      secondarySet.add('trapezius');
    } else if (
      normName.includes('dominadas') ||
      normName.includes('jalon') ||
      normName.includes('jalón') ||
      normName.includes('remo')
    ) {
      secondarySet.add('biceps');
      secondarySet.add('forearm');
      secondarySet.add('back-deltoids');
    } else if (normName.includes('curl')) {
      secondarySet.add('forearm');
    } else if (
      normName.includes('sentadilla') ||
      normName.includes('squat') ||
      normName.includes('prensa')
    ) {
      secondarySet.add('gluteal');
      secondarySet.add('hamstring');
    } else if (normName.includes('peso muerto')) {
      secondarySet.add('trapezius');
      secondarySet.add('forearm');
    }
  }

  // Filtrar cualquier músculo que ya esté activo como principal
  const primarySet = new Set(primaryMuscles);
  return Array.from(secondarySet).filter((m) => !primarySet.has(m));
};

/** Músculos que se visualizan principalmente en la cara posterior */
const POSTERIOR_PRIMARY_MUSCLES = new Set<Muscle>([
  'upper-back',
  'lower-back',
  'trapezius',
  'triceps',
  'hamstring',
  'gluteal',
  'back-deltoids',
  'neck',
]);

// Paleta Anatómica de Alta Definición para Modo Oscuro
const ANATOMY_BODY_COLOR = '#232E42'; // Silueta oscura azulada / slate profesional
const COLOR_SECONDARY = '#F59E0B'; // Ámbar / amarillo para músculos secundarios
const COLOR_PRIMARY = '#10B981'; // Verde Esmeralda vibrante para músculos principales
const HIGHLIGHTED_PALETTE = [COLOR_SECONDARY, COLOR_PRIMARY];

export const ExerciseImage: React.FC<ExerciseImageProps> = ({
  imageUrl,
  name,
  muscleGroup,
  secondaryMuscles = [],
  className = '',
  priority = false,
  variant = 'auto',
}) => {
  const [imageError, setImageError] = useState(false);
  const meta = getMuscleMeta(muscleGroup);

  // Calcular músculos anatómicos principales y secundarios
  const primaryMuscles = getPrimaryMuscles(muscleGroup, name);
  const secondaryMusclesCalculated = getSecondaryMuscles(secondaryMuscles, primaryMuscles, name);

  // Estructura de datos para react-body-highlighter:
  // Frecuencia 1 -> HIGHLIGHTED_PALETTE[0] (Ámbar - Secundario)
  // Frecuencia 2 -> HIGHLIGHTED_PALETTE[1] (Verde Esmeralda - Principal)
  const exerciseData: IExerciseData[] = [
    ...(secondaryMusclesCalculated.length > 0
      ? [
          {
            name: 'Secundario',
            muscles: secondaryMusclesCalculated,
            frequency: 1,
          },
        ]
      : []),
    {
      name: 'Principal',
      muscles: primaryMuscles,
      frequency: 2,
    },
  ];

  // Si hay imagen real proporcionada y no falló, renderizar imagen fotográfica
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

  // 1. MODO MINIATURA / THUMBNAIL (para tarjetas compactas de listas y selectores)
  const isThumbnail =
    variant === 'thumbnail' ||
    variant === 'badge' ||
    className.includes('w-11') ||
    className.includes('w-12') ||
    className.includes('w-14') ||
    className.includes('w-16');

  if (isThumbnail) {
    // Determinar la vista óptima (anterior o posterior) según dónde se concentre el músculo principal
    const hasPosterior = primaryMuscles.some((m) => POSTERIOR_PRIMARY_MUSCLES.has(m));
    const thumbnailType = hasPosterior ? 'posterior' : 'anterior';

    return (
      <div
        className={`w-full h-full rounded-xl flex items-center justify-center relative select-none overflow-hidden p-1 bg-[#0D131F] border border-gym-border/60 shadow-inner ${className}`}
        title={`${name} (${meta.label})`}
      >
        <div className="w-full h-full flex items-center justify-center">
          <Model
            type={thumbnailType}
            data={exerciseData}
            bodyColor={ANATOMY_BODY_COLOR}
            highlightedColors={HIGHLIGHTED_PALETTE}
            style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          />
        </div>
      </div>
    );
  }

  // 2. MODO TARJETA COMPLETA CON VISTAS DUALES (FRONTAL Y TRASERA LADO A LADO)
  // Pantalla de Iniciar Rutina (SetCard) y Modal de Detalles del Catálogo de Ejercicios
  return (
    <div
      className={`w-full h-full relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#131B28] via-[#0E141F] to-[#0A0D15] border border-gym-border/80 flex flex-col justify-between select-none p-3 sm:p-4 ${className}`}
    >
      {/* Resplandor sutil de fondo según el músculo principal */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${COLOR_PRIMARY} 0%, transparent 68%)`,
        }}
      />

      {/* Trama sutil de micropuntos de fondo */}
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

      {/* Cabecera de la tarjeta: Badge de Grupo Muscular y Badge de Actividad */}
      <div className="relative z-10 w-full flex items-center justify-between flex-shrink-0">
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

        {/* Leyenda compacta en cabecera para pantallas grandes */}
        <div className="flex items-center gap-2">
          <div className="hidden xs:flex items-center gap-2.5 text-[10px] font-semibold text-gray-300 bg-black/40 px-2.5 py-1 rounded-full border border-white/5 backdrop-blur-sm">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]"></span>
              Principal
            </span>
            {secondaryMusclesCalculated.length > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B] shadow-[0_0_6px_#F59E0B]"></span>
                Secundario
              </span>
            )}
          </div>
          <div className="p-1.5 rounded-lg bg-black/40 border border-white/5 text-gray-400">
            <Activity className="w-3.5 h-3.5" style={{ color: meta.color }} />
          </div>
        </div>
      </div>

      {/* Cuerpo Central: Modelos Anatómicos Frontal y Trasero Lado a Lado */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-center gap-3 sm:gap-6 my-auto min-h-0 py-1">
        {/* Vista Frontal */}
        <div className="flex flex-col items-center h-full max-h-full justify-between flex-1 max-w-[120px] sm:max-w-[150px]">
          <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 py-0.5 rounded-md bg-slate-800/80 border border-white/5 mb-1 flex-shrink-0">
            Frontal
          </span>
          <div className="flex-1 w-full aspect-[1/2] max-h-[140px] sm:max-h-[180px] flex items-center justify-center">
            <Model
              type="anterior"
              data={exerciseData}
              bodyColor={ANATOMY_BODY_COLOR}
              highlightedColors={HIGHLIGHTED_PALETTE}
              style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            />
          </div>
        </div>

        {/* Separador vertical estilizado */}
        <div className="w-px h-24 sm:h-32 bg-gradient-to-b from-transparent via-white/10 to-transparent flex-shrink-0" />

        {/* Vista Trasera */}
        <div className="flex flex-col items-center h-full max-h-full justify-between flex-1 max-w-[120px] sm:max-w-[150px]">
          <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 py-0.5 rounded-md bg-slate-800/80 border border-white/5 mb-1 flex-shrink-0">
            Trasera
          </span>
          <div className="flex-1 w-full aspect-[1/2] max-h-[140px] sm:max-h-[180px] flex items-center justify-center">
            <Model
              type="posterior"
              data={exerciseData}
              bodyColor={ANATOMY_BODY_COLOR}
              highlightedColors={HIGHLIGHTED_PALETTE}
              style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            />
          </div>
        </div>
      </div>

      {/* Pie de la tarjeta: Sublabel anatómico y Leyenda de Colores */}
      <div className="relative z-10 w-full flex items-center justify-between pt-1.5 border-t border-white/5 flex-shrink-0 text-[10px] sm:text-[11px]">
        <span className="text-gray-400 font-medium truncate max-w-[55%]">
          {meta.sublabel}
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-gray-300 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]"></span>
            Principal
          </span>
          {secondaryMusclesCalculated.length > 0 && (
            <span className="flex items-center gap-1.5 text-gray-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] shadow-[0_0_6px_#F59E0B]"></span>
              Secundario
            </span>
          )}
        </div>
      </div>
    </div>
  );
};