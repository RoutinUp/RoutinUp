import { GoogleGenAI } from '@google/genai';
import { MuscleGroup } from '../types/exercise';

export interface AIGeneratedSet {
  reps: number;
  peso: number;
}

export interface AIGeneratedExercise {
  nombre: string;
  grupoMuscular: string;
  series: AIGeneratedSet[];
}

export interface AIGeneratedDay {
  dayName: string;
  exercises: AIGeneratedExercise[];
}

export interface AIGeneratedRoutine {
  nombre: string;
  routine: AIGeneratedDay[];
}

export const getGeminiApiKey = (): string => {
  return import.meta.env.VITE_GEMINI_API_KEY || '';
};

const SYSTEM_INSTRUCTION = `Eres un entrenador personal y preparador físico de élite. Tu tarea es convertir el texto o descripción de entrenamiento del usuario (en lenguaje natural, notas o rutinas completas de uno o varios días) en una rutina estructurada de ejercicios dividida por días.

INSTRUCCIÓN CLAVE PARA DETECCIÓN DE DÍAS:
Detecta cuidadosamente si el texto contiene divisiones o encabezados de días como "Día 1", "Día 2", "Día 3", "Día 4", "Día A", "Día B", "Lunes", "Martes", "Miércoles", "Torso", "Pierna", "Push", "Pull", "Legs", etc., o saltos de sección principales.
Cada bloque de día detectado DEBE ser un elemento separado en el arreglo "routine" con su correspondiente "dayName" (ej: "Día 1: Torso A", "Día 2: Piernas A", "Día 3: Pecho y Bíceps").
Si el texto describe solo una sesión o no menciona división de días, devuelve un único elemento en "routine" con dayName "Día 1: Entrenamiento".

Debes responder ÚNICAMENTE con un JSON válido con el siguiente formato exacto:
{
  "nombre": "Nombre representativo de la rutina",
  "routine": [
    {
      "dayName": "Día 1: Torso A",
      "exercises": [
        {
          "nombre": "Press de banca plano",
          "grupoMuscular": "Pecho",
          "series": [
            { "reps": 10, "peso": 80 },
            { "reps": 8, "peso": 85 }
          ]
        }
      ]
    },
    {
      "dayName": "Día 2: Piernas A",
      "exercises": [
        {
          "nombre": "Sentadilla con barra",
          "grupoMuscular": "Piernas",
          "series": [
            { "reps": 10, "peso": 100 }
          ]
        }
      ]
    }
  ]
}

Reglas estrictas:
1. "grupoMuscular" DEBE ser exactamente uno de los siguientes: "Pecho", "Espalda", "Piernas", "Hombros", "Bíceps", "Tríceps", "Core", "Cardio", o "Cuerpo Completo".
2. Cada día en "routine" debe tener su "dayName" descriptivo y su lista de "exercises".
3. Cada ejercicio debe tener al menos una serie. Si el usuario escribe "4x10 con 50kg", genera 4 objetos en "series", cada uno con reps: 10 y peso: 50.
4. Si el usuario no especificó peso (ej. flexiones, dominadas, sentadillas al aire), coloca peso: 0.
5. Si el usuario no especificó repeticiones, asigna 10 reps por defecto.
6. Interpreta pesos piramidales o variables (ej. "50kg, 60kg, 70kg") asignando el peso correspondiente a cada serie.
7. NO agregues introducciones, conclusiones ni markdown fuera del JSON. Devuelve únicamente el objeto JSON.`;

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

Texto del usuario:
"${userPrompt.trim()}"

IMPORTANTE: Responde ÚNICAMENTE con el objeto JSON según el esquema especificado, sin ningún texto antes ni después.`;

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

    // Normalizar días (soporta tanto "routine", "dias", "days" o lista plana de "ejercicios")
    const rawDays = parsedRaw.routine || parsedRaw.dias || parsedRaw.days || [];
    let normalizedDays: AIGeneratedDay[] = [];

    if (Array.isArray(rawDays) && rawDays.length > 0) {
      normalizedDays = rawDays.map((d: any, idx: number) => {
        const dayName = d.dayName || d.nombre || d.name || d.nombreDia || `Día ${idx + 1}`;
        const rawExercises = d.exercises || d.ejercicios || [];
        const exercises: AIGeneratedExercise[] = Array.isArray(rawExercises)
          ? rawExercises.map((ex: any) => ({
              nombre: ex.nombre || ex.name || 'Ejercicio',
              grupoMuscular: ex.grupoMuscular || ex.muscleGroup || 'Cuerpo Completo',
              series: Array.isArray(ex.series || ex.sets)
                ? (ex.series || ex.sets).map((s: any) => ({
                    reps: Number(s.reps || s.repeticiones || 10),
                    peso: Number(s.peso || s.weight || 0),
                  }))
                : [{ reps: 10, peso: 0 }],
            }))
          : [];

        return {
          dayName,
          exercises,
        };
      });
    } else if (Array.isArray(parsedRaw.ejercicios || parsedRaw.exercises)) {
      // Fallback si devolvió una lista plana de ejercicios sin agrupar por días
      const rawExercises = parsedRaw.ejercicios || parsedRaw.exercises;
      normalizedDays = [
        {
          dayName: 'Día 1: Entrenamiento',
          exercises: rawExercises.map((ex: any) => ({
            nombre: ex.nombre || ex.name || 'Ejercicio',
            grupoMuscular: ex.grupoMuscular || ex.muscleGroup || 'Cuerpo Completo',
            series: Array.isArray(ex.series || ex.sets)
              ? (ex.series || ex.sets).map((s: any) => ({
                  reps: Number(s.reps || s.repeticiones || 10),
                  peso: Number(s.peso || s.weight || 0),
                }))
              : [{ reps: 10, peso: 0 }],
          })),
        },
      ];
    }

    if (normalizedDays.length === 0) {
      throw new Error('La respuesta de Gemini no contiene días ni ejercicios válidos.');
    }

    const parsed: AIGeneratedRoutine = {
      nombre: parsedRaw.nombre || parsedRaw.name || 'Rutina Generada con IA',
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
