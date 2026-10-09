// Meteo di Bologna da Open-Meteo (dati CC BY 4.0, gratuito per uso non commerciale): previsioni, giorni passati
// e medie di 30 anni; gradi giorno per prevedere quando si raccoglie. La copia sul telefono la tiene dati.js

import { leggiMeteo, scriviMeteo, oggiVero } from './dati.js';

const PUNTO = 'latitude=44.49&longitude=11.34&timezone=Europe%2FRome';   // Bologna città, non l'orto
const ORE = 3600000;

// Colture che vogliono caldo: crescono sopra i 10 °C (le altre sopra i 5 °C)
const CALDE = new Set(['pomodoro', 'peperone', 'melanzana', 'zucchina', 'cetriolo', 'zucca', 'melone', 'anguria', 'mais', 'fagiolino', 'fagiolorampicante', 'basilico']);

const piu = (iso, n) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const giorniTra = (da, a) => Math.round((Date.parse(a) - Date.parse(da)) / 86400000);

// Copia in memoria del meteo salvato (rileggerlo a ogni giorno dei conti sarebbe lento)
let memoria;
const meteo = () => (memoria === undefined ? (memoria = leggiMeteo()) : memoria);

async function scarica(url) {
  // Sempre chiedendo al server se ci sono dati nuovi (le previsioni cambiano ogni ora)
  const r = await fetch(url, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`Meteo non disponibile (${r.status})`);
  return r.json();
}

// Scarica ciò che manca: le medie (una volta l'anno) e i giorni recenti con le previsioni (ogni 3 ore).
// Senza rete resta la copia salvata
export async function aggiornaMeteo() {
  const m = structuredClone(meteo() ?? {});
  const oggi = oggiVero();
  const anno = Number(oggi.slice(0, 4));
  let cambiato = false;
  // Versione 2: c'è anche l'evapotraspirazione (ET0). I dati vecchi restano finché non arrivano i nuovi
  if (m.versioneDati !== 2) Object.assign(m, { normaliAnno: null, archivioFino: null, aggiornato: null, versioneDati: 2 });
  const giorni = m.giorni ?? {};
  // Tre richieste separate: se una non va (niente rete, troppe richieste), le altre arrivano lo stesso
  // 1. Medie di 30 anni, una volta l'anno
  if (!m.normali || m.normaliAnno !== anno) {
    try {
      const j = await scarica(`https://archive-api.open-meteo.com/v1/archive?${PUNTO}&start_date=${anno - 30}-01-01&end_date=${anno - 1}-12-31&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration`);
      m.normali = calcolaNormali(j.daily);
      m.normaliAnno = anno;
      cambiato = true;
    } catch { /* si riprova al prossimo avvio */ }
  }
  // 2. Dall'inizio dell'anno scorso fino a una settimana fa (dati definitivi), una volta al giorno
  if (m.archivioFino !== oggi) {
    try {
      const j = await scarica(`https://archive-api.open-meteo.com/v1/archive?${PUNTO}&start_date=${anno - 1}-01-01&end_date=${piu(oggi, -6)}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration`);
      unisci(giorni, j.daily, false);
      m.archivioFino = oggi;
      cambiato = true;
    } catch { /* si riprova più tardi */ }
  }
  // 3. Previsioni e ultimi giorni, ogni 3 ore
  if (!m.aggiornato || Date.now() - m.aggiornato > 3 * ORE) {
    try {
      const j = await scarica(`https://api.open-meteo.com/v1/forecast?${PUNTO}&past_days=10&forecast_days=16&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,et0_fao_evapotranspiration`);
      unisci(giorni, j.daily, true);
      m.aggiornato = Date.now();
      cambiato = true;
    } catch { /* si usa l'ultima copia */ }
  }
  // Si tiene solo dall'inizio dell'anno scorso
  for (const k of Object.keys(giorni)) if (k < `${anno - 1}-01-01`) delete giorni[k];
  m.giorni = giorni;
  if (cambiato) {
    scriviMeteo(m);
    memoria = m;
    memoriaCalore.clear();
    memoriaPrevisioni.clear();
    document.dispatchEvent(new Event('meteo-aggiornato'));
  }
  return m;
}

// giorni[data] = [massima, minima, pioggia mm, codice del tempo (solo previsioni), previsione sì/no, ET0 mm]
function unisci(giorni, d, previsione) {
  d.time.forEach((t, i) => {
    if (d.temperature_2m_max[i] == null) return;
    giorni[t] = [d.temperature_2m_max[i], d.temperature_2m_min[i], d.precipitation_sum[i] ?? 0, d.weather_code?.[i] ?? null, previsione && t > oggiVero(), d.et0_fao_evapotranspiration?.[i] ?? null];
  });
}

