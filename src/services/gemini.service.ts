import { GoogleGenAI } from '@google/genai';
import { MuscleGroup } from '../types/exercise';

export interface AIGeneratedSet {
  reps: number;
  repsMin?: number;
  repsMax?: number;
  peso: number;
}

export interface AIGeneratedExercise {
  name: string;
  nombre?: string;
  muscle_group: string;
  grupoMuscular?: string;
  sets: number;
  reps_min: number;
  reps_max: number;
  weight: number;
  series?: AIGeneratedSet[];
}

export interface AIGeneratedDay {
  dayName: string;
  exercises: AIGeneratedExercise[];
}

export interface AIGeneratedRoutine {
  nombre: string;
  days: AIGeneratedDay[];
  routine: AIGeneratedDay[];
}

export const getGeminiApiKey = (): string => {
  return import.meta.env.VITE_GEMINI_API_KEY || '';
};

const SYSTEM_INSTRUCTION = `Eres un entrenador personal y preparador físico de élite. Tu tarea es convertir el texto o descripción de entrenamiento del usuario (en lenguaje natural, notas o rutinas completas de uno o varios días) en una rutina estructurada de ejercicios dividida por días.

INSTRUCCIÓN CRÍTICA DE DÍAS Y PROCESAMIENTO (ESTRICTAMENTE OBLIGATORIA):
1. Procesa TODOS los días solicitados por el usuario sin omitir ninguno. Si el usuario no especifica repeticiones mínimas/máximas o pesos para un ejercicio, asigna por defecto reps_min: 8, reps_max: 10 y weight: 0. Nunca dejes campos vacíos ni omitas días.
2. Detecta cuidadosamente todas las divisiones de días en el texto (por ejemplo: "Día 1", "Día 2", "Día 3", "Día 4", "Día A", "Día B", "Lunes", "Martes", "Miércoles", "Torso", "Piernas", "Push", "Pull", "Legs", saltos de línea principales, etc.).
3. DEBES devolver obligatoriamente un arreglo llamado "days" donde cada elemento sea un día independiente con su propio "dayName" (ej: "Día 1: Torso A", "Día 2: Piernas A", "Día 3: Pecho y Bíceps") y su lista "exercises".
4. NUNCA mezcles todos los ejercicios en un solo día si el usuario describió o mencionó varios días.
5. Si el texto describe 3 días, el arreglo "days" DEBE tener 3 objetos; si describe 4 días, DEBE tener 4 objetos.
6. Solo si el texto describe explícitamente una sola sesión sin mención de otros días, el arreglo "days" contendrá 1 solo día (ej: "Día 1: Entrenamiento General").

ESTRUCTURA OBLIGATORIA DE CADA EJERCICIO:
Cada objeto dentro de la lista "exercises" DEBE tener exactamente las siguientes propiedades:
- "name": string con el nombre del ejercicio en español (ej: "Press de banca plano").
- "muscle_group": string con el grupo muscular principal.
- "sets": número entero con la cantidad de series (ej: 3 o 4). Si el usuario no lo especifica, asigna 3.
- "reps_min": número entero con las repeticiones mínimas del rango objetivo. Si no se especifica, asigna 8.
- "reps_max": número entero con las repeticiones máximas del rango objetivo. Si no se especifica, asigna 10.
- "weight": número con el peso sugerido o especificado en kg (acepta decimales como 22.5). Si no se especifica o es peso corporal, asigna 0.

Debes responder ÚNICAMENTE con un JSON válido con el siguiente formato exacto:
{
  "nombre": "Nombre de la rutina (ej. Rutina Torso Pierna 4 Días)",
  "days": [
    {
      "dayName": "Día 1: Torso A",
      "exercises": [
        {
          "name": "Press de banca plano",
          "muscle_group": "Pecho",
          "sets": 4,
          "reps_min": 8,
          "reps_max": 10,
          "weight": 80
        },
        {
          "name": "Remo con barra",
          "muscle_group": "Espalda",
          "sets": 3,
          "reps_min": 8,
          "reps_max": 10,
          "weight": 70
        }
      ]
    },
    {
      "dayName": "Día 2: Piernas A",
      "exercises": [
        {
          "name": "Sentadilla con barra",
          "muscle_group": "Piernas",
          "sets": 3,
          "reps_min": 8,
          "reps_max": 10,
          "weight": 100
        }
      ]
    }
  ]
}

Reglas estrictas:
1. "muscle_group" DEBE ser exactamente uno de los siguientes: "Pecho", "Espalda", "Piernas", "Hombros", "Bíceps", "Tríceps", "Core", "Cardio", o "Cuerpo Completo".
2. Cada día en "days" debe tener su "dayName" descriptivo y su lista "exercises".
3. Procesa TODOS los días solicitados por el usuario sin omitir ninguno. Si el usuario no especifica repeticiones mínimas/máximas o pesos para un ejercicio, asigna por defecto reps_min: 8, reps_max: 10 y weight: 0. Nunca dejes campos vacíos ni omitas días.
4. Si el usuario especifica un rango (ej: "8-12 reps"), asigna reps_min: 8 y reps_max: 12. Si especifica un número único (ej: "10 reps"), asigna reps_min: 10 y reps_max: 10.
5. NO agregues introducciones, conclusiones ni bloques markdown fuera del JSON. Devuelve únicamente el objeto JSON.`;

