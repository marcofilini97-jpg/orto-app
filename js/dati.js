// Unico file che sa dove e come sono salvati i dati: sul telefono (localStorage) e,
// se collegato, su Supabase (tramite server.js). Le schermate usano solo carica() e salva().

import { collegato, emailCollegata, accedi, esci, scaricaNovita, inviaModifiche, mieiOrti, creaOrto, rinominaOrtoServer,
  personeOrto, aggiungiPersona, cambiaRuolo, togliPersona, eliminaOrtoServer } from './server.js';
export { iscriviti, recuperaPassword, cambiaPassword, accessoDaLink, personeOrto, aggiungiPersona, cambiaRuolo, togliPersona } from './server.js';

const CHIAVE = 'orto-dati';
const CHIAVE_PROVA = 'orto-dati-prova';      // copia separata per la modalità prova
const CHIAVE_MODO = 'orto-modo-prova';       // '1' se la modalità prova è attiva
const CHIAVE_SYNC = 'orto-sync';             // stato della sincronizzazione
const CHIAVE_ARCADE = 'orto-arcade';         // simulazioni Arcade (solo su questo telefono)
const CHIAVE_ARCADE_ATTIVA = 'orto-arcade-attiva';   // id della simulazione in cui si sta giocando
const CHIAVE_SVILUPPATORE = 'orto-sviluppatore';   // '1' su questo telefono chi sviluppa l'app vede la modalità prova
const CHIAVE_ELENCO_ORTI = 'orto-elenco-orti';  // ultimo elenco degli orti dell'account (per vederlo anche offline)
// Gli altri orti dell'account restano da parte sul telefono: 'orto-dati:<id>' e 'orto-sync:<id>'
const DA_PARTE_DATI = 'orto-dati:';
const DA_PARTE_SYNC = 'orto-sync:';
const VERSIONE = 1;

// L'orto di partenza (8 aiuole da 180 × 120 cm, 4 per lato di un vialetto centrale), con le misure in cm.
// x e y sono il centro di ogni aiuola: x da sinistra a destra, y dal fondo (in alto) al davanti
const AIUOLE = [
  { id: '1A', settore: 1, x: 90, y: 60 },
  { id: '1B', settore: 1, x: 90, y: 190 },
  { id: '3A', settore: 3, x: 90, y: 330 },
  { id: '3B', settore: 3, x: 90, y: 460 },
  { id: '2A', settore: 2, x: 300, y: 60 },
  { id: '2B', settore: 2, x: 300, y: 190 },
  { id: '4A', settore: 4, x: 300, y: 330 },
  { id: '4B', settore: 4, x: 300, y: 460 },
].map(a => ({ ...a, nome: a.id, forma: 'rettangolo', w: 180, h: 120, rot: 0 }));
const TERRENO = { id: 'terreno', larghezza: 390, lunghezza: 520, staccionata: true, esposizione: null };
const VIALETTI = [{ id: 'vialetto', x: 195, y: 260, w: 30, h: 520, rot: 0 }];
// Nell'orto di partenza le metà "vialetto" ed "esterno" (nomi di prima) diventano sinistra e destra
const LATO_VIALETTO = { '1A': 'destra', '1B': 'destra', '3A': 'destra', '3B': 'destra', '2A': 'sinistra', '2B': 'sinistra', '4A': 'sinistra', '4B': 'sinistra' };

// Gruppi dei dati e nome del "tipo" sul server
const TIPO = { aiuole: 'aiuola', colture: 'coltura', registro: 'registro', task: 'task', terreno: 'terreno', vialetti: 'vialetto', alberi: 'albero' };
const GRUPPO = Object.fromEntries(Object.entries(TIPO).map(([g, t]) => [t, g]));

function vuoti() {
  return Object.fromEntries(Object.keys(TIPO).map(g => [g, []]));
}

function datiIniziali() {
  return {
    ...vuoti(),
    versione: VERSIONE,
    aiuole: AIUOLE.map(a => ({ ...a, note: '' })),
    terreno: [{ ...TERRENO }],
    vialetti: VIALETTI.map(v => ({ ...v })),
  };
}

