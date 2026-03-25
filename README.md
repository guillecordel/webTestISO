# Study Sprint ISO - SPA de Test de Estudio

## Pruebame:
https://web-test-iso.vercel.app/
## 1. Descripcion del proyecto

Study Sprint ISO es una aplicacion web tipo SPA (Single Page Application) orientada a practicar preguntas tipo test.
La aplicacion permite:

- Elegir un examen especifico desde varios archivos JSON.
- Generar un examen aleatorio mezclando todas las preguntas disponibles y seleccionando hasta 50.
- Responder pregunta a pregunta con feedback inmediato.
- Mostrar resultados finales (aciertos, fallos y nota).
- Guardar y reanudar progreso mediante localStorage.
- Mostrar comentario explicativo por pregunta cuando el JSON incluye el campo comentarios o comentario.

La app funciona completamente en frontend (cliente), sin backend ni base de datos.

---

## 2. Como hemos realizado el proyecto

### 2.1 Enfoque de construccion

El proyecto se construyo de forma incremental, priorizando:

1. Estructura de interfaz y navegacion por pantallas.
2. Motor de examen y evaluacion.
3. Persistencia del estado para evitar perdida al recargar.
4. Escalabilidad por bancos JSON independientes.
5. Mejora UX con salida de examen, reanudacion y animaciones suaves.

### 2.2 Estructura final

