import { speak } from './tts.js';

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

  if (SpeechRec) {
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