// Porta i dati salvati con versioni precedenti dell'app alla forma di adesso (senza salvarli):
// gruppi mancanti, misure e forma delle aiuole dell'orto di partenza, metà vialetto/esterno → sinistra/destra
export function normalizza(dati) {
  for (const g of Object.keys(TIPO)) dati[g] ??= [];
  const partenza = new Map(AIUOLE.map(a => [a.id, a]));
  for (const a of dati.aiuole) {
    if (a.forma) continue;
    const base = partenza.get(a.id) ?? { nome: a.id, forma: 'rettangolo', w: 180, h: 120, rot: 0, x: 90, y: 60 };
    Object.assign(a, { nome: a.nome ?? base.nome, forma: base.forma, x: base.x, y: base.y, w: base.w, h: base.h, rot: base.rot });
    a.settore ??= base.settore ?? 1;
  }
  // Esposizione: prima una lettera (N, E, S, O), ora i gradi verso cui guarda il fondo
  for (const t of dati.terreno) {
    if (typeof t.esposizione === 'string') t.esposizione = { N: 0, E: 90, S: 180, O: 270 }[t.esposizione] ?? null;
  }
  if (dati.terreno.length === 0) {
    dati.terreno.push({ ...TERRENO });
    if (dati.vialetti.length === 0 && dati.aiuole.every(a => partenza.has(a.id))) dati.vialetti.push(...VIALETTI.map(v => ({ ...v })));
  }
  for (const x of [...dati.colture, ...dati.registro, ...dati.task]) {
    for (const [id, parte] of Object.entries(x.parti ?? {})) {
      if (parte !== 'vialetto' && parte !== 'esterno') continue;
      const versoVialetto = LATO_VIALETTO[id] ?? 'destra';
      x.parti[id] = parte === 'vialetto' ? versoVialetto : versoVialetto === 'destra' ? 'sinistra' : 'destra';
    }
  }
  return dati;
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
  const sim = simulazioneAttiva();
  if (sim) return normalizza(structuredClone(sim.dati));
  return normalizza(leggiDa(inProva() ? CHIAVE_PROVA : CHIAVE));
}

// I dati veri (anche dentro Arcade, per copiarli in una simulazione)
export function caricaReali() {
  return normalizza(leggiDa(CHIAVE));
}

// All'avvio: se i dati salvati sono di una versione precedente, li aggiorna e li salva (così vanno anche sul server)
export function aggiornaDatiSalvati() {
  const prima = leggiDa(CHIAVE);
  const dopo = normalizza(structuredClone(prima));
  if (JSON.stringify(prima) !== JSON.stringify(dopo) && !soloLettura()) {
    registraModifiche(prima, dopo);
    localStorage.setItem(CHIAVE, JSON.stringify(dopo));
    programmaSincronizzazione();
  }
  const prova = localStorage.getItem(CHIAVE_PROVA);
  if (prova) localStorage.setItem(CHIAVE_PROVA, JSON.stringify(normalizza(JSON.parse(prova))));
}

