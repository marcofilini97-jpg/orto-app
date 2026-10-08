// Forma delle aiuole e dell'orto: solo calcoli, in centimetri, senza disegnare niente.
// Coordinate della mappa: x da sinistra a destra, y dal fondo (in alto) al davanti (in basso).
// Un'aiuola: { forma: 'rettangolo' | 'ellisse' | 'elle', x, y (centro), w, h (misure prima di girarla),
//   rot (gradi, in senso orario), taglio: { w, h, angolo: 'ne' | 'no' | 'se' | 'so' } solo per la forma a L }

// Dalla mappa alle coordinate dell'aiuola (u verso destra e v verso il basso, prima di girarla)
function locale(a, px, py) {
  const r = (a.rot ?? 0) * Math.PI / 180;
  const dx = px - a.x, dy = py - a.y;
  return { u: dx * Math.cos(r) + dy * Math.sin(r), v: -dx * Math.sin(r) + dy * Math.cos(r) };
}

function mappaDa(a, u, v) {
  const r = (a.rot ?? 0) * Math.PI / 180;
  return { x: a.x + u * Math.cos(r) - v * Math.sin(r), y: a.y + u * Math.sin(r) + v * Math.cos(r) };
}

// Il punto (in coordinate dell'aiuola) è nella forma?
function nellaForma(a, u, v) {
  const mw = a.w / 2, mh = a.h / 2;
  if (a.forma === 'ellisse') return (u / mw) ** 2 + (v / mh) ** 2 <= 1.0001;
  if (Math.abs(u) > mw + 0.01 || Math.abs(v) > mh + 0.01) return false;
  if (a.forma === 'elle' && a.taglio) {
    const { w, h, angolo } = a.taglio;
    const aDestra = angolo.endsWith('e'), inAlto = angolo.startsWith('n');
    const fuoriU = aDestra ? u > mw - w : u < -mw + w;
    const fuoriV = inAlto ? v < -mh + h : v > mh - h;
    if (fuoriU && fuoriV) return false;
  }
  return true;
}

// Le metà si dividono sulla mappa: fondo = sopra il centro, davanti = sotto, sinistra e destra
function nellaZona(a, zona, px, py) {
  if (zona === 'fondo') return py <= a.y + 0.01;
  if (zona === 'davanti') return py >= a.y - 0.01;
  if (zona === 'sinistra') return px <= a.x + 0.01;
  if (zona === 'destra') return px >= a.x - 0.01;
  return true;
}

export function dentro(a, zona, px, py) {
  const { u, v } = locale(a, px, py);
  return nellaForma(a, u, v) && nellaZona(a, zona, px, py);
}

// Un quadrato di lato s (centro cx, cy, dritto sulla mappa) sta tutto dentro la forma e la zona?
export function quadratoDentro(a, zona, cx, cy, s) {
  const m = s / 2;
  for (const [dx, dy] of [[-m, -m], [0, -m], [m, -m], [-m, 0], [0, 0], [m, 0], [-m, m], [0, m], [m, m]]) {
    if (!dentro(a, zona, cx + dx, cy + dy)) return false;
  }
  return true;
}

// Rettangolo dritto che contiene l'aiuola: { x, y, w, h } (x, y = angolo in alto a sinistra)
export function ingombro(a) {
  const r = (a.rot ?? 0) * Math.PI / 180;
  const c = Math.abs(Math.cos(r)), s = Math.abs(Math.sin(r));
  let mw, mh;
  if (a.forma === 'ellisse') {
    mw = Math.hypot(a.w / 2 * Math.cos(r), a.h / 2 * Math.sin(r));
    mh = Math.hypot(a.w / 2 * Math.sin(r), a.h / 2 * Math.cos(r));
  } else {
    mw = (a.w * c + a.h * s) / 2;
    mh = (a.w * s + a.h * c) / 2;
  }
  return { x: a.x - mw, y: a.y - mh, w: 2 * mw, h: 2 * mh };
}

// Rettangolo che contiene la parte (metà) dell'aiuola
export function ingombroZona(a, zona) {
  const b = ingombro(a);
  if (zona === 'fondo') return { ...b, h: a.y - b.y };
  if (zona === 'davanti') return { ...b, y: a.y, h: b.y + b.h - a.y };
  if (zona === 'sinistra') return { ...b, w: a.x - b.x };
  if (zona === 'destra') return { ...b, x: a.x, w: b.x + b.w - a.x };
  return b;
}

// Punti di una griglia fitta dentro la zona (per aree e misure)
function campioni(a, zona, n = 48) {
  const b = ingombroZona(a, zona);
  const punti = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const px = b.x + (i + 0.5) * b.w / n, py = b.y + (j + 0.5) * b.h / n;
      if (dentro(a, zona, px, py)) punti.push({ px, py });
    }
  }
  return { punti, cella: (b.w / n) * (b.h / n) };
}

// Superficie in cm²
export function area(a, zona = 'tutta') {
  if (zona === 'tutta' || !zona) {
    if (a.forma === 'ellisse') return Math.PI * a.w * a.h / 4;
    if (a.forma === 'elle' && a.taglio) return a.w * a.h - a.taglio.w * a.taglio.h;
    return a.w * a.h;
  }
  const { punti, cella } = campioni(a, zona);
  return punti.length * cella;
}

