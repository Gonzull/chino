import { speak } from './tts.js';

function initAspiracion(pairs) {
  const list = document.getElementById('aspList');
  pairs.forEach(([a, b]) => {
    const row = document.createElement('div');
    row.className = 'pair-row';
    row.innerHTML = `
      <div class="pair-word"><button class="minibtn">&#9654;</button><div><span class="han">${a.han}</span> <span class="pin">${a.pin}</span><br><span class="tag no">sin aire</span></div></div>
      <div class="pair-word"><button class="minibtn">&#9654;</button><div><span class="han">${b.han}</span> <span class="pin">${b.pin}</span><br><span class="tag si">aire fuerte</span></div></div>
    `;
    const btns = row.querySelectorAll('.minibtn');
    btns[0].addEventListener('click', () => speak(a.han, { calm: true }));
    btns[1].addEventListener('click', () => speak(b.han, { calm: true }));
    list.appendChild(row);
  });
}

export { initAspiracion };