- index.html: estructura de la SPA (pantalla inicial, quiz, resumen y modal de salida).
- style.css: estilos visuales, componentes, estados de respuesta y animaciones.
- script.js: logica de negocio (carga de datos, evaluacion, persistencia, renderizado).
- data/*.json: bancos de preguntas independientes.

---

## 3. Tecnologias implementadas

### 3.1 HTML5

- Estructura semantica por secciones y dialog nativo para el modal de salida.
- Identificadores de elementos para renderizado dinamico desde JavaScript.

### 3.2 CSS3

- Variables CSS para paleta y consistencia visual.
- Animaciones con keyframes.
- Diseno responsive con media queries.

### 3.3 Tailwind CSS (CDN)

- Maquetacion rapida con utilidades (spacing, grid, tipografia, etc.).
- Combinado con CSS propio para componentes custom.

### 3.4 JavaScript Vanilla

- Manipulacion del DOM sin frameworks.
- Programacion asincrona con async/await para carga de JSON.
- Gestion de estado en memoria + localStorage.

### 3.5 LocalStorage

- Persistencia completa del estado de aplicacion.
- Recuperacion de examen en curso tras recarga accidental.
- Guardado opcional al salir del examen.

---

## 4. Formato de datos

Cada pregunta del JSON sigue este esquema base:

- enunciado: texto de la pregunta.
- opcionA: texto de la opcion A.
- opcionB: texto de la opcion B.
- correcta: puede venir como A/B o como texto equivalente de la opcion correcta.
- comentarios (opcional): explicacion adicional a mostrar tras responder.
  - Se acepta tambien comentario por compatibilidad.

Ejemplo:

{
  "enunciado": "La ejecucion de una instruccion privilegiada en modo usuario genera:",
  "opcionA": "Una interrupcion.",
  "opcionB": "Una excepcion o trap.",
  "correcta": "b",
  "comentarios": "En modo usuario, una instruccion privilegiada dispara trap al kernel."
}

---

## 5. Algoritmos y logica necesaria para su funcionamiento

### 5.1 Seleccion de examen

La constante EXAM_FILES define el catalogo de bancos disponibles.

Algoritmo:

1. Cargar EXAM_FILES.
2. Pintar opciones en el selector del menu.
3. Si el modo es especifico, cargar solo ese archivo.
4. Si el modo es aleatorio, cargar todos los archivos en paralelo.

### 5.2 Carga de preguntas

Funciones clave: loadSpecificExamQuestions, loadRandomExamQuestions, fetchJson.

Algoritmo:

1. Ejecutar fetch al archivo JSON.
2. Validar respuesta HTTP correcta.
3. Parsear JSON y comprobar que sea array.
4. Mezclar con Fisher-Yates.
5. Si modo aleatorio, aplicar slice hasta RANDOM_LIMIT (50).

### 5.3 Generación del examen aleatorio

Funciones clave: loadRandomExamQuestions, getRandomQuestionsFromUnifiedFile, fetchUnifiedJson.

Constantes:

- RANDOM_BANK_FILE = "data/banco_unificado.json"
- RANDOM_LIMIT = 50

Algoritmo:

1. Cargar archivo consolidado banco_unificado.json (contiene todas las preguntas de los 14 bancos originales).
2. Validar respuesta HTTP correcta.
3. Extraer el array global unifiedData.preguntas (361 preguntas totales).
4. Crear copia del array para evitar mutaciones.
5. Aplicar algoritmo Fisher-Yates para mezcla aleatoria completa.
6. Seleccionar exactamente las primeras 50 preguntas del array mezclado mediante slice(0, 50).
7. Devolver ese subset de 50 preguntas como examen aleatorio.

Ventajas de este enfoque:

- Una única carga HTTP en lugar de 14 cargas paralelas.
- Consolidación garantiza que todas las preguntas disponibles participan en la aleatorización.
- Fisher-Yates proporciona una verdadera distribución aleatoria uniforme.
- El límite de 50 preguntas evita exámenes demasiado largos.

### 5.4 Mezcla aleatoria (Fisher-Yates)

Funcion: shuffle.

Algoritmo:

1. Recorrer array desde el final al principio.
2. Elegir indice aleatorio j entre 0 e i.
3. Intercambiar posiciones i y j.
4. Continuar hasta i = 1.

Complejidad aproximada:

- Tiempo: O(n)
- Memoria: O(1) adicional (mezcla en sitio)

### 5.5 Flujo de respuesta por pregunta

Funciones clave: answerQuestion, isAnswerCorrect, getCorrectOption, paintAnswerState.

Algoritmo general al responder:

1. Verificar que la app esta en modo quiz.
2. Obtener pregunta actual por currentIndex.
3. Comprobar que no esta ya respondida.
4. Evaluar respuesta:
   - Si correcta es A/B -> comparacion directa.
   - Si correcta viene como texto -> comparar texto de opcion elegida con correcta.
5. Guardar respuesta en answers[index].
6. Actualizar aciertos o fallos.
7. Persistir estado en localStorage.
8. Repintar interfaz con feedback visual.

### 5.6 Como se decide si una respuesta es correcta o no

La app admite dos formatos de correcta:

1. Formato letra (A o B)
- Se normaliza a mayusculas.
- Se compara con la opcion seleccionada.

2. Formato texto
- Se toma el texto de opcion A u opcion B segun lo seleccionado.
- Se normaliza (trim y lowercase).
- Se compara contra correcta normalizada.

Resultado:

- true: respuesta correcta.
- false: respuesta incorrecta.

Feedback visual:

- Se marca la opcion correcta con estilo de acierto.
- Si el usuario falla, se marca tambien su opcion con estilo de error.
- Se muestra mensaje textual: Respuesta correcta o Respuesta incorrecta.

### 5.7 Mostrar comentario por pregunta

Funciones clave: getQuestionComment y paintAnswerState.

Algoritmo:

1. Tras responder, leer question.comentarios.
2. Si no existe, probar question.comentario.
3. Normalizar el texto.
4. Si hay contenido:
   - Mostrar bloque Comentario debajo del feedback.
   - Lanzar animacion suave de aparicion.
5. Si no hay contenido:
   - Ocultar bloque.

Esto garantiza que el comentario mostrado siempre corresponde exactamente a la pregunta respondida en ese momento.

### 5.8 Navegacion de examen y finalizacion

Funcion: goToNextQuestion.

Algoritmo:

1. Si currentIndex es la ultima posicion:
   - Cambiar stage a summary.
   - Calcular y mostrar resultados.
2. Si no es la ultima:
   - Incrementar currentIndex.
   - Renderizar siguiente pregunta.

### 5.9 Calculo de nota

Funcion: calculateGrade.

Formula implementada:

Nota = (Aciertos - Fallos) / TotalPreguntas * 10

Regla adicional:

- Si el resultado es negativo, se muestra 0.

### 5.10 Persistencia y recuperacion

Funciones clave: persistState, restoreState, saveAndExitExam, resumeSavedExam.

Algoritmo:

1. Cada cambio relevante guarda appState en localStorage.
2. Al cargar la SPA:
   - Se intenta reconstruir estado previo.
   - Se valida que el examen guardado sea consistente.
3. Salida de examen con modal:
   - Guardar y salir: snapshot reanudable.
   - Salir sin guardar: descarta snapshot.
4. En menu inicial:
   - Si hay snapshot valido, aparece boton Reanudar examen guardado.

---

## 6. Como funciona la aplicacion (de extremo a extremo)

1. El usuario entra al menu principal.
2. Selecciona modo especifico o aleatorio.
3. Inicia examen.
4. La app carga y mezcla preguntas.
5. Se muestra una pregunta por pantalla.
6. Al responder:
   - Se bloquean opciones.
   - Se pinta correcta/incorrecta.
   - Se muestra feedback.
   - Si existe, se muestra comentario con animacion suave.
7. El usuario avanza con Siguiente.
8. Al terminar, se muestra resumen final con nota.
9. Opcionalmente puede salir durante el examen guardando o descartando progreso.

---

## 7. Ejecucion en local para desarrollo

### Opcion recomendada con Python

En la carpeta del proyecto:

c:/Users/guill/Desktop/webTestISO/.venv/Scripts/python.exe -m http.server 5500

Abrir en navegador:

http://127.0.0.1:5500/index.html

Para detener:

Ctrl + C en la terminal.

---

## 8. Escalabilidad: anadir nuevos examenes

Para agregar un nuevo banco:

1. Crear archivo JSON en data/ con el formato de pregunta.
2. Anadir entrada en EXAM_FILES dentro de script.js:
   - id unico
   - nombre visible
   - ruta del archivo
3. Guardar y recargar.

El nuevo banco aparecera en modo especifico y tambien participara en el modo aleatorio automaticamente.

---

## 9. Estado actual del proyecto

Incluye:

- SPA responsive completa.
- Banco de examenes por archivos JSON.
- Evaluacion inmediata por pregunta.
- Comentarios opcionales por pregunta con animacion.
- Persistencia local y reanudacion.
- Modal de salida con decision de guardado.

Este diseno permite seguir ampliando contenido sin tocar la logica principal, solo agregando nuevos JSON y su registro en EXAM_FILES.
