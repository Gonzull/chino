import { speak } from './tts.js';

function initGrabadora(vocab, sibGroups) {
  const words = [...vocab, ...sibGroups.flat().map(w => ({ ...w, level: 'sib' }))];
  const select = document.getElementById('recWordSelect');
  const groups = {
    1: document.createElement('optgroup'),
    2: document.createElement('optgroup'),
    3: document.createElement('optgroup'),
    sib: document.createElement('optgroup')
  };
  groups[1].label = 'HSK 1';
  groups[2].label = 'HSK 2';
  groups[3].label = 'HSK 3';
  groups.sib.label = 'Sibilantes (práctica extra)';

  words.forEach((w, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${w.han} (${w.pin}) — ${w.es}`;
    groups[w.level].appendChild(opt);
  });
  [1, 2, 3, 'sib'].forEach(lv => select.appendChild(groups[lv]));

  function updateHan() {
    document.getElementById('recHan').textContent = words[select.value].han;
  }
  select.addEventListener('change', updateHan);
  updateHan();
  document.getElementById('recPlayNative').addEventListener('click', () => speak(words[select.value].han));

  let mediaRecorder,
    chunks = [],
    recording = false,
    recordedUrl = null;
  const toggleBtn = document.getElementById('recToggle');
  const playMineBtn = document.getElementById('recPlayMine');
  const player = document.getElementById('recAudioPlayer');
  const note = document.getElementById('recNote');

  toggleBtn.addEventListener('click', async () => {
    if (!recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        chunks = [];
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = e => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          recordedUrl = URL.createObjectURL(blob);
          playMineBtn.disabled = false;
          note.textContent = 'Grabación lista. Compárala con el audio nativo.';
          stream.getTracks().forEach(t => t.stop());
        };
        mediaRecorder.start();
        recording = true;
        toggleBtn.textContent = '■ Detener';
        toggleBtn.classList.add('recording');
        note.textContent = 'Grabando…';
      } catch (err) {
        note.textContent = 'No se pudo acceder al micrófono. Revisa los permisos del navegador.';
      }
    } else {
      mediaRecorder.stop();
      recording = false;
      toggleBtn.textContent = '● Grabar';
      toggleBtn.classList.remove('recording');
    }
  });

  playMineBtn.addEventListener('click', () => {
    if (!recordedUrl) return;
    player.src = recordedUrl;
    player.style.display = 'block';
    player.play();
  });
}

export { initGrabadora };
