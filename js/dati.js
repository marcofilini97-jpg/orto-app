// Unico file che sa dove e come sono salvati i dati.
// Se in futuro i dati andranno su un server (es. il NAS), si cambia solo qui.

const CHIAVE = 'orto-dati';
const VERSIONE = 1;

const AIUOLE = [
  { id: '1A', settore: 1, lato: 'sinistra', posizione: 1 },
  { id: '1B', settore: 1, lato: 'sinistra', posizione: 2 },
  { id: '3A', settore: 3, lato: 'sinistra', posizione: 3 },
  { id: '3B', settore: 3, lato: 'sinistra', posizione: 4 },
  { id: '2A', settore: 2, lato: 'destra', posizione: 1 },
  { id: '2B', settore: 2, lato: 'destra', posizione: 2 },
  { id: '4A', settore: 4, lato: 'destra', posizione: 3 },
  { id: '4B', settore: 4, lato: 'destra', posizione: 4 },
];

function datiIniziali() {
  return {
    versione: VERSIONE,
    aiuole: AIUOLE.map(a => ({ ...a, note: '' })),
    colture: [],
    registro: [],
    task: [],
  };
}

export function carica() {
  const testo = localStorage.getItem(CHIAVE);
  if (testo === null) return datiIniziali();
  try {
    return JSON.parse(testo);
  } catch {
    throw new Error('I dati salvati sono danneggiati. Ripristina un backup.');
  }
}

export function salva(dati) {
  localStorage.setItem(CHIAVE, JSON.stringify(dati));
}

export function esporta(dati) {
  return JSON.stringify(dati, null, 2);
}

export function importa(testo) {
  let dati;
  try {
    dati = JSON.parse(testo);
  } catch {
    throw new Error('Il file non è un backup valido.');
  }
  if (dati.versione !== VERSIONE ||
      !['aiuole', 'colture', 'registro', 'task'].every(k => Array.isArray(dati[k]))) {
    throw new Error('Il file non è un backup valido.');
  }
  return dati;
}

export function nuovoId(prefisso) {
  return `${prefisso}-${crypto.randomUUID()}`;
}

// Date: l'utente vede gg/mm/aaaa, i dati contengono AAAA-MM-GG.
// Ogni conversione passa da queste funzioni.

export function dataPerUtente(iso) {          // '2026-06-12' → '12/06/2026'
  if (!iso) return '';
  const [a, m, g] = iso.split('-');
  return `${g}/${m}/${a}`;
}

export function dataPerArchivio(testo) {      // '12/06/2026' → '2026-06-12'
  const parti = testo.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!parti) return null;
  const [, g, m, a] = parti.map(Number);
  const d = new Date(a, m - 1, g);
  if (d.getMonth() !== m - 1 || d.getDate() !== g) return null;  // es. 31/02
  return `${a}-${String(m).padStart(2, '0')}-${String(g).padStart(2, '0')}`;
}

function aIso(d) {                            // oggetto data → 'AAAA-MM-GG'
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function oggi() {                      // data di oggi in AAAA-MM-GG
  return aIso(new Date());
}

export function domani() {                    // data di domani in AAAA-MM-GG
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return aIso(d);
}
