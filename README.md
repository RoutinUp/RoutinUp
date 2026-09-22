# 🏋️ GymTrack - Aplicación Web Mobile-First de Entrenamiento

**GymTrack** es una aplicación web progresiva (PWA) de alto rendimiento diseñada con un enfoque **mobile-first**, creada para planificar, gestionar y ejecutar entrenamientos de gimnasio en una experiencia interactiva basada en **tarjetas deslizables (swipe cards)**, descansos cronometrados automáticos, seguimiento de récords personales (PRs), sugerencias de peso inteligentes y persistencia completa en **Supabase** (PostgreSQL).

---

## 🚀 Características Principales

1. **Nombre y Marca Centralizados:**
   - La marca "GymTrack", colores, incremento de pesos y textos están centralizados en `src/config/app.config.ts` para cambiar el nombre o estilo de la aplicación en un solo archivo.

2. **Experiencia de Entrenamiento Inmersiva Basada en Tarjetas (Swipe Deck):**
   - Interfaz a pantalla completa optimizada para uso con **una sola mano**.
   - Secuencia plana e interactiva: `Serie 1` ➔ `Descanso` ➔ `Serie 2` ➔ `Descanso`...
   - Deslizamiento táctil fluido (swipe izquierda para avanzar, swipe derecha para retroceder) con física de arrastre e inercia mediante Framer Motion.
   - Controles visuales accesibles en pantalla para usuarios que prefieran tocar botones.
   - **Navegación bidireccional estricta:** Al volver hacia atrás, se navega 1 a 1 en el historial (de Serie 3 a Descanso previo, o de Descanso a Serie 2).
   - **Persistencia al navegar:** Al regresar a una serie previa y modificar el peso o las repeticiones, **se actualiza el registro existente sin duplicar series**.
   - **Saltar ejercicio con confirmación:** Omite las series restantes del ejercicio, lo marca como `skipped` en el historial y salta directamente al siguiente ejercicio.

3. **Tarjeta de Descanso con Temporizador Automático:**
   - Inicia automáticamente la cuenta regresiva al completar cada serie.
   - Utiliza el tiempo de descanso configurado individualmente para cada ejercicio (ej. 120s para press banca, 60s para elevaciones laterales).
   - Anticipa el próximo ejercicio y serie.
   - Botones rápidos de ajuste (+30s / -30s) y botón prominente `[SALTAR DESCANSO]`.
   - Al llegar a 00:00: alerta sonora/campana nativa agradable (Web Audio API) y paso automático a la siguiente serie.

4. **Sugerencia Inteligente de Peso (Sobrecarga Progresiva):**
   - Analiza el desempeño del entrenamiento previo: si el usuario completó el tope de repeticiones de la meta (ej. 10 de un rango 8–10), sugiere un incremento (+2.5 kg para ejercicios compuestos, +1.25 kg para aislamiento).
   - Insignia interactiva con botón de 1 toque para aplicar el peso sugerido al campo sin esfuerzo.

5. **Biblioteca de 60+ Ejercicios con Placeholders Anatómicos Vectoriales:**
   - Ejercicios clasificados por grupo muscular: Pecho, Espalda, Hombros, Bíceps, Tríceps, Piernas, Core.
   - Ilustración anatómica vectorial en SVG que resalta con color neón el músculo principal trabajado.
   - Soporte para crear **Ejercicios Personalizados** asociados a la cuenta del usuario.
   - Preparado para subir imágenes personalizadas a Supabase Storage.

6. **Gestor de Rutinas y Días:**
   - Rutinas predeterminadas listas para usar (Push / Pull / Legs).
   - Creador y editor: crea días, agrega ejercicios, define series, rangos de reps (ej: 4 × 8–10), peso objetivo, descansos individuales y notas personales.

7. **Historial y Récords Personales (PRs):**
   - Registro de duración, volumen total (kg) y desglose serie a serie.
   - Detección automática y celebración con confeti de nuevos récords de peso.
   - Gráficas móviles con Recharts: evolución del peso máximo por fecha y volumen por sesión.

8. **PWA & Offline / Demo Fallback Resiliente:**
   - Funciona como PWA instalable en la pantalla de inicio del teléfono.
   - Si no se configuran las variables de Supabase de inmediato, la aplicación entra automáticamente en **Modo Local / Demo**, permitiendo probar el 100% de los flujos de entrenamiento sin errores.

---

## 📂 Estructura del Proyecto

