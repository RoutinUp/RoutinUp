// Catálogo inicial de ejercicios comunes del gimnasio
import { Exercise } from '../types/exercise';

export const SEED_EXERCISES: Exercise[] = [
  {
    "id": "ex-pecho-01",
    "name": "Press banca con barra",
    "slug": "press-banca-barra",
    "description": "Básico y compuesto por excelencia para fuerza y masa en pectorales.",
    "mainMuscleGroup": "pecho",
    "secondaryMuscles": [
      "triceps",
      "hombros"
    ],
    "equipment": "barra",
    "exerciseType": "compuesto",
    "instructions": [
      "Acuéstate sobre el banco plano con los ojos bajo la barra.",
      "Agarra la barra a un ancho ligeramente mayor a hombros.",
      "Retrae escápulas y apoya pies firmes.",
      "Baja controladamente a la parte media del pecho.",
      "Empuja extendiendo brazos sin bloquear codos bruscamente."
    ],
    "techniqueTips": "Mantén escápulas retraídas y glúteos pegados al banco.",
    "difficultyLevel": "intermedio",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-pecho-02",
    "name": "Press inclinado con barra",
    "slug": "press-inclinado-barra",
    "description": "Énfasis en el haz clavicular (pecho superior).",
    "mainMuscleGroup": "pecho",
    "secondaryMuscles": [
      "hombros",
      "triceps"
    ],
    "equipment": "barra",
    "exerciseType": "compuesto",
    "instructions": [
      "Ajusta el banco a 30-45 grados.",
      "Baja la barra de forma controlada hacia la clavícula.",
      "Empuja con fuerza hasta posición inicial."
    ],
    "techniqueTips": "Evita inclinar a más de 45° para no fatigar el hombro anterior.",
    "difficultyLevel": "intermedio",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-pecho-03",
    "name": "Press con mancuernas",
    "slug": "press-mancuernas",
    "description": "Mayor rango de movimiento y corrección de asimetrías.",
    "mainMuscleGroup": "pecho",
    "secondaryMuscles": [
      "triceps",
      "hombros"
    ],
    "equipment": "mancuernas",
    "exerciseType": "compuesto",
    "instructions": [
      "Túmbate en el banco con mancuernas al costado del pecho.",
      "Baja sintiendo el estiramiento pectoral.",
      "Empuja acercando mancuernas sin chocarlas."
    ],
    "techniqueTips": "Controla la fase excéntrica en 2-3 segundos.",
    "difficultyLevel": "intermedio",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-pecho-04",
    "name": "Press inclinado con mancuernas",
    "slug": "press-inclinado-mancuernas",
    "description": "Enfoque clavicular con libertad articular para muñecas y codos.",
    "mainMuscleGroup": "pecho",
    "secondaryMuscles": [
      "hombros",
      "triceps"
    ],
    "equipment": "mancuernas",
    "exerciseType": "compuesto",
    "instructions": [
      "Banco a 30 grados, desciende controlando los codos a 45 grados.",
      "Empuja contrayendo la porción alta del pecho."
    ],
    "techniqueTips": "Ángulo de 30° es óptimo.",
    "difficultyLevel": "intermedio",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-pecho-05",
    "name": "Aperturas con mancuernas",
    "slug": "aperturas-mancuernas",
    "description": "Aislamiento para estirar las fibras pectorales bajo tensión.",
    "mainMuscleGroup": "pecho",
    "secondaryMuscles": [
      "hombros"
    ],
    "equipment": "mancuernas",
    "exerciseType": "aislamiento",
    "instructions": [
      "Abre los brazos en un arco amplio con codos ligeramente flexionados.",
      "Cierra contrayendo fuertemente los pectorales."
    ],
    "techniqueTips": "No bajes de la línea de los hombros si sientes molestia articular.",
    "difficultyLevel": "principiante",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-pecho-06",
    "name": "Pec deck / Contractor",
    "slug": "pec-deck",
    "description": "Máquina guiada con tensión constante en todo el recorrido.",
    "mainMuscleGroup": "pecho",
    "secondaryMuscles": [
      "hombros"
    ],
    "equipment": "maquina",
    "exerciseType": "aislamiento",
    "instructions": [
      "Junta los brazos al centro manteniendo 1s de contracción pico.",
      "Regresa lento controlando las placas."
    ],
    "techniqueTips": "Empuja con codos y pecho, no tirando de las manos.",
    "difficultyLevel": "principiante",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-pecho-07",
    "name": "Fondos para pecho (Dips)",
    "slug": "fondos-pecho",
    "description": "Peso corporal con inclinación frontal para pectoral inferior.",
    "mainMuscleGroup": "pecho",
    "secondaryMuscles": [
      "triceps",
      "hombros"
    ],
    "equipment": "peso_corporal",
    "exerciseType": "compuesto",
    "instructions": [
      "Inclina el torso 30° hacia adelante en paralelas.",
      "Baja a 90° de flexión y empuja fuerte."
    ],
    "techniqueTips": "Inclina el cuerpo al frente para enfocar pecho.",
    "difficultyLevel": "avanzado",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-pecho-08",
    "name": "Cruce de poleas",
    "slug": "cruce-poleas",
    "description": "Aislamiento continuo con cables para bombeo y congestión.",
    "mainMuscleGroup": "pecho",
    "secondaryMuscles": [
      "hombros"
    ],
    "equipment": "polea",
    "exerciseType": "aislamiento",
    "instructions": [
      "Desde polea media o alta, cruza las manos al frente y abajo.",
      "Siente la compresión pectoral en cada repetición."
    ],
    "techniqueTips": "Mantén codos fijos y aprieta 1 segundo al cruzar.",
    "difficultyLevel": "intermedio",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-espalda-01",
    "name": "Dominadas",
    "slug": "dominadas",
    "description": "Tracción vertical fundamental para amplitud de dorsal ancho.",
    "mainMuscleGroup": "espalda",
    "secondaryMuscles": [
      "biceps",
      "core"
    ],
    "equipment": "peso_corporal",
    "exerciseType": "compuesto",
    "instructions": [
      "Cuélgate con agarre prono a ancho superior a hombros.",
      "Tracciona con los dorsales llevando el pecho hacia la barra.",
      "Supera con la barbilla y baja con control total."
    ],
    "techniqueTips": "Evita balanceo y concéntrate en tirar con la espalda.",
    "difficultyLevel": "intermedio",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-espalda-02",
    "name": "Jalón al pecho en polea",
    "slug": "jalon-pecho",
    "description": "Tracción vertical guiada para dorsales con peso regulable.",
    "mainMuscleGroup": "espalda",
    "secondaryMuscles": [
      "biceps"
    ],
    "equipment": "polea",
    "exerciseType": "compuesto",
    "instructions": [
      "Fija las piernas, toma la barra ancha y baja hacia el esternón superior.",
      "Extiende los dorsales arriba al regresar."
    ],
    "techniqueTips": "Lleva los codos hacia las costillas.",
    "difficultyLevel": "principiante",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-espalda-03",
    "name": "Remo con barra",
    "slug": "remo-barra",
    "description": "Tracción horizontal pesada para grosor y densidad de espalda.",
    "mainMuscleGroup": "espalda",
    "secondaryMuscles": [
      "biceps",
      "core"
    ],
    "equipment": "barra",
    "exerciseType": "compuesto",
    "instructions": [
      "Inclina torso a 45° con columna neutra.",
      "Tracciona la barra hacia el ombligo contrayendo escápulas.",
      "Baja con control sin perder la postura."
    ],
    "techniqueTips": "Activa el core para no cargar la zona lumbar.",
    "difficultyLevel": "intermedio",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-espalda-04",
    "name": "Remo con mancuerna a una mano",
    "slug": "remo-mancuerna",
    "description": "Trabajo unilateral con gran recorrido y estabilidad lumbar.",
    "mainMuscleGroup": "espalda",
    "secondaryMuscles": [
      "biceps"
    ],
    "equipment": "mancuernas",
    "exerciseType": "compuesto",
    "instructions": [
      "Apoya rodilla y mano en banco plano.",
      "Tira la mancuerna en diagonal hacia la cadera con el codo.",
      "Estira el dorsal al bajar."
    ],
    "techniqueTips": "No rotes el torso excesivamente.",
    "difficultyLevel": "principiante",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-espalda-05",
    "name": "Remo sentado en polea (Gironda)",
    "slug": "remo-gironda",
    "description": "Remo en polea baja para zona media de trapecios y romboides.",
    "mainMuscleGroup": "espalda",
    "secondaryMuscles": [
      "biceps"
    ],
    "equipment": "polea",
    "exerciseType": "compuesto",
    "instructions": [
      "Espalda recta, tracciona el maneral V hacia el abdomen.",
      "Aprieta escápulas y regresa despacio."
    ],
    "techniqueTips": "No balancees el cuerpo bruscamente.",
    "difficultyLevel": "principiante",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-espalda-06",
    "name": "Pullover en polea alta",
    "slug": "pullover-polea-alta",
    "description": "Aislamiento de dorsales sin fatiga de bíceps.",
    "mainMuscleGroup": "espalda",
    "secondaryMuscles": [
      "core",
      "triceps"
    ],
    "equipment": "polea",
    "exerciseType": "aislamiento",
    "instructions": [
      "Brazos casi rectos, lleva la barra hacia los muslos en un arco.",
      "Aprieta dorsales y regresa a la altura de ojos."
    ],
    "techniqueTips": "Tira con los codos manteniendo codos semi-rígidos.",
    "difficultyLevel": "intermedio",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-espalda-07",
    "name": "Peso muerto convencional",
    "slug": "peso-muerto-convencional",
    "description": "Fuerza total y masa para erectores espinales, glúteos y trapecios.",
    "mainMuscleGroup": "espalda",
    "secondaryMuscles": [
      "piernas",
      "core"
    ],
    "equipment": "barra",
    "exerciseType": "compuesto",
    "instructions": [
      "Pies al ancho de cadera, agarra la barra por fuera de piernas.",
      "Espalda recta, empuja el piso extendiendo cadera y rodillas.",
      "Ponte erguido y baja pegado a los muslos."
    ],
    "techniqueTips": "Nunca curves la espalda baja bajo carga.",
    "difficultyLevel": "avanzado",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-hombros-01",
    "name": "Press militar con barra",
    "slug": "press-militar-barra",
    "description": "Empuje vertical estricto para hombros y fuerza general de tren superior.",
    "mainMuscleGroup": "hombros",
    "secondaryMuscles": [
      "triceps",
      "core"
    ],
    "equipment": "barra",
    "exerciseType": "compuesto",
    "instructions": [
      "Barra en clavículas, glúteos y abdomen apretados.",
      "Empuja la barra verticalmente por encima de la cabeza.",
      "Bloquea brazos arriba y baja con control."
    ],
    "techniqueTips": "No arquees la zona lumbar al subir.",
    "difficultyLevel": "intermedio",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-hombros-02",
    "name": "Press sentado con mancuernas",
    "slug": "press-hombros-mancuernas",
    "description": "Aislamiento de deltoides con respaldo y rango independiente.",
    "mainMuscleGroup": "hombros",
    "secondaryMuscles": [
      "triceps"
    ],
    "equipment": "mancuernas",
    "exerciseType": "compuesto",
    "instructions": [
      "Mancuernas a la altura de las orejas en banco a 85 grados.",
      "Presiona hacia arriba en arco convergente.",
      "Desciende controladamente sin chocar las mancuernas."
    ],
    "techniqueTips": "Mantén tensión continua sin relajar abajo.",
    "difficultyLevel": "principiante",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-hombros-03",
    "name": "Elevaciones laterales",
    "slug": "elevaciones-laterales",
    "description": "El ejercicio clave para dar amplitud en V con deltoides laterales.",
    "mainMuscleGroup": "hombros",
    "secondaryMuscles": [
      "trapecio"
    ],
    "equipment": "mancuernas",
    "exerciseType": "aislamiento",
    "instructions": [
      "Eleva mancuernas hacia los lados guiando con codos hasta altura de hombros.",
      "Baja resistiendo el peso en 2 segundos."
    ],
    "techniqueTips": "Piensa en empujar las paredes hacia los lados con los codos.",
    "difficultyLevel": "principiante",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-hombros-04",
    "name": "Pájaros / Deltoides posterior",
    "slug": "pajaros-posteriores",
    "description": "Aislamiento de deltoides posterior para equilibrio y salud de hombro.",
    "mainMuscleGroup": "hombros",
    "secondaryMuscles": [
      "espalda"
    ],
    "equipment": "mancuernas",
    "exerciseType": "aislamiento",
    "instructions": [
      "Inclina torso hacia adelante con espalda recta casi horizontal.",
      "Eleva las mancuernas a los lados contrayendo la parte posterior de hombros."
    ],
    "techniqueTips": "Usa pesos moderados sin impulsos del torso.",
    "difficultyLevel": "intermedio",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-hombros-05",
    "name": "Face pull en polea",
    "slug": "face-pull",
    "description": "Esencial para manguito rotador, trapecio y deltoides posterior.",
    "mainMuscleGroup": "hombros",
    "secondaryMuscles": [
      "espalda"
    ],
    "equipment": "polea",
    "exerciseType": "aislamiento",
    "instructions": [
      "Cuerda a la altura de los ojos, tira hacia la frente separando manos.",
      "Rota externamente los hombros contrayendo 1s atrás."
    ],
    "techniqueTips": "Codos altos y muñecas hacia atrás.",
    "difficultyLevel": "principiante",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-biceps-01",
    "name": "Curl de bíceps con barra",
    "slug": "curl-barra",
    "description": "Sobrecarga principal para ambas cabezas del bíceps braquial.",
    "mainMuscleGroup": "biceps",
    "secondaryMuscles": [
      "antebrazos"
    ],
    "equipment": "barra",
    "exerciseType": "aislamiento",
    "instructions": [
      "Codos pegados a costillas, sube la barra flexionando codos.",
      "Aprieta en la cima y desciende lento."
    ],
    "techniqueTips": "Sin balanceo de cadera ni tirones.",
    "difficultyLevel": "principiante",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-biceps-02",
    "name": "Curl con mancuernas alterno",
    "slug": "curl-mancuernas-alterno",
    "description": "Supinación activa para máxima contracción del bíceps.",
    "mainMuscleGroup": "biceps",
    "secondaryMuscles": [
      "antebrazos"
    ],
    "equipment": "mancuernas",
    "exerciseType": "aislamiento",
    "instructions": [
      "Sube la mancuerna girando la palma hacia arriba (supinación).",
      "Baja controlando y alterna de brazo."
    ],
    "techniqueTips": "Comienza a supinar desde el primer tercio del movimiento.",
    "difficultyLevel": "principiante",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-biceps-03",
    "name": "Curl martillo",
    "slug": "curl-martillo",
    "description": "Trabaja braquial anterior y braquiorradial para engrosar el brazo.",
    "mainMuscleGroup": "biceps",
    "secondaryMuscles": [
      "antebrazos"
    ],
    "equipment": "mancuernas",
    "exerciseType": "aislamiento",
    "instructions": [
      "Palmas enfrentadas en todo momento (agarre neutro).",
      "Flexiona llevando mancuernas hacia hombros sin rotar muñecas."
    ],
    "techniqueTips": "Hombros firmes y codos bloqueados en posición.",
    "difficultyLevel": "principiante",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-biceps-04",
    "name": "Curl inclinado con mancuernas",
    "slug": "curl-inclinado",
    "description": "Estiramiento máximo de la cabeza larga en banco inclinado.",
    "mainMuscleGroup": "biceps",
    "secondaryMuscles": [
      "antebrazos"
    ],
    "equipment": "mancuernas",
    "exerciseType": "aislamiento",
    "instructions": [
      "Acuéstate en banco a 45-60 grados con brazos colgando.",
      "Haz curl sin adelantar los codos."
    ],
    "techniqueTips": "Siente el estiramiento profundo antes de cada repetición.",
    "difficultyLevel": "intermedio",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-biceps-05",
    "name": "Curl predicador en banco Scott",
    "slug": "curl-predicador",
    "description": "Aisla el bíceps imposibilitando cualquier impulso del cuerpo.",
    "mainMuscleGroup": "biceps",
    "secondaryMuscles": [
      "antebrazos"
    ],
    "equipment": "barra",
    "exerciseType": "aislamiento",
    "instructions": [
      "Brazos apoyados en la almohadilla, sube hasta la vertical.",
      "Baja hasta casi extensión completa sin bloquear codos."
    ],
    "techniqueTips": "No despegues los codos de la almohadilla.",
    "difficultyLevel": "intermedio",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-triceps-01",
    "name": "Press francés con barra Z",
    "slug": "press-frances-barra-z",
    "description": "Desarrollo masivo de cabeza medial y larga del tríceps.",
    "mainMuscleGroup": "triceps",
    "secondaryMuscles": [
      "pecho"
    ],
    "equipment": "barra",
    "exerciseType": "aislamiento",
    "instructions": [
      "Tumbado en banco plano con barra Z en alto.",
      "Flexiona solo codos bajando la barra a la coronilla o trasnuca.",
      "Extiende los antebrazos contrayendo tríceps."
    ],
    "techniqueTips": "Mantén codos cerrados hacia adentro sin abrir hacia afuera.",
    "difficultyLevel": "intermedio",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-triceps-02",
    "name": "Extensión de tríceps en polea (Pushdown)",
    "slug": "pushdown-polea",
    "description": "Aislamiento constante y congestión para cabeza lateral.",
    "mainMuscleGroup": "triceps",
    "secondaryMuscles": [],
    "equipment": "polea",
    "exerciseType": "aislamiento",
    "instructions": [
      "Codos pegados a costillas, empuja la barra o cuerda hacia abajo.",
      "Extiende por completo y regresa hasta ángulo de 90°."
    ],
    "techniqueTips": "Los codos deben quedar fijos como bisagras.",
    "difficultyLevel": "principiante",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-triceps-03",
    "name": "Extensión trasnuca con mancuerna",
    "slug": "extension-trasnuca",
    "description": "Máxima elongación y trabajo de la cabeza larga del tríceps.",
    "mainMuscleGroup": "triceps",
    "secondaryMuscles": [],
    "equipment": "mancuernas",
    "exerciseType": "aislamiento",
    "instructions": [
      "Sostén mancuerna con ambas manos sobre la cabeza.",
      "Baja la mancuerna detrás de la nuca flexionando codos.",
      "Extiende hacia arriba sin mover la espalda."
    ],
    "techniqueTips": "Codos lo más apuntados al techo posible.",
    "difficultyLevel": "intermedio",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-triceps-04",
    "name": "Fondos para tríceps en paralelas",
    "slug": "fondos-triceps",
    "description": "Empuje vertical con torso erguido para tríceps masivos.",
    "mainMuscleGroup": "triceps",
    "secondaryMuscles": [
      "pecho",
      "hombros"
    ],
    "equipment": "peso_corporal",
    "exerciseType": "compuesto",
    "instructions": [
      "Cuerpo vertical en barras paralelas con codos cerrados.",
      "Baja a 90° y empuja extendiendo codos con fuerza."
    ],
    "techniqueTips": "Cuerpo recto para focalizar tríceps (no inclinar el torso).",
    "difficultyLevel": "avanzado",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-piernas-01",
    "name": "Sentadilla trasera con barra",
    "slug": "sentadilla-trasera",
    "description": "El pilar fundamental de la fuerza y desarrollo del tren inferior.",
    "mainMuscleGroup": "piernas",
    "secondaryMuscles": [
      "core",
      "gluteos"
    ],
    "equipment": "barra",
    "exerciseType": "compuesto",
    "instructions": [
      "Barra en trapecios, pies a ancho de hombros con puntas ligeramente abiertas.",
      "Rompe paralelo bajando con control llevando rodillas en dirección de puntas.",
      "Empuja el suelo firmemente para subir a posición inicial."
    ],
    "techniqueTips": "Talones pegados al piso y pecho erguido.",
    "difficultyLevel": "avanzado",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-piernas-02",
    "name": "Sentadilla frontal con barra",
    "slug": "sentadilla-frontal",
    "description": "Mayor verticalidad del torso y enfoque directo en cuádriceps y core.",
    "mainMuscleGroup": "piernas",
    "secondaryMuscles": [
      "core"
    ],
    "equipment": "barra",
    "exerciseType": "compuesto",
    "instructions": [
      "Barra descansando en deltoides anteriores con codos altos.",
      "Desciende profundo manteniendo el torso totalmente vertical.",
      "Empuja el suelo ascendiendo con codos apuntando al frente."
    ],
    "techniqueTips": "Mantén los codos altos para que la barra no ruede hacia adelante.",
    "difficultyLevel": "avanzado",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-piernas-03",
    "name": "Prensa de piernas 45°",
    "slug": "prensa-piernas-45",
    "description": "Gran sobrecarga para cuádriceps y glúteos con bajo estrés espinal.",
    "mainMuscleGroup": "piernas",
    "secondaryMuscles": [
      "gluteos"
    ],
    "equipment": "maquina",
    "exerciseType": "compuesto",
    "instructions": [
      "Espalda y glúteos pegados al respaldo.",
      "Baja la plataforma hasta flexión profunda sin despegar el coxis.",
      "Empuja sin bloquear las rodillas en la cima."
    ],
    "techniqueTips": "Nunca bloquees las rodillas por completo.",
    "difficultyLevel": "principiante",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-piernas-04",
    "name": "Peso muerto rumano (RDL)",
    "slug": "peso-muerto-rumano",
    "description": "Máxima tensión e hipertrofia para isquiotibiales y glúteos.",
    "mainMuscleGroup": "piernas",
    "secondaryMuscles": [
      "espalda",
      "gluteos"
    ],
    "equipment": "barra",
    "exerciseType": "compuesto",
    "instructions": [
      "Rodillas semi-flexionadas pero fijas.",
      "Empuja la cadera hacia atrás bajando la barra rozando piernas.",
      "Extiende cadera con fuerza de glúteos para volver erguido."
    ],
    "techniqueTips": "Espalda totalmente recta; el movimiento es de bisagra de cadera.",
    "difficultyLevel": "intermedio",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-piernas-05",
    "name": "Extensión de cuádriceps",
    "slug": "extension-cuadriceps",
    "description": "Aislamiento para acortamiento máximo del cuádriceps.",
    "mainMuscleGroup": "piernas",
    "secondaryMuscles": [],
    "equipment": "maquina",
    "exerciseType": "aislamiento",
    "instructions": [
      "Almohadilla en tibias bajas, extiende piernas hacia arriba.",
      "Aprieta 1 segundo arriba y baja en 2-3 segundos."
    ],
    "techniqueTips": "Sujeta firmemente las agarraderas laterales.",
    "difficultyLevel": "principiante",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-piernas-06",
    "name": "Curl femoral tumbado",
    "slug": "curl-femoral-tumbado",
    "description": "Flexión de rodilla directa para isquiotibiales.",
    "mainMuscleGroup": "piernas",
    "secondaryMuscles": [],
    "equipment": "maquina",
    "exerciseType": "aislamiento",
    "instructions": [
      "Boca abajo con almohadilla tras tobillos.",
      "Flexiona rodillas acercando talones a glúteos.",
      "Baja controlando sin soltar el peso de golpe."
    ],
    "techniqueTips": "Mantén la pelvis pegada al banco.",
    "difficultyLevel": "principiante",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-piernas-07",
    "name": "Hip thrust con barra",
    "slug": "hip-thrust",
    "description": "El ejercicio de mayor activación y carga para glúteos.",
    "mainMuscleGroup": "piernas",
    "secondaryMuscles": [
      "gluteos"
    ],
    "equipment": "barra",
    "exerciseType": "compuesto",
    "instructions": [
      "Espalda media en borde del banco, barra acolchada en pelvis.",
      "Empuja talones extendiendo cadera hasta quedar horizontal.",
      "Aprieta glúteos 1s arriba con mentón recogido."
    ],
    "techniqueTips": "Mira siempre al frente para no arquear cuello ni lumbares.",
    "difficultyLevel": "intermedio",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-piernas-08",
    "name": "Zancadas con mancuernas",
    "slug": "zancadas-mancuernas",
    "description": "Trabajo dinámico unilateral para fuerza de piernas y estabilidad.",
    "mainMuscleGroup": "piernas",
    "secondaryMuscles": [
      "gluteos",
      "core"
    ],
    "equipment": "mancuernas",
    "exerciseType": "compuesto",
    "instructions": [
      "Paso amplio adelante flexionando ambas rodillas a 90°.",
      "Empuja con pierna delantera para regresar erguido."
    ],
    "techniqueTips": "Torso firme sin tambaleos laterales.",
    "difficultyLevel": "intermedio",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-piernas-09",
    "name": "Sentadilla búlgara",
    "slug": "sentadilla-bulgara",
    "description": "Gran estímulo unilateral en banco para glúteo y cuádriceps.",
    "mainMuscleGroup": "piernas",
    "secondaryMuscles": [
      "gluteos"
    ],
    "equipment": "mancuernas",
    "exerciseType": "compuesto",
    "instructions": [
      "Pie trasero elevado en banco, desciende la rodilla al suelo.",
      "Sube empujando desde el talón delantero."
    ],
    "techniqueTips": "Inclina levemente el torso al frente para activar glúteo.",
    "difficultyLevel": "avanzado",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-piernas-10",
    "name": "Elevación de talones / Gemelos",
    "slug": "gemelos-de-pie",
    "description": "Estiramiento y contracción completa para gemelos.",
    "mainMuscleGroup": "piernas",
    "secondaryMuscles": [],
    "equipment": "maquina",
    "exerciseType": "aislamiento",
    "instructions": [
      "Punta de pies en plataforma, baja talones al máximo estiramiento.",
      "Ponte de puntillas al tope y pausa 1s."
    ],
    "techniqueTips": "Pausa en el fondo para evitar el rebote elástico del tendón.",
    "difficultyLevel": "principiante",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-core-01",
    "name": "Crunch en polea alta",
    "slug": "crunch-polea",
    "description": "Sobrecarga progresiva con peso para recto abdominal.",
    "mainMuscleGroup": "core",
    "secondaryMuscles": [],
    "equipment": "polea",
    "exerciseType": "aislamiento",
    "instructions": [
      "Arrodillado con cuerda tras nuca, enrolla la columna hacia los muslos.",
      "Aprieta abdomen abajo y regresa con control."
    ],
    "techniqueTips": "Flexiona la columna, no te sientes sobre los talones.",
    "difficultyLevel": "intermedio",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-core-02",
    "name": "Elevaciones de piernas colgado",
    "slug": "elevaciones-piernas",
    "description": "Excelente para abdomen bajo y flexores de cadera.",
    "mainMuscleGroup": "core",
    "secondaryMuscles": [
      "antebrazos"
    ],
    "equipment": "peso_corporal",
    "exerciseType": "aislamiento",
    "instructions": [
      "Colgado de barra, eleva piernas flexionando la pelvis hacia el pecho.",
      "Baja sin balanceos."
    ],
    "techniqueTips": "Retroverte la pelvis para activar los abdominales.",
    "difficultyLevel": "avanzado",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-core-03",
    "name": "Plancha isométrica",
    "slug": "plancha",
    "description": "Fuerza estática y estabilidad para todo el cinturón abdominal.",
    "mainMuscleGroup": "core",
    "secondaryMuscles": [
      "gluteos",
      "hombros"
    ],
    "equipment": "peso_corporal",
    "exerciseType": "aislamiento",
    "instructions": [
      "Sobre antebrazos y puntas de pies formando una línea recta.",
      "Aprieta glúteos y ombligo hacia adentro."
    ],
    "techniqueTips": "No dejes caer la cadera ni la subas en pirámide.",
    "difficultyLevel": "principiante",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "ex-core-04",
    "name": "Rueda abdominal (Ab wheel)",
    "slug": "rueda-abdominal",
    "description": "Anti-extensión máxima para abdominales de acero.",
    "mainMuscleGroup": "core",
    "secondaryMuscles": [
      "espalda",
      "triceps"
    ],
    "equipment": "otro",
    "exerciseType": "aislamiento",
    "instructions": [
      "De rodillas, rueda hacia adelante extendiendo el cuerpo.",
      "Tira con el abdomen para regresar a la posición inicial."
    ],
    "techniqueTips": "Aprieta glúteos para evitar dolor lumbar.",
    "difficultyLevel": "avanzado",
    "imageUrl": "",
    "isCustom": false,
    "createdBy": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
];
