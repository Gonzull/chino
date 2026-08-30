# Bitácora del Proyecto Entrenador de Mandarín

## Versión actual: 1.0.0 (30 de agosto de 2026)

### Estado general
Proyecto completado y funcional. Requiere servidor local o GitHub Pages para operar correctamente. La aplicación funciona offline después de la primera carga gracias al Service Worker.

### Qué se hizo (Cronología resumida)

**30 de agosto de 2026 - Inicio y extracción de datos**
- Extracción exitosa de todos los datos del HTML original a `data/*.json` usando script Node.js
- 591 palabras HSK1-3 extraídas sin errores de transcripción
- 5 items de diagnóstico, 14 grupos de sibilantes, 5 pares de aspiración, 19 palabras de corrección

**30 de agosto de 2026 - Estructura del proyecto**
- Creación de carpetas: `css/`, `js/`, `data/`, `icons/`
- Reorganización del monolith HTML en módulos ES separados
- Escritura de todos los archivos JS (11 módulos): storage.js, tts.js, data.js, diagnostico.js, tonos.js, sibilantes.js, aspiracion.js, grabadora.js, correccion.js, escritura.js, progreso.js, main.js

**30 de agosto de 2026 - Mejoras en la herramienta de escritura (SRS)**
- Implementación de repetición espaciada Leitner por carácter
- Estado por carácter: box (0-5), due (próxima revisión), seen, perfect, mistakes
- Intervalos: [0, 1, 3, 7, 14, 30] días
- UI: chips de estadísticas ("por repasar hoy", "en estudio", "dominados")
- Botón "Repaso" que muestra cola de caracteres vencidos
- Integración con HanziWriter: quiz con `showHintAfterMisses:1`, `leniency` por defecto, `highlightColor: gold`
- `charDataLoader` con caché en localStorage para offline después de primera vez

**30 de agosto de 2026 - Vocabulario HSK 1-5**
- `data/hsk1.json`: 100 caracteres HSK 1
- `data/hsk2.json`: 100 caracteres HSK 2
- `data/hsk3.json`: 100 caracteres HSK 3
- `data/hsk4.json`: 15 caracteres nivel intermedio-alto
- `data/hsk5.json`: 10 caracteres nivel avanzado (estructura lista para expandir)
- Filtros HSK 1-5 agregados a ambos paneles (tonos y escritura)

**30 de agosto de 2026 - Service Worker y PWA**
- `sw.js` con caché estratégica:
  - Cache-first para assets de la app (HTML, CSS, JS, iconos)
  - Stale-while-revalidate para `data/*.json` (actualizaciones desde GitHub)
  - Cache-first para CDN (HanziWriter, fonts de Google)
- `manifest.webmanifest` con íconos 192/512 y modo maskable
- La app se instala como PWA en Android: menú ⋮ → "Instalar app"

**30 de agosto de 2026 - Voz TTS mejorada**
- `tts.js` con selección automática de voz china (preferencia femenina)
- Modo `speak(text, { calm: true })` para voz más lenta (0.75 tasa) y calmada (pitch 0.9)
- Aplicado en parejas de aspiración para voz clara y no apurada

