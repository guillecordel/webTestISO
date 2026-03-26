const SUBJECTS = [
  { id: "iso", nombre: "Sistemas Operativos" },
  { id: "sstt", nombre: "Servicios y Sistemas de Telecomunicaciones" },
];

const EXAM_FILES = {
  iso: [
    { id: "tema1", nombre: "Examen tema-1", archivo: "data/preguntas-tema-1.json" },
    { id: "tema2", nombre: "Examen tema-2", archivo: "data/preguntas-tema-2.json" },
    { id: "tema3", nombre: "Examen tema-3", archivo: "data/preguntas-tema-3.json" },
    { id: "tema4", nombre: "Examen tema-4", archivo: "data/preguntas-tema-4.json" },
    { id: "tema5", nombre: "Examen tema-5", archivo: "data/preguntas-tema-5.json" },
    { id: "tema6", nombre: "Examen tema-6", archivo: "data/preguntas-tema-6.json" },
    { id: "prueba", nombre: "Examen parcial-1 Prueba", archivo: "data/parcial-1-prueba.json" },
    { id: "noviembre2023", nombre: "Examen parcial-1 Noviembre 2023", archivo: "data/parcial-1-2023.json" },
    { id: "noviembre2022", nombre: "Examen parcial-1 Noviembre 2022", archivo: "data/parcial-1-2022.json" },
    { id: "prueba1", nombre: "Examen parcial-2 Prueba", archivo: "data/parcial-2-prueba.json" },
    { id: "diciembre2023", nombre: "Examen parcial-2 Diciembre 2023", archivo: "data/parcial-2-2023.json" },
    { id: "diciembre2022", nombre: "Examen parcial-2 Diciembre 2022", archivo: "data/parcial-2-2022.json" },
    { id: "mayo2023", nombre: "Examen Mayo 2023", archivo: "data/examenMayo2023.json" },
    { id: "junio2023", nombre: "Examen Junio 2023", archivo: "data/examenJunio2023.json" },
  ],
  sstt: [
    { id: "tema1", nombre: "Examen tema-1", archivo: "data/sstt-tema-1.json" },
    { id: "tema2", nombre: "Examen tema-2", archivo: "data/sstt-tema-2.json" },
  ],
};

const DEFAULT_SUBJECT = "iso";

const STORAGE_KEY = "study_sprint_state_v1";
const RANDOM_LIMIT = 50;
const RANDOM_BANK_FILE = "data/banco_unificado.json";

const ui = {
  screenStart: document.getElementById("screen-start"),
  screenQuiz: document.getElementById("screen-quiz"),
  screenSummary: document.getElementById("screen-summary"),
  modeSpecific: document.getElementById("mode-specific"),
  modeRandom: document.getElementById("mode-random"),
  specificControls: document.getElementById("specific-controls"),
  subjectSelect: document.getElementById("subject-select"),
  examSelect: document.getElementById("exam-select"),
  startExam: document.getElementById("start-exam"),
  resumeSavedExam: document.getElementById("resume-saved-exam"),
  resetStorage: document.getElementById("reset-storage"),
  quizMode: document.getElementById("quiz-mode"),
  questionCounter: document.getElementById("question-counter"),
  scorePreview: document.getElementById("score-preview"),
  progressBar: document.getElementById("progress-bar"),
  questionText: document.getElementById("question-text"),
  optionA: document.getElementById("option-a"),
  optionB: document.getElementById("option-b"),
  answerFeedback: document.getElementById("answer-feedback"),
  questionComment: document.getElementById("question-comment"),
  exitExam: document.getElementById("exit-exam"),
  nextQuestion: document.getElementById("next-question"),
  summaryCorrect: document.getElementById("summary-correct"),
  summaryWrong: document.getElementById("summary-wrong"),
  summaryGrade: document.getElementById("summary-grade"),
  newExam: document.getElementById("new-exam"),
  repeatSame: document.getElementById("repeat-same"),
  exitModal: document.getElementById("exit-modal"),
  saveAndExit: document.getElementById("save-and-exit"),
  discardAndExit: document.getElementById("discard-and-exit"),
  cancelExit: document.getElementById("cancel-exit"),
};

