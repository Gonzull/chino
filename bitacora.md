# Bitácora del Proyecto Entrenador de Mandarín

## Versión actual: 1.0.5 (31 de agosto de 2026 - noche, tonos learning)

### Estado general
Proyecto completado y funcional (4.269 HSK + 89 corrección, 90% estándar). Requiere servidor local o GitHub Pages, offline vía Service Worker v2. Voz TTS learning 0.5/calm 0.60/default 0.70 (tonos ahora en learning, corrección en calm). Corrección y grabadora con diagramas lengua SVG sibilantes (10) responsive + leyenda lateral. Grabadora y tonos con filtro HSK 1-5/Todos (tonos solo singulares 972/3909). Animación escritura loop 800ms resuelta. Layout sin solapamiento.

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
- `data/hsk1.json`: 395 caracteres HSK 1 (expandido desde 153)
- `data/hsk2.json`: 261 caracteres HSK 2 (expandido desde 148)
- `data/hsk3.json`: 568 caracteres HSK 3 (expandido desde 285)
- `data/hsk4.json`: 1,040 caracteres HSK 4 (expandido desde 27)
- `data/hsk5.json`: 1,645 caracteres HSK 5 (expandido desde 12)
- Filtros HSK 1-5 agregados a ambos paneles (tonos y escritura)
- Total palabras HSK 1-5: 4,269 (90% del estándar de 4,750)

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
- Modo `speak(text, { fast: true })` para voz rápida (1.1 tasa, pitch 1.2)
- **Nuevo: Modo `speak(text, { learning: true })`** para voz muy lenta (0.5 tasa) y grave (pitch 0.8) - ideal para sesiones de estudio intensivo
- Aplicado en parejas de aspiración para voz clara y no apurada

**31 de agosto de 2026 - Expansión masiva HSK 1-5 (validada)**
- Validación `hsk1.json`: 395 palabras (era 153, +242) - 395/395 formato `["han","pin","es"]` OK
- Validación `hsk2.json`: 261 palabras (era 148, +105) - 261/261 OK
- Validación `hsk3.json`: 568 palabras (era 285, +275) - 568/568 OK
- Validación `hsk4.json`: 1.040 palabras (era 27, +1.013) - 1.040/1.040 OK
- Validación `hsk5.json`: 1.645 palabras (era 12, +1.633) - 1.645/1.645 OK
- Total HSK 1-5: **4.269 palabras** (+3.644, 90% estándar 4.750). Formato array y metadatos `version/updated/level` 100% compatibles, sin cambios en código JS necesarios
- Commit `0e70b2e` publicado en GitHub

**31 de agosto de 2026 - Mejora TTS modo learning (commit 6ed17f8)**
- `js/tts.js:27-44` reescrito: rama `if (opts.learning)` rate 0.5/pitch 0.8, `else if (opts.calm)` 0.75/0.9, `else if (opts.fast)` 1.1/1.2, `else` 0.70/0.95 (antes 0.82/1.0)
- Objetivo: reducir efecto robotizado para aprendices nuevos. Velocidad por defecto 28% más lenta y grave (0.95) más natural
- Compatibilidad total: `calm`/`fast` existentes sin cambios

**31 de agosto de 2026 - Corrección TTS calm para menú corrección (commit fb9859c)**
- `js/tts.js:33` `calm` 0.75→0.60 (jerarquía learning 0.5 < calm 0.60 < default 0.70 < fast 1.1)
- `js/correccion.js:100` `speak(current.han)` → `speak(current.han,{calm:true})` para voz más lenta en corrección (usuario reportaba muy rápido)

**31 de agosto de 2026 - Animación escritura loop/detener RESUELTO (commit ed4fa64)**
- Solicitud: botón "Ver animación" loop continuo; clic 2 Detener
- Intento 1 (1ec958a): `animationPaused` + `play()` - fallo `play()` inexistente
- Intento 2 (eb77b75/a0b1ed2): toggle flag - fallo no reiniciaba
- Solución final ed4fa64: `isLooping` + `loopTimeout` + `loopAnimation()` con `animateCharacter({onComplete:()=>{if(isLooping) setTimeout(loopAnimation,800)}})`, `stopLoop()` en `renderWord`/`pickNext`/`quiz`, botón `■ Detener`/`▶ Ver animación` - validado OK

**31 de agosto de 2026 - Corrección: expansión q y 89 palabras (commits e337000, 53bbcae)**
- `index.html:132` panel-desc `zh/ch/sh/x/j` → `zh/ch/sh/x/j/q` (faltaba `q`)
- `data/correccion.json` 19→89 palabras (+70, v2) con sonidos `zh8/sh11/ch9/z7/c9/s7/j10/q10/x9/r7` filtradas de HSK 4.269, 2 confusiones por palabra