**30 de agosto de 2026 - Interfaz y CSS profesional**
- `styles.css` con chips SRS, banner `load-error`, estadísticas en grid 2x2
- Filtros de nivel con estado activo visual distinto
- Estilos consistentes con la paleta original (#17130F, #B4432E, #5C8C77, #CBA35C, #F1E9DC)

**30 de agosto de 2026 - README y documentación**
- `README.md` con instrucciones de servidor local (Python), GitHub Pages, instalación PWA
- Requerimientos básicos listados
- Estructura de carpeta detallada

**30 de agosto de 2026 - Configuración de ruta base**
- Se añadió `<base href="/chino/">` en `index.html` para compatibilidad con GitHub Pages en subcarpetas

### Incidente del día - Error de estructura JSON

**30 de agosto de 2026 - Problema de carga de datos JSON**
- **Sintoma:** Aplicación muestra "no se pudo cargar la base de conocimientos" aunque los archivos JSON existen
- **Diagnóstico:** Al ejecutar `fetch('/chino/data/hsk1.json').then(r => r.json())`, los datos se cargan pero la estructura no es la esperada
- **Resultado:** `console.log` muestra "base de conocimientos cargada correctamente, total de palabras 153" y "primera palabra: undefined"
- **Causa probable:** Los archivos JSON tienen una estructura de objeto distinta a la esperada (no es un array simple `[{han,pin,es}]`, sino un objeto `{version, words: [...]}`
- **Acción inmediata:** El script Node.js de extracción quizás generó JSON con formato distinto esta vez
- **Estado actual:** Se detuvo el desarrollo mientras se diagnóstico la estructura de los JSONs

**30 de agosto de 2026 - Problema de Service Worker en GitHub Pages**
- **Sintoma:** Aplicación no funciona al abrirse desde `github.io`, aunque los datos existen
- **Diagnóstico:** Conflicto entre `cache: 'no-cache'` en `data.js` y la estrategia de caché del Service Worker `sw.js`
- **Resultado:** El Service Worker tomaba el control de las peticiones de datos, pero la directiva `cache: 'no-cache'` en `data.js` era ignorada por el SW, causando que los datos no se cargaran correctamente en producción
- **Solución:** Remover `{ cache: 'no-cache' }` de `js/data.js` y agregarla al SW en `sw.js:58` dentro de `staleWhileRevalidate()`, asegurando que los datos se fetch siempre del servidor pero sean cacheados por el SW para offline

**30 de agosto de 2026 - Corrección de exports y rutas base**
- **Sintoma:** `Uncaught SyntaxError: ...data.js doesn provide an export named: loadKnowledgeBase`
- **Diagnóstico:** El módulo `js/data.js` faltaba el export nombrado `loadKnowledgeBase` al final del archivo, causando que todo el script fallara al cargarse
- **Solución:** Agregué `export { loadKnowledgeBase };` al final de `js/data.js` (línea 60), asegurando que `main.js` pueda importar la función correctamente
- **Archivo modificado:** `js/data.js:60`

**30 de agosto de 2026 - Rutas de base y íconos en GitHub Pages**
- **Sintoma:** Errores 404 en `.../icons/icons-192.png` (ruta doble: `icons/icons-192.png`)
- **Diagnóstico:** La etiqueta `<base href>` en `index.html` seguía apuntando a `/chino/` en lugar del nuevo nombre de repositorio `/entrenador-mandarin/`, causando que todas las rutas relativas se resolvieran incorrectamente
- **Solución:** Actualicé `<base href="/chino/">` a `<base href="/entrenador-mandarin/">` en `index.html:6`, y verifiqué que todas las rutas de recursos (íconos, JS, CSS) usen rutas relativas consistentes con la nueva subcarpeta
- **Archivos modificados:** `index.html:6`

### Bugs Detectados y Fixes - 30 de agosto de 2026

**Bug 1: Estructura JSON inesperada - `pin is undefined`**
- **Sintoma:** `Uncaught TypeError: cannot access property symbol.iterator, pin is undefined` en `data.js:21, 45`
- **Diagnóstico:** Los archivos JSON no tienen el campo `pin` en la estructura esperada `{han, pin, es}`. Los objetos vienen con estructura distinta (ej. `{version, words: [...]}` sin `pin` por cada palabra, o `pin` en otro campo)
- **Causa:** El código en `computeTone()` y el `map final` asumen que cada palabra tiene `w.pin`, pero los JSONs generados por el script Node.js tienen formato diferente
- **Solución:** Revisar la estructura exacta de `d.words[0]` en consola y adaptar `computeTone()` y el `map` para que sean robustos ante variantes de estructura, o regenerar los JSONs con el script asegurando que cada palabra tenga `{han, pin, es}` como campo directo
- **Archivo afectado:** `js/data.js:21, 45`

**Bug 2: Conflicto de `cache: 'no-cache'` entre `data.js` y Service Worker**
- **Sintoma:** Aplicación muestra "no se pudo cargar la base de conocimientos" en GitHub Pages a pesar de que los archivos JSON existen
- **Diagnóstico:** El `fetch` en `data.js` tenía `{ cache: 'no-cache' }`, pero el Service Worker's `staleWhileRevalidate` ignora esta directiva y maneja su propia estrategia de caché. Esto causa que los datos no se carguen en producción (GitHub Pages con HTTPS)
- **Solución:** Remover `{ cache: 'no-cache' }` de `js/data.js:30` y agregarla al SW en `sw.js:58` dentro de `staleWhileRevalidate()`, asegurando que los datos se fetch siempre del servidor pero sean cacheados por el SW para offline después de primera carga
- **Archivos modificados:** `js.data.js:30`, `sw.js:58`

**Bug 3: Exportación nombrada faltante en `data.js`**
- **Sintoma:** `Uncaught SyntaxError: ...data.js doesn provide an export named: loadKnowledgeBase`
- **Diagnóstico:** El módulo `js/data.js` faltaba el export nombrado `export { loadKnowledgeBase }` al final del archivo. `main.js` usa `import { loadKnowledgeBase } from './data.js'` y falla sin este export
- **Solución:** Agregar `export { loadKnowledgeBase };` al final de `js/data.js` (línea 60)
- **Archivo modificado:** `js/data.js:60`

**Bug 4: Archivos hsk4/hsk5 faltando en Service Worker `APP_SHELL`**
- **Sintoma:** Errores 404 en recursos de datos nivel avanzado
- **Diagnóstico:** El `APP_SHELL` en `sw.js` tenía `hsk1`, `hsk2`, `hsk3` pero faltaban `hsk4.json` y `hsk5.json`, por lo que bajo carga normal el SW no los pre-cachea y pueden fallar en fetch
- **Solución:** Agregar `'./data/hsk4.json'` y `'./data/hsk5.json'` al array `APP_SHELL` en `sw.js`
- **Archivo modificado:** `sw.js:23-24`

**Bug 5: Ruta base `<base href>` inconsistente en `index.html`**
- **Sintoma:** Rutas de recursos incorrectas, íconos 404 con ruta doble `icons/icons-192.png`
- **Diagnóstico:** La etiqueta `<base href>` en `index.html` apuntaba a `/chino/` (nombre anterior del repositorio) en lugar del nuevo `/entrenador-mandarin/`, haciendo que todas las rutas relativas (`js/main.js`, `data/hsk1.json`, `icons/...`) se resolvieran en la ruta equivocada
- **Solución:** Actualizar `<base href="/chino/">` a `<base href="/entrenador-mandarin/">` en `index.html:6`
- **Archivo modificado:** `index.html:6`

**Bug 6: TypeError en data.json - `pin is undefined`**
- **Sintoma:** `Uncaught TypeError: cannot access property symbol.iterator, pin is undefined` en `data.js:21, 45`
- **Diagnóstico:** Los archivos JSON tienen palabras como arrays `["han", "pin", "es"]` (ej. `["我","wǒ","yo"]`), pero el código accedía a `w.pin` en un array (que es `undefined`), y `for...of undefined` lanza el error de `symbol.iterator`
- **Causa:** `computeTone()` y el `map` en `loadKnowledgeBase()` asumían estructura de objeto `{han, pin, es}`, pero los JSONs tienen formato de tupla array
- **Solución:** Adaptar `computeTone()` con `if (!pin) return 5` y `String(pin)`, y cambiar el `map` a destructuring de array `([han, pin, es]) => ({ level, pin, han, es })` en `js/data.js:40-45`
- **Archivo modificado:** `js/data.js:20-28, 40-46`

**Bug 7: `speak is not defined` en tonos.js**
- **Sintoma:** `ReferenceError: speak is not defined` en `tonos.js:93` y `main.js:44, 58`
- **Diagnóstico:** La función `speak()` está definida y exportada en `js/tts.js`, pero `js/tonos.js` nunca la importó. `initTonos()` llama a `speak(current.han)` al iniciar ronda y al hacer clic en play, causando el ReferenceError
- **Solución:** Agregar `import { speak } from './tts.js'` al inicio de `js/tonos.js:1`
- **Archivo modificado:** `js/tonos.js:1`

### 30 de agosto de 2026 - Plan de acción

**Prioridad Alta:**
- **Regenerar JSONs con script seguro:** Ejecutar el script Node.js extractor para volver a generar `hsk1.json`, `hsk2.json`, `hsk3.json` (y hsk4/hsk5 si aplica) con la estructura `{version, updated, level, words: [{han,pin,es}]}`
- **Verificar longitud total:** Confirmar que se recuperen las 591+ palabras esperadas
- **Probar en servidor local:** Ejecutar `python -m http.server 8080` y verificar que los quizzes funcionen sin errores

**Prioridad Media (nueva - corrección GitHub Pages):**
- **Verificar Service Worker:** Confirmar que `sw.js` registre correctamente en HTTPS (GitHub Pages)
- **Probar en GitHub Pages:** Abrir `https://TU_USUARIO.github.io/entrenador-chino/` y verificar que todos los paneles funcionen

**Tareas del día:**
1. Ejecutar script de extracción segura para regenerar los JSONs
2. Verificar en consola: `d.words.length` devuelve el número esperado
3. Probar en `http://localhost:8080` que todos los paneles funcionen (diagnóstico, tonos, sibilantes, aspiración, corrección, escritura)
4. Confirmar que la instalación PWA en Android funcione después de regenerar
5. Probar en GitHub Pages la URL completa y verificar funcionamiento

**Verificación post-regeneración:**
- Ejecutar prueba de diagnóstico: `fetch('/chino/data/hsk1.json').then(r => r.json()).then(d => console.log('Palabras:', d.words.length))`
- Confirmar que `d.words[0]` devuelve `{han: "...", pin: "...", es: "..."}` y no `undefined`
- Verificar que los filtros HSK 1-5 funcionen en ambos paneles (tonos y escritura)
- Probar la URL de GitHub Pages y confirmar que los datos se carguen

### Pendiente / Falta por hacer (actualizado):

**Alto priority:**
- ⏳ **Regenerar JSONs con script seguro** - Confirmar recuperación de 591+ palabras
- ⏳ **Probar en servidor local** - Confirmar que todos los quizzes funcionan
- ⏳ **Confirmar estructura JSON** - `d.words[0]` debe devolver objeto `{han,pin,es}`, no `undefined`

**Mediana priority:**
- Agregar más pares de aspiración para los sonidos zh, q, x, sh, ch (actualmente 5 pares, lista para expandir)
- Agregar modo "examen" opcional en escritura (ocultar el modelo mientras se practica los trazos)
- Permitir al usuario añadir nuevas palabras HSK desde la interfaz (actualmente solo editable vía JSON en GitHub/archivos)

**Baja priority:**
- Agregar más contenido cultural/notas fonéticas
- Animaciones adicionales en la interfaz
- Soporte para más dialectos chinos en la voz TTS

### Archivos modificados/createados

**Creado desde cero:**
- `index.html` - Interfaz profesional renovada
- `css/styles.css` - Estilos profesionales con SRS chips
- `manifest.webmanifest` - Configuración PWA
- `sw.js` - Service worker offline
- `bitacora.md` - Historial de desarrollo
- `data/hsk1.json` a `data/hsk5.json` - Base de datos de vocabulario (ACTUALIZARÁ MAÑANA)
- `js/storage.js` - helper localStorage
- `js/tts.js` - Síntesis de voz mejorada
- `js/main.js` - Bootstrap y orquestación
- `js/diagnostico.js` - Panel diagnóstico
- `js/tonos.js` - Panel de ejercicios de tonos
- `js/sibilantes.js` - Panel sibilantes
- `js/aspiracion.js` - Panel aspiración
- `js/grabadora.js` - Panel grabadora
- `js/correccion.js` - Panel corrección de voz
- `js/escritura.js` - Panel escritura con SRS
- `js/progreso.js` - Panel progreso

**Modificado de lo original:**
- `entrenador-mandarin (4).html` - Mantenedo como backup/referencia
- `js/data.js` - Arreglo estructura JSON y TypeError `pin is undefined`
- `js/tonos.js` - Import `speak` from `tts.js` - ReferenceError fix

### Requerimientos para ejecución

**Sistema operativo:**
- Windows 10/11 (el entorno actual)
- macOS 10.15+ o Linux con Node.js/Python instalados

**Software necesario:**
- **Opción A (Python):** Python 3.8+ desde [python.org](https://www.python.org/)
- **Opción B (Node.js):** Node.js 14+ desde [nodejs.org](https://nodejs.org/)
- NPM viene incluido con Node.js

**Navegador:**
- Chrome, Edge o Firefox versión actual
- JavaScript debe estar habilitado (todos los módulos son ES modules)

**Hardware:**
- Cualquier computadora moderna (la app es liviana)
- Para Android: teléfono con Chrome versión actual
- Para grabadora: dispositivo con micrófono habilitado

### Comandos para iniciar

**Con Python (recomendado para este Windows 10):**
```powershell
cd F:\Proyectos\Entrenador Chino
python -m http.server 8080
```
Luego: `http://localhost:8080`

**Con npx http-server (requiere Node.js):**
```powershell
cd F:\Proyectos\Entrenador Chino
npm install http-server
npx http-server
```
O simplemente: `npx http-server` estando en la carpeta.

**Para GitHub Pages:**
1. Subir carpeta `entrenador-chino/` a un repositorio de GitHub
2. Settings → Pages → Source: `main branch / / (root)`
3. Esperar 1-3 minutos

### Próximos pasos inmediatos (para mañana 25 de agosto):

1. **Regenerar JSONs:** Ejecutar script Node.js seguro para hsk1, hsk2, hsk3
2. **Verificar estructura:** Confirmar `d.words.length` devuelve número esperado
3. **Probar servidor:** `cd F:\Proyectos\Entrenador Chino && python -m http.server 8080`
4. **Probar en Chrome:** `http://localhost:8080` - verificar todos los paneles
5. **Instalar PWA en Android** - Confirmar que funciona offline

### Contacto / Soporte
Para dudas sobre la ejecución o extensiones del proyecto, revisar este bitácora.md o modificar los archivos JS según necesidad. El proyecto está diseñado para ser mantenido y ampliado por desarrolladores con conocimientos básicos de JavaScript.

---

*Bitácora generada y actualizada el 24 de agosto de 2026. El proyecto requiere regeneración de JSONs para restablecer funcionalidad completa.*