let appState = {
  stage: "start",
  mode: "specific",
  selectedSubject: DEFAULT_SUBJECT,
  selectedExamId: EXAM_FILES[DEFAULT_SUBJECT][0].id,
  questions: [],
  currentIndex: 0,
  answers: [],
  aciertos: 0,
  fallos: 0,
  savedExam: null,
};

// setSubject:
// Objetivo general: cambiar la asignatura seleccionada y actualizar los exámenes disponibles.
// Flujo específico: actualiza estado -> re-renderiza opciones de examen -> persiste.
function setSubject(subjectId) {
  appState.selectedSubject = subjectId;
  appState.selectedExamId = EXAM_FILES[subjectId][0].id;
  renderExamOptions(subjectId);
  persistState();
}

// init:
// Objetivo general: arrancar la aplicación y dejarla lista para interacción.
// Flujo específico: pinta selector -> conecta eventos -> restaura localStorage -> renderiza pantalla actual.
init();

function init() {
  // 1) Renderiza el combo de asignaturas disponibles.
  renderSubjectOptions();
  // 2) Renderiza el combo de exámenes disponibles.
  renderExamOptions(DEFAULT_SUBJECT);
  // 3) Registra listeners de todos los controles UI.
  bindEvents();
  // 4) Recupera estado persistido si existe.
  restoreState();
  // 5) Dibuja la pantalla adecuada según stage.
  render();
}

// renderExamOptions:
// Objetivo general: cargar en el select todos los bancos definidos en EXAM_FILES.
// Flujo específico: limpia opciones previas -> crea option por examen -> sincroniza valor actual.
function renderExamOptions(subject) {
  // Limpia cualquier opción previa para evitar duplicados.
  ui.examSelect.innerHTML = "";

  // Recorre la lista de bancos y crea una opción por cada banco.
  EXAM_FILES[subject].forEach((exam) => {
    // Crea nodo option.
    const option = document.createElement("option");
    // Guarda el id como value para identificar el banco.
    option.value = exam.id;
    // Texto visible para el usuario.
    option.textContent = exam.nombre;
    // Inserta option dentro del select.
    ui.examSelect.appendChild(option);
  });

  // Ajusta el valor del select al examen actualmente seleccionado en estado.
  ui.examSelect.value = appState.selectedExamId;
}

// renderSubjectOptions:
// Objetivo general: cargar en el select todos los subject disponibles.
// Flujo específico: limpia opciones previas -> crea option por subject -> sincroniza valor actual.
function renderSubjectOptions() {
  ui.subjectSelect.innerHTML = "";
  SUBJECTS.forEach((subject) => {
    const option = document.createElement("option");
    option.value = subject.id;
    option.textContent = subject.nombre;
    ui.subjectSelect.appendChild(option);
  });
  ui.subjectSelect.value = appState.selectedSubject;
}

// bindEvents:
// Objetivo general: conectar acciones de usuario con funciones de negocio.
// Flujo específico: asigna listeners a botones, select, respuestas, navegación y modal.
function bindEvents() {
  // Cambiar modo a específico.
  ui.modeSpecific.addEventListener("click", () => setMode("specific"));
  // Cambiar modo a aleatorio.
  ui.modeRandom.addEventListener("click", () => setMode("random"));

  // Al cambiar asignatura en el select.
  ui.subjectSelect.addEventListener("change", (event) => {
    setSubject(event.target.value);
  });

  // Al cambiar banco en el select, persiste nueva selección.
  ui.examSelect.addEventListener("change", (event) => {
    appState.selectedExamId = event.target.value;
    persistState();
  });

  // Inicia examen con configuración actual.
  ui.startExam.addEventListener("click", startExam);
  // Reanuda un examen previamente guardado.
  ui.resumeSavedExam.addEventListener("click", resumeSavedExam);
  // Borra todo el progreso guardado y reinicia estado.
  ui.resetStorage.addEventListener("click", clearProgress);

  // Responder opción A.
  ui.optionA.addEventListener("click", () => answerQuestion("A"));
  // Responder opción B.
  ui.optionB.addEventListener("click", () => answerQuestion("B"));
  // Abrir diálogo de salida del examen.
  ui.exitExam.addEventListener("click", openExitModal);

  // Ir a la siguiente pregunta o finalizar.
  ui.nextQuestion.addEventListener("click", goToNextQuestion);
  // Volver al inicio desde resumen.
  ui.newExam.addEventListener("click", resetToStart);
  // Repetir inmediatamente el mismo tipo de examen.
  ui.repeatSame.addEventListener("click", repeatCurrentConfig);
  // Guardar progreso y salir al menú.
  ui.saveAndExit.addEventListener("click", saveAndExitExam);
  // Salir descartando progreso.
  ui.discardAndExit.addEventListener("click", discardAndExitExam);
  // Cerrar modal sin salir.
  ui.cancelExit.addEventListener("click", closeExitModal);
}