// Medie di ogni giorno dell'anno ('MM-GG'), lisciate su una settimana: { 'MM-GG': [massima, minima, pioggia, ET0] }
function calcolaNormali(d) {
  const somme = {};
  d.time.forEach((t, i) => {
    if (d.temperature_2m_max[i] == null) return;
    const k = t.slice(5);
    const s = somme[k] ??= [0, 0, 0, 0, 0];
    s[0] += d.temperature_2m_max[i]; s[1] += d.temperature_2m_min[i]; s[2] += d.precipitation_sum[i] ?? 0;
    s[3] += d.et0_fao_evapotranspiration?.[i] ?? 0; s[4]++;
  });
  const giorni = Array.from({ length: 366 }, (_, i) => piu('2000-01-01', i).slice(5));   // 2000 è bisestile
  const medie = giorni.map(k => somme[k] ? somme[k].slice(0, 4).map(v => v / somme[k][4]) : null);
  const normali = {};
  giorni.forEach((k, i) => {
    const vicini = [-3, -2, -1, 0, 1, 2, 3].map(o => medie[(i + o + 366) % 366]).filter(Boolean);
    normali[k] = [0, 1, 2, 3].map(q => Math.round(vicini.reduce((s, v) => s + v[q], 0) / vicini.length * 10) / 10);
  });
  return normali;
}

export function meteoPronto() {
  return !!meteo()?.normali;
}

// Meteo di una simulazione Arcade: null fuori da Arcade; dentro { giorni } con l'annata vera spostata sulle date
// della simulazione, oppure {} per usare solo le medie (mai il meteo di oggi, che nella simulazione non c'entra)
let simulato = null;
export function impostaMeteoSimulato(m) {
  if (m === simulato) return;
  simulato = m;
  memoriaPrevisioni.clear();
}

// Il tempo di un giorno: quello vero o previsto se c'è, altrimenti la media. null se il meteo non è mai stato scaricato
export function tempoDel(iso) {
  const m = meteo();
  if (!m?.normali) return null;
  const g = simulato ? simulato.giorni?.[iso] : m.giorni?.[iso];
  const n = m.normali[iso.slice(5)] ?? m.normali['02-28'];
  if (g) return { massima: g[0], minima: g[1], pioggia: g[2], codice: g[3] ?? null, previsione: !!g[4], et0: g[5] ?? n[3], media: false };
  return { massima: n[0], minima: n[1], pioggia: n[2], codice: null, previsione: false, et0: n[3], media: true };
}

export function mediaDel(iso) {
  const n = meteo()?.normali?.[iso.slice(5)];
  return n ? { massima: n[0], minima: n[1], pioggia: n[2] } : null;
}

// Gradi giorno di un giorno per una coltura: quanto la temperatura media sta sopra la sua soglia (con un tetto)
function gradiGiorno(t, calda) {
  const base = calda ? 10 : 5, tetto = calda ? 30 : 25;
  const max = Math.min(t.massima, tetto), min = Math.max(Math.min(t.minima, tetto), base);
  return Math.max(0, (Math.max(max, base) + min) / 2 - base);
}

// Primo giorno di un periodo 'MM-GG' a partire da `dopo` (AAAA-MM-GG), anche l'anno dopo
function prossimo(mmgg, dopo) {
  const anno = Number(dopo.slice(0, 4));
  const d = `${anno}-${mmgg}`;
  return d >= dopo ? d : `${anno + 1}-${mmgg}`;
}

// Inizio della raccolta secondo il calendario del catalogo, per una coltura iniziata il giorno `inizio`
function raccoltaDaCalendario(scheda, inizio) {
  return scheda.r.map(([da]) => prossimo(da, piu(inizio, 1))).sort()[0];
}

// Calore che serve a una coltura dal suo inizio alla prima raccolta, in un anno medio a Bologna:
// dal primo giorno del periodo di trapianto (o di semina) del catalogo all'inizio della sua raccolta
const memoriaCalore = new Map();
function caloreNecessario(scheda, metodo) {
  const chiave = `${scheda.id}-${metodo}`;
  if (memoriaCalore.has(chiave)) return memoriaCalore.get(chiave);
  const periodi = (metodo === 'semina' ? scheda.s : metodo === 'trapianto' ? scheda.t : null) ?? scheda.t ?? scheda.s;
  let calore = null;
  if (periodi?.length && scheda.r?.length) {
    const inizio = `2001-${periodi[0][0]}`;
    const fine = raccoltaDaCalendario(scheda, inizio);
    const calda = CALDE.has(scheda.id);
    calore = 0;
    for (let d = inizio; d < fine; d = piu(d, 1)) calore += gradiGiorno(tempoMedio(d), calda);
  }
  memoriaCalore.set(chiave, calore);
  return calore;
}

