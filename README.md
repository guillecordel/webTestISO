# Study Sprint - SPA de Test de Estudio (Multi-asignatura)

## Pruebame:
https://web-test-iso.vercel.app/
## 1. Descripcion del proyecto

Study Sprint es una aplicacion web tipo SPA (Single Page Application) orientada a practicar preguntas tipo test para multiples asignaturas.
La aplicacion permite:

- Elegir una asignatura (ISO, SSTT, etc.).
- Elegir un examen especifico desde varios archivos JSON dentro de la asignatura seleccionada.
- Generar un examen aleatorio mezclando todas las preguntas disponibles y seleccionando hasta 50.
- Responder pregunta a pregunta con feedback inmediato.
- Mostrar resultados finales (aciertos, fallos y nota).
- Guardar y reanudar progreso mediante localStorage.
- Mostrar comentario explicativo por pregunta cuando el JSON incluye el campo comentarios o comentario.
- Modo Recuperación (Repaso de errores): Al finalizar, permite     repetir exclusivamente las preguntas falladas o saltadas hasta acertarlas todas.
- Soporte dinámico de opciones: La interfaz detecta si la pregunta tiene 2 o 3 opciones (A, B o C) y ajusta los botones automáticamente.

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

- index.html: estructura de la SPA (pantalla inicial con selector de asignatura, quiz, resumen y modal de salida).
- style.css: estilos visuales, componentes, estados de respuesta y animaciones.
- script.js: logica de negocio (carga de datos, evaluacion, persistencia, renderizado, seleccion de asignatura).
- data/*.json: bancos de preguntas independientes organizados por asignatura.

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
  "id": 17,
  "enunciado": "¿Cómo obtiene una aplicación web los datos... \nPOST /cgi-bin/encuesta.pl...",
  "opcionA": "Mediante la entrada estándar.",
  "opcionB": "Mediante la variable de entorno QUERY_STRING.",
  "opcionC": "A través de una base de datos compartida.",
  "correcta": "A",
  "comentarios": "CGI utiliza variables de entorno..."
}
-Nota: El sistema ahora soporta el carácter \n en los enunciados para representar bloques de código o trazas HTTP con formato.
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

### 5.11 Gestión en la Cola de Fallos y Saltos

Funciones clave: skipQuestion, answerQuestion, startRecoveryMode.

Algoritmo:

1. Captura: Si una pregunta se falla o se pulsa el botón Saltar, el objeto de la pregunta se añade a appState.failedQueue.

2. Persistencia: La cola de fallos se guarda en localStorage junto con el resto del progreso.

3. Activación: Al llegar al resumen, si failedQueue tiene elementos, se habilita el botón "Repasar Fallos".

4. Bucle de aprendizaje: En el modo recuperación, las preguntas acertadas se eliminan de la cola, mientras que las falladas permanecen para la siguiente ronda, fomentando la memorización activa.

---

### 5.12 Renderizado Dinámico de Interfaz (A/B/C)

Función clave: renderQuizScreen.

Lógica:

1. Al cargar una pregunta, la app comprueba la existencia de question.opcionC.

2. Si existe, el botón se hace visible (classList.remove("hidden")) y se le asigna el texto.

3. Si no existe (como en muchos tests de ISO), el botón se oculta automáticamente para mantener la estética limpia.

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

## 8. Escalabilidad: anadir nuevas asignaturas y examenes

### Para agregar una nueva asignatura:

1. Crear archivos JSON en data/ con el formato de pregunta para cada tema/examen de la asignatura.
2. Anadir entrada en el array SUBJECTS dentro de script.js con id y nombre de la asignatura.
3. Anadir propiedad en EXAM_FILES (que ahora es un objeto) con clave = id de la asignatura y valor = array de examenes.
4. Guardar y recargar.

Ejemplo: Para agregar la asignatura "Bases de Datos" con dos temas:

```javascript
// En SUBJECTS
{ id: "bd", nombre: "Bases de Datos" }

// En EXAM_FILES
bd: [
  { id: "tema1", nombre: "Examen tema-1", archivo: "data/bd-tema-1.json" },
  { id: "tema2", nombre: "Examen tema-2", archivo: "data/bd-tema-2.json" },
]
```

Asignaturas actuales:

- **ISO**: Sistemas Operativos (14 examenes)
- **SSTT**: Servicios y Sistemas de Telecomunicaciones (2 temas de ejemplo)

---

## 9. Cambios recientes (Versión Multi-asignatura)

### Nuevas funcionalidades:

1. **Selector de asignatura**: Se agregó un dropdown en la pantalla inicial que permite elegir entre ISO, SSTT y futuras asignaturas.

2. **Estructura de datos reorganizada**:
   - EXAM_FILES cambio de array a objeto indexado por ID de asignatura.
   - Se agregó array SUBJECTS con la lista de asignaturas disponibles.
   - Se agregó constante DEFAULT_SUBJECT para inicializar la app.

3. **Nuevas funciones**:
   - `renderSubjectOptions()`: Pinta el selector de asignaturas.
   - `setSubject(subjectId)`: Maneja el cambio de asignatura y actualiza exámenes disponibles.

4. **Logica actualizada**:
   - `renderExamOptions()` ahora recibe la asignatura como parámetro y filtra exámenes según ella.
   - `init()` ahora inicializa el selector de asignatura primero.
   - `restoreState()` valida que la asignatura seleccionada sea válida.
   - `loadSpecificExamQuestions()` usa la asignatura seleccionada del estado.

5. **Persistencia mejorada**:
   - El estado ahora persiste la asignatura seleccionada en localStorage.
   - Al recuperar estado, se valida que la asignatura siga siendo válida.

6. **Sistema de Repaso de Errores: - Implementación de un "buffer" temporal para preguntas erróneas.**
   -Nuevo botón Saltar para posponer preguntas sin responderlas.

   -Lógica de "Examen de recuperación" infinito hasta que el buffer esté vacío.

7. **Mejoras de Visualización y UX:**
   - Soporte para 3 opciones de respuesta.

   - Soporte para multilínea (\n) en enunciados, ideal para protocolos de red y código.

   - Ajuste de diseño: Los botones "Saltar" y "Siguiente" se agrupan a la derecha para mejorar la ergonomía, manteniendo "Salir" a la izquierda.

   - Auto-scroll y rotura de palabras: El CSS ahora gestiona cadenas largas (URLs, rutas de archivos) mediante overflow-wrap: break-word para evitar que el texto se salga de los paneles.
### Archivos SSTT de ejemplo:

- `data/sstt-tema-1.json`: 5 preguntas sobre conceptos básicos de telecomunicaciones.
- `data/sstt-tema-2.json`: 5 preguntas sobre modelos OSI, IPv6 y protocolos de red.

## 10. Estado actual del proyecto

Incluye:

- SPA responsive completa con soporte multi-asignatura.
- Selector de asignatura en la pantalla inicial.
- Banco de examenes organizados por asignatura con archivos JSON.
- Evaluacion inmediata por pregunta.
- Comentarios opcionales por pregunta con animacion.
- Persistencia local de asignatura y examen seleccionado, con reanudacion.
- Modal de salida con decision de guardado.
- Base de datos expandida: ~100 preguntas integradas cubriendo HTTP, DNS, Correo (SMTP/IMAP), DHCP, Criptografía, Certificados X.509 y IPsec.

- Robustez visual: Compatibilidad total con enunciados complejos de Servicios Telemáticos.

Este diseno permite seguir ampliando contenido simplemente agregando nuevas asignaturas en SUBJECTS, registrando los examenes en EXAM_FILES, y creando los archivos JSON correspondientes, sin necesidad de modificar la logica principal de la aplicacion.
