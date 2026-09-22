module.exports = [
  // PECHO
  {
    id: "ex-pecho-01",
    name: "Press banca con barra",
    slug: "press-banca-barra",
    description: "Básico y compuesto por excelencia para fuerza y masa en pectorales.",
    mainMuscleGroup: "pecho",
    secondaryMuscles: ["triceps", "hombros"],
    equipment: "barra",
    exerciseType: "compuesto",
    instructions: [
      "Acuéstate sobre el banco plano con los ojos bajo la barra.",
      "Agarra la barra a un ancho ligeramente mayor a hombros.",
      "Retrae escápulas y apoya pies firmes.",
      "Baja controladamente a la parte media del pecho.",
      "Empuja extendiendo brazos sin bloquear codos bruscamente."
    ],
    techniqueTips: "Mantén escápulas retraídas y glúteos pegados al banco.",
    difficultyLevel: "intermedio",
    imageUrl: ""
  },
  {
    id: "ex-pecho-02",
    name: "Press inclinado con barra",
    slug: "press-inclinado-barra",
    description: "Énfasis en el haz clavicular (pecho superior).",
    mainMuscleGroup: "pecho",
    secondaryMuscles: ["hombros", "triceps"],
    equipment: "barra",
    exerciseType: "compuesto",
    instructions: [
      "Ajusta el banco a 30-45 grados.",
      "Baja la barra de forma controlada hacia la clavícula.",
      "Empuja con fuerza hasta posición inicial."
    ],
    techniqueTips: "Evita inclinar a más de 45° para no fatigar el hombro anterior.",
    difficultyLevel: "intermedio",
    imageUrl: ""
  },
  {
    id: "ex-pecho-03",
    name: "Press con mancuernas",
    slug: "press-mancuernas",
    description: "Mayor rango de movimiento y corrección de asimetrías.",
    mainMuscleGroup: "pecho",
    secondaryMuscles: ["triceps", "hombros"],
    equipment: "mancuernas",
    exerciseType: "compuesto",
    instructions: [
      "Túmbate en el banco con mancuernas al costado del pecho.",
      "Baja sintiendo el estiramiento pectoral.",
      "Empuja acercando mancuernas sin chocarlas."
    ],
    techniqueTips: "Controla la fase excéntrica en 2-3 segundos.",
    difficultyLevel: "intermedio",
    imageUrl: ""
  },
  {
    id: "ex-pecho-04",
    name: "Press inclinado con mancuernas",
    slug: "press-inclinado-mancuernas",
    description: "Enfoque clavicular con libertad articular para muñecas y codos.",
    mainMuscleGroup: "pecho",
    secondaryMuscles: ["hombros", "triceps"],
    equipment: "mancuernas",
    exerciseType: "compuesto",
    instructions: [
      "Banco a 30 grados, desciende controlando los codos a 45 grados.",
      "Empuja contrayendo la porción alta del pecho."
    ],
    techniqueTips: "Ángulo de 30° es óptimo.",
    difficultyLevel: "intermedio",
    imageUrl: ""
  },
  {
    id: "ex-pecho-05",
    name: "Aperturas con mancuernas",
    slug: "aperturas-mancuernas",
    description: "Aislamiento para estirar las fibras pectorales bajo tensión.",
    mainMuscleGroup: "pecho",
    secondaryMuscles: ["hombros"],
    equipment: "mancuernas",
    exerciseType: "aislamiento",
    instructions: [
      "Abre los brazos en un arco amplio con codos ligeramente flexionados.",
      "Cierra contrayendo fuertemente los pectorales."
    ],
    techniqueTips: "No bajes de la línea de los hombros si sientes molestia articular.",
    difficultyLevel: "principiante",
    imageUrl: ""
  },
  {
    id: "ex-pecho-06",
    name: "Pec deck / Contractor",
    slug: "pec-deck",
    description: "Máquina guiada con tensión constante en todo el recorrido.",
    mainMuscleGroup: "pecho",
    secondaryMuscles: ["hombros"],
    equipment: "maquina",
    exerciseType: "aislamiento",
    instructions: [
      "Junta los brazos al centro manteniendo 1s de contracción pico.",
      "Regresa lento controlando las placas."
    ],
    techniqueTips: "Empuja con codos y pecho, no tirando de las manos.",
    difficultyLevel: "principiante",
    imageUrl: ""
  },
  {
    id: "ex-pecho-07",
    name: "Fondos para pecho (Dips)",
    slug: "fondos-pecho",
    description: "Peso corporal con inclinación frontal para pectoral inferior.",
    mainMuscleGroup: "pecho",
    secondaryMuscles: ["triceps", "hombros"],
    equipment: "peso_corporal",
    exerciseType: "compuesto",
    instructions: [
      "Inclina el torso 30° hacia adelante en paralelas.",
      "Baja a 90° de flexión y empuja fuerte."
    ],
    techniqueTips: "Inclina el cuerpo al frente para enfocar pecho.",
    difficultyLevel: "avanzado",
    imageUrl: ""
  },
  {
    id: "ex-pecho-08",
    name: "Cruce de poleas",
    slug: "cruce-poleas",
    description: "Aislamiento continuo con cables para bombeo y congestión.",
    mainMuscleGroup: "pecho",
    secondaryMuscles: ["hombros"],
    equipment: "polea",
    exerciseType: "aislamiento",
    instructions: [
      "Desde polea media o alta, cruza las manos al frente y abajo.",
      "Siente la compresión pectoral en cada repetición."
    ],
    techniqueTips: "Mantén codos fijos y aprieta 1 segundo al cruzar.",
    difficultyLevel: "intermedio",
    imageUrl: ""
  },

  // ESPALDA
  {
    id: "ex-espalda-01",
    name: "Dominadas",
    slug: "dominadas",
    description: "Tracción vertical fundamental para amplitud de dorsal ancho.",
    mainMuscleGroup: "espalda",
    secondaryMuscles: ["biceps", "core"],
    equipment: "peso_corporal",
    exerciseType: "compuesto",
    instructions: [
      "Cuélgate con agarre prono a ancho superior a hombros.",
      "Tracciona con los dorsales llevando el pecho hacia la barra.",
      "Supera con la barbilla y baja con control total."
    ],
    techniqueTips: "Evita balanceo y concéntrate en tirar con la espalda.",
    difficultyLevel: "intermedio",
    imageUrl: ""
  },
  {
    id: "ex-espalda-02",
    name: "Jalón al pecho en polea",
    slug: "jalon-pecho",
    description: "Tracción vertical guiada para dorsales con peso regulable.",
    mainMuscleGroup: "espalda",
    secondaryMuscles: ["biceps"],
    equipment: "polea",
    exerciseType: "compuesto",
    instructions: [
      "Fija las piernas, toma la barra ancha y baja hacia el esternón superior.",
      "Extiende los dorsales arriba al regresar."
    ],
    techniqueTips: "Lleva los codos hacia las costillas.",
    difficultyLevel: "principiante",
    imageUrl: ""
  },
  {
    id: "ex-espalda-03",
    name: "Remo con barra",
    slug: "remo-barra",
    description: "Tracción horizontal pesada para grosor y densidad de espalda.",
    mainMuscleGroup: "espalda",
    secondaryMuscles: ["biceps", "core"],
    equipment: "barra",
    exerciseType: "compuesto",
    instructions: [
      "Inclina torso a 45° con columna neutra.",
      "Tracciona la barra hacia el ombligo contrayendo escápulas.",
      "Baja con control sin perder la postura."
    ],
    techniqueTips: "Activa el core para no cargar la zona lumbar.",
    difficultyLevel: "intermedio",
    imageUrl: ""
  },
  {
    id: "ex-espalda-04",
    name: "Remo con mancuerna a una mano",
    slug: "remo-mancuerna",
    description: "Trabajo unilateral con gran recorrido y estabilidad lumbar.",
    mainMuscleGroup: "espalda",
    secondaryMuscles: ["biceps"],
    equipment: "mancuernas",
    exerciseType: "compuesto",
    instructions: [
      "Apoya rodilla y mano en banco plano.",
      "Tira la mancuerna en diagonal hacia la cadera con el codo.",
      "Estira el dorsal al bajar."
    ],
    techniqueTips: "No rotes el torso excesivamente.",
    difficultyLevel: "principiante",
    imageUrl: ""
  },
  {
    id: "ex-espalda-05",
    name: "Remo sentado en polea (Gironda)",
    slug: "remo-gironda",
    description: "Remo en polea baja para zona media de trapecios y romboides.",
    mainMuscleGroup: "espalda",
    secondaryMuscles: ["biceps"],
    equipment: "polea",
    exerciseType: "compuesto",
    instructions: [
      "Espalda recta, tracciona el maneral V hacia el abdomen.",
      "Aprieta escápulas y regresa despacio."
    ],
    techniqueTips: "No balancees el cuerpo bruscamente.",
    difficultyLevel: "principiante",
    imageUrl: ""
  },
  {
    id: "ex-espalda-06",
    name: "Pullover en polea alta",
    slug: "pullover-polea-alta",
    description: "Aislamiento de dorsales sin fatiga de bíceps.",
    mainMuscleGroup: "espalda",
    secondaryMuscles: ["core", "triceps"],
    equipment: "polea",
    exerciseType: "aislamiento",
    instructions: [
      "Brazos casi rectos, lleva la barra hacia los muslos en un arco.",
      "Aprieta dorsales y regresa a la altura de ojos."
    ],
    techniqueTips: "Tira con los codos manteniendo codos semi-rígidos.",
    difficultyLevel: "intermedio",
    imageUrl: ""
  },
  {
    id: "ex-espalda-07",
    name: "Peso muerto convencional",
    slug: "peso-muerto-convencional",
    description: "Fuerza total y masa para erectores espinales, glúteos y trapecios.",
    mainMuscleGroup: "espalda",
    secondaryMuscles: ["piernas", "core"],
    equipment: "barra",
    exerciseType: "compuesto",
    instructions: [
      "Pies al ancho de cadera, agarra la barra por fuera de piernas.",
      "Espalda recta, empuja el piso extendiendo cadera y rodillas.",
      "Ponte erguido y baja pegado a los muslos."
    ],
    techniqueTips: "Nunca curves la espalda baja bajo carga.",
    difficultyLevel: "avanzado",
    imageUrl: ""
  }
];