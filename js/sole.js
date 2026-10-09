// Ore di sole sulle aiuole: posizione del sole a Bologna e ombra degli alberi. Solo calcoli, niente disegno.
// Coordinate della mappa in cm come in geometria.js; l'esposizione (terreno.esposizione) dice verso dove guarda il fondo

import { dentro, ingombroZona } from './geometria.js';

const LAT = 44.5 * Math.PI / 180;   // Bologna
const rad = g => g * Math.PI / 180;
const gradi = r => r * 180 / Math.PI;
// Giorno dell'anno del 21 di ogni mese
const GIORNO_21 = [21, 52, 80, 111, 141, 172, 202, 233, 264, 294, 325, 355];
export const PASSO_ORA = 0.5;
const ALTEZZA_MINIMA = 10;   // gradi: il sole più basso (alba, tramonto) scalda e illumina poco, non conta

// Sole il 21 del mese (1–12) all'ora solare `ora`: { el: altezza in gradi, az: azimut in gradi da Nord, in senso orario }
export function posizioneSole(mese, ora) {
  const n = GIORNO_21[mese - 1];
  const dec = rad(23.44) * Math.sin(2 * Math.PI * (284 + n) / 365);
  const H = rad(15 * (ora - 12));
  const el = Math.asin(Math.sin(LAT) * Math.sin(dec) + Math.cos(LAT) * Math.cos(dec) * Math.cos(H));
  const az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(LAT) - Math.tan(dec) * Math.cos(LAT)) + Math.PI;
  return { el: gradi(el), az: (gradi(az) + 360) % 360 };
}

// Direzione sulla mappa (x verso destra, y verso il davanti) di un azimut, se il fondo guarda verso `esposizione`
function verso(az, esposizione) {
  const a = rad(az - esposizione);
  return { x: Math.sin(a), y: -Math.cos(a) };
}

// Ombra di un albero a terra. La chioma va da circa 1/3 dell'altezza fino in cima: la sua ombra è una striscia
// larga quanto la chioma, con le punte tonde, dal punto in cui cade l'ombra della parte bassa a quello della cima.
// { x1, y1, x2, y2, r, angolo, lunghezza } in cm e gradi, oppure null se il sole è sotto l'orizzonte
export function ombraAlberoAlSole(albero, sole, esposizione) {
  if (sole.el <= 0) return null;
  const h = (albero.altezza ?? 4) * 100;
  const r = albero.diametro / 2;
  const v = verso(sole.az + 180, esposizione);
  const t = Math.tan(rad(sole.el));
  const d1 = h * 0.35 / t, d2 = h * 0.95 / t;
  return {
    x1: albero.x + v.x * d1, y1: albero.y + v.y * d1, x2: albero.x + v.x * d2, y2: albero.y + v.y * d2,
    r, angolo: gradi(Math.atan2(v.y, v.x)), lunghezza: d2 - d1,
  };
}

// Il punto è in ombra se è a meno di r dal segmento tra le due punte dell'ombra
function inOmbra(px, py, ombre) {
  return ombre.some(o => {
    const sx = o.x2 - o.x1, sy = o.y2 - o.y1;
    const k = Math.max(0, Math.min(1, ((px - o.x1) * sx + (py - o.y1) * sy) / (sx * sx + sy * sy || 1)));
    return Math.hypot(px - (o.x1 + k * sx), py - (o.y1 + k * sy)) <= o.r;
  });
}

// Punti della parte di aiuola su cui si conta il sole
function puntiAiuola(a, zona) {
  const b = ingombroZona(a, zona);
  const punti = [];
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 5; j++) {
      const px = b.x + (i + 0.5) * b.w / 6, py = b.y + (j + 0.5) * b.h / 5;
      if (dentro(a, zona, px, py)) punti.push([px, py]);
    }
  }
  return punti.length ? punti : [[a.x, a.y]];
}

const memoria = new Map();

// Ore di sole al giorno sulla parte di aiuola, il 21 del mese: { ore, possibili } (possibili = senza ombre)
export function oreDiSole(dati, aiuola, mese, zona = 'tutta') {
  const esposizione = dati.terreno[0]?.esposizione ?? 0;
  const chiave = JSON.stringify([aiuola.id, aiuola.x, aiuola.y, aiuola.w, aiuola.h, aiuola.rot, aiuola.forma, aiuola.taglio, zona, mese, esposizione, dati.alberi]);
  if (memoria.has(chiave)) return memoria.get(chiave);
  const punti = puntiAiuola(aiuola, zona);
  let ore = 0, possibili = 0;
  for (let ora = 4; ora <= 20; ora += PASSO_ORA) {
    const sole = posizioneSole(mese, ora);
    if (sole.el < ALTEZZA_MINIMA) continue;
    possibili += PASSO_ORA;
    const ombre = dati.alberi.map(al => ombraAlberoAlSole(al, sole, esposizione)).filter(Boolean);
    const liberi = ombre.length ? punti.filter(([x, y]) => !inOmbra(x, y, ombre)).length : punti.length;
    ore += PASSO_ORA * liberi / punti.length;
  }
  const risultato = { ore, possibili };
  if (memoria.size > 5000) memoria.clear();
  memoria.set(chiave, risultato);
  return risultato;
}

// Ore di sole medie nei mesi dati (1–12)
export function oreMedie(dati, aiuola, mesi, zona = 'tutta') {
  const tutte = mesi.map(m => oreDiSole(dati, aiuola, m, zona).ore);
  return tutte.reduce((s, x) => s + x, 0) / tutte.length;
}

// I mesi tra due date AAAA-MM-GG (al massimo 12)
export function mesiTra(dal, al) {
  const mesi = [];
  let [a, m] = dal.split('-').map(Number);
  const [a2, m2] = al.split('-').map(Number);
  while ((a < a2 || (a === a2 && m <= m2)) && mesi.length < 12) {
    mesi.push(m);
    m++;
    if (m > 12) { m = 1; a++; }
  }
  return mesi.length ? mesi : [Number(dal.slice(5, 7))];
}

// Quanto rende una coltura con il sole che ha (0,3–1): se le ore sono meno del suo bisogno, in proporzione.
// Il bisogno non supera quello che darebbe il cielo libero in quel mese (d'inverno le ore sono poche per tutti)
export function fattoreSole(ore, bisogno, possibili = Infinity) {
  if (ore == null || !bisogno) return 1;
  return Math.max(0.3, Math.min(1, ore / Math.min(bisogno, possibili)));
}

// Fattore medio nei mesi in cui la coltura sta nell'aiuola
export function fattoreSoleAiuola(dati, aiuola, mesi, zona, bisogno) {
  const f = mesi.map(m => {
    const { ore, possibili } = oreDiSole(dati, aiuola, m, zona);
    return fattoreSole(ore, bisogno, possibili);
  });
  return f.reduce((s, x) => s + x, 0) / f.length;
}

// Il sole conta solo se l'esposizione è indicata (senza, gli alberi non si sa dove fanno ombra)
export function soleNoto(dati) {
  return dati.terreno[0]?.esposizione != null;
}
