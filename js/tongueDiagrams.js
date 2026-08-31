// Diagramas sagitales simples para corrección zh/ch/sh/z/c/s/j/q/x/r
// Vista: paladar arriba, dientes, lengua en posición. Colores paleta proyecto.
const PALATE = 'M15 25 Q60 8 105 25';
const TEETH_UP = 'M35 25 L38 38 L45 38 L45 25';
const TEETH_LOW = 'M35 95 L38 82 L45 82 L45 95';
const LIP_UP = 'M20 25 Q60 18 100 25';
const LIP_LOW = 'M20 95 Q60 102 100 95';

const TONGUES = {
  // retroflejas: punta curvada hacia atrás
  zh: 'M50 70 Q60 55 70 45 Q75 38 68 32 Q60 45 50 70',
  ch: 'M50 70 Q60 55 70 45 Q75 38 68 32 Q60 45 50 70',
  sh: 'M50 72 Q62 58 72 48 Q78 40 70 34 Q62 48 50 72',
  r:  'M50 70 Q62 55 72 42 Q76 35 68 30 Q60 45 50 70',
  // dentales: punta plana detrás dientes superiores
  z:  'M45 45 Q55 45 60 50 Q60 65 50 70 Q45 60 45 45',
  c:  'M45 45 Q55 45 60 50 Q60 65 50 70 Q45 60 45 45',
  s:  'M45 48 Q55 48 60 52 Q60 65 50 70 Q45 62 45 48',
  // palatales j/q/x: dorso elevado medio-paladar, punta baja
  j:  'M45 68 Q60 55 75 50 Q82 48 80 60 Q65 68 45 68',
  q:  'M45 68 Q60 55 75 50 Q82 48 80 60 Q65 68 45 68',
  x:  'M45 65 Q60 52 75 48 Q80 46 78 58 Q65 65 45 65',
};

const LABELS = {
  zh: 'zh: punta curvada atrás', ch: 'ch: zh + aire fuerte', sh: 'sh: dorso curvado',
  z: 'z: plana tras dientes', c: 'c: z + aire', s: 's: z sin vibración',
  j: 'j: dorso elevado medio', q: 'q: j + aire', x: 'x: j fricativa', r: 'r: retrofleja suave'
};

export function tongueDiagramSVG(sound, w=120, h=120) {
  if (!TONGUES[sound]) {
    return `<svg width="${w}" height="${h}" viewBox="0 0 120 120" style="background:var(--bg-soft);border:1px solid var(--gold);border-radius:8px"><text x="60" y="55" text-anchor="middle" font-size="8" fill="var(--text-dim)">Sin diagrama</text><text x="60" y="68" text-anchor="middle" font-size="7" fill="var(--text-dim)">solo sibilantes</text><text x="60" y="80" text-anchor="middle" font-size="6" fill="var(--text-dim)">zh/ch/sh/z/c/s/j/q/x/r</text></svg>`;
  }
  const tongue = TONGUES[sound];
  const label = LABELS[sound];
  return `
<svg width="${w}" height="${h}" viewBox="0 0 120 120" style="background:var(--bg-soft);border:1px solid var(--gold);border-radius:8px">
  <path d="${PALATE}" fill="none" stroke="#CBA35C" stroke-width="3" stroke-linecap="round"/>
  <path d="${LIP_UP}" fill="none" stroke="#8a7a65" stroke-width="2" opacity="0.5"/>
  <path d="${LIP_LOW}" fill="none" stroke="#8a7a65" stroke-width="2" opacity="0.5"/>
  <path d="${TEETH_UP}" fill="#F1E9DC" stroke="#5C8C77" stroke-width="1"/>
  <path d="${TEETH_LOW}" fill="#F1E9DC" stroke="#5C8C77" stroke-width="1"/>
  <!-- lengua -->
  <path d="${tongue}" fill="#B4432E" stroke="#7a2e1e" stroke-width="1.2" opacity="0.95"/>
  <!-- aire / fricción -->
  ${['ch','c','q'].includes(sound) ? '<g opacity="0.6"><path d="M70 32 L78 28 M70 38 L78 34 M70 44 L78 40" stroke="#CBA35C" stroke-width="1.5" stroke-linecap="round"/></g>' : ''}
  ${['sh','s','x'].includes(sound) ? '<path d="M60 35 Q65 40 60 45 Q55 40 60 35" fill="none" stroke="#CBA35C" stroke-width="1" opacity="0.5"/>' : ''}
  <text x="60" y="115" text-anchor="middle" font-size="7" fill="var(--text-dim)">${label}</text>
</svg>`;
}