function tempoMedio(iso) {
  const n = meteo().normali[iso.slice(5)] ?? meteo().normali['02-28'];
  return { massima: n[0], minima: n[1] };
}

// Inizio della raccolta previsto con i gradi giorno: { data, calendario, scarto (giorni rispetto al calendario) }.
// Usa il caldo vero dei giorni passati, le previsioni e poi le medie. null se il meteo non c'è o la coltura non ha date
const memoriaPrevisioni = new Map();
export function raccoltaPrevista(scheda, inizio, metodo) {
  if (!scheda?.r?.length || !inizio || !meteoPronto() || ['P', 'F', 'V'].includes(scheda.tappa)) return null;
  const chiave = `${scheda.id}|${inizio}|${metodo}`;
  if (!memoriaPrevisioni.has(chiave)) memoriaPrevisioni.set(chiave, calcolaRaccolta(scheda, inizio, metodo));
  return memoriaPrevisioni.get(chiave);
}

function calcolaRaccolta(scheda, inizio, metodo) {
  const calore = caloreNecessario(scheda, metodo);
  if (!calore) return null;
  const calda = CALDE.has(scheda.id);
  let somma = 0;
  for (let d = inizio, n = 0; n < 500; d = piu(d, 1), n++) {
    somma += gradiGiorno(tempoDel(d), calda);
    if (somma >= calore) {
      const calendario = raccoltaDaCalendario(scheda, inizio);
      return { data: d, calendario, scarto: giorniTra(calendario, d) };
    }
  }
  return null;
}

// Fine della raccolta spostata come l'inizio previsto (al massimo un mese più tardi del calendario)
export function spostaFine(fineCalendario, previsione) {
  if (!previsione || !fineCalendario) return fineCalendario;
  const spostata = piu(fineCalendario, Math.min(30, previsione.scarto));
  return spostata > previsione.data ? spostata : piu(previsione.data, 14);
}

// I giorni salvati (veri e previsti), per la pagina del meteo
export function giorniMeteo() {
  return meteo()?.giorni ?? {};
}

// ---- Avvisi meteo per l'orto (le stesse regole sono nella funzione del server supabase/functions/avvisi-meteo) ----

const NOMI_GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
function quando(iso, oggi) {
  const n = giorniTra(oggi, iso);
  if (n === 0) return 'oggi';
  if (n === 1) return 'domani';
  return NOMI_GIORNI[new Date(`${iso}T12:00:00Z`).getUTCDay()];
}

// Avvisi dei prossimi giorni: [{ chiave, tipo, titolo, testo }]. colture = nomi delle colture attive nell'orto,
// delicate = nomi di quelle che temono il gelo (da caldo o appena trapiantate)
export function avvisiMeteo({ colture, delicate }) {
  if (!meteoPronto() || colture.length === 0) return [];
  const oggi = oggiVero();
  const avvisi = [];
  const prossimi = [0, 1, 2, 3].map(i => piu(oggi, i)).map(d => ({ d, t: tempoDel(d) })).filter(x => x.t && !x.t.media);
  const gelo = prossimi.find(x => x.t.minima <= 1);
  if (gelo && delicate.length) {
    avvisi.push({ chiave: `gelo-${gelo.d}`, tipo: 'gelo', titolo: `Gelata ${quando(gelo.d, oggi)}`,
      testo: `Minima prevista ${Math.round(gelo.t.minima)} °C: copri con il tessuto non tessuto (${delicate.slice(0, 4).join(', ')}${delicate.length > 4 ? '…' : ''}).` });
  }
  const caldo = prossimi.find(x => x.t.massima >= 33);
  if (caldo) {
    avvisi.push({ chiave: `caldo-${caldo.d}`, tipo: 'caldo', titolo: `Caldo forte ${quando(caldo.d, oggi)}`,
      testo: `Massima prevista ${Math.round(caldo.t.massima)} °C: annaffia la sera o al mattino presto e pacciama.` });
  }
  const pioggia = prossimi.slice(0, 2).find(x => x.t.pioggia >= 10);
  if (pioggia) {
    avvisi.push({ chiave: `pioggia-${pioggia.d}`, tipo: 'pioggia', titolo: `Pioggia ${quando(pioggia.d, oggi)}`,
      testo: `Previsti circa ${Math.round(pioggia.t.pioggia)} mm: puoi saltare l'annaffiatura.` });
  }
  const mese = Number(oggi.slice(5, 7));
  if (mese >= 4 && mese <= 9) {
    const ultimi = [1, 2, 3, 4, 5, 6, 7].map(i => tempoDel(piu(oggi, -i)));
    const asciutti = ultimi.every(t => t && !t.media) && ultimi.reduce((s, t) => s + t.pioggia, 0) < 2
      && prossimi.reduce((s, x) => s + x.t.pioggia, 0) < 2;
    if (asciutti) {
      avvisi.push({ chiave: `secco-${oggi.slice(0, 8)}${Number(oggi.slice(8)) < 15 ? 'a' : 'b'}`, tipo: 'secco', titolo: 'Niente pioggia da una settimana',
        testo: 'E non ne è prevista: controlla la terra con un dito e annaffia a fondo dove è asciutta.' });
    }
  }
  return avvisi;
}