// setMode:
// Objetivo general: alternar entre examen específico y aleatorio.
// Flujo específico: actualiza estado -> refleja clases visuales -> muestra/oculta select -> persiste.
function setMode(mode) {
  // Guarda modo elegido.
  appState.mode = mode;
  // Marca visualmente el botón activo específico.
  ui.modeSpecific.classList.toggle("active", mode === "specific");
  // Marca visualmente el botón activo aleatorio.
  ui.modeRandom.classList.toggle("active", mode === "random");
  // En modo aleatorio ocultamos el selector de examen fijo.
  ui.specificControls.classList.toggle("hidden", mode !== "specific");
  // Persiste estado para soportar refresh.
  persistState();
}

// startExam:
// Objetivo general: construir el set de preguntas y arrancar la sesión de examen.
// Flujo específico: carga preguntas según modo -> valida no vacío -> reinicia contadores -> persiste -> renderiza.
async function startExam() {
  try {
    // Carga por modo: específico usa un banco; aleatorio combina todos y corta a RANDOM_LIMIT.
    const questions = appState.mode === "specific"
      ? await loadSpecificExamQuestions(appState.selectedExamId)
      : await loadRandomExamQuestions();

    // Protege contra intento de iniciar sin preguntas.
    if (!questions.length) {
      alert("No hay preguntas disponibles para iniciar el examen.");
      return;
    }

    // Reinicia estado de sesión activa del examen.
    appState = {
      ...appState,
      stage: "quiz",
      questions,
      currentIndex: 0,
      answers: new Array(questions.length).fill(null),
      aciertos: 0,
      fallos: 0,
      savedExam: null,
    };

    // Guarda estado actualizado.
    persistState();
    // Dibuja pantalla de quiz.
    render();
  } catch (error) {
    // Registro técnico para depurar fallos de carga.
    console.error(error);
    // Mensaje legible para usuario final.
    alert("No se pudieron cargar las preguntas. Revisa los archivos JSON.");
  }
}

// loadSpecificExamQuestions:
// Objetivo general: cargar y barajar preguntas de un banco concreto.
// Flujo específico: localiza metadata -> valida existencia -> fetch JSON -> shuffle.
async function loadSpecificExamQuestions(examId) {
  // Busca definición del examen por id.
  const exam = EXAM_FILES[appState.selectedSubject].find((item) => item.id === examId);

  // Si no existe el banco, retorna vacío para que el llamador lo gestione.
  if (!exam) {
    return [];
  }

  // Carga contenido del archivo JSON.
  const data = await fetchJson(exam.archivo);
  // Baraja preguntas para evitar orden fijo.
  return shuffle([...data]);
}

// loadRandomExamQuestions:
// Objetivo general: construir un examen aleatorio global usando todos los bancos.
// Flujo específico: carga todos los JSON en paralelo -> aplana -> mezcla -> recorta a límite.
async function loadRandomExamQuestions() {
  // Carga el banco consolidado y toma 50 preguntas aleatorias desde su array global.
  return getRandomQuestionsFromUnifiedFile(RANDOM_BANK_FILE, RANDOM_LIMIT);
}

// getRandomQuestionsFromUnifiedFile:
// Objetivo general: obtener preguntas aleatorias a partir del archivo consolidado de bancos.
// Flujo específico: fetch del banco unificado -> extrae preguntas -> mezcla -> devuelve hasta el limite.
async function getRandomQuestionsFromUnifiedFile(unifiedPath, limit = 50) {
  const unifiedData = await fetchUnifiedJson(unifiedPath);
  const globalQuestions = Array.isArray(unifiedData.preguntas) ? unifiedData.preguntas : [];
  const shuffledQuestions = shuffle([...globalQuestions]);
  return shuffledQuestions.slice(0, Math.min(limit, shuffledQuestions.length));
}