```text
gymtrack/
├── .github/workflows/deploy.yml     # Despliegue automatizado en GitHub Pages
├── public/
│   ├── favicon.svg                  # Ícono SVG de la app
│   ├── 404.html                     # Soporte de redirección SPA para GitHub Pages
│   └── placeholder-exercise.svg
├── src/
│   ├── config/
│   │   ├── app.config.ts            # Configuración de marca GymTrack (centralizada)
│   │   └── supabase.ts              # Cliente seguro de Supabase
│   ├── types/                       # Modelos TypeScript (ejercicios, rutinas, series, RPs)
│   ├── services/
│   │   ├── auth.service.ts          # Autenticación (Email, Google OAuth, sesión)
│   │   ├── exercise.service.ts      # Catálogo y ejercicios personalizados
│   │   ├── routine.service.ts       # Rutinas y configuración de días
│   │   └── workout.service.ts       # Guardado de sesiones, RPs y estadísticas
│   ├── store/
│   │   ├── useAuthStore.ts          # Sesión y perfil de usuario
│   │   └── useActiveWorkoutStore.ts # Motor del entrenamiento activo con persistencia
│   ├── components/
│   │   ├── common/                  # Button, Header, BottomNav, Modal, ExerciseImage
│   │   ├── workout/                 # SetCard, RestCard, SwipeableDeck, QuickNumberStepper...
│   │   ├── routines/
│   │   ├── exercises/
│   │   └── progress/
│   ├── pages/                       # Vistas: Home, Rutinas, Biblioteca, Entrenamiento, Historial, Progreso, Ajustes, Auth
│   ├── data/seedExercises.ts        # Catálogo precargado de 40+ ejercicios estructurados
│   ├── App.tsx                      # Router HashRouter (compatible con GitHub Pages)
│   ├── main.tsx
│   └── index.css                    # Tailwind CSS + reset táctil mobile-first
├── supabase/
│   ├── migrations/                  # Migraciones SQL independientes (Schema, RLS, Seed)
│   └── seed.sql                     # Script SQL consolidado para ejecución con 1 clic
├── .env.example
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

---

## 🛠️ Instalación y Ejecución Local

1. **Clonar o ingresar al proyecto:**
   ```bash
   cd gymtrack
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar en modo desarrollo:**
   ```bash
   npm run dev
   ```
   Abre la URL mostrada (ej. `http://localhost:5173`) en tu navegador o desde tu teléfono conectado a la misma red WiFi.

4. **Compilar para producción:**
   ```bash
   npm run build
   ```

---

## ☁️ Configuración de Supabase (Paso a Paso)

GymTrack utiliza PostgreSQL con Row Level Security (RLS) en Supabase para aislar estrictamente los datos de cada usuario.

