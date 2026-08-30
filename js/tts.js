let zhVoice = null;

function pickVoice(){
  const voices = speechSynthesis.getVoices();
  const cnVoices = voices.filter(v => v.lang === 'zh-CN' || (v.lang && v.lang.startsWith('zh')));
  // Preferir voz femenina si está disponible, sino la primera
  let selected = cnVoices[0];
  const female = cnVoices.find(v => /femal|zira|hui|xiaoy|yun|jun|ting/i.test(v.name));
  if (female) selected = female;
  zhVoice = selected || null;
}
if ('speechSynthesis' in window){
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}

function speak(text, opts={}){
  if (!('speechSynthesis' in window)) {
    alert('Tu navegador no soporta síntesis de voz.');
    return;
  }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN';
  if (zhVoice) u.voice = zhVoice;
  // Voz más calmada: reducir velocidad y añadir una pausa breve
  u.rate = opts.calm ? 0.75 : (opts.fast ? 1.1 : 0.82);
  u.pitch = opts.calm ? 0.9 : 1.0;
  u.volume = 1.0;
  speechSynthesis.speak(u);
}

export { speak, pickVoice };