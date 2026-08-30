import { store } from './storage.js';

const DAY_MS = 86400000;

function loadProgress() {
  document.getElementById('statStreak').textContent = store.get('streak', 0);
  document.getElementById('statSessions').textContent = store.get('sessions', 0);
}

function refreshWritingStats() {
  const srs = store.get('hanzi_srs_v1', {});
  let practiced = 0,
    mastered = 0;
  for (const k in srs) {
    const e = srs[k];
    if (!e.seen) continue;
    practiced++;
    if (e.box >= 4) mastered++;
  }
  document.getElementById('statChars').textContent = practiced;
  document.getElementById('statMastered').textContent = mastered;
}

function initProgreso() {
  loadProgress();
  refreshWritingStats();

  document.getElementById('logSession').addEventListener('click', () => {
    const today = new Date().toDateString();
    const last = store.get('lastLogDate', '');
    let streak = store.get('streak', 0);
    let sessions = store.get('sessions', 0);
    if (last === today) {
      alert('Ya registraste tu sesión de hoy. ¡Vuelve mañana!');
      return;
    }
    const yesterday = new Date(Date.now() - DAY_MS).toDateString();
    streak = last === yesterday ? streak + 1 : 1;
    sessions += 1;
    store.set('streak', streak);
    store.set('sessions', sessions);
    store.set('lastLogDate', today);
    loadProgress();
  });
}

export { initProgreso };
