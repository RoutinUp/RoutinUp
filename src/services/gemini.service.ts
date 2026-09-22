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

export interface AIGeneratedRoutine {
  nombre: string;
  ejercicios: AIGeneratedExercise[];
}

export const getGeminiApiKey = (): string => {
  return import.meta.env.VITE_GEMINI_API_KEY || '';
};

const SYSTEM_INSTRUCTION = `Eres un entrenador personal y preparador físico de élite. Tu tarea es convertir el texto o descripción de entrenamiento del usuario (en lenguaje natural, notas desordenadas o rutinas completas) en una rutina estructurada de ejercicios.

Debes responder ÚNICAMENTE con un JSON válido con el siguiente formato exacto:
{
  "nombre": "Nombre representativo de la rutina",
  "ejercicios": [
    {
      "nombre": "Nombre común y claro del ejercicio",
      "grupoMuscular": "Pecho",
      "series": [
        { "reps": 10, "peso": 80 },
        { "reps": 8, "peso": 85 }
      ]
    }
  ]
}

Reglas estrictas:
1. "grupoMuscular" DEBE ser exactamente uno de los siguientes: "Pecho", "Espalda", "Piernas", "Hombros", "Bíceps", "Tríceps", "Core", "Cardio", o "Cuerpo Completo".
2. Cada ejercicio debe tener al menos una serie. Si el usuario escribe "4x10 con 50kg", genera 4 objetos en "series", cada uno con reps: 10 y peso: 50.
3. Si el usuario no especificó peso (ej. flexiones, dominadas, sentadillas al aire), coloca peso: 0.
4. Si el usuario no especificó repeticiones, asigna 10 reps por defecto.
5. Interpreta pesos piramidales o variables (ej. "50kg, 60kg, 70kg") asignando el peso correspondiente a cada serie.
6. NO agregues introducciones, conclusiones ni markdown fuera del JSON. Devuelve únicamente el objeto JSON.`;

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

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: promptText,
      });

      rawText = response.text || '';
    } catch (err: any) {
      console.warn('Llamada con SDK @google/genai falló, intentando con endpoint directo:', err);

      if (
        err?.status === 400 &&
        (err?.message?.includes('API_KEY_INVALID') || err?.message?.includes('API key'))
      ) {
        throw new Error('La clave configurada en el servidor es inválida.');
      }

      // Endpoint directo con fetch como respaldo
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData?.error?.message || res.statusText;
        if (res.status === 400 && msg.includes('API_KEY_INVALID')) {
          throw new Error('La clave configurada en el servidor es inválida.');
        }
        throw new Error(msg || 'Error al comunicarse con la API de Google Gemini.');
      }

      const data = await res.json();
      rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    if (!rawText) {
      throw new Error('No se recibió contenido en la respuesta de Gemini.');
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

    const parsed: AIGeneratedRoutine = JSON.parse(jsonStr);

    if (!parsed.nombre || !Array.isArray(parsed.ejercicios)) {
      throw new Error('La respuesta de Gemini no contiene el formato esperado.');
    }

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
