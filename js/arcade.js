// Arcade: riempimento automatico dell'orto simulato secondo rotazione, stagioni e preferenze.
// Solo calcoli: restituisce le colture (e le voci di registro) da aggiungere, senza salvare niente.

import { CATALOGO, colturaDaNome, disposizione, resa, AIUOLA } from './catalogo.js';

const GIRO = ['L', 'C', 'A', 'S'];
// Ordine di partenza dei settori se l'orto non ha storia (come nel piano 2026–27)
const PARTENZA = { 1: 'L', 2: 'A', 3: 'C', 4: 'S' };

// Anno dell'orto (da ottobre a settembre)
export function annoOrto(iso) {
  const [a, m] = iso.split('-').map(Number);
  return m >= 10 ? a : a - 1;
}

// Prima fine di raccolta dopo l'inizio (stima dal catalogo), come in viste.js
function fineStimata(scheda, inizio) {
  if (!scheda || scheda.tappa === 'P') return null;
  const anno = Number(inizio.slice(0, 4));
  const fine = scheda.r.flatMap(([, al]) => [`${anno}-${al}`, `${anno + 1}-${al}`]).filter(d => d > inizio).sort()[0] ?? null;
  return scheda.tappa === 'V' && fine ? fineSovescio(scheda, inizio, fine) : fine;
}

// I sovesci si tagliano all'inizio del loro periodo di taglio, dopo almeno 6 settimane di crescita
export function fineSovescio(scheda, inizio, fine) {
  const [da, al] = scheda.r.find(([, al]) => al === fine.slice(5));
  const taglio = `${da > al ? Number(fine.slice(0, 4)) - 1 : fine.slice(0, 4)}-${da}`;
  const sei = piuGiorni(inizio, 42);
  return taglio > sei ? taglio : sei;
}

// I due momenti di ogni tappa: cosa si mette in autunno e cosa in primavera-estate
const JOLLY_INVERNO = ['lattugainv', 'spinacio', 'valerianella'];
const MOMENTI = {
  L: [{ quando: 'autunno', scegli: s => s.famiglia === 'Leguminose' && (s.s ?? s.t).some(([d]) => d >= '10-01') },
      { quando: 'estate', scegli: s => s.tappa === 'L' && s.famiglia === 'Brassicacee' }],
  C: [{ quando: 'autunno', scegli: s => JOLLY_INVERNO.includes(s.id) },
      { quando: 'primavera', scegli: s => s.tappa === 'C' }],
  A: [{ quando: 'autunno', scegli: s => s.famiglia === 'Alliacee' && s.tappa === 'A' },
      { quando: 'estate', scegli: s => s.tappa === 'A' && s.famiglia !== 'Alliacee' }],
  // Prima delle solanacee l'inverno resta a compost e pacciamatura: i pomodori si trapiantano già a fine aprile
  S: [{ quando: 'primavera', scegli: s => s.tappa === 'S' }],
};
// Finestre di inizio di ogni momento nell'anno dell'orto y
function finestra(quando, y) {
  if (quando === 'autunno') return [`${y}-09-01`, `${y}-12-31`];
  if (quando === 'primavera') return [`${y + 1}-02-01`, `${y + 1}-06-15`];
  return [`${y + 1}-06-15`, `${y + 1}-09-15`];
}

// Primo giorno utile per seminare o trapiantare la coltura nella finestra (preferendo il trapianto)
function giornoDiInizio(scheda, [da, a]) {
  for (const [metodo, periodi] of [['trapianto', scheda.t], ['semina', scheda.s]]) {
    for (const [dal] of periodi ?? []) {
      for (const anno of [Number(da.slice(0, 4)), Number(da.slice(0, 4)) + 1]) {
        const d = `${anno}-${dal}`;
        if (d >= da && d <= a) return { giorno: d, metodo };
      }
    }
  }
  return null;
}

// Tappa del settore nell'anno y: dall'ultima tappa avuta nei dati, altrimenti l'ordine di partenza
function tappaDelSettore(dati, settore, y, y0) {
  let ultima = null;
  for (const c of dati.colture) {
    const s = colturaDaNome(c.nome);
    if (!s || !GIRO.includes(s.tappa)) continue;
    if (!c.aiuoleIds.some(id => dati.aiuole.find(a => a.id === id)?.settore === settore)) continue;
    const a = annoOrto(c.dataInizio);
    if (a < y && (!ultima || a > ultima.anno)) ultima = { anno: a, tappa: s.tappa };
  }
  if (ultima) return GIRO[(GIRO.indexOf(ultima.tappa) + y - ultima.anno) % 4];
  return GIRO[(GIRO.indexOf(PARTENZA[settore]) + y - y0) % 4];
}