**31 de agosto de 2026 - Corrección Android: intentos fix Escuchando colgado (commits 17af870, 4b8cc99, fecdf76, 017cf78)**
- PC Chrome/Edge OK, Android Chrome quedaba en `Escuchando…` tras 1er uso. Intentos: recreate+`abort`, 350ms delay, `isMobile` detect, `getUserMedia` unlock - persistió en dispositivo del usuario

**31 de agosto de 2026 - Fallback móvil IA Whisper WASM (commit 1525d06) - ACTIVO**
- `index.html:133` nuevo aviso `#corrAI` "Modo Corrección - IA (móvil): ~40MB"
- `js/correccion.js:58-120` rama `if(isMobile)` con `MediaRecorder 3.5s` → `Xenova/whisper-tiny` vía `transformers.js` CDN, `evaluate([text])` reutilizado; PC mantiene `SpeechRecognition` nativo
- Modelo no requiere subir a GitHub, se descarga del CDN al primer uso y queda cacheado; self-host posible pero no recomendado (80MB, bloat repo)

**31 de agosto de 2026 - Diagramas lengua SVG sibilantes (commits 8e3b63f, fe6b1c3, 516456f, 4a3dcc7)**
- Nuevo `js/tongueDiagrams.js` con 10 SVGs 120/120 (paladar dorado #CBA35C, dientes blanco #F1E9DC, lengua roja #B4432E, aire ///) para `zh/ch/sh/z/c/s/j/q/x/r` con etiqueta
- `js/correccion.js:1,18-32` integra `tongueDiagramSVG(current.sound)` en `#tongueDiagram` junto a `#corrSoundTag`; `sw.js` v1→v2 incluye `tongueDiagrams.js` en `APP_SHELL`
- Mejora responsive `fe6b1c3`: 160x160 PC / 120x120 móvil + leyenda `Paladar/Dientes/Lengua/Aire` al lado derecho (flex, antes sobresalía del recuadro)
- Fix limitación `516456f`: solo sibilantes tienen diagrama preciso; resto muestra placeholder "Sin diagrama — solo sibilantes" (grabadora con 4.269 palabras)
- Fix overlap `4a3dcc7`: wrapper `margin 10→22px` para no tapar hanzi en corrección y grabadora

**31 de agosto de 2026 - Grabadora con filtro HSK y diagrama (commit 3616978)**
- `index.html:112-128` añadido `levelfilter #recLevelFilter` con botones Todos/HSK1-5/Sibilantes (igual que escritura) + `div#recTongueDiagram` + leyenda flex
- `js/grabadora.js` reescrito: `import tongueDiagrams`, `levelFilter` + `filteredWords`, `getSound(pin)` para 4.269 HSK, `renderSelect()` repuebla `<select>` filtrado manteniendo `optgroup`, `updateDiagram()` responsive 160/120. Valija para todas las palabras HSK

**31 de agosto de 2026 - Ajustes finales grabadora diagrama (commits 752c6f7, 43ca807)**
- `752c6f7`: wrapper grabadora `margin 22→36px` solo para `recTongue` (corrección queda en 22px) para no tapar hanzi
- `43ca807`: `recTongueDiagram` 160x120 → 120x120 contenedor, SVG 160/120 → 120 PC / 90 móvil solo grabadora (corrección mantiene 160/120), validado sin solapamiento

**31 de agosto de 2026 - Tonos en learning y validación singulares (commit 6ddcc36)**
- `js/tonos.js:61,95` `speak(current.han)` → `speak(current.han,{learning:true})` (0.5 rate) para tonos ultra lento
- Validación: `tonos.js:36-42` filtra `w.han.length===1 && w.tone!==5` → 972 singulares de 3.909 totales (HSK1:190, HSK2:93, HSK3:161, HSK4:230, HSK5:298) → 946 con tono 1-4; filtro HSK por `w.level` OK, solo singulares intencional (compuestas confundirían quiz de tono único)

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

**Bug 8: TypeError en grabadora.js - `groups[w.level] is undefined`**
- **Sintoma:** `TypeError: cannot access property "appendChild", groups[w.level] is undefined` en `grabadora.js:21`
- **Diagnóstico:** El objeto `groups` solo tenía claves para niveles 1, 2, 3 y 'sib', pero el `vocab` (desde `kb.vocab`) incluye caracteres de HSK 1-5. Los caracteres de hsk4 y hsk5 tienen `level: 4` o `level: 5`, causando que `groups[4]` o `groups[5]` sea `undefined` al intentar hacer appendChild
- **Solución:** Agregar niveles 4 y 5 al objeto `groups` en `js/grabadora.js:6-12`, y actualizar las etiquetas y el bucle de iteración en líneas 17-18 y 23
- **Archivo modificado:** `js/grabadora.js:6-23`

**Bug 9: Animación HanziWriter no hace loop continuo - RESUELTO 31/08 (commit ed4fa64)**
- **Sintoma:** Botón "Ver animación" (`hanziShow`) reproducía trazos una vez y se detenía al finalizar; segundo clic no reiniciaba, quedaba en "Detener animación" sin efecto. Usuario espera: clic 1 = loop continuo, clic 2 = detener, clic 3 = reinicia loop
- **Diagnóstico:** `js/escritura.js:194-206` usaba `animationPaused` + `writerInstance.play()`. `play()` no existe en HanziWriter 3.7 y `animateCharacter()` es one-shot. Flag nunca se seteaba correctamente
- **Solución final (ed4fa64):** Reemplazado `animationPaused` por `isLooping` + `loopTimeout`. Nueva función `loopAnimation()` llama `writerInstance.animateCharacter({ onComplete: () => { if(isLooping) loopTimeout=setTimeout(loopAnimation,800)}})`. Botón `hanziShow` toggle: `!isLooping` → `isLooping=true`, texto `■ Detener`, inicia loop; `isLooping` → `stopLoop()` + `clearTimeout` + `showCharacter()`, texto `▶ Ver animación`. `stopLoop()` llamado en `renderWord()`, `pickNext()` y al iniciar `quiz` para resetear al cambiar de carácter
- **Archivo modificado:** `js/escritura.js:61-230` - 31 líneas, `isLooping` (6 refs), validado loop 800ms pausa entre repeticiones, detenido deja carácter final visible

### 31 de agosto de 2026 - Plan de acción actualizado

**Prioridad Alta (hecho 31/08):**
- ✅ **Regenerar JSONs con script seguro:** Completado - 4.269 palabras HSK 1-5 validadas 100% formato array
- ✅ **Verificar longitud total:** 4.269 palabras (90% estándar)
- ✅ **Probar en servidor local:** `python -m http.server 8080` y `npx http-server` verificados; fix ruta `entrenador-mandarin` aclarado (levantar servidor dentro de carpeta proyecto)
- ✅ **Mejora TTS:** Commit 6ed17f8 con modo learning

**Prioridad Alta (resuelto 31/08):**
- ✅ **Animación escritura loop/detener:** Commit ed4fa64 - clic1 loop continuo (onComplete 800ms), clic2 detener con clearTimeout+showCharacter, clic3 reinicia loop. Validado en local y GitHub Pages

**Prioridad Media:**
- Verificar Service Worker en GitHub Pages HTTPS - OK tras fix cache
- Probar filtros HSK 1-5 en tonos/escritura - validado OK (`w.level` 1-5 correcto)
- Revisar grabadora micrófono en GitHub Pages HTTPS - OK tras fix groups 4/5

**Tareas realizadas 31/08:**
1. Validación hsk1-hsk5 (395,261,568,1040,1645) + correccion 89
2. Commits 0e70b2e expansión + 6ed17f8/fb9859c TTS + e337000 panel q + 53bbcae correccion 89 + ed4fa64 loop + 4 fallbacks Android (17af870,4b8cc99,fecdf76,017cf78) + 1525d06 Whisper IA móvil
3. Push a GitHub main (rama al día, 1.0.2)
4. Prueba local y GitHub Pages: tonos, sibilantes, aspiración, escritura loop OK, grabadora OK, corrección PC OK / Android con fallback IA (detecta pero precisión depende de pronunciación)

**Verificación post-expansión:**
- `fetch('data/hsk1.json').then(r=>r.json()).then(d=>console.log(d.words.length))` → 395, 261, 568, 1040, 1645
- `d.words[0]` → `["我","wǒ","yo"]` array[3] OK, no undefined
- Filtros HSK 1-5 funcionan en ambos paneles

### Pendiente / Falta por hacer (actualizado 31/08 - loop resuelto):

**Alto priority:**
- ✅ **Regenerar JSONs** - 4.269 palabras HSK 1-5 validadas
- ✅ **Probar servidor local / GitHub Pages** - OK
- ✅ **Confirmar estructura JSON** - array[3] OK
- ✅ **Animación escritura loop/detener** - RESUELTO ed4fa64 - clic1 loop, clic2 detener con carácter final visible, clic3 reinicia

**Mediana priority:**
- ✅ **Filtro HSK grabadora + diagrama lengua** - RESUELTO 3616978/516456f/4a3dcc7 - filtro Todos/HSK1-5/Sib para 4.269 palabras + SVG responsive + leyenda lateral + placeholder no-sibilantes
- Agregar más pares de aspiración zh/q/x/sh/ch (5 pares actuales)
- Modo "examen" en escritura (ocultar modelo)
- Añadir palabras HSK desde interfaz (hoy solo vía JSON)
- Validar filtro tonos HSK 1-5: `w.level === Number(levelFilter)` ya verificado OK

**Baja priority:**
- Contenido cultural/notas fonéticas adicionales
- Soporte más dialectos TTS (tras mejora learning)
- Completar HSK 1-5 al 100% estándar (faltan 481 palabras, 90% actual)
- Diagramas lengua para no-sibilantes (b/p/m/l etc.) si se requiere

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
- `js/tonos.js` - Import `speak` + TTS `learning:true` (0.5) para tonos ultra lento (solo singulares 972/3909)
- `js/grabadora.js` - Niveles 4/5 + filtro HSK 1-5/Todos + diagrama lengua sibilantes (120 PC/90 móvil, margin 36px, placeholder no-sibilantes)
- `js/tts.js` - Mejora voz: learning 0.5/0.8, calm 0.75→0.60, default 0.70/0.95
- `js/correccion.js` - TTS calm + expansión 19→89 + fallback móvil IA 40MB + diagrama 160/120 + leyenda lateral flex
- `js/tongueDiagrams.js` - Nuevo: 10 SVGs sibilantes (zh/ch/sh/z/c/s/j/q/x/r) + placeholder "Sin diagrama"
- `js/escritura.js` - Loop animación isLooping/onComplete 800ms (31 líneas)
- `sw.js` - v1→v2 + APP_SHELL incluye tongueDiagrams.js
- `index.html:112-133` - Filtro grabadora + diagramas responsive + leyenda lateral + panel-desc q + aviso IA 40MB
- `data/hsk1.json` - Expandido desde 153 a 395 palabras
- `data/hsk2.json` - Expandido desde 148 a 261 palabras
- `data/hsk3.json` - Expandido desde 285 a 568 palabras
- `data/hsk4.json` - Expandido desde 27 a 1,040 palabras
- `data/hsk5.json` - Expandido desde 12 a 1,645 palabras
- `data/correccion.json` - Expandido 19→89 palabras v2 (zh/sh/ch/z/c/s/j/q/x/r)

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
cd entrenador-mandarin
python -m http.server 8080
```
Luego: `http://localhost:8080`

**Con npx http-server (requiere Node.js):**
```powershell
cd entrenador-mandarin
npm install http-server
npx http-server
```
O simplemente: `npx http-server` estando en la carpeta.

**Para GitHub Pages:**
1. Subir carpeta `entrenador-chino/` a un repositorio de GitHub
2. Settings → Pages → Source: `main branch / / (root)`
3. Esperar 1-3 minutos

### Próximos pasos inmediatos (01 de septiembre 2026):

1. **Verificado animación loop/detener:** ed4fa64 OK 800ms
2. **Verificado corrección:** PC nativo OK, Android IA 40MB OK (precisión según pronunciación) - commits e337000/fb9859c/53bbcae/1525d06
3. **Verificado diagramas lengua + grabadora filtro:** 8e3b63f/fe6b1c3/3616978/516456f/4a3dcc7/752c6f7/43ca807 OK - SVG sibilantes + placeholder + leyenda lateral + filtro HSK 4.269 + fix overlap 36px + tamaño 120/90 grabadora
4. **Verificado tonos learning:** 6ddcc36 OK - TTS learning 0.5 para tonos, solo singulares 972/3909 intencional (w.han.length===1)
5. **Probar GitHub Pages:** `https://TU_USUARIO.github.io/entrenador-mandarin/` carga TTS learning, vocabulario 4.269 y diagramas sin solapamiento
6. **Opcional:** Completar 481 palabras HSK 1-5 (90%→100%) + PWA offline

### Contacto / Soporte
Para dudas sobre la ejecución o extensiones del proyecto, revisar este bitácora.md o modificar los archivos JS según necesidad. El proyecto está diseñado para ser mantenido y ampliado por desarrolladores con conocimientos básicos de JavaScript.

---

*Bitácora generada y actualizada el 31 de agosto de 2026 noche (1.0.5). Proyecto con 4.269 HSK (90%) + 89 corrección (solo singulares 972/3909 en tonos intencional), TTS learning 0.5/calm 0.60/default 0.70 (tonos en learning), fallback IA 40MB móvil, diagramas lengua SVG + grabadora filtro HSK. Fixes Bugs 6-9 y mejoras commits 0e70b2e/e337000/53bbcae/fb9859c/ed4fa64/1525d06/8e3b63f/fe6b1c3/3616978/516456f/4a3dcc7/752c6f7/43ca807/6ddcc36. Requiere servidor local o GitHub Pages; offline vía Service Worker v2.*