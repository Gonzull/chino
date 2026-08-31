# Leeme.md - Instrucciones de Instalación y Uso

## 📱 Instalación en Android (PWA)

### Navegadores recomendados:
- **Chrome** (versión más reciente) - Funciona perfecto, todos los features incluidos grabadora y reconocimiento de voz
- **Edge** - También compatible, basado en el mismo motor que Chrome
- **Firefox** - Funciona la mayor parte de la app, pero el reconocimiento de voz puede tener limitaciones

### Pasos para instalar:

1. **Abrir en celular:**
   - Conectarse a la red (Wi-Fi recomendado, los datos móviles también funcionan)
   - Navegar a la URL: `http://localhost:8080` (si tienen servidor local) O
   - Si está en GitHub Pages: `https://Gonzull.github.io/entrenador-mandarin/`

2. **Instalar como app:**
   - En Chrome Android: Tocar el menú ⋮ (tres puntos) en la esquina superior derecha
   - Seleccionar **"Instalar app"** (o **"Añadir a pantalla principal"**)
   - Confirmar la instalación en el diálogo que aparece
   - La app aparecerá en el cajón de aplicaciones como cualquier otra aplicación

### Funcionamiento offline:
- Después de la primera carga (necesita internet para descargar los datos de HanziWriter y voces), la app funciona **offline completo**
- El Service Worker cachea todos los recursos necesarios
- Progreso, estadísticas y escritura se guardan en `localStorage` del navegador
- Ideal para usar en el metro, avión o sin conexión estable

### Permisos necesarios:
- Al primera vez, Chrome pedirá permiso para usar el **micrófono** (necesario para la grabadora y modo corrección de voz)
- Permitir este acceso para poder grabar y comparar audios

---

## 💻 Uso en PC (Computadora)

### Requerimientos:
- **Python** instalado (versión 3.8 o superior) O **Node.js** con `http-server`
- **Navegador actual**: Chrome, Edge o Firefox
- **Puerto disponible** (8080 por defecto, o 8081 si el 8080 está ocupado)

### Cómo hacerlo funcionar en PC:

#### Opción A: Servidor Python (más sencillo)
1. Abrir la terminal (PowerShell o CMD) en la carpeta del proyecto
2. Ejecutar: `python -m http.server 8080`
3. Abrir en navegador: `http://localhost:8080`
4. La app cargará con todos los quizzes, escritura, grabadora, etc.

#### Opción B: Node.js http-server
1. Tener Node.js instalado
2. Ejecutar: `npx http-server` (o `npm start` si tienen un package.json)
3. La app estará disponible en `http://localhost:8080` (o el puerto que indique)

### ⚠️ Problemas comunes en PC:

**"Error 404" o los quizzes no cargan:**
- **Causa:** Abrir el `index.html` con doble clic (archivo `file://`)
- **Solución:** **Siempre usar un servidor local** (los pasos de arriba). Los navegadores bloquean `fetch()` y `Service Worker` cuando se abre el archivo directo.

"La grabadora no funciona":
- **Causa:** No se concedió permiso de micrófono
- **Solución:** Cuando aparezca el cartel de "¿Permitir acceso al micrófono?", hacer clic en "Permitir". Si ya denegó, hay que ir a la configuración del navegador y activarlo para el dominio localhost.

"Los tonos/no reconocen mi voz":
- **Causa:** El reconocimiento de voz funciona mejor en **Chrome** y en entornos silenciosos
- **Solución:** Hablar despacio, cerca del micrófono, sin ruido de fondo. La app está diseñada para hispanohablantes y el modelo reconoce acentos comunes.

---

## 📂 Estructura del proyecto (solo para desarrolladores)

El proyecto tiene esta organización interna:

```
entrenador-mandarin/
├── index.html          # Punto de entrada principal (<base href="/entrenador-mandarin/">)
├── manifest.webmanifest # Configuración PWA
├── sw.js               # Service worker para offline (cache-first + stale-while-revalidate)
├── css/styles.css      # Estilos visuales profesionales
├── js/                 # Módulos JavaScript (11 archivos)
│   ├── main.js         # Bootstrap y orquestación general
│   ├── storage.js      # helper de localStorage (fallback memoria)
│   ├── tts.js          # Síntesis de voz: default 0.70, calm 0.60, learning 0.5, fast 1.1
│   ├── data.js         # Carga data/*.json, computeTone con array [han,pin,es]
│   ├── diagnostico.js  # Panel diagnóstico inicial
│   ├── tonos.js        # Ejercicios de tonos (filtros HSK 1-5)
│   ├── sibilantes.js   # Panel sibilantes zh/ch/sh
│   ├── aspiracion.js   # Pares de aspiración
│   ├── grabadora.js    # Grabadora comparativa (grupos HSK 1-5 + sib)
│   ├── correccion.js   # Reconocimiento voz: nativo PC + fallback móvil IA Whisper tiny 40MB
│   ├── escritura.js    # Escritura hanzi con SRS + loop animación isLooping 800ms
│   └── progreso.js     # Estadísticas de racha y caracteres dominados
├── data/               # Base de conocimientos (4.269 palabras HSK 90% estándar)
│   ├── hsk1.json       # HSK 1: 395 palabras
│   ├── hsk2.json       # HSK 2: 261 palabras
│   ├── hsk3.json       # HSK 3: 568 palabras
│   ├── hsk4.json       # HSK 4: 1.040 palabras
│   ├── hsk5.json       # HSK 5: 1.645 palabras (total 4.269)
│   ├── diagnostico.json # 5 items
│   ├── sibilantes.json  # 14 grupos
│   ├── aspiracion.json  # 5 pares
│   └── correccion.json  # 89 palabras (zh/ch/sh/x/j/q/c + confusiones)
├── icons/              # Íconos PWA (192/512/maskable)
│   ├── icon-192.png
│   ├── icon-512.png
│   └── maskable-512.png

```

---



## 📋 Resumen rápido de comandos

**Para empezar en PC (genérico, clonar y modificar en tu proyecto):**
```powershell
git clone https://github.com/TU_USUARIO/entrenador-mandarin.git
cd entrenador-mandarin
python -m http.server 8080
# Luego: abrir http://localhost:8080 en Chrome
# Importante: levantar el servidor DENTRO de la carpeta del proyecto (no desde el padre) para evitar 404 js/main.js
```

**Para instalar en Android:**
1. Abrir `http://localhost:8080` o `https://Gonzull.github.io/entrenador-mandarin/` en Chrome Android
2. Menú ⋮ → "Instalar app" (o "Añadir a pantalla principal")
3. Listo - funciona offline después de primera carga. Corrección en móvil usa IA Whisper tiny (descarga ~40MB una sola vez) si el reconocimiento nativo falla



---

**¿Para quién es esto?**
- **Usuarios Android:** Pueden instalarla desde Chrome y usarla offline
- **Usuarios PC:** Necesitan un servidor local (Python o Node.js) para que todo funcione
- **Desarrolladores:** Pueden extender el proyecto añadiendo más datos HSK, features, etc.