// Colture da aggiungere dal giorno `dal` per `anni` anni dell'orto. preferenze: { preferite, escluse, obiettivo }
export function pianoAutomatico(dati, { dal, anni = 4, preferenze = {}, nuovoId }) {
  const preferite = preferenze.preferite ?? [];
  const escluse = preferenze.escluse ?? [];
  const soloPreferite = preferenze.obiettivo === 'preferite';
  const colture = [...dati.colture];
  const nuove = [], voci = [];
  const y0 = annoOrto(dal);

  // L'aiuola è libera tra inizio e fine (fine stimata della coltura nuova)?
  const libera = (id, inizio, fine) => colture.every(c => {
    if (!c.aiuoleIds.includes(id) || c.stato === 'pianificata') return true;
    const fineC = c.dataFine ?? fineStimata(colturaDaNome(c.nome), c.dataInizio) ?? '9999-12-31';
    return fineC <= inizio || c.dataInizio >= (fine ?? '9999-12-31');
  });

  for (let y = y0; y < y0 + anni; y++) {
    for (const settore of [1, 2, 3, 4]) {
      const tappa = tappaDelSettore({ ...dati, colture }, settore, y, y0);
      const aiuole = dati.aiuole.filter(a => a.settore === settore).sort((x, z) => x.posizione - z.posizione);
      for (const momento of MOMENTI[tappa]) {
        const fin = finestra(momento.quando, y);
        // Candidate: adatte al momento, non escluse; le sconsigliate solo se preferite; prima le preferite
        let candidate = CATALOGO.filter(s => momento.scegli(s) && !escluse.includes(s.id) && (!s.avviso || preferite.includes(s.id)))
          .map(s => ({ s, inizio: giornoDiInizio(s, fin) }))
          .filter(x => x.inizio && x.inizio.giorno >= dal);
        if (candidate.length === 0) continue;
        const pref = candidate.filter(x => preferite.includes(x.s.id));
        if (soloPreferite && pref.length) candidate = pref;
        else {
          // Varietà: le preferite davanti, le altre a giro secondo anno e settore
          const altre = candidate.filter(x => !preferite.includes(x.s.id));
          const giro = (y + settore) % Math.max(1, altre.length);
          candidate = [...pref, ...altre.slice(giro), ...altre.slice(0, giro)];
        }
        aiuole.forEach((a, i) => {
          const scelta = candidate[i % candidate.length];
          const { giorno, metodo } = scelta.inizio;
          const fine = fineStimata(scelta.s, giorno);
          if (!libera(a.id, giorno, fine)) return;
          const coltura = {
            id: nuovoId('c'), nome: scelta.s.nome, varieta: '', aiuoleIds: [a.id], parti: {}, dataInizio: giorno,
            metodo, metodoAltro: '', stato: 'attiva', dataFine: null, note: 'Aggiunta in automatico da Arcade', catalogoId: scelta.s.id,
          };
          colture.push(coltura);
          nuove.push(coltura);
          voci.push({ id: nuovoId('r'), data: giorno, tipo: metodo, aiuoleIds: [a.id], parti: {}, colturaId: coltura.id, quantita: '', note: '' });
        });
      }
    }
  }

  // Poi i vuoti: sovesci e fiori utili dove l'aiuola resta libera abbastanza (2 settimane di margine prima della coltura dopo)
  const aggiungi = (scheda, a, giorno) => {
    const coltura = {
      id: nuovoId('c'), nome: scheda.nome, varieta: '', aiuoleIds: [a.id], parti: {}, dataInizio: giorno,
      metodo: 'semina', metodoAltro: '', stato: 'attiva', dataFine: null, note: 'Aggiunta in automatico da Arcade', catalogoId: scheda.id,
    };
    colture.push(coltura);
    nuove.push(coltura);
    voci.push({ id: nuovoId('r'), data: giorno, tipo: 'semina', aiuoleIds: [a.id], parti: {}, colturaId: coltura.id, quantita: '', note: '' });
  };
  for (let y = y0; y < y0 + anni; y++) {
    for (const [quando, ids] of RIEMPITIVI) {
      const [da, a] = finestra(quando, y);
      const schede = ids.map(id => CATALOGO.find(s => s.id === id)).filter(s => s && !escluse.includes(s.id));
      schede.sort((x, z) => preferite.includes(z.id) - preferite.includes(x.id));
      for (const aiuola of dati.aiuole) {
        // Primo giorno utile, a passi di una settimana, in cui una delle colture ci sta
        trova: for (let g = da > dal ? da : dal; g <= a; g = piuGiorni(g, 7)) {
          for (const s of schede) {
            if (!(s.s ?? []).some(p => dentro(g, p))) continue;
            const fine = fineStimata(s, g);
            if (fine && libera(aiuola.id, g, piuGiorni(fine, 14))) {
              aggiungi(s, aiuola, g);
              break trova;
            }
          }
        }
      }
    }
  }
  return { colture: nuove, registro: voci };
}