// getRandomQuestionsFromJsonFiles:
// Objetivo general: combinar varios JSON de preguntas, mezclarlos y devolver un subconjunto aleatorio.
// Flujo específico: carga asincrona en paralelo -> fusion de arrays -> Fisher-Yates -> corte por limite.
async function getRandomQuestionsFromJsonFiles(jsonPaths, limit = 50) {
  // Carga todos los bancos de preguntas en paralelo para evitar esperas secuenciales.
  const allQuestionSets = await Promise.all(jsonPaths.map((path) => fetchJson(path)));

  // Combina todas las preguntas en un unico array global.
  const globalQuestions = allQuestionSets.flat();

  // Mezcla completamente el array global con Fisher-Yates.
  const shuffledQuestions = shuffle([...globalQuestions]);

  // Si hay menos preguntas que el limite, devuelve todas; si no, devuelve exactamente las primeras `limit`.
  return shuffledQuestions.slice(0, Math.min(limit, shuffledQuestions.length));
}

// fetchJson:
// Objetivo general: recuperar y validar un banco JSON remoto/local.
// Flujo específico: fetch -> valida status HTTP -> parsea JSON -> valida array.
async function fetchJson(path) {
  // Solicita recurso JSON.
  const response = await fetch(path);

  // Si HTTP no es OK, lanza error para tratar en niveles superiores.
  if (!response.ok) {
    throw new Error(`Error al cargar ${path}`);
  }

  // Convierte cuerpo a objeto JavaScript.
  const data = await response.json();

  // Garantiza contrato esperado: un array de preguntas.
  if (!Array.isArray(data)) {
    throw new Error(`Formato inválido en ${path}`);
  }

  // Devuelve colección válida.
  return data;
}

