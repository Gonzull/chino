const DATA_FILES = [
  'hsk1',
  'hsk2',
  'hsk3',
  'hsk4',
  'hsk5',
  'diagnostico',
  'sibilantes',
  'aspiracion',
  'correccion'
];

const TONE_MAP = {
  'āēīōūǖ': 1,
  'áéíóúǘ': 2,
  'ǎěǐǒǔǚ': 3,
  'àèìòùǜ': 4
};

function computeTone(pin) {
  for (const ch of pin) {
    for (const set in TONE_MAP) {
      if (set.includes(ch)) return TONE_MAP[set];
    }
  }
  return 5;
}

async function fetchJSON(name) {
  const res = await fetch(`data/${name}.json`);
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  return res.json();
}

async function loadKnowledgeBase() {
  const results = await Promise.all(DATA_FILES.map(fetchJSON));
  const [hsk1, hsk2, hsk3, hsk4, hsk5, diagnostico, sibilantes, aspiracion, correccion] = results;

  const vocab = [
    ...hsk1.words.map(w => ({ ...w, level: 1 })),
    ...hsk2.words.map(w => ({ ...w, level: 2 })),
    ...hsk3.words.map(w => ({ ...w, level: 3 })),
    ...hsk4.words.map(w => ({ ...w, level: 4 })),
    ...hsk5.words.map(w => ({ ...w, level: 5 }))
  ].map(w => ({ ...w, tone: computeTone(w.pin) }));

  return {
    vocab,
    diagnostico: diagnostico.items,
    sibilantes: sibilantes.groups,
    aspiracion: aspiracion.pairs,
    correccion: correccion.words,
    meta: {
      updated: hsk1.updated,
      total: vocab.length
    }
  };
}

export { loadKnowledgeBase };