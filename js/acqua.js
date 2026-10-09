// Bilancio dell'acqua delle aiuole (metodo FAO-56): ogni giorno una coltura consuma ET0 × Kc millimetri,
// cioè litri per m² (ET0 = evapotraspirazione di riferimento da Open-Meteo, Kc = coefficiente della coltura
// secondo la sua fase). Si toglie la pioggia utile. Solo calcoli

import { area } from './geometria.js';
import { colturaDaNome } from './catalogo.js';
import { tempoDel, raccoltaPrevista } from './meteo.js';
import { fineStimata } from './arcade.js';

// Kc [iniziale, pieno sviluppo, fine] dalla tabella 12 di FAO-56; dove la tabella non ha la coltura,
// quella più simile (indicata a fianco)
const KC = {
  pomodoro: [0.6, 1.15, 0.8], peperone: [0.6, 1.05, 0.9], melanzana: [0.6, 1.05, 0.9],
  zucchina: [0.5, 0.95, 0.75], cetriolo: [0.6, 1.0, 0.75], zucca: [0.5, 1.0, 0.8], melone: [0.5, 1.05, 0.75], anguria: [0.4, 1.0, 0.75],
  fagiolino: [0.5, 1.05, 0.9], fagiolorampicante: [0.5, 1.05, 0.9], pisello: [0.5, 1.15, 1.1],
  fava: [0.5, 1.15, 1.1],                                      // come il pisello fresco
  cavolfiore: [0.7, 1.05, 0.95], verza: [0.7, 1.05, 0.95], broccolo: [0.7, 1.05, 0.95], cavolonero: [0.7, 1.05, 0.95],
  carota: [0.7, 1.05, 0.95], sedano: [0.7, 1.05, 1.0], aglio: [0.7, 1.0, 0.7], cipolla: [0.7, 1.05, 0.75],
  scalogno: [0.7, 1.05, 0.75],                                 // come la cipolla
  porro: [0.7, 1.0, 1.0], erbacipollina: [0.7, 1.0, 1.0],      // come la cipolla verde
  lattuga: [0.7, 1.0, 0.95], lattugainv: [0.7, 1.0, 0.95], spinacio: [0.7, 1.0, 0.95], ravanello: [0.7, 0.9, 0.85],
  valerianella: [0.7, 1.0, 0.95], rucola: [0.7, 1.0, 0.95], radicchio: [0.7, 1.0, 0.95], bietola: [0.7, 1.0, 0.95],   // come lattuga e spinacio
  finocchio: [0.7, 1.05, 0.95], prezzemolo: [0.7, 1.05, 0.95], basilico: [0.7, 1.05, 0.95],                          // ortaggi piccoli
  patata: [0.5, 1.15, 0.75], carciofo: [0.5, 1.0, 0.95], asparago: [0.5, 0.95, 0.3], fragola: [0.4, 0.85, 0.75], menta: [0.6, 1.15, 1.1],
  mais: [0.3, 1.15, 1.05],                                     // mais dolce
};
const KC_AROMATICHE = [0.4, 0.5, 0.45];   // rosmarino, salvia, timo, origano, lavanda: vogliono poca acqua
const KC_ALTRE = [0.5, 0.9, 0.7];         // fiori utili, sovesci e colture non elencate

function kcDi(scheda) {
  if (!scheda) return KC_ALTRE;
  return KC[scheda.id] ?? (['rosmarino', 'salvia', 'timo', 'origano', 'lavanda'].includes(scheda.id) ? KC_AROMATICHE : KC_ALTRE);
}

const giorniTra = (da, a) => Math.round((Date.parse(a) - Date.parse(da)) / 86400000);
const piu = (iso, n) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

// Kc della coltura nel giorno g: fase iniziale (primo 30% del tempo fino alla raccolta), crescita fino al 70%,
// pieno sviluppo fino a metà raccolta, poi cala fino alla fine
function kcIl(c, scheda, g) {
  const [ini, mid, fin] = kcDi(scheda);
  const metodo = c.metodo === 'semina' || c.metodo === 'trapianto' ? c.metodo : (scheda?.t ? 'trapianto' : 'semina');
  const raccolta = (scheda && raccoltaPrevista(scheda, c.dataInizio, metodo)?.data) ?? piu(c.dataInizio, 90);
  const fine = c.dataFine ?? (scheda && fineStimata(scheda, c.dataInizio)) ?? piu(raccolta, 60);
  const t = giorniTra(c.dataInizio, g), tr = Math.max(1, giorniTra(c.dataInizio, raccolta));
  const metaRaccolta = raccolta < fine ? giorniTra(c.dataInizio, piu(raccolta, Math.round(giorniTra(raccolta, fine) / 2))) : tr;
  const tf = Math.max(metaRaccolta + 1, giorniTra(c.dataInizio, fine));
  if (t <= 0.3 * tr) return ini;
  if (t <= 0.7 * tr) return ini + (mid - ini) * (t - 0.3 * tr) / (0.4 * tr);
  if (t <= metaRaccolta) return mid;
  return mid + (fin - mid) * Math.min(1, (t - metaRaccolta) / (tf - metaRaccolta));
}

// La coltura c'è nell'aiuola il giorno g? (iniziata e non finita, anche secondo la fine stimata)
function presente(c, scheda, g) {
  if (c.stato === 'pianificata' || c.dataInizio > g) return false;
  const fine = c.dataFine ?? (scheda?.tappa === 'P' ? null : scheda && fineStimata(scheda, c.dataInizio));
  return !fine || g < fine;
}

// Acqua di un'aiuola tra i giorni da (compreso) e a (escluso), in litri:
// { fabbisogno, pioggia (pioggia utile sulle parti coltivate), daDare, coltivata (m²), colture: [nomi] }
export function bilancioAcqua(dati, aiuola, da, a) {
  let fabbisogno = 0, pioggia = 0, coltivataMax = 0;
  const nomi = new Set();
  for (let g = da; g < a; g = piu(g, 1)) {
    const t = tempoDel(g);
    if (!t) continue;
    const et0 = t.et0 ?? 0;
    // Colture presenti, divise per parte dell'aiuola: chi divide la stessa parte divide anche lo spazio
    const qui = dati.colture.map(c => ({ c, s: colturaDaNome(c.nome) }))
      .filter(({ c, s }) => c.aiuoleIds.includes(aiuola.id) && presente(c, s, g));
    const perZona = new Map();
    for (const x of qui) {
      const zona = x.c.parti?.[aiuola.id] || 'tutta';
      perZona.set(zona, [...(perZona.get(zona) ?? []), x]);
    }
    let coltivata = 0;
    for (const [zona, lista] of perZona) {
      const m2 = area(aiuola, zona) / 10000;
      coltivata += m2;
      for (const { c, s } of lista) {
        fabbisogno += et0 * kcIl(c, s, g) * m2 / lista.length;
        nomi.add(c.nome);
      }
    }
    coltivata = Math.min(coltivata, area(aiuola) / 10000);
    coltivataMax = Math.max(coltivataMax, coltivata);
    // Pioggia utile: le piogge leggere (sotto i 3 mm) bagnano solo la superficie; delle altre conta l'80%
    if (t.pioggia >= 3) pioggia += t.pioggia * 0.8 * coltivata;
  }
  return { fabbisogno, pioggia, daDare: Math.max(0, fabbisogno - pioggia), coltivata: coltivataMax, colture: [...nomi] };
}