// Misure "equivalenti" per contare file e piante (catalogo.disposizione): L lungo il lato lungo dell'aiuola,
// W tale che L × W sia la superficie vera. Per un rettangolo sono proprio le sue misure
export function misure(a, zona = 'tutta') {
  const lungoU = a.w >= a.h;
  let minA = Infinity, maxA = -Infinity, minB = Infinity, maxB = -Infinity;
  for (const { px, py } of campioni(a, zona, 40).punti) {
    const { u, v } = locale(a, px, py);
    const lungo = lungoU ? u : v, corto = lungoU ? v : u;
    minA = Math.min(minA, lungo); maxA = Math.max(maxA, lungo);
    minB = Math.min(minB, corto); maxB = Math.max(maxB, corto);
  }
  if (minA === Infinity) return { L: 0, W: 0 };
  const passo = Math.max(a.w, a.h) / 40;
  const L = Math.round(maxA - minA + passo);
  return { L, W: Math.round(area(a, zona) / L) };
}

// Numero tra 0 e 1 che sembra casuale ma è sempre uguale per lo stesso testo
export function casuale(testo) {
  let h = 2166136261;
  for (const c of testo) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0) / 4294967296;
}

// Il quadrato (centro cx, cy, lato s) tocca uno dei rettangoli da evitare (es. il cartellino col nome)?
export function toccaRettangoli(cx, cy, s, evita = []) {
  return evita.some(r => cx + s / 2 > r.x && cx - s / 2 < r.x + r.w && cy + s / 2 > r.y && cy - s / 2 < r.y + r.h);
}

// Disposizione automatica di n disegnini quadrati di lato s (cm) nella zona: una casella ciascuno
// (2 × 2 per 4, 2 affiancati o in colonna per 2), con una variazione fissa dentro la casella; evita i rettangoli dati.
// Restituisce i centri, oppure null se non ci stanno
export function posti(a, zona, n, s, seme, evita = []) {
  const b = ingombroZona(a, zona);
  const colonne = n === 1 ? 1 : n === 2 ? (b.w >= b.h ? 2 : 1) : 2;
  const righe = Math.ceil(n / colonne);
  const risultato = [];
  for (let i = 0; i < n; i++) {
    const cx0 = b.x + (i % colonne) * b.w / colonne, cy0 = b.y + Math.floor(i / colonne) * b.h / righe;
    const cw = b.w / colonne, ch = b.h / righe;
    let trovato = null;
    // Prima dentro la sua casella, poi ovunque nella zona
    for (let k = 0; k < 60 && !trovato; k++) {
      const [ox, oy, ow, oh] = k < 30 ? [cx0, cy0, cw, ch] : [b.x, b.y, b.w, b.h];
      const px = ox + s / 2 + Math.max(0, ow - s) * casuale(`${seme}-${i}-${k}x`);
      const py = oy + s / 2 + Math.max(0, oh - s) * casuale(`${seme}-${i}-${k}y`);
      if (quadratoDentro(a, zona, px, py, s) && !toccaRettangoli(px, py, s, evita) && risultato.every(p => Math.hypot(p.x - px, p.y - py) > s * 0.55)) trovato = { x: px, y: py };
    }
    if (!trovato) return null;
    risultato.push(trovato);
  }
  // Prima quelli più in alto: così quelli sotto vengono disegnati davanti
  return risultato.sort((p, q) => p.y - q.y);
}

// Dove mettere il cartellino col nome: il punto della forma più vicino all'angolo in alto a sinistra
export function puntoEtichetta(a) {
  const b = ingombro(a);
  let migliore = { x: b.x, y: b.y }, d = Infinity;
  for (const { px, py } of campioni(a, 'tutta', 24).punti) {
    const dist = (px - b.x) + (py - b.y);
    if (dist < d) { d = dist; migliore = { x: px, y: py }; }
  }
  return migliore;
}

// Contorno della forma per SVG, in coordinate dell'aiuola (centro = 0, 0); il gruppo va spostato e girato
export function tracciato(a) {
  const mw = a.w / 2, mh = a.h / 2;
  if (a.forma === 'ellisse') return `M ${-mw} 0 A ${mw} ${mh} 0 1 0 ${mw} 0 A ${mw} ${mh} 0 1 0 ${-mw} 0 Z`;
  if (a.forma === 'elle' && a.taglio) {
    const { w, h, angolo } = a.taglio;
    // Angoli del rettangolo in senso orario dall'alto a sinistra, con il taglio al posto di uno
    const p = { no: [-mw, -mh], ne: [mw, -mh], se: [mw, mh], so: [-mw, mh] };
    const giro = ['no', 'ne', 'se', 'so'];
    const punti = [];
    for (const k of giro) {
      if (k !== angolo) { punti.push(p[k]); continue; }
      const [x, y] = p[k];
      const sx = k.endsWith('e') ? -w : w, sy = k.startsWith('n') ? h : -h;
      // entrando nell'angolo tagliato: prima il punto sul lato di arrivo, poi l'angolo interno, poi l'altro lato
      if (k === 'no' || k === 'se') punti.push([x, y + sy], [x + sx, y + sy], [x + sx, y]);
      else punti.push([x + sx, y], [x + sx, y + sy], [x, y + sy]);
    }
    return `M ${punti.map(q => q.join(' ')).join(' L ')} Z`;
  }
  return `M ${-mw} ${-mh} H ${mw} V ${mh} H ${-mw} Z`;
}
