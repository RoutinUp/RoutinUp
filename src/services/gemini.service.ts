import { GoogleGenAI, Type } from '@google/genai';
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

    const ai = new GoogleGenAI({ apiKey });

    // Modelos soportados en v1beta: gemini-2.5-flash (principal) y gemini-2.0-flash (respaldo)
    const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash'];
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: `Convierte este texto en una rutina estructurada según las instrucciones:\n\n${userPrompt.trim()}`,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseJsonSchema: {
              type: Type.OBJECT,
              properties: {
                nombre: {
                  type: Type.STRING,
                  description: 'Nombre de la rutina',
                },
                ejercicios: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      nombre: {
                        type: Type.STRING,
                        description: 'Nombre del ejercicio',
                      },
                      grupoMuscular: {
                        type: Type.STRING,
                        description: 'Grupo muscular principal',
                      },
                      series: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            reps: {
                              type: Type.NUMBER,
                              description: 'Número de repeticiones',
                            },
                            peso: {
                              type: Type.NUMBER,
                              description: 'Peso en kilogramos',
                            },
                          },
                          required: ['reps', 'peso'],
                        },
                        description: 'Listado de series con su peso y reps',
                      },
                    },
                    required: ['nombre', 'grupoMuscular', 'series'],
                  },
                  description: 'Lista de ejercicios de la rutina',
                },
              },
              required: ['nombre', 'ejercicios'],
            },
          },
        });

        const rawText = response.text || '';
        const cleanedText = rawText
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim();

        const parsed: AIGeneratedRoutine = JSON.parse(cleanedText);

        if (!parsed.nombre || !Array.isArray(parsed.ejercicios)) {
          throw new Error('La respuesta de Gemini no contiene el formato esperado.');
        }

        return parsed;
      } catch (err: any) {
        lastError = err;
        console.warn(`Error llamando a Gemini con modelo ${modelName}:`, err);
        if (
          err?.status === 400 &&
          (err?.message?.includes('API_KEY_INVALID') || err?.message?.includes('API key'))
        ) {
          throw new Error('La clave configurada en el servidor es inválida.');
        }
      }
    }

    throw new Error(
      lastError?.message || 'No se pudo conectar con el servicio de Google Gemini.'
    );
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
