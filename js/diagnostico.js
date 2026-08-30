import { speak } from './tts.js';

function initDiagnostico(items) {
  const list = document.getElementById('diagList');
  items.forEach((it, i) => {
    const row = document.createElement('div');
    row.className = 'diag-item';
    if (i > 0) row.style.marginTop = '16px';
    row.innerHTML = `
      <button class="playbtn" aria-label="reproducir">▶</button>
      <div class="diag-text">
        <span class="han">${it.han}</span>
        <span class="pin">${it.pin}</span>
        <div class="es">${it.es}</div>
        <label class="diag-check"><input type="checkbox"> ${it.check}</label>
      </div>`;
    row.querySelector('.playbtn').addEventListener('click', () => speak(it.han));
    list.appendChild(row);
  });
}

export { initDiagnostico };