export function salva(dati) {
  const sim = simulazioneAttiva();
  if (sim) {
    sim.dati = dati;
    salvaSimulazione(sim);
    return;
  }
  if (inProva()) {
    localStorage.setItem(CHIAVE_PROVA, JSON.stringify(dati));
    return;
  }
  if (soloLettura()) throw new Error(MESSAGGIO_SOLA_LETTURA);
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

export function sviluppatore() {
  return localStorage.getItem(CHIAVE_SVILUPPATORE) === '1';
}

// Accende o spegne gli strumenti per chi sviluppa (modalità prova) su questo telefono
export function cambiaSviluppatore() {
  if (sviluppatore()) localStorage.removeItem(CHIAVE_SVILUPPATORE);
  else localStorage.setItem(CHIAVE_SVILUPPATORE, '1');
  return sviluppatore();
}

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

// ---- Arcade: simulazioni salvate solo su questo telefono, mai sincronizzate ----
// Ogni simulazione: { id, nome, creata, parametri, dati, giorno }. Dentro Arcade carica() e salva()
// usano i dati della simulazione e oggi() è il giorno scelto con la barra del tempo.

export function elencoSimulazioni() {
  try {
    return JSON.parse(localStorage.getItem(CHIAVE_ARCADE)) ?? [];
  } catch {
    return [];
  }
}

export function leggiSimulazione(id) {
  return elencoSimulazioni().find(s => s.id === id) ?? null;
}

export function salvaSimulazione(sim) {
  const tutte = elencoSimulazioni().filter(s => s.id !== sim.id);
  tutte.unshift(sim);
  localStorage.setItem(CHIAVE_ARCADE, JSON.stringify(tutte));
}

export function eliminaSimulazione(id) {
  localStorage.setItem(CHIAVE_ARCADE, JSON.stringify(elencoSimulazioni().filter(s => s.id !== id)));
  if (localStorage.getItem(CHIAVE_ARCADE_ATTIVA) === id) esciArcade();
}

export function entraArcade(id) {
  localStorage.setItem(CHIAVE_ARCADE_ATTIVA, id);
}

export function esciArcade() {
  localStorage.removeItem(CHIAVE_ARCADE_ATTIVA);
}

export function simulazioneAttiva() {
  const id = localStorage.getItem(CHIAVE_ARCADE_ATTIVA);
  return id ? leggiSimulazione(id) : null;
}

export function inArcade() {
  return simulazioneAttiva() !== null;
}

export function impostaGiornoArcade(giorno) {
  const sim = simulazioneAttiva();
  if (!sim) return;
  sim.giorno = giorno;
  salvaSimulazione(sim);
}

// Dati di partenza di una simulazione: orto vuoto oppure l'orto vero com'era il giorno `dal`
export function datiPerSimulazione({ partenza, dal, terreno }) {
  // La simulazione ha la stessa forma dell'orto vero (aiuole, vialetti, alberi); il terreno vero solo se scelto
  const reali = normalizza(leggiDa(CHIAVE));
  const dati = datiIniziali();
  dati.aiuole = reali.aiuole.map(a => {
    const copia = { ...structuredClone(a), note: '' };
    if (terreno !== 'reale') delete copia.suolo;
    return copia;
  });
  for (const g of ['terreno', 'vialetti', 'alberi']) dati[g] = structuredClone(reali[g]);
  if (partenza === 'reale') {
    dati.colture = reali.colture.filter(c => c.dataInizio <= dal && c.stato !== 'pianificata').map(c => {
      const copia = structuredClone(c);
      if (copia.dataFine && copia.dataFine > dal) Object.assign(copia, { stato: 'attiva', dataFine: null });
      return copia;
    });
    dati.registro = reali.registro.filter(v => v.data <= dal).map(v => structuredClone(v));
  }
  return dati;
}

// Il primo giorno dell'orto vero: la prima coltura o voce di registro (null se è vuoto)
export function inizioOrtoReale() {
  const reali = leggiDa(CHIAVE);
  return [...reali.colture.map(c => c.dataInizio), ...reali.registro.map(v => v.data)].filter(Boolean).sort()[0] ?? null;
}

// ---- Sincronizzazione ----
// Ogni aiuola, coltura, voce e task ha l'ora dell'ultima modifica (orari). Le modifiche fatte
// sul telefono aspettano in daInviare finché il server non le riceve. Vince la modifica più recente.

function nuovoStato() {
  return { orari: {}, daInviare: {}, ultimoRicevuto: null, ultimaSync: null, errore: null, orto: null };
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
    const vecchi = new Map((prima[gruppo] ?? []).map(e => [e.id, e]));
    for (const elemento of dopo[gruppo] ?? []) {
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

// L'orto del server a cui è legato il telefono ({ id, nome, ruolo }). Se non c'è ancora (telefoni collegati
// prima che esistessero più orti, o account nuovi) prende il primo orto dell'account, o ne crea uno
async function ortoCollegato() {
  const stato = statoSync();
  if (stato.orto) {
    // Nome e ruolo possono essere cambiati dal gestore: si aggiornano a ogni sincronizzazione
    const orti = await aggiornaElencoOrti();
    const qui = orti.find(o => o.id === stato.orto.id);
    if (!qui) throw new Error('Non fai più parte di questo orto: scegline un altro in "I miei orti".');
    if (qui.nome !== stato.orto.nome || qui.ruolo !== stato.orto.ruolo) {
      const aggiornato = statoSync();
      aggiornato.orto = qui;
      scriviStato(aggiornato);
      document.dispatchEvent(new Event('dati-sincronizzati'));
    }
    return qui;
  }
  let orti = await aggiornaElencoOrti();
  if (orti.length === 0) {
    await creaOrto('Il mio orto');
    orti = await aggiornaElencoOrti();
  }
  const orto = orti[0];
  const aggiornato = statoSync();
  aggiornato.orto = orto;
  scriviStato(aggiornato);
  return orto;
}

async function aggiornaElencoOrti() {
  const orti = await mieiOrti();
  localStorage.setItem(CHIAVE_ELENCO_ORTI, JSON.stringify(orti));
  return orti;
}

// ---- Più orti sul telefono ----

// L'orto a cui è legato il telefono ({ id, nome, ruolo }), oppure null senza account
export function ortoAttuale() {
  return collegato() ? statoSync().orto : null;
}

// Gli orti dell'account: dal server se c'è rete, altrimenti l'ultimo elenco salvato
export async function elencoOrti() {
  try {
    return await aggiornaElencoOrti();
  } catch {
    try {
      return JSON.parse(localStorage.getItem(CHIAVE_ELENCO_ORTI)) ?? [];
    } catch {
      return [];
    }
  }
}

// Passa a un altro orto dell'account: quello attuale resta da parte sul telefono, quello nuovo
// si riprende da parte (se c'era) oppure si scarica tutto dal server
export async function cambiaOrto(orto) {
  await sincronizza();                 // prima si prova a inviare le modifiche dell'orto attuale
  const attuale = statoSync().orto;
  if (attuale?.id === orto.id) return;
  if (attuale) {
    localStorage.setItem(DA_PARTE_DATI + attuale.id, localStorage.getItem(CHIAVE) ?? JSON.stringify(datiIniziali()));
    localStorage.setItem(DA_PARTE_SYNC + attuale.id, localStorage.getItem(CHIAVE_SYNC) ?? JSON.stringify(nuovoStato()));
  }
  await apriOrto(orto);
}

// Apre un orto: dalla copia messa da parte, se c'è, altrimenti scaricandolo tutto dal server
async function apriOrto(orto) {
  const dati = localStorage.getItem(DA_PARTE_DATI + orto.id);
  const stato = localStorage.getItem(DA_PARTE_SYNC + orto.id);
  if (dati && stato) {
    localStorage.setItem(CHIAVE, dati);
    localStorage.setItem(CHIAVE_SYNC, stato);
  } else {
    localStorage.setItem(CHIAVE, JSON.stringify(datiIniziali()));
    scriviStato({ ...nuovoStato(), orto });
  }
  localStorage.removeItem(DA_PARTE_DATI + orto.id);
  localStorage.removeItem(DA_PARTE_SYNC + orto.id);
  await sincronizza();
}

// Nuovo orto dell'account (chi lo crea ne è il gestore): il telefono passa subito a lui
export async function nuovoOrto(nome) {
  const id = await creaOrto(nome);
  const orto = (await aggiornaElencoOrti()).find(o => o.id === id);
  await cambiaOrto(orto);
  // Le aiuole di partenza vanno anche sul server
  registraModifiche(vuoti(), leggiDa(CHIAVE));
  await sincronizza();
}

// Dopo aver eliminato l'orto in uso o esserne usciti: i suoi dati spariscono dal telefono e si apre
// il primo altro orto dell'account; se non ce ne sono, se ne crea uno nuovo
async function dimenticaOrtoAttuale() {
  const orti = await aggiornaElencoOrti();
  localStorage.setItem(CHIAVE, JSON.stringify(datiIniziali()));
  scriviStato(nuovoStato());
  if (orti.length > 0) {
    await apriOrto(orti[0]);
    return;
  }
  await sincronizza();
  registraModifiche(vuoti(), leggiDa(CHIAVE));
  await sincronizza();
}

export async function eliminaOrto() {
  await eliminaOrtoServer(statoSync().orto.id);
  await dimenticaOrtoAttuale();
}

export async function esciDallOrto() {
  await togliPersona(statoSync().orto.id, emailCollegata().toLowerCase());
  await dimenticaOrtoAttuale();
}

// In sola lettura (ruolo "lettore" nell'orto in uso) non si salva niente; prova e Arcade restano liberi
export const MESSAGGIO_SOLA_LETTURA = 'Sei in sola lettura: puoi guardare questo orto, non modificarlo.';
export function soloLettura() {
  return !inProva() && !simulazioneAttiva() && collegato() && statoSync().orto?.ruolo === 'lettore';
}

export async function rinominaOrto(nome) {
  const stato = statoSync();
  await rinominaOrtoServer(stato.orto.id, nome);
  stato.orto = { ...stato.orto, nome };
  scriviStato(stato);
  await aggiornaElencoOrti();
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
    const orto = await ortoCollegato();
    // 1. Scarica ciò che il server ha ricevuto dall'ultima volta
    const righe = await scaricaNovita(orto.id, statoSync().ultimoRicevuto);
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

    // 2. Invia le modifiche in attesa (chi è in sola lettura non invia niente)
    const daInviare = orto.ruolo === 'lettore' ? [] : Object.values(stato.daInviare);
    if (daInviare.length > 0) await inviaModifiche(orto.id, daInviare);
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
  await completaCollegamento(chiediSostituzione);
}

// Dopo l'accesso (con la password o dal link di conferma dell'email): sceglie l'orto e allinea i dati
export async function completaCollegamento(chiediSostituzione) {
  scriviStato(nuovoStato());
  const orto = await ortoCollegato();
  const righe = await scaricaNovita(orto.id, null);
  const stato = nuovoStato();
  stato.orto = orto;
  if (righe.length > 0 && chiediSostituzione()) {
    const dati = { ...vuoti(), versione: VERSIONE };
    for (const riga of righe) {
      applica(dati, riga);
      stato.orari[riga.id] = riga.modificato;
    }
    if (dati.aiuole.length === 0) Object.assign(dati, { aiuole: datiIniziali().aiuole, vialetti: datiIniziali().vialetti });
    stato.ultimoRicevuto = righe.at(-1).ricevuto;
    localStorage.setItem(CHIAVE, JSON.stringify(dati));
    scriviStato(stato);
  } else {
    // Tutto ciò che c'è sul telefono va inviato; poi la sincronizzazione unisce i due lati
    scriviStato(stato);
    registraModifiche(vuoti(), leggiDa(CHIAVE));
  }
  await sincronizza();
}

// Scollega il telefono: i dati restano sul telefono, ma non si sincronizzano più
export function scollegaTelefono() {
  esci();
  localStorage.removeItem(CHIAVE_SYNC);
  localStorage.removeItem(CHIAVE_ELENCO_ORTI);
  for (const chiave of Object.keys(localStorage)) {
    if (chiave.startsWith(DA_PARTE_DATI) || chiave.startsWith(DA_PARTE_SYNC)) localStorage.removeItem(chiave);
  }
}

// Cancella tutto ciò che l'app ha salvato su questo telefono (i dati sul server restano)
export function cancellaDatiTelefono() {
  scollegaTelefono();
  for (const chiave of [CHIAVE, CHIAVE_PROVA, CHIAVE_MODO, CHIAVE_ARCADE, CHIAVE_ARCADE_ATTIVA]) localStorage.removeItem(chiave);
}

export function statoSincronizzazione() {
  const stato = statoSync();
  return {
    collegato: collegato(),
    email: emailCollegata(),
    orto: stato.orto,
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

export function oggi() {                      // data di oggi in AAAA-MM-GG (dentro Arcade: il giorno della simulazione)
  return simulazioneAttiva()?.giorno ?? aIso(new Date());
}

export function oggiVero() {                  // la data di oggi anche dentro Arcade
  return aIso(new Date());
}

export function domani() {                    // data di domani in AAAA-MM-GG
  const d = new Date(oggi());
  d.setDate(d.getDate() + 1);
  return aIso(d);
}

export function orarioPerUtente(istante) {    // ora completa → '06/10/2026 18:05'
  const d = new Date(istante);
  return `${dataPerUtente(aIso(d))} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