1. **Crear Proyecto en Supabase:**
   - Ingresa a [supabase.com](https://supabase.com) y crea una cuenta gratuita.
   - Crea un nuevo proyecto (ej. `gymtrack-db`) y define una contraseña segura para la base de datos.

2. **Ejecutar el Script SQL Consolidado:**
   - En el panel de Supabase, ve al menú lateral izquierdo y entra a **SQL Editor**.
   - Haz clic en **New query**.
   - Abre el archivo `supabase/seed.sql` de este proyecto, copia todo su contenido, pégalo en el editor de Supabase y presiona **RUN**.
   - ¡Listo! Se habrán creado las tablas (`profiles`, `exercises`, `workout_routines`, `workout_days`, `workout_day_exercises`, `workout_sessions`, `session_exercises`, `session_sets`, `personal_records`), todos los índices de alto rendimiento, los triggers de actualización, las políticas de Row Level Security (RLS) y el catálogo inicial de ejercicios.

3. **Habilitar Google OAuth (Opcional):**
   - Ve a **Authentication ➔ Providers ➔ Google**.
   - Ingresa tu `Client ID` y `Client Secret` obtenidos en Google Cloud Console.
   - Agrega la URL de Callback de Supabase a tus URIs de redirección autorizadas en Google Cloud.

4. **Configurar Supabase Storage para Imágenes Personalizadas (Opcional):**
   - Ve a **Storage** y crea un bucket público llamado `exercise-images`.
   - Permite que los usuarios autenticados suban imágenes mediante las políticas predeterminadas de Supabase Storage.

5. **Obtener Credenciales y Configurar el archivo `.env`:**
   - Ve a **Project Settings ➔ API**.
   - Copia la `Project URL` y la `anon public key`.
   - En la raíz del proyecto crea un archivo `.env` (basándote en `.env.example`):
     ```env
     VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
     VITE_SUPABASE_ANON_KEY=tu-anon-key-publica
     ```

---

## 🌐 Despliegue en GitHub Pages

GymTrack está configurado para desplegarse como frontend estático en GitHub Pages sin caídas de enrutamiento:

1. **Crear Repositorio en GitHub:**
   - Inicializa el repositorio git y haz push a tu cuenta:
     ```bash
     git init
     git add .
     git commit -m "feat: initial GymTrack release"
     git branch -M main
     git remote add origin https://github.com/tu-usuario/gymtrack.git
     git push -u origin main
     ```

2. **Configurar GitHub Pages:**
   - En GitHub, ve a **Settings ➔ Pages**.
   - En **Build and deployment ➔ Source**, selecciona **GitHub Actions**.

3. **Configurar Secretos (Secrets):**
   - Ve a **Settings ➔ Secrets and variables ➔ Actions**.
   - Agrega dos secretos con los valores de Supabase:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - El workflow `.github/workflows/deploy.yml` compilará y desplegará la aplicación automáticamente en cada `git push`.

---

## 🎨 Guía para Reemplazar Ilustraciones Propias

Cada ejercicio en GymTrack cuenta con un campo `imageUrl`.

1. **Subir tus ilustraciones:**
   - Puedes subir tus archivos PNG o SVG directamente al bucket `exercise-images` de Supabase Storage o colocarlos en la carpeta `public/illustrations/`.
2. **Asignar la imagen al ejercicio:**
   - Al editar o crear un ejercicio, pega la URL en el campo `imageUrl`.
   - La aplicación detectará automáticamente la imagen y la mostrará tanto en la selección de rutinas como en la tarjeta principal durante el entrenamiento, manteniendo el fallback al placeholder anatómico SVG si no hay imagen disponible.

---

## 📋 Lista de Funcionalidades Implementadas

- [x] Configuración centralizada de marca y nombre GymTrack (`src/config/app.config.ts`).
- [x] Autenticación completa (Supabase Auth Email/Password + Google OAuth + Modo Demo local).
- [x] Base de datos relacional PostgreSQL con RLS estricto y triggers automáticos (`supabase/seed.sql`).
- [x] Biblioteca de 40+ ejercicios organizados por grupo muscular con filtros y búsqueda.
- [x] Soporte para creación de ejercicios personalizados.
- [x] Gestor interactivo de rutinas: días, ejercicios, series, rangos de reps (ej: 4 × 8–10), descansos y notas.
- [x] Rutinas predeterminadas completas (Push / Pull / Legs).
- [x] **Motor de entrenamiento inmersivo con tarjetas (Swipe Cards):**
  - [x] Tarjeta de Serie con ilustración anatómica prominente y controles táctiles de peso y reps.
  - [x] Tarjeta de Descanso con cronómetro regresivo automático, alerta sonora (Web Audio API) y botón "Saltar".
  - [x] Navegación por gestos Swipe (Framer Motion) y botones táctiles accesibles.
  - [x] Navegación estricta 1 a 1 hacia atrás y hacia adelante.
  - [x] Edición de series anteriores sin duplicación de registros.
  - [x] Modal de confirmación para saltar ejercicios (`skipped`).
  - [x] Sugerencias de peso inteligentes basadas en sobrecarga progresiva y desempeño anterior.
  - [x] Pantalla resumen de finalización con confeti y cálculo de volumen total.
- [x] Historial detallado de entrenamientos serie a serie.
- [x] Detección y vitrina de Récords Personales (PRs).
- [x] Gráficas de progreso de peso máximo y volumen por fecha (Recharts).
- [x] PWA configurada con manifiesto y service worker (`vite-plugin-pwa`).
- [x] Workflow de CI/CD para GitHub Pages (`deploy.yml`).

---

## 🔮 Funcionalidades Preparadas para el Futuro (Escalabilidad)

- **Planes Premium y Facturación:** Tablas y perfiles desacoplados con IDs de usuario preparados para integración con Stripe / LemonSqueezy.
- **Rutinas Compartibles y Comunidad:** Esquema preparado para agregar banderas `is_public` o tokens para compartir rutinas con amigos.
- **Sincronización de Ejercicios en la Nube con Storage:** Hook y servicios listos para subida directa de archivos binarios vía Supabase Storage API.
- **Temporizadores de Intervalo HIIT / Tabata:** El motor de tarjetas planas soporta extenderse a rutinas basadas puramente en tiempo.