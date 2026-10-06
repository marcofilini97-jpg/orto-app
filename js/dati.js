// Unico file che sa dove e come sono salvati i dati: sul telefono (localStorage) e,
// se collegato, su Supabase (tramite server.js). Le schermate usano solo carica() e salva().

import { collegato, emailCollegata, accedi, esci, scaricaNovita, inviaModifiche } from './server.js';

const CHIAVE = 'orto-dati';
const CHIAVE_PROVA = 'orto-dati-prova';      // copia separata per la modalità prova
const CHIAVE_MODO = 'orto-modo-prova';       // '1' se la modalità prova è attiva
const CHIAVE_SYNC = 'orto-sync';             // stato della sincronizzazione
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

// Gruppi dei dati e nome del "tipo" sul server
const TIPO = { aiuole: 'aiuola', colture: 'coltura', registro: 'registro', task: 'task' };
const GRUPPO = { aiuola: 'aiuole', coltura: 'colture', registro: 'registro', task: 'task' };

function datiIniziali() {
  return {
    versione: VERSIONE,
    aiuole: AIUOLE.map(a => ({ ...a, note: '' })),
    colture: [],
    registro: [],
    task: [],
  };
}

function leggiDa(chiave) {
  const testo = localStorage.getItem(chiave);
  if (testo === null) return datiIniziali();
  try {
    return JSON.parse(testo);
  } catch {
    throw new Error('I dati salvati sono danneggiati. Ripristina un backup.');
  }
}

export function carica() {
  return leggiDa(inProva() ? CHIAVE_PROVA : CHIAVE);
}