export const geminiService = {
  isConfigured(): boolean {
    return Boolean(getGeminiApiKey());
  },

  async generateRoutineFromText(userPrompt: string): Promise<AIGeneratedRoutine> {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      throw new Error(
        'El servicio de generación con IA no está disponible temporalmente. Por favor, crea tu rutina manualmente.'
      );
    }

    const promptText = `${SYSTEM_INSTRUCTION}

Texto del usuario para convertir:
"""
${userPrompt.trim()}
"""

RECUERDA: La estructura de respuesta DEBE tener la propiedad "days" con cada día separado en el arreglo y cada ejercicio con name, muscle_group, sets, reps_min, reps_max, weight:
{ "nombre": "...", "days": [{ "dayName": "Día 1: ...", "exercises": [{ "name": "...", "muscle_group": "...", "sets": 3, "reps_min": 8, "reps_max": 10, "weight": 0 }] }] }`;

    let rawText = '';

    const callModel = async (modelName: string): Promise<string> => {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: modelName,
          contents: promptText,
        });

        if (response.text) return response.text;
      } catch (err: any) {
        console.warn(`Llamada con SDK para ${modelName} falló, intentando fetch directo:`, err);

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          const status = res.status;
          const detailedMsg =
            errorData?.error?.message ||
            errorData?.message ||
            err?.message ||
            res.statusText ||
            'Error al comunicarse con la API de Google Gemini.';

          const error: any = new Error(detailedMsg);
          error.status = status;
          throw error;
        }

        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }

      throw new Error(`No se recibió contenido para el modelo ${modelName}`);
    };

    // Modelos a intentar en orden de preferencia: principal gemini-3.6-flash, con fallbacks a 1.5
    const modelsToTry = [
      'gemini-3.6-flash',
      'gemini-1.5-flash',
      'gemini-1.5-flash-8b',
    ];
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        rawText = await callModel(model);
        if (rawText) break;
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || '').toLowerCase();

        // Si es clave inválida en el servidor, no reintentar
        if (msg.includes('api_key_invalid')) {
          throw err;
        }

        console.warn(`Modelo ${model} no disponible o falló (${err?.message}), probando siguiente modelo de respaldo...`);
        // Pasa inmediatamente al siguiente modelo del array sin romper la UI
        continue;
      }
    }

    if (!rawText) {
      throw lastError || new Error('No se recibió contenido en la respuesta de Gemini.');
    }

    const cleanedText = rawText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const firstBrace = cleanedText.indexOf('{');
    const lastBrace = cleanedText.lastIndexOf('}');
    const jsonStr =
      firstBrace !== -1 && lastBrace !== -1
        ? cleanedText.substring(firstBrace, lastBrace + 1)
        : cleanedText;

    const parsedRaw: any = JSON.parse(jsonStr);

    // Normalizar días (soporta tanto "days", "routine", "dias", "workoutDays" o lista plana)
    const rawDays =
      parsedRaw.days ||
      parsedRaw.routine ||
      parsedRaw.dias ||
      parsedRaw.workoutDays ||
      (Array.isArray(parsedRaw) ? parsedRaw : []);
    let normalizedDays: AIGeneratedDay[] = [];

    const parseExerciseItem = (ex: any, idx: number): AIGeneratedExercise => {
      const name = String(ex.name || ex.nombre || `Ejercicio ${idx + 1}`).trim();
      const muscle_group = String(ex.muscle_group || ex.grupoMuscular || ex.muscleGroup || 'Cuerpo Completo').trim();
      const sets = Number(ex.sets) > 0 ? Number(ex.sets) : Array.isArray(ex.series) && ex.series.length > 0 ? ex.series.length : 3;
      const reps_min = Number(ex.reps_min ?? ex.repsMin ?? 8);
      const reps_max = Number(ex.reps_max ?? ex.repsMax ?? ex.reps ?? 10);
      const weight = typeof ex.weight === 'number'
        ? ex.weight
        : typeof ex.peso === 'number'
        ? ex.peso
        : parseFloat(String(ex.weight ?? ex.peso ?? '0').replace(',', '.')) || 0;

      const series: AIGeneratedSet[] = Array.isArray(ex.series || ex.sets)
        ? (ex.series || ex.sets).map((s: any) => ({
            reps: Number(s.reps || s.repeticiones || reps_max),
            repsMin: Number(s.repsMin || s.reps_min || reps_min),
            repsMax: Number(s.repsMax || s.reps_max || reps_max),
            peso: typeof s.peso === 'number'
              ? s.peso
              : typeof s.weight === 'number'
              ? s.weight
              : parseFloat(String(s.peso ?? s.weight ?? weight).replace(',', '.')) || 0,
          }))
        : Array.from({ length: sets }, () => ({
            reps: reps_max,
            repsMin: reps_min,
            repsMax: reps_max,
            peso: weight,
          }));

      return {
        name,
        nombre: name,
        muscle_group,
        grupoMuscular: muscle_group,
        sets,
        reps_min,
        reps_max,
        weight,
        series,
      };
    };

    if (Array.isArray(rawDays) && rawDays.length > 0) {
      // Comprobar si los elementos son objetos de día (contienen exercises/ejercicios o dayName)
      const firstItem = rawDays[0];
      const isDayObject =
        firstItem &&
        (Array.isArray(firstItem.exercises) ||
          Array.isArray(firstItem.ejercicios) ||
          firstItem.dayName ||
          firstItem.nombreDia);

      if (isDayObject) {
        normalizedDays = rawDays.map((d: any, idx: number) => {
          const dayName = d.dayName || d.nombre || d.name || d.nombreDia || `Día ${idx + 1}`;
          const rawExercises = d.exercises || d.ejercicios || [];
          const exercises: AIGeneratedExercise[] = Array.isArray(rawExercises)
            ? rawExercises.map((ex: any, exIdx: number) => parseExerciseItem(ex, exIdx))
            : [];

          return {
            dayName,
            exercises,
          };
        });
      } else {
        // Es un arreglo de ejercicios planos: agrupar por propiedad de día si existe
        const dayMap = new Map<string, AIGeneratedExercise[]>();
        rawDays.forEach((ex: any, idx: number) => {
          const dayKey = ex.dia || ex.day || ex.dayName || 'Día 1: Entrenamiento';
          if (!dayMap.has(dayKey)) {
            dayMap.set(dayKey, []);
          }
          dayMap.get(dayKey)!.push(parseExerciseItem(ex, idx));
        });

        normalizedDays = Array.from(dayMap.entries()).map(([dayName, exercises]) => ({
          dayName,
          exercises,
        }));
      }
    } else if (Array.isArray(parsedRaw.ejercicios || parsedRaw.exercises)) {
      // Fallback si devolvió una lista plana de ejercicios sin agrupar por días
      const rawExercises = parsedRaw.ejercicios || parsedRaw.exercises;
      const hasDayProperty = rawExercises.some((ex: any) => ex.dia || ex.day || ex.dayName);

      if (hasDayProperty) {
        const dayMap = new Map<string, AIGeneratedExercise[]>();
        rawExercises.forEach((ex: any, idx: number) => {
          const dayKey = ex.dia || ex.day || ex.dayName || 'Día 1: Entrenamiento';
          if (!dayMap.has(dayKey)) {
            dayMap.set(dayKey, []);
          }
          dayMap.get(dayKey)!.push(parseExerciseItem(ex, idx));
        });

        normalizedDays = Array.from(dayMap.entries()).map(([dayName, exercises]) => ({
          dayName,
          exercises,
        }));
      } else {
        normalizedDays = [
          {
            dayName: 'Día 1: Entrenamiento',
            exercises: rawExercises.map((ex: any, idx: number) => parseExerciseItem(ex, idx)),
          },
        ];
      }
    }

    if (normalizedDays.length === 0) {
      throw new Error('La respuesta de Gemini no contiene días ni ejercicios válidos.');
    }

    const parsed: AIGeneratedRoutine = {
      nombre: parsedRaw.nombre || parsedRaw.name || 'Rutina Generada con IA',
      days: normalizedDays,
      routine: normalizedDays,
    };

    return parsed;
  },

  /**
   * Mapea un nombre de grupo muscular textual devuelto por Gemini
   * al tipo MuscleGroup estándar de la aplicación
   */
  mapToMuscleGroup(rawMuscle: string): MuscleGroup {
    const normalized = (rawMuscle || '').toLowerCase().trim();
    if (normalized.includes('pecho')) return 'pecho';
    if (normalized.includes('espalda')) return 'espalda';
    if (normalized.includes('pierna') || normalized.includes('cuad') || normalized.includes('glute'))
      return 'piernas';
    if (normalized.includes('hombro') || normalized.includes('deltoid')) return 'hombros';
    if (normalized.includes('bicep')) return 'biceps';
    if (normalized.includes('tricep')) return 'triceps';
    if (normalized.includes('core') || normalized.includes('abdo')) return 'core';
    if (normalized.includes('cardio')) return 'cardio';
    return 'cuerpo_completo';
  },
};
