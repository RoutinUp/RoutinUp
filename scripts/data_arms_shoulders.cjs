module.exports = [
  // HOMBROS
  {
    id: "ex-hombros-01",
    name: "Press militar con barra",
    slug: "press-militar-barra",
    description: "Empuje vertical estricto para hombros y fuerza general de tren superior.",
    mainMuscleGroup: "hombros",
    secondaryMuscles: ["triceps", "core"],
    equipment: "barra",
    exerciseType: "compuesto",
    instructions: [
      "Barra en clavículas, glúteos y abdomen apretados.",
      "Empuja la barra verticalmente por encima de la cabeza.",
      "Bloquea brazos arriba y baja con control."
    ],
    techniqueTips: "No arquees la zona lumbar al subir.",
    difficultyLevel: "intermedio",
    imageUrl: ""
  },
  {
    id: "ex-hombros-02",
    name: "Press sentado con mancuernas",
    slug: "press-hombros-mancuernas",
    description: "Aislamiento de deltoides con respaldo y rango independiente.",
    mainMuscleGroup: "hombros",
    secondaryMuscles: ["triceps"],
    equipment: "mancuernas",
    exerciseType: "compuesto",
    instructions: [
      "Mancuernas a la altura de las orejas en banco a 85 grados.",
      "Presiona hacia arriba en arco convergente.",
      "Desciende controladamente sin chocar las mancuernas."
    ],
    techniqueTips: "Mantén tensión continua sin relajar abajo.",
    difficultyLevel: "principiante",
    imageUrl: ""
  },
  {
    id: "ex-hombros-03",
    name: "Elevaciones laterales",
    slug: "elevaciones-laterales",
    description: "El ejercicio clave para dar amplitud en V con deltoides laterales.",
    mainMuscleGroup: "hombros",
    secondaryMuscles: ["trapecio"],
    equipment: "mancuernas",
    exerciseType: "aislamiento",
    instructions: [
      "Eleva mancuernas hacia los lados guiando con codos hasta altura de hombros.",
      "Baja resistiendo el peso en 2 segundos."
    ],
    techniqueTips: "Piensa en empujar las paredes hacia los lados con los codos.",
    difficultyLevel: "principiante",
    imageUrl: ""
  },
  {
    id: "ex-hombros-04",
    name: "Pájaros / Deltoides posterior",
    slug: "pajaros-posteriores",
    description: "Aislamiento de deltoides posterior para equilibrio y salud de hombro.",
    mainMuscleGroup: "hombros",
    secondaryMuscles: ["espalda"],
    equipment: "mancuernas",
    exerciseType: "aislamiento",
    instructions: [
      "Inclina torso hacia adelante con espalda recta casi horizontal.",
      "Eleva las mancuernas a los lados contrayendo la parte posterior de hombros."
    ],
    techniqueTips: "Usa pesos moderados sin impulsos del torso.",
    difficultyLevel: "intermedio",
    imageUrl: ""
  },
  {
    id: "ex-hombros-05",
    name: "Face pull en polea",
    slug: "face-pull",
    description: "Esencial para manguito rotador, trapecio y deltoides posterior.",
    mainMuscleGroup: "hombros",
    secondaryMuscles: ["espalda"],
    equipment: "polea",
    exerciseType: "aislamiento",
    instructions: [
      "Cuerda a la altura de los ojos, tira hacia la frente separando manos.",
      "Rota externamente los hombros contrayendo 1s atrás."
    ],
    techniqueTips: "Codos altos y muñecas hacia atrás.",
    difficultyLevel: "principiante",
    imageUrl: ""
  },

  // BÍCEPS
  {
    id: "ex-biceps-01",
    name: "Curl de bíceps con barra",
    slug: "curl-barra",
    description: "Sobrecarga principal para ambas cabezas del bíceps braquial.",
    mainMuscleGroup: "biceps",
    secondaryMuscles: ["antebrazos"],
    equipment: "barra",
    exerciseType: "aislamiento",
    instructions: [
      "Codos pegados a costillas, sube la barra flexionando codos.",
      "Aprieta en la cima y desciende lento."
    ],
    techniqueTips: "Sin balanceo de cadera ni tirones.",
    difficultyLevel: "principiante",
    imageUrl: ""
  },
  {
    id: "ex-biceps-02",
    name: "Curl con mancuernas alterno",
    slug: "curl-mancuernas-alterno",
    description: "Supinación activa para máxima contracción del bíceps.",
    mainMuscleGroup: "biceps",
    secondaryMuscles: ["antebrazos"],
    equipment: "mancuernas",
    exerciseType: "aislamiento",
    instructions: [
      "Sube la mancuerna girando la palma hacia arriba (supinación).",
      "Baja controlando y alterna de brazo."
    ],
    techniqueTips: "Comienza a supinar desde el primer tercio del movimiento.",
    difficultyLevel: "principiante",
    imageUrl: ""
  },
  {
    id: "ex-biceps-03",
    name: "Curl martillo",
    slug: "curl-martillo",
    description: "Trabaja braquial anterior y braquiorradial para engrosar el brazo.",
    mainMuscleGroup: "biceps",
    secondaryMuscles: ["antebrazos"],
    equipment: "mancuernas",
    exerciseType: "aislamiento",
    instructions: [
      "Palmas enfrentadas en todo momento (agarre neutro).",
      "Flexiona llevando mancuernas hacia hombros sin rotar muñecas."
    ],
    techniqueTips: "Hombros firmes y codos bloqueados en posición.",
    difficultyLevel: "principiante",
    imageUrl: ""
  },
  {
    id: "ex-biceps-04",
    name: "Curl inclinado con mancuernas",
    slug: "curl-inclinado",
    description: "Estiramiento máximo de la cabeza larga en banco inclinado.",
    mainMuscleGroup: "biceps",
    secondaryMuscles: ["antebrazos"],
    equipment: "mancuernas",
    exerciseType: "aislamiento",
    instructions: [
      "Acuéstate en banco a 45-60 grados con brazos colgando.",
      "Haz curl sin adelantar los codos."
    ],
    techniqueTips: "Siente el estiramiento profundo antes de cada repetición.",
    difficultyLevel: "intermedio",
    imageUrl: ""
  },
  {
    id: "ex-biceps-05",
    name: "Curl predicador en banco Scott",
    slug: "curl-predicador",
    description: "Aisla el bíceps imposibilitando cualquier impulso del cuerpo.",
    mainMuscleGroup: "biceps",
    secondaryMuscles: ["antebrazos"],
    equipment: "barra",
    exerciseType: "aislamiento",
    instructions: [
      "Brazos apoyados en la almohadilla, sube hasta la vertical.",
      "Baja hasta casi extensión completa sin bloquear codos."
    ],
    techniqueTips: "No despegues los codos de la almohadilla.",
    difficultyLevel: "intermedio",
    imageUrl: ""
  },

  // TRÍCEPS
  {
    id: "ex-triceps-01",
    name: "Press francés con barra Z",
    slug: "press-frances-barra-z",
    description: "Desarrollo masivo de cabeza medial y larga del tríceps.",
    mainMuscleGroup: "triceps",
    secondaryMuscles: ["pecho"],
    equipment: "barra",
    exerciseType: "aislamiento",
    instructions: [
      "Tumbado en banco plano con barra Z en alto.",
      "Flexiona solo codos bajando la barra a la coronilla o trasnuca.",
      "Extiende los antebrazos contrayendo tríceps."
    ],
    techniqueTips: "Mantén codos cerrados hacia adentro sin abrir hacia afuera.",
    difficultyLevel: "intermedio",
    imageUrl: ""
  },
  {
    id: "ex-triceps-02",
    name: "Extensión de tríceps en polea (Pushdown)",
    slug: "pushdown-polea",
    description: "Aislamiento constante y congestión para cabeza lateral.",
    mainMuscleGroup: "triceps",
    secondaryMuscles: [],
    equipment: "polea",
    exerciseType: "aislamiento",
    instructions: [
      "Codos pegados a costillas, empuja la barra o cuerda hacia abajo.",
      "Extiende por completo y regresa hasta ángulo de 90°."
    ],
    techniqueTips: "Los codos deben quedar fijos como bisagras.",
    difficultyLevel: "principiante",
    imageUrl: ""
  },
  {
    id: "ex-triceps-03",
    name: "Extensión trasnuca con mancuerna",
    slug: "extension-trasnuca",
    description: "Máxima elongación y trabajo de la cabeza larga del tríceps.",
    mainMuscleGroup: "triceps",
    secondaryMuscles: [],
    equipment: "mancuernas",
    exerciseType: "aislamiento",
    instructions: [
      "Sostén mancuerna con ambas manos sobre la cabeza.",
      "Baja la mancuerna detrás de la nuca flexionando codos.",
      "Extiende hacia arriba sin mover la espalda."
    ],
    techniqueTips: "Codos lo más apuntados al techo posible.",
    difficultyLevel: "intermedio",
    imageUrl: ""
  },
  {
    id: "ex-triceps-04",
    name: "Fondos para tríceps en paralelas",
    slug: "fondos-triceps",
    description: "Empuje vertical con torso erguido para tríceps masivos.",
    mainMuscleGroup: "triceps",
    secondaryMuscles: ["pecho", "hombros"],
    equipment: "peso_corporal",
    exerciseType: "compuesto",
    instructions: [
      "Cuerpo vertical en barras paralelas con codos cerrados.",
      "Baja a 90° y empuja extendiendo codos con fuerza."
    ],
    techniqueTips: "Cuerpo recto para focalizar tríceps (no inclinar el torso).",
    difficultyLevel: "avanzado",
    imageUrl: ""
  }
];