export function salva(dati) {
  if (inProva()) {
    localStorage.setItem(CHIAVE_PROVA, JSON.stringify(dati));
    return;
  }
  registraModifiche(leggiDa(CHIAVE), dati);
  localStorage.setItem(CHIAVE, JSON.stringify(dati));
  programmaSincronizzazione();
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

// ---- Modalità prova: una copia separata dei dati, che non si sincronizza ----

export function inProva() {
  return localStorage.getItem(CHIAVE_MODO) === '1';
}

export function attivaProva() {
  if (localStorage.getItem(CHIAVE_PROVA) === null) ricominciaProva();
  localStorage.setItem(CHIAVE_MODO, '1');
}

export function disattivaProva() {
  localStorage.removeItem(CHIAVE_MODO);
  sincronizza();
}

// La copia di prova riparte dai dati veri
export function ricominciaProva() {
  localStorage.setItem(CHIAVE_PROVA, localStorage.getItem(CHIAVE) ?? JSON.stringify(datiIniziali()));
}

// ---- Sincronizzazione ----
// Ogni aiuola, coltura, voce e task ha l'ora dell'ultima modifica (orari). Le modifiche fatte
// sul telefono aspettano in daInviare finché il server non le riceve. Vince la modifica più recente.

function nuovoStato() {
  return { orari: {}, daInviare: {}, ultimoRicevuto: null, ultimaSync: null, errore: null };
}

function statoSync() {
  try {
    return JSON.parse(localStorage.getItem(CHIAVE_SYNC)) ?? nuovoStato();
  } catch {
    return nuovoStato();
  }
}

function scriviStato(stato) {
  localStorage.setItem(CHIAVE_SYNC, JSON.stringify(stato));
}

function tempo(testo) {
  return new Date(testo).getTime();
}

// Confronta i dati prima e dopo un salvataggio e mette in daInviare ciò che è cambiato o sparito
function registraModifiche(prima, dopo) {
  const ora = new Date().toISOString();
  const stato = statoSync();
  const segna = (gruppo, elemento, eliminato) => {
    stato.orari[elemento.id] = ora;
    stato.daInviare[elemento.id] = { id: elemento.id, tipo: TIPO[gruppo], dati: elemento, modificato: ora, eliminato };
  };
  for (const gruppo of Object.keys(TIPO)) {
    const vecchi = new Map(prima[gruppo].map(e => [e.id, e]));
    for (const elemento of dopo[gruppo]) {
      const vecchio = vecchi.get(elemento.id);
      if (!vecchio || JSON.stringify(vecchio) !== JSON.stringify(elemento)) segna(gruppo, elemento, false);
      vecchi.delete(elemento.id);
    }
    for (const vecchio of vecchi.values()) segna(gruppo, vecchio, true);
  }
  scriviStato(stato);
}

// Applica una riga del server ai dati del telefono
function applica(dati, riga) {
  const lista = dati[GRUPPO[riga.tipo]];
  const i = lista.findIndex(e => e.id === riga.id);
  if (riga.eliminato) {
    if (i >= 0) lista.splice(i, 1);
  } else if (i >= 0) {
    lista[i] = riga.dati;
  } else {
    lista.push(riga.dati);
  }
}

let attesa = null;
function programmaSincronizzazione() {
  clearTimeout(attesa);
  attesa = setTimeout(sincronizza, 2000);
}

let inCorso = null;
// Scarica le novità e invia le modifiche. Se è già in corso, non ne parte una seconda
export function sincronizza() {
  if (!inCorso) inCorso = eseguiSincronizzazione().finally(() => { inCorso = null; });
  return inCorso;
}

async function eseguiSincronizzazione() {
  if (inProva() || !collegato()) return;
  try {
    // 1. Scarica ciò che il server ha ricevuto dall'ultima volta
    const righe = await scaricaNovita(statoSync().ultimoRicevuto);
    const stato = statoSync();          // riletto: nel frattempo potrebbero esserci stati salvataggi
    const dati = leggiDa(CHIAVE);
    let arrivato = false;
    for (const riga of righe) {
      const locale = stato.orari[riga.id];
      if (!locale || tempo(riga.modificato) > tempo(locale)) {
        applica(dati, riga);
        stato.orari[riga.id] = riga.modificato;
        delete stato.daInviare[riga.id];
        arrivato = true;
      }
      if (!stato.ultimoRicevuto || tempo(riga.ricevuto) > tempo(stato.ultimoRicevuto)) stato.ultimoRicevuto = riga.ricevuto;
    }
    if (arrivato) localStorage.setItem(CHIAVE, JSON.stringify(dati));
    scriviStato(stato);

    // 2. Invia le modifiche in attesa
    const daInviare = Object.values(stato.daInviare);
    if (daInviare.length > 0) await inviaModifiche(daInviare);
    const dopo = statoSync();
    for (const r of daInviare) {
      if (dopo.daInviare[r.id]?.modificato === r.modificato) delete dopo.daInviare[r.id];
    }
    dopo.ultimaSync = new Date().toISOString();
    dopo.errore = null;
    scriviStato(dopo);
    if (arrivato) document.dispatchEvent(new Event('dati-sincronizzati'));
  } catch (errore) {
    const stato = statoSync();
    stato.errore = errore instanceof TypeError ? 'Server non raggiungibile (niente rete o progetto in pausa).' : errore.message;
    scriviStato(stato);
  }
}

// Primo collegamento di questo telefono. chiediSostituzione() viene chiamata solo se
// sul server ci sono già dati: true = prendi i dati del server, false = unisci quelli del telefono
export async function collegaTelefono(email, password, chiediSostituzione) {
  await accedi(email, password);
  const righe = await scaricaNovita(null);
  const stato = nuovoStato();
  if (righe.length > 0 && chiediSostituzione()) {
    const dati = { versione: VERSIONE, aiuole: [], colture: [], registro: [], task: [] };
    for (const riga of righe) {
      applica(dati, riga);
      stato.orari[riga.id] = riga.modificato;
    }
    if (dati.aiuole.length === 0) dati.aiuole = datiIniziali().aiuole;
    stato.ultimoRicevuto = righe.at(-1).ricevuto;
    localStorage.setItem(CHIAVE, JSON.stringify(dati));
    scriviStato(stato);
  } else {
    // Tutto ciò che c'è sul telefono va inviato; poi la sincronizzazione unisce i due lati
    scriviStato(stato);
    registraModifiche({ aiuole: [], colture: [], registro: [], task: [] }, leggiDa(CHIAVE));
  }
  await sincronizza();
}

// Scollega il telefono: i dati restano sul telefono, ma non si sincronizzano più
export function scollegaTelefono() {
  esci();
  localStorage.removeItem(CHIAVE_SYNC);
}

export function statoSincronizzazione() {
  const stato = statoSync();
  return {
    collegato: collegato(),
    email: emailCollegata(),
    ultimaSync: stato.ultimaSync,
    errore: stato.errore,
    inAttesa: Object.keys(stato.daInviare).length,
  };
}

// ---- Date: l'utente vede gg/mm/aaaa, i dati contengono AAAA-MM-GG.
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

export function orarioPerUtente(istante) {    // ora completa → '06/10/2026 18:05'
  const d = new Date(istante);
  return `${dataPerUtente(aIso(d))} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