// Sovesci e fiori utili per i vuoti: d'inverno il miscuglio da sovescio, in primavera i fiori, d'estate il sovescio veloce
const RIEMPITIVI = [
  ['autunno', ['favino', 'veccia', 'avena']],
  ['primavera', ['facelia', 'calendula', 'borragine', 'alisso']],
  ['estate', ['saraceno', 'facelia']],
];

function piuGiorni(iso, n) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Il giorno cade nel periodo ['MM-GG', 'MM-GG'] (anche a cavallo di capodanno)?
function dentro(g, [dal, al]) {
  const md = g.slice(5);
  return dal <= al ? md >= dal && md <= al : md >= dal || md <= al;
}

// ---- Raccolto: kg stimati dal catalogo, raccolti un po' alla volta nel periodo di raccolta ----

const giorniTra = (da, a) => (Date.parse(a) - Date.parse(da)) / 86400000;

// Resa della coltura nelle sue aiuole/metà e periodi di raccolta (il primo dopo l'inizio; le perenni ogni anno).
// null se il catalogo non dà la resa (fiori, sovesci, aromatiche…)
export function resaColtura(c) {
  const scheda = colturaDaNome(c.nome);
  if (!scheda?.r) return null;
  let kg = [0, 0];
  for (const id of c.aiuoleIds) {
    const parte = c.parti?.[id];
    const misura = !parte ? AIUOLA : ['fondo', 'davanti'].includes(parte) ? { L: AIUOLA.L, W: AIUOLA.W / 2 } : { L: AIUOLA.L / 2, W: AIUOLA.W };
    const r = resa(scheda, disposizione(scheda, misura.L, misura.W));
    if (!r) return null;
    kg = [kg[0] + r[0], kg[1] + r[1]];
  }
  if (kg[1] === 0) return null;
  const anno = Number(c.dataInizio.slice(0, 4));
  let periodi = [];
  for (let y = anno; y <= anno + (scheda.tappa === 'P' ? 6 : 1); y++) {
    for (const [da, al] of scheda.r) {
      const fine = `${y}-${al}`;
      const inizio = da > al ? `${y - 1}-${da}` : `${y}-${da}`;
      if (fine > c.dataInizio) periodi.push({ dal: inizio > c.dataInizio ? inizio : c.dataInizio, al: fine });
    }
  }
  periodi.sort((x, z) => x.al.localeCompare(z.al));
  if (scheda.tappa !== 'P') periodi = periodi.slice(0, 1);
  // Coltura terminata prima: la raccolta si ferma alla data di fine
  periodi = periodi.filter(p => !c.dataFine || p.dal < c.dataFine)
    .map(p => ({ ...p, stop: c.dataFine && c.dataFine < p.al ? c.dataFine : p.al }));
  return periodi.length ? { coltura: c, scheda, kg, periodi } : null;
}

// kg [min, max] raccolti tra i giorni da (compreso) e a (escluso)
export function kgTra(info, da, a) {
  let parte = 0;
  for (const p of info.periodi) {
    const x = da > p.dal ? da : p.dal;
    const y = a < p.stop ? a : p.stop;
    if (y > x) parte += giorniTra(x, y) / Math.max(1, giorniTra(p.dal, p.al));
  }
  return [info.kg[0] * parte, info.kg[1] * parte];
}

// La coltura è in raccolta nel giorno g?
export function inRaccolta(info, g) {
  return info.periodi.some(p => p.dal <= g && g < p.stop);
}