// Colture attive dell'orto e quelle delicate (temono il gelo): da caldo, oppure iniziate da meno di 3 settimane
export function coltureAttive(dati, colturaDaNome) {
  const oggi = oggiVero();
  const attive = dati.colture.filter(c => c.stato === 'attiva' && c.dataInizio <= oggi && !c.dataFine);
  const delicate = attive.filter(c => CALDE.has(colturaDaNome(c.nome)?.id) || giorniTra(c.dataInizio, oggi) <= 21);
  return { colture: [...new Set(attive.map(c => c.nome))], delicate: [...new Set(delicate.map(c => c.nome.toLowerCase()))] };
}

// ---- Annate vere per Arcade ----

// Il meteo vero di un'annata spostato sulle date della simulazione che parte il giorno `partenza`:
// la prima estate della simulazione è l'estate di annoVero (es. partenza ottobre 2026, annata 2003: l'estate 2027
// simulata è quella del 2003). Per 4 anni e mezzo. { origine, giorni: { 'AAAA-MM-GG': [massima, minima, pioggia] } }
export async function scaricaAnnata(annoVero, partenza) {
  const annoPartenza = Number(partenza.slice(0, 4));
  const primaEstate = Number(partenza.slice(5, 7)) <= 6 ? annoPartenza : annoPartenza + 1;
  const scarto = primaEstate - annoVero;
  const da = `${annoPartenza - scarto}${partenza.slice(4)}`;
  const limite = piu(oggiVero(), -6);
  const fine = [piu(da, 4 * 365 + 120), limite].sort()[0];
  const j = await scarica(`https://archive-api.open-meteo.com/v1/archive?${PUNTO}&start_date=${da}&end_date=${fine}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration`);
  const giorni = {};
  j.daily.time.forEach((t, i) => {
    if (j.daily.temperature_2m_max[i] == null) return;
    const anno = Number(t.slice(0, 4)) + scarto;
    const mmgg = t.slice(5);
    // Il 29 febbraio esiste solo negli anni bisestili
    if (mmgg === '02-29' && !(anno % 4 === 0 && (anno % 100 !== 0 || anno % 400 === 0))) return;
    giorni[`${anno}-${mmgg}`] = [j.daily.temperature_2m_max[i], j.daily.temperature_2m_min[i], j.daily.precipitation_sum[i] ?? 0, null, false, j.daily.et0_fao_evapotranspiration?.[i] ?? null];
  });
  return { origine: annoVero, giorni };
}

// Colture da frutto che soffrono il caldo estremo mentre fioriscono e maturano
const FRUTTO = new Set(['pomodoro', 'peperone', 'melanzana', 'zucchina', 'cetriolo', 'fagiolino', 'fagiolorampicante', 'melone', 'anguria', 'zucca']);

// Effetti dell'annata (solo con il meteo vero, mai con le medie): gelata nel primo mese per le colture da caldo
// (resa −40%), giorni oltre i 35 °C durante la raccolta delle colture da frutto (−3% al giorno, al massimo −30%).
// { fattore, eventi: [{ data, testo }] }
export function effettiClima(scheda, inizio, raccolta) {
  const eventi = [];
  let fattore = 1;
  if (!scheda || !meteoPronto()) return { fattore, eventi };
  if (CALDE.has(scheda.id)) {
    for (let d = inizio, n = 0; n <= 30; d = piu(d, 1), n++) {
      const t = tempoDel(d);
      if (t && !t.media && t.minima <= 0) {
        fattore *= 0.6;
        eventi.push({ data: d, testo: `gelata (${Math.round(t.minima)} °C) poco dopo ${scheda.t ? 'il trapianto' : 'la semina'}: resa −40%` });
        break;
      }
    }
  }
  if (FRUTTO.has(scheda.id) && raccolta) {
    let caldi = 0, primo = null;
    for (let d = raccolta.dal; d < raccolta.al; d = piu(d, 1)) {
      const t = tempoDel(d);
      if (t && !t.media && t.massima >= 35) {
        caldi++;
        primo ??= d;
      }
    }
    if (caldi) {
      const f = Math.max(0.7, 1 - 0.03 * caldi);
      fattore *= f;
      eventi.push({ data: primo, testo: `${caldi} ${caldi === 1 ? 'giorno' : 'giorni'} sopra i 35 °C durante la raccolta: resa −${Math.round((1 - f) * 100)}%` });
    }
  }
  return { fattore, eventi };
}
