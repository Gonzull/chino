import { speak } from './tts.js';
import { tongueDiagramSVG } from './tongueDiagrams.js';

function stripPunct(s) {
  return s.replace(/[，。！？、\s.,!?]/g, '');
}

function initCorreccion(words) {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const el = id => document.getElementById(id);
  let recognition = null;
  let current = null;
  let score = 0,
    total = 0;

  function showWord() {
    current = words[Math.floor(Math.random() * words.length)];
    el('corrHan').textContent = current.han;
    el('corrPinEs').textContent = `${current.pin} — ${current.es}`;
    el('corrSoundTag').textContent = current.sound;
    // diagrama lengua responsive + leyenda al lado derecho
    let dia = el('tongueDiagram');
    if (!dia) {
      const wrapper = document.createElement('div');
      wrapper.id = 'tongueWrapper';
      wrapper.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;margin:10px auto;max-width:420px;';
      dia = document.createElement('div');
      dia.id = 'tongueDiagram';
      dia.style.cssText = 'width:160px;height:160px;flex-shrink:0;';
      const legend = document.createElement('div');
      legend.id = 'tongueLegend';
      legend.style.cssText = 'font-size:10px;color:var(--text-dim);text-align:left;line-height:1.4;max-width:160px;';
      legend.innerHTML = '<span style="color:#CBA35C">━</span> Paladar<br><span style="display:inline-block;width:10px;height:8px;background:#F1E9DC;border:1px solid #5C8C77;vertical-align:middle"></span> Dientes<br><span style="display:inline-block;width:10px;height:8px;background:#B4432E;vertical-align:middle"></span> Lengua<br><span style="color:#CBA35C">///</span> Aire';
      wrapper.appendChild(dia);
      wrapper.appendChild(legend);
      const card = document.getElementById('corrCard');
      if (card) card.insertBefore(wrapper, card.querySelector('.quiz-stage') || card.firstChild);
      // responsive: 160 en PC, 120 en móvil
      const mql = window.matchMedia('(max-width: 600px)');
      const applySize = () => { dia.style.width = mql.matches ? '120px' : '160px'; dia.style.height = mql.matches ? '120px' : '160px'; };
      mql.addEventListener ? mql.addEventListener('change', applySize) : mql.addListener(applySize);
      applySize();
    }
    const isMobileDia = window.matchMedia('(max-width: 600px)').matches;
    dia.innerHTML = tongueDiagramSVG(current.sound, isMobileDia ? 120 : 160, isMobileDia ? 120 : 160);
    el('corrFeedback').innerHTML = '';
    el('corrHeard').textContent = '';
    el('corrStatus').textContent = 'Toca el micrófono y di la palabra claramente.';
  }

  function updateScore() {
    el('corrScore').textContent = score;
    el('corrTotal').textContent = total;
  }

  function evaluate(transcripts) {
    total++;
    const fb = el('corrFeedback');
    el('corrHeard').textContent = 'Se reconoció: "' + transcripts.join('" / "') + '"';
    const cleaned = transcripts.map(stripPunct);

    if (cleaned.some(t => t.includes(current.han))) {
      score++;
      fb.innerHTML = `<span style="color:var(--jade)">✓ ¡Muy bien! Se reconoció "${current.han}" (${current.pin}) correctamente.</span>`;
      el('corrStatus').textContent = 'Correcto — toca "Siguiente palabra" para continuar.';
      updateScore();
      return;
    }

    for (const conf of current.confusions) {
      if (cleaned.some(t => t.includes(conf.han))) {
        fb.innerHTML = `<span style="color:var(--seal)">✗ Casi — ${conf.note}</span>`;
        el('corrStatus').textContent = 'Vuelve a intentar cuantas veces quieras.';
        updateScore();
        return;
      }
    }

    fb.innerHTML = `<span style="color:var(--gold)">No pude relacionarlo con las opciones conocidas. Habla más cerca del micrófono, despacio y sin ruido de fondo, y vuelve a intentar.</span>`;
    el('corrStatus').textContent = 'Intenta de nuevo.';
    updateScore();
  }

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    el('corrAI').style.display = 'flex';
    let whisperPipe = null;
    let whisperLoading = false;
    let mediaRecorder = null;
    let chunks = [];
    async function getWhisper() {
      if (whisperPipe) return whisperPipe;
      if (whisperLoading) return null;
      whisperLoading = true;
      el('corrStatus').textContent = 'Descargando modelo IA 40MB (primera vez, una sola vez)…';
      try {
        const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js');
        whisperPipe = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny');
        el('corrStatus').textContent = 'Modelo IA listo. Toca el micrófono y habla.';
      } catch (e) {
        el('corrStatus').textContent = 'Error cargando IA: ' + e.message;
      }
      whisperLoading = false;
      return whisperPipe;
    }
    el('corrMicBtn').addEventListener('click', async () => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        try { mediaRecorder.stop(); } catch {}
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        chunks = [];
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach(t => t.stop());
          el('corrMicBtn').style.background = 'var(--jade)';
          if (!chunks.length) { el('corrStatus').textContent = 'No se grabó audio. Intenta de nuevo.'; return; }
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          el('corrStatus').textContent = 'Transcribiendo con IA…';
          try {
            const pipe = await getWhisper();
            if (!pipe) return;
            const res = await pipe(url, { language: 'chinese', task: 'transcribe' });
            URL.revokeObjectURL(url);
            const text = (res.text || '').trim();
            if (!text) { el('corrStatus').textContent = 'No se reconoció voz. Intenta de nuevo.'; return; }
            evaluate([text]);
          } catch (e) {
            el('corrStatus').textContent = 'Error IA: ' + e.message;
          }
        };
        mediaRecorder.start();
        el('corrStatus').textContent = 'Escuchando… (habla ahora, 3s)';
        el('corrMicBtn').style.background = 'var(--seal)';
        setTimeout(() => { try { if (mediaRecorder.state === 'recording') mediaRecorder.stop(); } catch {} }, 3500);
      } catch (e) {
        el('corrStatus').textContent = 'Permiso de micrófono denegado.';
      }
    });
  } else if (SpeechRec) {
    let listenTimeout = null;
    function createRecognition() {
      const rec = new SpeechRec();
      rec.lang = 'zh-CN';
      rec.continuous = false;
      rec.interimResults = false;
      rec.maxAlternatives = 5;
      rec.onstart = () => {
        el('corrStatus').textContent = 'Escuchando…';
        el('corrMicBtn').style.background = 'var(--seal)';
        clearTimeout(listenTimeout);
        listenTimeout = setTimeout(() => { try { rec.stop(); } catch {} }, 5000);
      };
      rec.onresult = event => {
        clearTimeout(listenTimeout);
        const alts = [];
        for (let i = 0; i < event.results[0].length; i++) {
          alts.push(event.results[0][i].transcript);
        }
        evaluate(alts);
      };
      rec.onerror = event => {
        clearTimeout(listenTimeout);
        const status = el('corrStatus');
        if (event.error === 'no-speech') status.textContent = 'No se detectó voz. Intenta de nuevo.';
        else if (event.error === 'not-allowed' || event.error === 'permission-denied')
          status.textContent = 'Permiso de micrófono denegado. Revisa los ajustes del navegador.';
        else if (event.error === 'network')
          status.textContent = 'Error de red — el reconocimiento de voz necesita conexión a internet.';
        else if (event.error === 'aborted') status.textContent = 'Escucha abortada. Intenta de nuevo.';
        else status.textContent = 'Ocurrió un error (' + event.error + '). Intenta de nuevo.';
      };
      rec.onend = () => {
        clearTimeout(listenTimeout);
        el('corrMicBtn').style.background = 'var(--jade)';
      };
      rec.onspeechend = () => { try { rec.stop(); } catch {} };
      return rec;
    }
    recognition = createRecognition();
    el('corrMicBtn').addEventListener('click', async () => {
      el('corrMicBtn').disabled = true;
      try { recognition.abort(); } catch {}
      clearTimeout(listenTimeout);
      el('corrMicBtn').style.background = 'var(--jade)';
      el('corrStatus').textContent = 'Reiniciando micrófono…';
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
      } catch {}
      setTimeout(() => {
        recognition = createRecognition();
        try { recognition.start(); } catch (e) { el('corrStatus').textContent = 'No se pudo iniciar (' + e.message + '). Toca de nuevo.'; }
        el('corrMicBtn').disabled = false;
      }, 350);
    });
  } else {
    el('corrUnsupported').style.display = 'flex';
    el('corrMicBtn').disabled = true;
    el('corrMicBtn').style.opacity = '.4';
  }

  el('corrListen').addEventListener('click', () => speak(current.han, { calm: true }));
  el('corrNext').addEventListener('click', showWord);
  showWord();
}

export { initCorreccion };