// fetchUnifiedJson:
// Objetivo general: recuperar y validar el archivo JSON consolidado de preguntas.
// Flujo específico: fetch -> valida status -> parsea -> valida objeto.
async function fetchUnifiedJson(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Error al cargar ${path}`);
  }

  const data = await response.json();

  if (typeof data !== "object" || data === null) {
    throw new Error(`Formato inválido en ${path}`);
  }

  return data;
}

// answerQuestion:
// Objetivo general: procesar una respuesta del usuario y actualizar marcador.
// Flujo específico: valida estado/pregunta -> evalúa acierto -> guarda respuesta -> ajusta aciertos/fallos -> persiste -> repinta.
function answerQuestion(selectedOption) {
  // Evita responder fuera del flujo de quiz.
  if (appState.stage !== "quiz") {
    return;
  }

  // Índice y pregunta actual según progreso.
  const index = appState.currentIndex;
  const current = appState.questions[index];

  // Bloquea respuestas duplicadas o pregunta inexistente.
  if (!current || appState.answers[index]) {
    return;
  }

  // Determina si la opción pulsada es correcta.
  const isCorrect = isAnswerCorrect(current, selectedOption);

  // Registra respuesta en posición actual.
  appState.answers[index] = {
    selected: selectedOption,
    correct: isCorrect,
  };

  // Suma acierto/fallo al contador.
  if (isCorrect) {
    appState.aciertos += 1;
  } else {
    appState.fallos += 1;
  }

  // Persiste cambio de estado.
  persistState();
  // Repinta pregunta para mostrar feedback visual.
  renderQuizScreen();
}

// isAnswerCorrect:
// Objetivo general: comprobar si una respuesta seleccionada coincide con la correcta.
// Flujo específico: soporta correcta como letra (A/B) o como texto de opción.
function isAnswerCorrect(question, selectedOption) {
  // Normaliza campo correcta para comparaciones robustas.
  const correcta = String(question.correcta).trim().toUpperCase();

  // Si el formato es A/B, comparación directa.
  if (correcta === "A" || correcta === "B") {
    return correcta === selectedOption;
  }

  // Si correcta viene como texto, compara contra la opción elegida.
  const compareText = selectedOption === "A" ? question.opcionA : question.opcionB;
  return String(compareText).trim().toLowerCase() === String(question.correcta).trim().toLowerCase();
}

// getCorrectOption:
// Objetivo general: resolver qué botón (A o B) representa la respuesta correcta.
// Flujo específico: usa letra explícita si existe, si no infiere comparando con opcionA.
function getCorrectOption(question) {
  // Normaliza el valor de correcta.
  const correcta = String(question.correcta).trim().toUpperCase();

  // Si ya viene en formato letra, devuelve directamente.
  if (correcta === "A" || correcta === "B") {
    return correcta;
  }

  // Fallback textual: compara correcta con opción A para decidir A/B.
  const optionA = String(question.opcionA).trim().toLowerCase();
  const expected = String(question.correcta).trim().toLowerCase();
  return optionA === expected ? "A" : "B";
}

// goToNextQuestion:
// Objetivo general: avanzar de pregunta o cerrar examen si ya es la última.
// Flujo específico: valida stage -> detecta fin -> cambia stage o incrementa índice -> persiste -> renderiza.
function goToNextQuestion() {
  // Solo se permite avanzar durante quiz.
  if (appState.stage !== "quiz") {
    return;
  }

  // Comprueba si estamos en la última pregunta.
  const isLast = appState.currentIndex >= appState.questions.length - 1;

  // Si es la última, pasa a resumen.
  if (isLast) {
    appState.stage = "summary";
    persistState();
    render();
    return;
  }

  // Si no es última, avanza índice y refresca UI.
  appState.currentIndex += 1;
  persistState();
  renderQuizScreen();
}

// resetToStart:
// Objetivo general: limpiar sesión actual y volver al menú de configuración.
// Flujo específico: resetea stage/datos -> persiste -> renderiza inicio.
function resetToStart() {
  appState.stage = "start";
  appState.questions = [];
  appState.currentIndex = 0;
  appState.answers = [];
  appState.aciertos = 0;
  appState.fallos = 0;
  persistState();
  render();
}

// repeatCurrentConfig:
// Objetivo general: reiniciar y comenzar otro examen con la misma configuración elegida.
// Flujo específico: limpia sesión activa -> persiste/render -> relanza startExam.
function repeatCurrentConfig() {
  appState.stage = "start";
  appState.questions = [];
  appState.currentIndex = 0;
  appState.answers = [];
  appState.aciertos = 0;
  appState.fallos = 0;
  persistState();
  render();
  startExam();
}

// clearProgress:
// Objetivo general: borrar todo lo persistido en localStorage y volver al estado inicial completo.
// Flujo específico: removeItem -> reconstruye appState base -> repinta select/modo -> renderiza.
function clearProgress() {
  // Elimina snapshot persistido.
  localStorage.removeItem(STORAGE_KEY);
  // Restaura estado base de aplicación.
  appState = {
    stage: "start",
    mode: "specific",
    selectedSubject: DEFAULT_SUBJECT,
    selectedExamId: EXAM_FILES[DEFAULT_SUBJECT][0].id,
    questions: [],
    currentIndex: 0,
    answers: [],
    aciertos: 0,
    fallos: 0,
    savedExam: null,
  };
  // Regenera opciones del selector.
  renderSubjectOptions();
  renderExamOptions(appState.selectedSubject);
  // Asegura modo visual por defecto.
  setMode("specific");
  // Refresca pantalla inicial.
  render();
}

// calculateGrade:
// Objetivo general: calcular nota final de 0 a 10 con fórmula pedida.
// Flujo específico: valida total -> aplica fórmula -> recorta mínimo a cero.
function calculateGrade() {
  // Total de preguntas del examen terminado.
  const total = appState.questions.length;

  // Evita división por cero.
  if (!total) {
    return 0;
  }

  // Fórmula oficial: (Aciertos - Fallos) / Total * 10.
  const result = ((appState.aciertos - appState.fallos) / total) * 10;
  // Impone límite inferior de 0.
  return Math.max(0, result);
}

// restoreState:
// Objetivo general: reconstruir estado de app desde localStorage al recargar.
// Flujo específico: lee storage -> parsea -> fusiona -> sanea valores -> sincroniza UI de modo/select.
function restoreState() {
  try {
    // Lee el snapshot persistido.
    const raw = localStorage.getItem(STORAGE_KEY);

    // Si no hay snapshot, solo asegura modo actual visual.
    if (!raw) {
      setMode(appState.mode);
      return;
    }

    // Convierte string JSON a objeto.
    const saved = JSON.parse(raw);
    // Fusiona estado recuperado sobre estado por defecto.
    appState = {
      ...appState,
      ...saved,
    };

    // Si el examen guardado no es válido, se descarta.
    if (!isValidSavedExam(appState.savedExam)) {
      appState.savedExam = null;
    }

    // Valida que la asignatura seleccionada exista
    if (!SUBJECTS.some((subject) => subject.id === appState.selectedSubject)) {
      appState.selectedSubject = DEFAULT_SUBJECT;
    }

    // Si el examen seleccionado ya no existe, usa el primero disponible.
    if (!EXAM_FILES[appState.selectedSubject].some((exam) => exam.id === appState.selectedExamId)) {
      appState.selectedExamId = EXAM_FILES[appState.selectedSubject][0].id;
    }

    // Sincroniza select visible con estado restaurado.
    ui.subjectSelect.value = appState.selectedSubject;
    ui.examSelect.value = appState.selectedExamId;
    // Sincroniza modo visual restaurado.
    setMode(appState.mode === "random" ? "random" : "specific");
  } catch (error) {
    // Log técnico y fallback seguro.
    console.error("No se pudo restaurar el estado:", error);
    setMode("specific");
  }
}

// persistState:
// Objetivo general: guardar el estado actual de la SPA en localStorage.
// Flujo específico: serializa appState y lo guarda con STORAGE_KEY.
function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

// render:
// Objetivo general: decidir qué pantalla mostrar según el stage y pintar sub-vistas.
// Flujo específico: alterna visibilidad start/quiz/summary -> muestra botón de reanudar -> delega render detallado.
function render() {
  // Muestra inicio solo si stage es start.
  ui.screenStart.classList.toggle("hidden", appState.stage !== "start");
  // Muestra quiz solo si stage es quiz.
  ui.screenQuiz.classList.toggle("hidden", appState.stage !== "quiz");
  // Muestra resumen solo si stage es summary.
  ui.screenSummary.classList.toggle("hidden", appState.stage !== "summary");
  // Reanudar solo aparece si hay examen guardado válido.
  ui.resumeSavedExam.classList.toggle("hidden", !isValidSavedExam(appState.savedExam));

  // Dibuja detalle de quiz cuando corresponde.
  if (appState.stage === "quiz") {
    renderQuizScreen();
  }

  // Dibuja detalle de resumen cuando corresponde.
  if (appState.stage === "summary") {
    renderSummaryScreen();
  }
}

// openExitModal:
// Objetivo general: abrir diálogo para decidir cómo salir del examen.
// Flujo específico: valida stage quiz -> usa API showModal si está disponible.
function openExitModal() {
  // Evita abrir modal fuera del contexto de examen.
  if (appState.stage !== "quiz") {
    return;
  }

  // Apertura accesible del elemento dialog.
  if (typeof ui.exitModal.showModal === "function") {
    ui.exitModal.showModal();
  }
}

// closeExitModal:
// Objetivo general: cerrar el diálogo de salida sin cambiar estado de examen.
// Flujo específico: comprueba que esté abierto y soportado -> cierra.
function closeExitModal() {
  if (ui.exitModal.open && typeof ui.exitModal.close === "function") {
    ui.exitModal.close();
  }
}

// saveAndExitExam:
// Objetivo general: persistir el progreso del examen activo y volver al menú.
// Flujo específico: serializa snapshot mínimo -> limpia examen en curso -> cierra modal.
function saveAndExitExam() {
  // Captura una instantánea reanudable del examen actual.
  appState.savedExam = {
    mode: appState.mode,
    selectedExamId: appState.selectedExamId,
    questions: appState.questions,
    currentIndex: appState.currentIndex,
    answers: appState.answers,
    aciertos: appState.aciertos,
    fallos: appState.fallos,
  };

  // Limpia sesión activa y vuelve a inicio.
  clearCurrentExamToStart();
  // Cierra diálogo.
  closeExitModal();
}

// discardAndExitExam:
// Objetivo general: salir del examen descartando cualquier progreso guardado.
// Flujo específico: borra savedExam -> limpia examen activo -> cierra modal.
function discardAndExitExam() {
  // Elimina snapshot de reanudación.
  appState.savedExam = null;
  // Limpia sesión actual y retorna al menú.
  clearCurrentExamToStart();
  // Cierra diálogo.
  closeExitModal();
}

// clearCurrentExamToStart:
// Objetivo general: helper para abandonar sesión de examen actual y volver a inicio.
// Flujo específico: resetea datos runtime (no configuración) -> persiste -> renderiza.
function clearCurrentExamToStart() {
  appState.stage = "start";
  appState.questions = [];
  appState.currentIndex = 0;
  appState.answers = [];
  appState.aciertos = 0;
  appState.fallos = 0;
  persistState();
  render();
}

// resumeSavedExam:
// Objetivo general: restaurar una sesión guardada por el usuario y seguir desde el punto exacto.
// Flujo específico: valida snapshot -> hidrata campos -> sincroniza modo/select -> persiste -> renderiza.
function resumeSavedExam() {
  // Sale si no hay snapshot consistente.
  if (!isValidSavedExam(appState.savedExam)) {
    return;
  }

  // Restaura todos los campos necesarios para continuar.
  appState.mode = appState.savedExam.mode;
  appState.selectedExamId = appState.savedExam.selectedExamId;
  appState.questions = [...appState.savedExam.questions];
  appState.currentIndex = appState.savedExam.currentIndex;
  appState.answers = [...appState.savedExam.answers];
  appState.aciertos = appState.savedExam.aciertos;
  appState.fallos = appState.savedExam.fallos;
  appState.stage = "quiz";

  // Sincroniza estado visual y formulario con datos recuperados.
  setMode(appState.mode === "random" ? "random" : "specific");
  ui.examSelect.value = appState.selectedExamId;
  // Persiste para consolidar estado activo.
  persistState();
  // Renderiza pantalla de examen.
  render();
}

// isValidSavedExam:
// Objetivo general: validar forma mínima del objeto de examen guardado.
// Flujo específico: comprueba existencia, arrays y tipos clave.
function isValidSavedExam(savedExam) {
  return Boolean(
    savedExam
      && Array.isArray(savedExam.questions)
      && savedExam.questions.length > 0
      && Array.isArray(savedExam.answers)
      && typeof savedExam.currentIndex === "number"
  );
}

// renderQuizScreen:
// Objetivo general: pintar la pregunta actual y estado parcial del examen.
// Flujo específico: obtiene pregunta actual -> actualiza textos y barra -> delega estado visual de respuesta.
function renderQuizScreen() {
  // Estado de posición actual.
  const index = appState.currentIndex;
  const total = appState.questions.length;
  const question = appState.questions[index];
  const answer = appState.answers[index];

  // Protección si índice está fuera de rango.
  if (!question) {
    return;
  }

  // Etiquetas de modo y contador.
  ui.quizMode.textContent = appState.mode === "specific" ? "Modo: Examen específico" : "Modo: Examen aleatorio";
  ui.questionCounter.textContent = `Pregunta ${index + 1} de ${total}`;
  // Marcador visible durante resolución.
  ui.scorePreview.textContent = `Aciertos: ${appState.aciertos} | Fallos: ${appState.fallos}`;
  // Enunciado actual.
  ui.questionText.textContent = question.enunciado;

  // Texto de botones A y B.
  ui.optionA.textContent = `A) ${question.opcionA}`;
  ui.optionB.textContent = `B) ${question.opcionB}`;

  // Cálculo de avance porcentual.
  const progress = ((index + 1) / total) * 100;
  // Aplicación visual del progreso.
  ui.progressBar.style.width = `${progress}%`;

  // Pinta clases/feedback según si ya respondió.
  paintAnswerState(question, answer);
}

// paintAnswerState:
// Objetivo general: aplicar estado visual de respuesta (correcta/incorrecta) y control de navegación.
// Flujo específico: limpia clases previas -> bloquea/activa botones -> pinta feedback -> configura botón siguiente.
function paintAnswerState(question, answer) {
  // Limpia estados visuales anteriores en botones.
  resetAnswerButtons();

  // Indica si la pregunta ya tiene respuesta registrada.
  const isAnswered = Boolean(answer);
  // Bloquea interacción cuando ya respondió.
  ui.optionA.disabled = isAnswered;
  ui.optionB.disabled = isAnswered;
  // Muestra botón siguiente solo tras responder.
  ui.nextQuestion.classList.toggle("hidden", !isAnswered);

  // Si no respondió aún, limpia feedback y termina.
  if (!isAnswered) {
    ui.answerFeedback.textContent = "";
    ui.answerFeedback.className = "mt-4 min-h-[1.5rem] text-base font-medium";
    ui.questionComment.textContent = "";
    ui.questionComment.classList.remove("comment-fade-in");
    ui.questionComment.classList.add("hidden");
    return;
  }

  // Determina letra correcta para marcado visual.
  const correctOption = getCorrectOption(question);

  // Marca la opción correcta.
  if (correctOption === "A") {
    ui.optionA.classList.add("correct");
  } else {
    ui.optionB.classList.add("correct");
  }

  // Si falló, marca explícitamente la opción elegida como incorrecta.
  if (!answer.correct) {
    if (answer.selected === "A") {
      ui.optionA.classList.add("wrong");
    }

    if (answer.selected === "B") {
      ui.optionB.classList.add("wrong");
    }
  }

  // Texto y color de feedback.
  if (answer.correct) {
    ui.answerFeedback.textContent = "Respuesta correcta";
    ui.answerFeedback.classList.add("feedback-ok");
  } else {
    ui.answerFeedback.textContent = "Respuesta incorrecta";
    ui.answerFeedback.classList.add("feedback-fail");
  }

  // Si la pregunta trae comentarios en el JSON, se muestran tras responder.
  const commentText = getQuestionComment(question);
  if (commentText) {
    ui.questionComment.textContent = `Comentario: ${commentText}`;
    ui.questionComment.classList.remove("hidden");
    ui.questionComment.classList.remove("comment-fade-in");
    // Fuerza reflow para reiniciar la animacion en cada respuesta.
    void ui.questionComment.offsetWidth;
    ui.questionComment.classList.add("comment-fade-in");
  } else {
    ui.questionComment.textContent = "";
    ui.questionComment.classList.remove("comment-fade-in");
    ui.questionComment.classList.add("hidden");
  }

  // Ajusta CTA final según si queda alguna pregunta.
  const isLast = appState.currentIndex >= appState.questions.length - 1;
  ui.nextQuestion.textContent = isLast ? "Finalizar examen" : "Siguiente";
}

// getQuestionComment:
// Objetivo general: extraer el comentario de una pregunta con tolerancia a variantes de nombre.
// Flujo específico: prueba campos comunes -> normaliza y recorta -> devuelve string o vacío.
function getQuestionComment(question) {
  const rawComment = question.comentarios ?? question.comentario ?? "";
  return String(rawComment).trim();
}

// resetAnswerButtons:
// Objetivo general: eliminar clases visuales de acierto/error en ambos botones.
// Flujo específico: removeClass correct/wrong para A y B.
function resetAnswerButtons() {
  ui.optionA.classList.remove("correct", "wrong");
  ui.optionB.classList.remove("correct", "wrong");
}

// renderSummaryScreen:
// Objetivo general: mostrar resultados finales del examen.
// Flujo específico: calcula nota -> imprime aciertos/fallos/nota en tarjetas.
function renderSummaryScreen() {
  // Calcula nota numérica final.
  const grade = calculateGrade();
  // Pinta aciertos.
  ui.summaryCorrect.textContent = String(appState.aciertos);
  // Pinta fallos.
  ui.summaryWrong.textContent = String(appState.fallos);
  // Pinta nota con 2 decimales.
  ui.summaryGrade.textContent = grade.toFixed(2);
}

// shuffle:
// Objetivo general: mezclar un array en sitio usando Fisher-Yates.
// Flujo específico: recorre de atrás hacia delante -> intercambia cada índice con uno aleatorio previo.
function shuffle(array) {
  // i recorre desde el final hasta el segundo elemento.
  for (let i = array.length - 1; i > 0; i -= 1) {
    // Selecciona índice aleatorio entre 0 e i.
    const j = Math.floor(Math.random() * (i + 1));
    // Intercambia posiciones i y j.
    [array[i], array[j]] = [array[j], array[i]];
  }

  // Devuelve referencia del array ya mezclado.
  return array;
}
