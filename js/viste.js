// Funzioni che costruiscono le schermate. Ricevono i dati e restituiscono elementi da mostrare.

import {
  carica, salva, esporta, importa, oggi, domani, nuovoId, dataPerUtente, dataPerArchivio, orarioPerUtente,
  inProva, attivaProva, disattivaProva, ricominciaProva,
  sincronizza, collegaTelefono, scollegaTelefono, statoSincronizzazione, cancellaDatiTelefono,
} from './dati.js';
import { iconaSvg } from './disegni.js';
import { colturaDaNome, disposizione, resa, AIUOLA, TAPPE } from './catalogo.js';

const TIPI = {
  semina: 'Semina', trapianto: 'Trapianto', irrigazione: 'Irrigazione',
  concimazione: 'Concimazione', trattamento: 'Trattamento',
  diserbo: 'Diserbo/pulizia', lavorazione: 'Zappatura/lavorazione del terreno',
  raccolto: 'Raccolto', nota: 'Nota',
};

// Nome dell'attività mostrato nel registro: le voci "Altro" hanno il testo scritto in attivita
function testoTipo(voce) {
  return voce.tipo === 'nota' && voce.attivita ? `Nota personalizzata: ${voce.attivita}` : TIPI[voce.tipo];
}

// Icone di Feather Icons (licenza MIT)
const ICONE = {
  registro: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  task: '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  // Cronometro con le tacche delle ore
  test: '<circle cx="12" cy="13.5" r="8"/><path d="M12 5.5V3.5M10 2.5h4M17.7 7.8l1.4-1.4"/>'
    + '<path stroke-width="1.1" d="M12.00 8.10L12.00 6.50M15.05 8.22L15.50 7.44M17.28 10.45L18.06 10.00M17.40 13.50L19.00 13.50M17.28 16.55L18.06 17.00M15.05 18.78L15.50 19.56M12.00 18.90L12.00 20.50M8.95 18.78L8.50 19.56M6.72 16.55L5.94 17.00M6.60 13.50L5.00 13.50M6.72 10.45L5.94 10.00M8.95 8.22L8.50 7.44"/>'
    + '<path d="M12 13.5V9.8M12 13.5l2.4 1.4"/>',
};

// Ogni metà appartiene a uno dei due modi di dividere un'aiuola
const ASSI = {
  fondo: 'fondo-davanti', davanti: 'fondo-davanti',
  vialetto: 'vialetto-esterno', esterno: 'vialetto-esterno',
};

// Come è divisa un'aiuola dalle colture attive: 'fondo-davanti', 'vialetto-esterno' o null
// Una coltura attiva con la data di inizio nel futuro è "in programma": non si vede ancora sulla mappa
function iniziata(c) {
  return c.dataInizio <= oggi();
}

function divisione(dati, aiuolaId) {
  for (const c of dati.colture) {
    const parte = c.parti?.[aiuolaId];
    if (c.stato === 'attiva' && parte) return ASSI[parte];
  }
  return null;
}

// es. "2A, 2B metà fondo"
function doveColtura(c) {
  return c.aiuoleIds.map(id => c.parti?.[id] ? `${id} metà ${c.parti[id]}` : id).join(', ');
}

// Spazi dell'aiuola dove più colture attive si sovrappongono, es. [{ zona: 'fondo', n: 2 }]
function bollini(dati, aiuola) {
  const attive = dati.colture.filter(c => c.stato === 'attiva' && iniziata(c) && c.aiuoleIds.includes(aiuola.id));
  const asse = divisione(dati, aiuola.id);
  const zone = !asse ? ['tutta'] : asse === 'fondo-davanti' ? ['fondo', 'davanti'] : ['vialetto', 'esterno'];
  return zone
    .map(zona => ({
      zona,
      n: attive.filter(c => !c.parti?.[aiuola.id] || c.parti[aiuola.id] === zona).length,
    }))
    .filter(z => z.n > 1);
}

// Dove va il bollino nel riquadro: 'alto' (metà di sopra), 'sinistra' (metà di sinistra) o 'angolo' (in basso a destra)
function posizioneBollino(zona, lato) {
  if (zona === 'fondo') return 'alto';
  const metaSinistra = lato === 'sinistra' ? 'esterno' : 'vialetto';
  return zona === metaSinistra ? 'sinistra' : 'angolo';
}

export function mappa(dati) {
  const mappa = document.createElement('section');
  mappa.className = 'mappa';
  mappa.append(etichetta('Fondo'), colonna(dati, 'sinistra'), vialetto(dati), colonna(dati, 'destra'), staccionata(), etichetta('Davanti'));
  const scorciatoie = elemento('div', '', 'scorciatoie');
  const daFare = scorciatoia('Da fare', '#/task', 'task');
  const segnoSenzaAiuole = segnoTask(dati.task.filter(t => t.aiuoleIds.length === 0));
  if (segnoSenzaAiuole) daFare.append(puntino(segnoSenzaAiuole));
  scorciatoie.append(scorciatoia('Registro', '#/registro', 'registro'), daFare, scorciatoia('Test', '#/test', 'test'));
  mappa.append(scorciatoie);
  return mappa;
}

function scorciatoia(testo, href, icona) {
  const a = link('', href, 'scorciatoia');
  a.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONE[icona]}</svg>`;
  a.append(elemento('span', testo));
  return a;
}

function colonna(dati, lato) {
  const colonna = document.createElement('div');
  colonna.className = 'lato';
  const aiuole = dati.aiuole
    .filter(a => a.lato === lato)
    .sort((x, y) => x.posizione - y.posizione);
  for (const a of aiuole) {
    const link = document.createElement('a');
    const asse = divisione(dati, a.id);
    link.className = asse ? `aiuola diviso-${asse}` : 'aiuola';
    link.href = `#/aiuola/${a.id}`;
    // Il "tieni premuto" serve a spostare gli ortaggi: niente menu del browser sul link
    link.addEventListener('contextmenu', evento => evento.preventDefault());
    link.append(elemento('span', a.id, 'nome'), ...piantine(dati, a));
    for (const { zona, n } of bollini(dati, a)) {
      link.append(elemento('span', `× ${n}`, `bollino bollino-${posizioneBollino(zona, a.lato)}`));
    }
    const segno = segnoTask(taskAiuola(dati, a.id));
    if (segno) link.append(puntino(segno));
    const arrivo = prossimoArrivo(dati, a.id);
    if (arrivo) link.append(paletto(arrivo));
    colonna.append(link);
  }
  return colonna;
}

const GIORNO = 86400000;
const giorniDaOggi = iso => Math.round((new Date(iso) - new Date(oggi())) / GIORNO);

// La prima coltura in programma nell'aiuola che inizia entro 30 giorni, oppure null
function prossimoArrivo(dati, aiuolaId) {
  return dati.colture
    .filter(c => c.stato === 'attiva' && c.aiuoleIds.includes(aiuolaId) && !iniziata(c) && giorniDaOggi(c.dataInizio) <= 30)
    .sort((x, y) => x.dataInizio.localeCompare(y.dataInizio))[0] ?? null;
}

// Paletto di legno in basso a sinistra: disegnino della coltura in arrivo e giorni che mancano
function paletto(coltura) {
  const giorni = giorniDaOggi(coltura.dataInizio);
  const segno = elemento('span', '', 'paletto');
  segno.title = `${coltura.nome}: inizia tra ${giorni} ${giorni === 1 ? 'giorno' : 'giorni'}`;
  const tavola = elemento('span', '', 'tavola');
  tavola.append(icona(coltura.nome, 'icona-paletto', 2.4), `${giorni} g`);
  segno.append(tavola, elemento('span', '', 'asta'));
  return segno;
}

function vialetto(dati) {
  const vialetto = document.createElement('div');
  vialetto.className = 'vialetto';
  vialetto.setAttribute('aria-hidden', 'true');
  const segno = segnoTask(dati.task.filter(t => tuttoOrto(dati, t)));
  if (segno) vialetto.append(puntino(segno));
  return vialetto;
}

// Disegnini delle colture attive: uno spazio per tutta l'aiuola, oppure uno per ogni metà.
// Più colture nello stesso spazio si alternano
function piantine(dati, aiuola) {
  const attive = dati.colture.filter(c => c.stato === 'attiva' && iniziata(c) && c.aiuoleIds.includes(aiuola.id));
  if (attive.length === 0) return [];
  const asse = divisione(dati, aiuola.id);
  const zone = !asse ? ['tutta'] : asse === 'fondo-davanti' ? ['fondo', 'davanti'] : ['vialetto', 'esterno'];
  return zone.map(zona => {
    const qui = attive.filter(c => !c.parti?.[aiuola.id] || c.parti[aiuola.id] === zona);
    const posto = zona === 'tutta' ? 'tutta' : latoDisegno(zona, aiuola.lato);
    const spazio = elemento('span', '', `piantine piantine-${posto}`);
    // Intera: 2 file da 2. Metà fondo/davanti: 2 affiancati. Metà vialetto/esterno (strette): 2 in colonna
    const verticale = posto === 'sinistra' || posto === 'destra';
    const righe = zona === 'tutta' || verticale ? 2 : 1;
    const colonne = verticale ? 1 : 2;
    for (let i = 0; qui.length > 0 && i < righe * colonne; i++) {
      const coltura = qui[i % qui.length];
      const k = Math.floor(i / qui.length);   // quale disegnino di questa coltura, in questa aiuola
      const pianta = icona(coltura.nome, 'piantina', 2.6);
      const salvata = coltura.posizioni?.[aiuola.id]?.[k];
      if (salvata) {
        // Posizione scelta a mano: frazioni della sezione. Sottraendo --l non esce a destra né in basso
        pianta.style.left = `calc((100cqw - var(--l)) * ${salvata.x})`;
        pianta.style.bottom = `calc(max(0px, 100cqh - var(--l)) * ${salvata.y})`;
      } else {
        // Casella automatica: ogni ortaggio nella sua parte della sezione, con un po' di variazione dentro
        // (prima la fila in alto, così quella in basso le viene disegnata davanti)
        const riga = righe - 1 - Math.floor(i / colonne);
        const colonna = i % colonne;
        const seme = `${aiuola.id}-${zona}-${i}`;
        const rx = casuale(seme + 'x').toFixed(3);
        const ry = casuale(seme + 'y').toFixed(3);
        pianta.style.left = `calc(${colonna / colonne} * 100cqw + max(0px, ${1 / colonne} * 100cqw - var(--l)) * ${rx})`;
        pianta.style.bottom = `calc(${riga / righe} * 100cqh + max(0px, ${1 / righe} * 100cqh - var(--l)) * ${ry})`;
      }
      rendiSpostabile(pianta, spazio, { colturaId: coltura.id, aiuolaId: aiuola.id, k, sporgeInAlto: posto !== 'sotto' });
      spazio.append(pianta);
    }
    return spazio;
  });
}

const PRESSIONE = 500;   // millisecondi di pressione per "sollevare" un ortaggio

// Tenendo premuto 1 secondo l'ortaggio si solleva e si può trascinare dentro la sua sezione.
// Verso il fondo (in alto) può sporgere al massimo per metà; mai oltre gli altri bordi
function rendiSpostabile(pianta, spazio, { colturaId, aiuolaId, k, sporgeInAlto }) {
  let timer = null;
  let inizio = null;
  let presa = null;   // dove il dito ha preso il disegno, rispetto al suo angolo in alto a sinistra

  pianta.addEventListener('pointerdown', evento => {
    inizio = { x: evento.clientX, y: evento.clientY };
    timer = setTimeout(() => {
      timer = null;
      const r = pianta.getBoundingClientRect();
      presa = { dx: inizio.x - r.left, dy: inizio.y - r.top };
      pianta.setPointerCapture(evento.pointerId);
      pianta.classList.add('sollevata');
      navigator.vibrate?.(60);
    }, PRESSIONE);
  });

  pianta.addEventListener('pointermove', evento => {
    if (timer && Math.hypot(evento.clientX - inizio.x, evento.clientY - inizio.y) > 10) {
      clearTimeout(timer);
      timer = null;
    }
    if (!presa) return;
    const z = spazio.getBoundingClientRect();
    const l = pianta.offsetWidth;
    const maxBasso = Math.max(0, z.height - l) + (sporgeInAlto ? l / 2 : 0);
    const sinistra = Math.min(Math.max(evento.clientX - z.left - presa.dx, 0), Math.max(0, z.width - l));
    const basso = Math.min(Math.max(z.bottom - evento.clientY - (l - presa.dy), 0), maxBasso);
    pianta.style.left = `${sinistra}px`;
    pianta.style.bottom = `${basso}px`;
  });

  const fine = () => {
    clearTimeout(timer);
    timer = null;
    if (!presa) return;
    presa = null;
    pianta.classList.remove('sollevata');
    navigator.vibrate?.(20);
    // Il "clic" che segue il rilascio non deve aprire la scheda dell'aiuola
    const collegamento = pianta.closest('a');
    const blocca = e => e.preventDefault();
    collegamento.addEventListener('click', blocca, { capture: true, once: true });
    setTimeout(() => collegamento.removeEventListener('click', blocca, { capture: true }), 400);

    const z = spazio.getBoundingClientRect();
    const l = pianta.offsetWidth;
    const x = z.width > l ? parseFloat(pianta.style.left) / (z.width - l) : 0;
    const y = z.height > l ? parseFloat(pianta.style.bottom) / (z.height - l) : 0;
    salvaPosizione(colturaId, aiuolaId, k, x, y);
  };
  pianta.addEventListener('pointerup', fine);
  pianta.addEventListener('pointercancel', fine);
}

function salvaPosizione(colturaId, aiuolaId, k, x, y) {
  try {
    const dati = carica();
    const coltura = dati.colture.find(c => c.id === colturaId);
    coltura.posizioni ??= {};
    coltura.posizioni[aiuolaId] ??= [];
    coltura.posizioni[aiuolaId][k] = { x: Number(x.toFixed(3)), y: Number(y.toFixed(3)) };
    salva(dati);
  } catch (errore) {
    alert(errore.message);
  }
}

// Numero tra 0 e 1 che sembra casuale ma è sempre uguale per lo stesso testo
function casuale(testo) {
  let h = 2166136261;
  for (const c of testo) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0) / 4294967296;
}

// Disegno fisso scelto in base al nome; il nome scritto dall'utente non entra nell'HTML
function icona(nome, classe, tratto) {
  const contenitore = elemento('span', '', classe);
  contenitore.innerHTML = iconaSvg(nome, tratto);
  return contenitore;
}

// Staccionata davanti all'orto, con l'ingresso libero in corrispondenza del vialetto
function staccionata() {
  const riga = elemento('div', '', 'staccionata');
  riga.setAttribute('aria-hidden', 'true');
  // Solo disegno fisso, nessun testo dell'utente
  const tratto = `<svg width="100%" height="32">
    <rect x="0" y="28" width="100%" height="4" rx="2" fill="#4F6E33" opacity="0.5"></rect>
    <rect x="0" y="9" width="100%" height="5" rx="2" fill="#B27A42" stroke="#5C3D22" stroke-width="1.5"></rect>
    <rect x="0" y="19" width="100%" height="5" rx="2" fill="#B27A42" stroke="#5C3D22" stroke-width="1.5"></rect>
    <rect x="0" y="0" width="100%" height="30" fill="url(#paletti)"></rect></svg>`;
  riga.innerHTML = `<svg width="0" height="0" style="position:absolute"><defs>
    <pattern id="paletti" width="18" height="30" patternUnits="userSpaceOnUse">
      <path d="M3 9 L8.5 2 L14 9 V27 H3 Z" fill="#EBBE80" stroke="#5C3D22" stroke-width="1.5" stroke-linejoin="round"></path>
      <path d="M11 7 L14 9 V27 H11 Z" fill="#C88F52"></path>
      <path d="M5.5 10 V24" stroke="#FFE2B0" stroke-width="1.5" stroke-linecap="round"></path>
    </pattern></defs></svg>${tratto}<div></div>${tratto}`;
  return riga;
}

function etichetta(testo) {
  const p = document.createElement('p');
  p.className = 'estremo';
  p.textContent = testo;
  return p;
}

export function schedaAiuola(dati, aiuola) {
  const attive = colturePer(dati, aiuola.id).filter(c => c.stato === 'attiva' && iniziata(c));
  const inProgramma = colturePer(dati, aiuola.id).filter(c => c.stato === 'attiva' && !iniziata(c))
    .sort((x, y) => x.dataInizio.localeCompare(y.dataInizio));
  const intestazione = elemento('div', '', 'intestazione');
  intestazione.append(elemento('h2', `Aiuola ${aiuola.id}`), link('(info)', `#/aiuola/${aiuola.id}/info`, 'link-info'));
  const sezione = document.createElement('section');
  sezione.append(
    link('← Mappa', '#/', 'indietro'),
    intestazione,
    elemento('h3', 'Colture attive'),
    elencoColture(attive, 'Nessuna coltura attiva.'),
    elemento('h3', 'In programma'),
    elencoColture(inProgramma, 'Niente in programma.'),
    link('Aggiungi coltura', `#/aiuola/${aiuola.id}/nuova-coltura`, 'pulsante'),
    elemento('h3', 'Da fare'),
    elencoTask(dati, ordinaTask(dati.task.filter(t => !t.fatto && t.aiuoleIds.includes(aiuola.id))), 'Niente da fare.'),
    link('Aggiungi task', `#/aiuola/${aiuola.id}/nuovo-task`, 'pulsante secondario'),
    link('Mostra storico', `#/aiuola/${aiuola.id}/storico`, 'pulsante'),
    elemento('h3', 'Registro'),
    elencoVoci(dati, ordinaVoci(dati.registro.filter(v => v.aiuoleIds.includes(aiuola.id))).slice(0, 5), 'Nessuna voce nel registro.'),
    link('Aggiungi al registro', `#/aiuola/${aiuola.id}/nuova-voce`, 'pulsante'),
    link(`Vedi tutto il registro di ${aiuola.id}`, `#/aiuola/${aiuola.id}/registro`, 'pulsante secondario'),
  );
  return sezione;
}

export function infoAiuola(dati, aiuola) {
  const asse = divisione(dati, aiuola.id);

  const modulo = document.createElement('form');
  modulo.className = 'modulo';
  modulo.innerHTML = `
    <label>Note<textarea name="note" rows="4" placeholder="es. terreno argilloso, ristagna l'acqua"></textarea></label>
    <p class="errore" role="alert" hidden></p>
    <p class="conferma" role="status" hidden>Note salvate.</p>
    <button type="submit" class="pulsante">Salva note</button>
  `;
  // Le note le scrive l'utente: si mettono con .value, mai dentro innerHTML
  modulo.elements.note.value = aiuola.note;
  modulo.addEventListener('submit', evento => {
    evento.preventDefault();
    try {
      const dati = carica();
      dati.aiuole.find(a => a.id === aiuola.id).note = modulo.elements.note.value.trim();
      salva(dati);
      modulo.querySelector('.conferma').hidden = false;
    } catch (errore) {
      const avviso = modulo.querySelector('.errore');
      avviso.textContent = errore.message;
      avviso.hidden = false;
    }
  });

  const sezione = document.createElement('section');
  sezione.append(
    link(`← Aiuola ${aiuola.id}`, `#/aiuola/${aiuola.id}`, 'indietro'),
    elemento('h2', `Info ${aiuola.id}`),
    riga('Settore', String(aiuola.settore)),
    riga('Posizione', `a ${aiuola.lato}, ${aiuola.posizione}ª dal fondo`),
    riga('Divisione', asse === 'fondo-davanti' ? 'divisa a metà: fondo / davanti'
      : asse === 'vialetto-esterno' ? 'divisa a metà: vialetto / esterno' : 'non divisa'),
    modulo,
    pulsanteRiposiziona(aiuola),
  );
  return sezione;
}

// Cancella le posizioni scelte a mano in questa aiuola: si torna alla disposizione automatica
function pulsanteRiposiziona(aiuola) {
  const contenitore = elemento('div');
  const pulsante = elemento('button', 'Riposiziona gli ortaggi', 'pulsante secondario');
  pulsante.type = 'button';
  const conferma = elemento('p', 'Ortaggi riposizionati.', 'conferma');
  conferma.hidden = true;
  pulsante.addEventListener('click', () => {
    if (!confirm(`Rimettere gli ortaggi di ${aiuola.id} nella disposizione automatica?`)) return;
    try {
      const dati = carica();
      for (const c of dati.colture) delete c.posizioni?.[aiuola.id];
      salva(dati);
      conferma.hidden = false;
    } catch (errore) {
      alert(errore.message);
    }
  });
  contenitore.append(pulsante, conferma);
  return contenitore;
}

export function storicoAiuola(dati, aiuola) {
  const passate = colturePer(dati, aiuola.id)
    .filter(c => c.stato === 'terminata')
    .sort((x, y) => (y.dataFine ?? '').localeCompare(x.dataFine ?? ''));
  const sezione = document.createElement('section');
  sezione.append(
    link(`← Aiuola ${aiuola.id}`, `#/aiuola/${aiuola.id}`, 'indietro'),
    elemento('h2', `Storico ${aiuola.id}`),
    elencoColture(passate, 'Nessuna coltura passata.'),
  );
  return sezione;
}

function colturePer(dati, aiuolaId) {
  return dati.colture.filter(c => c.aiuoleIds.includes(aiuolaId));
}

function elencoColture(colture, testoSeVuoto) {
  if (colture.length === 0) return elemento('p', testoSeVuoto);
  const ul = elemento('ul', '', 'colture');
  for (const c of colture) {
    const nome = c.varieta ? `${c.nome} – ${c.varieta}` : c.nome;
    const periodo = c.dataFine
      ? `${dataPerUtente(c.dataInizio)} – ${dataPerUtente(c.dataFine)}`
      : `dal ${dataPerUtente(c.dataInizio)}`;
    const mostraDove = c.aiuoleIds.length > 1 || c.aiuoleIds.some(id => c.parti?.[id]);
    const dove = mostraDove ? ` (${doveColtura(c)})` : '';
    const voce = elemento('li');
    const collegamento = link(`${nome} · ${periodo}${dove}`, `#/coltura/${c.id}`);
    collegamento.prepend(icona(c.nome, 'icona-coltura', 1.6));
    voce.append(collegamento);
    ul.append(voce);
  }
  return ul;
}

function elemento(tag, testo, classe) {
  const el = document.createElement(tag);
  if (testo) el.textContent = testo;
  if (classe) el.className = classe;
  return el;
}

function link(testo, href, classe) {
  const a = elemento('a', testo, classe);
  a.href = href;
  return a;
}

export function impostazioni() {
  const esportaBtn = elemento('button', 'Esporta backup', 'pulsante');
  esportaBtn.type = 'button';
  esportaBtn.addEventListener('click', scaricaBackup);

  const sceltaFile = elemento('input');
  sceltaFile.type = 'file';
  sceltaFile.accept = '.json,application/json';
  sceltaFile.hidden = true;
  sceltaFile.addEventListener('change', () => caricaBackup(sceltaFile));

  const importaBtn = elemento('button', 'Importa backup', 'pulsante secondario');
  importaBtn.type = 'button';
  importaBtn.addEventListener('click', () => sceltaFile.click());

  const sezione = document.createElement('section');
  sezione.append(
    link('← Mappa', '#/', 'indietro'),
    elemento('h2', 'Impostazioni'),
    elemento('h3', 'Backup'),
    elemento('p', 'I dati sono salvati solo in questo browser. Esporta spesso un backup e conservalo in un posto sicuro: serve anche a passare i dati a un altro telefono.'),
    esportaBtn,
    elemento('p', 'Importare un backup sostituisce tutti i dati attuali.'),
    importaBtn,
    sceltaFile,
    elemento('h3', 'Sincronizzazione'),
    sezioneSincronizzazione(),
    elemento('h3', 'Modalità prova'),
    sezioneProva(),
    elemento('h3', 'Cancella dati'),
    elemento('p', 'Cancella tutti i dati dell\'orto da questo telefono e lo scollega dal server. I dati sul server non vengono toccati: ricollegandoti li riscarichi.'),
    pulsanteCancellaTutto(),
  );
  return sezione;
}

function pulsanteCancellaTutto() {
  const pulsante = elemento('button', 'Cancella i dati di questo telefono', 'pulsante pericolo');
  pulsante.type = 'button';
  pulsante.addEventListener('click', () => {
    if (!confirm('Cancellare tutti i dati dell\'orto da questo telefono?')) return;
    if (!confirm('Sicuro? Quello che non è sul server o in un backup andrà perso.')) return;
    cancellaDatiTelefono();
    location.hash = '#/';
    document.dispatchEvent(new Event('dati-cambiati'));
  });
  return pulsante;
}

// Login, stato e pulsanti della sincronizzazione con il server
function sezioneSincronizzazione() {
  const box = elemento('div');
  if (inProva()) {
    box.append(elemento('p', 'In modalità prova la sincronizzazione è sospesa: le prove restano solo su questo telefono.'));
    return box;
  }
  const stato = statoSincronizzazione();
  if (!stato.collegato) {
    const modulo = document.createElement('form');
    modulo.className = 'modulo';
    modulo.noValidate = true;
    modulo.innerHTML = `
      <p>Collegando il telefono, i dati dell'orto si salvano anche online e si condividono con l'altro telefono.</p>
      <label>Email<input type="email" name="email" autocomplete="username"></label>
      <label>Password<input type="password" name="password" autocomplete="current-password"></label>
      <p class="errore" role="alert" hidden></p>
      <button type="submit" class="pulsante">Collega questo telefono</button>
    `;
    modulo.addEventListener('submit', async evento => {
      evento.preventDefault();
      const avviso = modulo.querySelector('.errore');
      const pulsante = modulo.querySelector('button');
      pulsante.disabled = true;
      pulsante.textContent = 'Collegamento in corso…';
      try {
        await collegaTelefono(modulo.elements.email.value.trim(), modulo.elements.password.value, () => confirm(
          'Sul server ci sono già i dati dell\'orto.\n\n' +
          'OK = usa i dati del server su questo telefono (consigliato)\n' +
          'Annulla = unisci i dati di questo telefono a quelli del server'));
        document.dispatchEvent(new Event('dati-cambiati'));
      } catch (errore) {
        avviso.textContent = errore instanceof TypeError ? 'Server non raggiungibile: controlla la connessione.' : errore.message;
        avviso.hidden = false;
        pulsante.disabled = false;
        pulsante.textContent = 'Collega questo telefono';
      }
    });
    box.append(modulo);
    return box;
  }

  box.append(
    riga('Collegato come', stato.email ?? '—'),
    riga('Ultima sincronizzazione', stato.ultimaSync ? orarioPerUtente(stato.ultimaSync) : 'mai'),
  );
  if (stato.inAttesa > 0) box.append(riga('Modifiche in attesa di invio', String(stato.inAttesa)));
  if (stato.errore) box.append(elemento('p', stato.errore, 'errore'));

  const ora = elemento('button', 'Sincronizza ora', 'pulsante');
  ora.type = 'button';
  ora.addEventListener('click', async () => {
    ora.disabled = true;
    ora.textContent = 'Sincronizzazione…';
    await sincronizza();
    document.dispatchEvent(new Event('dati-cambiati'));
  });
  const scollega = elemento('button', 'Scollega questo telefono', 'pulsante secondario');
  scollega.type = 'button';
  scollega.addEventListener('click', () => {
    if (!confirm('Scollegare questo telefono? I dati restano sul telefono, ma non si sincronizzano più.')) return;
    scollegaTelefono();
    document.dispatchEvent(new Event('dati-cambiati'));
  });
  box.append(ora, scollega);
  return box;
}

// Modalità prova: una copia separata dei dati, per fare esperimenti senza toccare quelli veri
function sezioneProva() {
  const box = elemento('div');
  const attiva = inProva();
  box.append(elemento('p', attiva
    ? 'Stai lavorando su una copia di prova: niente di quello che fai arriva ai dati veri né all\'altro telefono.'
    : 'Lavora su una copia separata dei dati per fare prove: i dati veri restano intatti e non si sincronizza niente.'));
  const interruttore = elemento('button', attiva ? 'Disattiva modalità prova' : 'Attiva modalità prova', attiva ? 'pulsante' : 'pulsante secondario');
  interruttore.type = 'button';
  interruttore.addEventListener('click', () => {
    if (attiva) disattivaProva();
    else attivaProva();
    document.dispatchEvent(new Event('dati-cambiati'));
  });
  box.append(interruttore);
  if (attiva) {
    const ricomincia = elemento('button', 'Ricomincia la prova dai dati veri', 'pulsante secondario');
    ricomincia.type = 'button';
    ricomincia.addEventListener('click', () => {
      if (!confirm('Cancellare le prove e ripartire da una copia dei dati veri?')) return;
      ricominciaProva();
      document.dispatchEvent(new Event('dati-cambiati'));
    });
    box.append(ricomincia);
  }
  return box;
}

function scaricaBackup() {
  try {
    const file = new Blob([esporta(carica())], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file);
    a.download = `orto-backup-${oggi()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  } catch (errore) {
    alert(errore.message);
  }
}

async function caricaBackup(input) {
  const file = input.files[0];
  input.value = '';
  if (!file) return;
  try {
    const dati = importa(await file.text());
    const conferma = confirm(
      `Il backup contiene ${dati.colture.length} colture, ${dati.registro.length} voci di registro e ${dati.task.length} task.\n\n` +
      'Sostituire tutti i dati attuali? Se ti servono, esportali prima.' +
      (statoSincronizzazione().collegato && !inProva()
        ? '\n\nAttenzione: il telefono è sincronizzato, quindi la sostituzione arriverà anche sull\'altro telefono.'
        : '')
    );
    if (!conferma) return;
    salva(dati);
    alert('Backup importato.');
    location.hash = '#/';
  } catch (errore) {
    alert(errore.message);
  }
}

// Modulo per creare una coltura (da un'aiuola) o modificarne una attiva (coltura).
// Con una data di inizio futura la coltura è "in programma": in fondo compaiono gli avvisi
export function moduloColtura(dati, { aiuola = null, coltura = null }) {
  const modulo = document.createElement('form');
  modulo.className = 'modulo';
  modulo.noValidate = true;
  // Solo testo fisso e dati dell'app: i testi scritti dall'utente si mettono sotto, con .value
  modulo.innerHTML = `
    <label>Nome<input type="text" name="nome" autocomplete="off" placeholder="es. Pomodoro"></label>
    <label>Varietà (facoltativa)<input type="text" name="varieta" autocomplete="off" placeholder="es. Cuore di bue"></label>
    <div class="suggerimento" hidden></div>
    <div class="posto-aiuole"></div>
    <label>Data di inizio<input type="text" name="data" placeholder="gg/mm/aaaa" value="${dataPerUtente(coltura ? coltura.dataInizio : oggi())}"></label>
    <fieldset>
      <legend>Metodo</legend>
      <div class="due-colonne">
        <label class="opzione"><input type="radio" name="metodo" value="semina"> Semina</label>
        <label class="opzione"><input type="radio" name="metodo" value="trapianto"> Trapianto</label>
      </div>
      <label>Altro:<input type="text" name="metodoAltro" autocomplete="off" placeholder="es. pianta perenne, talea, bulbo"></label>
    </fieldset>
    ${coltura ? '<label>Note (facoltative)<textarea name="note" rows="3"></textarea></label>' : ''}
    <div class="avvisi" role="status" hidden></div>
    <p class="errore" role="alert" hidden></p>
    <button type="submit" class="pulsante">${coltura ? 'Salva modifiche' : 'Salva coltura'}</button>
  `;
  const campi = modulo.elements;
  if (coltura) {
    campi.nome.value = coltura.nome;
    campi.varieta.value = coltura.varieta;
    campi.note.value = coltura.note;
    if (coltura.metodo === 'altro') campi.metodoAltro.value = coltura.metodoAltro ?? '';
    else modulo.querySelector(`input[name="metodo"][value="${coltura.metodo}"]`).checked = true;
  }
  // "Altro" e i due pallini si escludono: scrivendo in Altro si toglie il pallino, e viceversa
  campi.metodoAltro.addEventListener('input', () => {
    if (campi.metodoAltro.value.trim()) modulo.querySelectorAll('input[name="metodo"]').forEach(r => { r.checked = false; });
  });
  modulo.querySelectorAll('input[name="metodo"]').forEach(r => r.addEventListener('change', () => { campi.metodoAltro.value = ''; }));

  modulo.querySelector('.posto-aiuole').replaceWith(selettoreAiuole(dati,
    coltura ? scelteDa(coltura.aiuoleIds, coltura.parti) : { [aiuola.id]: '' }));
  suggerimentiCatalogo(dati, modulo, coltura?.id ?? null);
  modulo.addEventListener('submit', evento => {
    evento.preventDefault();
    salvaColtura(modulo, coltura?.id);
  });

  const sezione = document.createElement('section');
  if (coltura) {
    const indietro = elemento('button', '← Indietro', 'indietro');
    indietro.type = 'button';
    indietro.addEventListener('click', () => history.back());
    sezione.append(indietro, elemento('h2', 'Modifica coltura'), modulo);
  } else {
    sezione.append(
      link(`← Aiuola ${aiuola.id}`, `#/aiuola/${aiuola.id}`, 'indietro'),
      elemento('h2', `Nuova coltura in ${aiuola.id}`),
      modulo,
    );
  }
  return sezione;
}

const MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
// Periodo del catalogo ['04-25', '05-15'] → "25 apr – 15 mag"
function periodoCatalogo([dal, al]) {
  const t = s => { const [m, g] = s.split('-').map(Number); return `${g} ${MESI[m - 1]}`; };
  return `${t(dal)} – ${t(al)}`;
}

// Fine suggerita: la prima fine di un periodo di raccolta del catalogo che viene dopo l'inizio
function fineSuggerita(scheda, inizio) {
  const anno = Number(inizio.slice(0, 4));
  const date = scheda.r.flatMap(([, al]) => [`${anno}-${al}`, `${anno + 1}-${al}`]).filter(d => d > inizio).sort();
  return date[0] ?? null;
}

// Misure (cm) della parte di aiuola usata: intera 180 × 120; metà fondo/davanti 180 × 60; metà vialetto/esterno 90 × 120
function misuraParte(parte) {
  if (!parte) return AIUOLA;
  return ASSI[parte] === 'fondo-davanti' ? { L: AIUOLA.L, W: AIUOLA.W / 2 } : { L: AIUOLA.L / 2, W: AIUOLA.W };
}

const kgTesto = v => (v < 10 ? v.toFixed(1) : String(Math.round(v))).replace('.', ',');

// Riquadro "Dal catalogo" (aggiornato mentre si scrive il nome o si scelgono le aiuole) e,
// se la data è nel futuro, gli avvisi in fondo al modulo. Per una coltura nuova propone il metodo
function suggerimentiCatalogo(dati, modulo, colturaId) {
  const box = modulo.querySelector('.suggerimento');
  const boxAvvisi = modulo.querySelector('.avvisi');
  const campi = modulo.elements;

  function aggiorna() {
    const scheda = colturaDaNome(campi.nome.value);
    const scelte = new FormData(modulo);
    const aiuoleIds = scelte.getAll('aiuole');
    const parti = Object.fromEntries(aiuoleIds.map(id => [id, scelte.get(`parte-${id}`) ?? '']));
    const inizio = dataPerArchivio(campi.data.value);
    let metodo = campi.metodoAltro.value.trim() ? 'altro' : scelte.get('metodo');
    if (scheda && !colturaId && !metodo) {
      const proposto = scheda.t && !scheda.s ? 'trapianto' : scheda.s && !scheda.t ? 'semina' : null;
      if (proposto) {
        modulo.querySelector(`input[name="metodo"][value="${proposto}"]`).checked = true;
        metodo = proposto;
      }
    }

    const avvisi = inizio && inizio > oggi() ? avvisiColtura(dati, { scheda, aiuoleIds, parti, inizio, metodo, colturaId }) : [];
    boxAvvisi.hidden = avvisi.length === 0;
    boxAvvisi.replaceChildren(...avvisi.map(([titolo, testo]) => {
      const p = elemento('p', '', 'avviso-modulo');
      p.append(elemento('strong', titolo), testo);
      return p;
    }));

    box.hidden = !scheda;
    if (!scheda) return;
    const righe = [];
    if (scheda.s) righe.push(`Semina a Bologna: ${scheda.s.map(periodoCatalogo).join(' · ')}`);
    if (scheda.t) righe.push(`${scheda.tLabel ?? 'Trapianto'} a Bologna: ${scheda.t.map(periodoCatalogo).join(' · ')}`);
    righe.push(`${scheda.rLabel ?? 'Raccolta'}: ${scheda.r.map(periodoCatalogo).join(' · ')}`);

    // Piante e resa nelle aiuole (o metà) scelte
    let piante = 0, min = 0, max = 0, conResa = true;
    for (const id of aiuoleIds) {
      const m = misuraParte(parti[id]);
      const d = disposizione(scheda, m.L, m.W);
      piante += d.piante ?? 0;
      const r = resa(scheda, d);
      if (r) { min += r[0]; max += r[1]; } else conResa = false;
    }
    if (piante) righe.push(piante === 1 ? 'Ci sta 1 pianta' : `Ci stanno circa ${piante} piante`);
    if (conResa && max) righe.push(`Resa stimata: ${kgTesto(min)}–${kgTesto(max)} kg (indicativa)`);

    box.replaceChildren(elemento('strong', `Dal catalogo: ${scheda.nome}`), ...righe.map(r => elemento('span', r)));
    if (scheda.avviso) box.append(elemento('span', scheda.avviso.replace(/\{\w+:([^}]+)\}/g, '$1'), 'avviso-catalogo'));

  }
  modulo.addEventListener('input', aggiorna);
  // Le aiuole scelte cambiano i campi nascosti del modulo: si ricalcola anche allora
  new MutationObserver(aggiorna).observe(modulo.querySelector('.mini-mappa').parentElement, { childList: true, subtree: true });
  aggiorna();
}

// ---- Avvisi per una coltura in programma: non bloccano mai il salvataggio ----

// Anno dell'orto (da ottobre a settembre): 2026-11-15 → 2026, 2027-05-01 → 2026
function annoOrto(iso) {
  const [a, m] = iso.split('-').map(Number);
  return m >= 10 ? a : a - 1;
}
// Due parti della stessa aiuola si toccano? ('' = intera)
function siToccano(p1, p2) {
  return !p1 || !p2 || ASSI[p1] !== ASSI[p2] || p1 === p2;
}
// Fine di una coltura: quella vera, oppure la stima dal catalogo, oppure null (non si sa).
// Le perenni non hanno fine; una coltura ancora attiva oltre la fine stimata non si sa quando finirà
function fineDi(c) {
  if (c.dataFine) return c.dataFine;
  const scheda = colturaDaNome(c.nome);
  if (!scheda || scheda.tappa === 'P') return null;
  const stima = fineSuggerita(scheda, c.dataInizio);
  return stima && stima < oggi() ? null : stima;
}
const meseGiorno = iso => iso.slice(5);
function dentro(mg, [dal, al]) {
  return dal <= al ? mg >= dal && mg <= al : mg >= dal || mg <= al;
}

function avvisiColtura(dati, { scheda, aiuoleIds, parti, inizio, metodo, colturaId }) {
  const avvisi = [];
  const altre = dati.colture.filter(c => c.id !== colturaId);

  // Fuori stagione
  if (scheda) {
    const periodi = (metodo === 'semina' ? scheda.s : metodo === 'trapianto' ? scheda.t : null)
      ?? [...(scheda.s ?? []), ...(scheda.t ?? [])];
    if (periodi.length && !periodi.some(p => dentro(meseGiorno(inizio), p))) {
      const cosa = metodo === 'semina' ? 'la semina' : metodo === 'trapianto' ? 'il trapianto' : "l'inizio";
      avvisi.push(['Fuori stagione. ', `A Bologna per ${scheda.nome.toLowerCase()} ${cosa} di solito va fatto ${periodi.map(periodoCatalogo).join(' oppure ')}. Puoi salvare lo stesso.`]);
    }
  }

  // Rotazione (regola base): la stessa famiglia non torna nello stesso settore prima di 4 anni
  if (scheda && !['J', 'P', 'F', 'V'].includes(scheda.tappa)) {
    const anno = annoOrto(inizio);
    const settori = [...new Set(aiuoleIds.map(id => dati.aiuole.find(a => a.id === id).settore))];
    for (const settore of settori) {
      const stesse = altre.filter(c => {
        const s = colturaDaNome(c.nome);
        const a = annoOrto(c.dataInizio);
        return s && s.famiglia === scheda.famiglia && !['J', 'P', 'F', 'V'].includes(s.tappa)
          && a >= anno - 3 && a < anno
          && c.aiuoleIds.some(id => dati.aiuole.find(x => x.id === id).settore === settore);
      });
      if (stesse.length) {
        const ultimo = Math.max(...stesse.map(c => annoOrto(c.dataInizio)));
        const nomi = [...new Set(stesse.map(c => c.nome))].join(', ');
        avvisi.push(['Rotazione. ', `Nel settore ${settore} ci sono già state ${scheda.famiglia.toLowerCase()} (${nomi}, anno dell'orto ${ultimo}–${ultimo + 1}). La stessa famiglia non dovrebbe tornare prima di 4 anni: meglio dall'autunno ${ultimo + 4}, oppure in un altro settore.`]);
      }
    }
  }

  // Aiuola occupata il giorno dell'inizio, oppure vuota a lungo prima
  for (const id of aiuoleIds) {
    const vicine = altre.filter(c => c.aiuoleIds.includes(id) && siToccano(c.parti?.[id] ?? '', parti[id] ?? ''));
    const occupante = vicine.find(c => c.dataInizio <= inizio && (fineDi(c) ?? '9999-12-31') > inizio);
    if (occupante) {
      const fine = fineDi(occupante);
      avvisi.push([`Aiuola ${id} occupata. `, fine
        ? `C'è ${occupante.nome} fino al ${dataPerUtente(fine)}${occupante.dataFine ? '' : ' (stima dal catalogo)'}, e la nuova coltura inizia il ${dataPerUtente(inizio)}.`
        : `C'è ${occupante.nome}, che non ha ancora una data di fine. Ricordati di terminarla quando la togli.`]);
      continue;
    }
    const prima = vicine.map(fineDi).filter(f => f && f <= inizio).sort().at(-1);
    if (prima) {
      const settimane = Math.round((new Date(inizio) - new Date(prima)) / (7 * 86400000));
      if (settimane >= 8) {
        avvisi.push([`Aiuola ${id} vuota a lungo. `, `Resta libera per circa ${settimane} settimane (dal ${dataPerUtente(prima)}): puoi riempire il vuoto con un'insalata veloce o un sovescio, oppure coprire la terra con la pacciamatura.`]);
      }
    }
  }
  return avvisi;
}

// Testo del metodo per la scheda: "Semina", "Trapianto" o quello scritto in "Altro"
function testoMetodo(c) {
  if (c.metodo === 'semina') return 'Semina';
  if (c.metodo === 'trapianto') return 'Trapianto';
  return c.metodoAltro || 'Altro';
}

// La voce di registro creata in automatico all'inizio della coltura (semina, trapianto o "Inizio coltura")
function voceIniziale(dati, coltura) {
  return dati.registro.find(v => v.colturaId === coltura.id && !v.dal && v.data === coltura.dataInizio
    && (v.tipo === coltura.metodo || (coltura.metodo === 'altro' && v.tipo === 'nota' && v.note.startsWith('Inizio coltura'))));
}

// Mini-mappa per scegliere aiuole e metà. Le scelte finiscono in campi nascosti del modulo:
// "aiuole" (una per aiuola scelta) e "parte-2A" ecc. (solo per quelle a metà)
function selettoreAiuole(dati, scelteIniziali) {
  const scelte = new Map(Object.entries(scelteIniziali));   // id → '' (intera) oppure una metà
  const mini = elemento('div', '', 'mini-mappa');
  const nascosti = elemento('div');
  const tutto = elemento('button', 'Tutto l\'orto', 'pulsante secondario tutto-orto');
  tutto.type = 'button';
  tutto.addEventListener('click', () => {
    if (tutteScelte()) scelte.clear();
    else for (const a of dati.aiuole) scelte.set(a.id, '');
    aggiorna();
  });

  // Tutte le aiuole scelte, tutte intere
  function tutteScelte() {
    return dati.aiuole.every(a => scelte.get(a.id) === '');
  }

  function aggiorna() {
    tutto.textContent = tutteScelte() ? 'Togli tutte' : 'Tutto l\'orto';
    mini.replaceChildren(miniColonna('sinistra'), elemento('div', '', 'mini-vialetto'), miniColonna('destra'));
    nascosti.replaceChildren();
    for (const [id, parte] of [...scelte].sort(([x], [y]) => x.localeCompare(y))) {
      nascosti.append(campoNascosto('aiuole', id));
      if (parte) nascosti.append(campoNascosto(`parte-${id}`, parte));
    }
  }

  function miniColonna(lato) {
    const colonna = elemento('div', '', 'mini-lato');
    for (const a of dati.aiuole.filter(a => a.lato === lato).sort((x, y) => x.posizione - y.posizione)) {
      const pulsante = disegnoAiuola(a, scelte.has(a.id) ? scelte.get(a.id) || 'intera' : null, 'button');
      pulsante.type = 'button';
      pulsante.setAttribute('aria-pressed', scelte.has(a.id));
      pulsante.addEventListener('click', () => {
        if (!scelte.has(a.id)) {
          scelte.set(a.id, '');
          aggiorna();
          return;
        }
        apriPopup(dati, a, scelte.get(a.id), parte => {
          if (parte === null) scelte.delete(a.id);
          else scelte.set(a.id, parte);
          aggiorna();
        });
      });
      colonna.append(pulsante);
    }
    return colonna;
  }

  const riquadro = elemento('fieldset');
  riquadro.append(elemento('legend', 'Aiuole (tocca per scegliere)'), mini, tutto, nascosti);
  aggiorna();
  return riquadro;
}

function campoNascosto(nome, valore) {
  const campo = elemento('input');
  campo.type = 'hidden';
  campo.name = nome;
  campo.value = valore;
  return campo;
}

// Riquadro di un'aiuola con la parte scelta in terra arata: parte = null (non scelta), 'intera' o una metà
function disegnoAiuola(aiuola, parte, tag = 'div') {
  const riquadro = elemento(tag, '', 'mini-aiuola');
  if (parte) riquadro.append(elemento('span', '', `riempimento riempimento-${latoDisegno(parte, aiuola.lato)}`));
  riquadro.append(elemento('span', aiuola.id, 'nome'));
  return riquadro;
}

// Da metà "logica" a lato del disegno: il vialetto è a destra per le aiuole di sinistra e viceversa
function latoDisegno(parte, lato) {
  if (parte === 'intera') return 'tutta';
  if (parte === 'fondo') return 'sopra';
  if (parte === 'davanti') return 'sotto';
  const versoVialetto = lato === 'sinistra' ? 'destra' : 'sinistra';
  if (parte === 'vialetto') return versoVialetto;
  return versoVialetto === 'destra' ? 'sinistra' : 'destra';
}

const ALTEZZA_VOCE = 48;   // altezza di ogni voce della rotella, in pixel

// Rotella a scorrimento con le frecce su e giù: la voce nella fascia centrale è quella scelta.
// cambia(i) viene chiamata a ogni nuova scelta
function creaRotella(etichette, iniziale, cambia) {
  let indice = iniziale;
  const rotella = elemento('div', '', 'rotella');
  const voci = etichette.map((testo, i) => {
    const voce = elemento('button', testo, 'voce-rotella');
    voce.type = 'button';
    voce.addEventListener('click', () => porta(i));
    return voce;
  });
  rotella.append(...voci);

  const freccia = (simbolo, passo, nome) => {
    const b = elemento('button', simbolo, 'freccia-rotella');
    b.type = 'button';
    b.setAttribute('aria-label', nome);
    b.addEventListener('click', () => porta(Math.min(etichette.length - 1, Math.max(0, indice + passo))));
    return b;
  };
  const su = freccia('▲', -1, 'Voce precedente');
  const giu = freccia('▼', 1, 'Voce successiva');

  function segna() {
    voci.forEach((voce, i) => voce.classList.toggle('attiva', i === indice));
    su.disabled = indice === 0;
    giu.disabled = indice === etichette.length - 1;
  }
  function porta(i) {
    rotella.scrollTo({ top: i * ALTEZZA_VOCE, behavior: 'smooth' });
  }
  rotella.addEventListener('scroll', () => {
    const nuovo = Math.min(etichette.length - 1, Math.max(0, Math.round(rotella.scrollTop / ALTEZZA_VOCE)));
    if (nuovo !== indice) {
      indice = nuovo;
      segna();
      cambia(indice);
    }
  });
  segna();

  const scatola = elemento('div', '', 'scatola-rotella');
  scatola.append(su, rotella, giu);
  // Da chiamare quando la rotella è già nella pagina, per mostrare la voce iniziale
  const mostraIniziale = () => { rotella.scrollTop = indice * ALTEZZA_VOCE; };
  return { elemento: scatola, mostraIniziale };
}

// Pop-up: disegno dell'aiuola a sinistra, rotella delle parti a destra.
// scegli(parte) riceve la parte confermata, oppure null se l'aiuola va tolta
function apriPopup(dati, aiuola, parteAttuale, scegli) {
  const asse = divisione(dati, aiuola.id);
  const opzioni = ['', ...Object.keys(ASSI).filter(p => !asse || ASSI[p] === asse)];
  let indice = Math.max(0, opzioni.indexOf(parteAttuale));

  const anteprima = elemento('div', '', 'anteprima');
  const mostraScelta = () => anteprima.replaceChildren(disegnoAiuola(aiuola, opzioni[indice] || 'intera'));
  const rotella = creaRotella(opzioni.map(parte => parte ? `Metà ${parte}` : 'Intera'), indice, i => {
    indice = i;
    mostraScelta();
  });

  const finestra = elemento('dialog', '', 'popup');
  const togli = elemento('button', 'Togli aiuola', 'pulsante pericolo');
  togli.type = 'button';
  togli.addEventListener('click', () => {
    scegli(null);
    finestra.close();
  });
  const conferma = elemento('button', 'Conferma', 'pulsante');
  conferma.type = 'button';
  conferma.addEventListener('click', () => {
    scegli(opzioni[indice]);
    finestra.close();
  });

  const corpo = elemento('div', '', 'popup-corpo');
  corpo.append(anteprima, rotella.elemento);
  const azioni = elemento('div', '', 'popup-azioni');
  azioni.append(togli, conferma);
  const contenuto = elemento('div', '', 'popup-contenuto');
  contenuto.append(elemento('h3', `Aiuola ${aiuola.id}`), corpo, azioni);
  finestra.append(contenuto);

  // Un tocco sullo sfondo scuro (fuori dal contenuto) chiude senza cambiare niente
  finestra.addEventListener('click', evento => {
    if (evento.target === finestra) finestra.close();
  });
  finestra.addEventListener('close', () => finestra.remove());
  document.body.append(finestra);
  finestra.showModal();
  mostraScelta();
  rotella.mostraIniziale();
}

function scelteDa(aiuoleIds, parti = {}) {
  return Object.fromEntries(aiuoleIds.map(id => [id, parti[id] ?? '']));
}

function leggiParti(campi, aiuoleIds) {
  const parti = {};
  for (const id of aiuoleIds) {
    const parte = campi.get(`parte-${id}`);
    if (parte) parti[id] = parte;
  }
  return parti;
}

// "Tutto l'orto" = tutte le aiuole, tutte intere
function tuttoOrto(dati, x) {
  return x.aiuoleIds.length === dati.aiuole.length && Object.keys(x.parti ?? {}).length === 0;
}

function salvaColtura(modulo, colturaId = null) {
  const campi = new FormData(modulo);
  const nome = campi.get('nome').trim();
  const aiuoleIds = campi.getAll('aiuole');
  const dataInizio = dataPerArchivio(campi.get('data'));
  const metodoAltro = campi.get('metodoAltro').trim();
  const metodo = metodoAltro ? 'altro' : campi.get('metodo');

  const errori = [];
  if (!nome) errori.push('Scrivi il nome della coltura.');
  if (aiuoleIds.length === 0) errori.push('Scegli almeno un\'aiuola.');
  if (!dataInizio) errori.push('Scrivi la data come gg/mm/aaaa, es. 20/04/2026.');
  if (!metodo) errori.push('Scegli semina o trapianto, oppure scrivi il metodo in "Altro".');

  const avviso = modulo.querySelector('.errore');
  if (errori.length > 0) {
    avviso.textContent = errori.join('\n');
    avviso.hidden = false;
    return;
  }

  try {
    const parti = leggiParti(campi, aiuoleIds);
    const dati = carica();
    const catalogoId = colturaDaNome(nome)?.id ?? null;
    // La voce automatica nel registro: semina o trapianto, oppure una nota "Inizio coltura: …"
    const voce = {
      data: dataInizio, tipo: metodo === 'altro' ? 'nota' : metodo, aiuoleIds, parti,
      note: metodo === 'altro' ? `Inizio coltura: ${metodoAltro}` : '',
    };
    if (colturaId) {
      const coltura = dati.colture.find(c => c.id === colturaId);
      const vecchiaVoce = voceIniziale(dati, coltura);
      Object.assign(coltura, {
        nome, varieta: campi.get('varieta').trim(), aiuoleIds, parti, dataInizio, metodo, metodoAltro,
        note: campi.get('note').trim(), catalogoId,
      });
      // Le posizioni scelte a mano nelle aiuole tolte non servono più
      for (const id of Object.keys(coltura.posizioni ?? {})) {
        if (!aiuoleIds.includes(id)) delete coltura.posizioni[id];
      }
      if (vecchiaVoce) Object.assign(vecchiaVoce, voce);
    } else {
      const nuovoColturaId = nuovoId('c');
      dati.colture.push({
        id: nuovoColturaId, nome, varieta: campi.get('varieta').trim(), aiuoleIds, parti,
        dataInizio, metodo, metodoAltro, stato: 'attiva', dataFine: null, note: '', catalogoId,
      });
      // Se la data è nel futuro, la voce si vede nel registro solo da quel giorno (vedi ordinaVoci)
      dati.registro.push({ id: nuovoId('r'), ...voce, colturaId: nuovoColturaId, quantita: '' });
    }
    salva(dati);
    history.back();
  } catch (errore) {
    avviso.textContent = errore.message;
    avviso.hidden = false;
  }
}

export function schedaColtura(dati, coltura) {
  const indietro = elemento('button', '← Indietro', 'indietro');
  indietro.type = 'button';
  indietro.addEventListener('click', () => history.back());

  const attiva = coltura.stato === 'attiva';
  const inProgramma = attiva && !iniziata(coltura);
  const intestazione = elemento('div', '', 'intestazione');
  intestazione.append(elemento('h2', coltura.varieta ? `${coltura.nome} – ${coltura.varieta}` : coltura.nome));
  if (attiva) intestazione.append(link('(modifica)', `#/coltura/${coltura.id}/modifica`, 'link-info'));
  const sezione = document.createElement('section');
  sezione.append(
    indietro,
    intestazione,
    riga('Stato', inProgramma ? 'In programma' : attiva ? 'Attiva' : 'Terminata'),
    riga('Aiuole', doveColtura(coltura)),
    riga('Inizio', dataPerUtente(coltura.dataInizio)),
  );
  if (!attiva) sezione.append(riga('Fine', dataPerUtente(coltura.dataFine)));
  sezione.append(
    riga('Metodo', testoMetodo(coltura)),
    riga('Note', coltura.note || 'Nessuna nota.'),
    elemento('h3', 'Da fare'),
    elencoTask(dati, ordinaTask(dati.task.filter(t => !t.fatto && t.colturaId === coltura.id)), 'Niente da fare.'),
    link('Aggiungi task', `#/coltura/${coltura.id}/nuovo-task`, 'pulsante secondario'),
    elemento('h3', 'Registro'),
    elencoVoci(dati, ordinaVoci(dati.registro.filter(v => v.colturaId === coltura.id)), 'Nessuna voce nel registro.'),
    link('Aggiungi al registro', `#/coltura/${coltura.id}/nuova-voce`, 'pulsante secondario'),
    inProgramma ? pulsanteEliminaProgramma(dati, coltura) : attiva ? moduloTermina(coltura) : pulsanteRiattiva(dati, coltura),
  );
  return sezione;
}

// Toglie una coltura in programma (non ancora iniziata) insieme alla sua voce automatica nel registro
function pulsanteEliminaProgramma(dati, coltura) {
  const pulsante = elemento('button', 'Togli dal programma', 'pulsante pericolo');
  pulsante.type = 'button';
  pulsante.addEventListener('click', () => {
    if (!confirm(`Togliere "${coltura.nome}" dal programma?`)) return;
    try {
      dati = carica();
      coltura = dati.colture.find(c => c.id === coltura.id);
      const voce = voceIniziale(dati, coltura);
      dati.colture = dati.colture.filter(c => c.id !== coltura.id);
      dati.registro = dati.registro.filter(x => x !== voce);
      dati.task = dati.task.map(t => (t.colturaId === coltura.id ? { ...t, colturaId: null } : t));
      salva(dati);
      history.back();
    } catch (errore) {
      alert(errore.message);
    }
  });
  return pulsante;
}

function riga(etichetta, valore) {
  const p = document.createElement('p');
  p.append(elemento('strong', `${etichetta}: `), valore);
  return p;
}

function moduloTermina(coltura) {
  const modulo = document.createElement('form');
  modulo.className = 'modulo';
  modulo.noValidate = true;
  modulo.innerHTML = `
    <label>Data di fine<input type="text" name="data" placeholder="gg/mm/aaaa" value="${dataPerUtente(oggi())}"></label>
    <p class="errore" role="alert" hidden></p>
    <button type="submit" class="pulsante">Termina coltura</button>
  `;
  modulo.addEventListener('submit', evento => {
    evento.preventDefault();
    const dataFine = dataPerArchivio(new FormData(modulo).get('data'));
    const avviso = modulo.querySelector('.errore');
    let errore = '';
    if (!dataFine) errore = 'Scrivi la data come gg/mm/aaaa, es. 30/09/2026.';
    else if (dataFine < coltura.dataInizio) errore = `La data di fine non può essere prima dell'inizio (${dataPerUtente(coltura.dataInizio)}).`;
    if (errore) {
      avviso.textContent = errore;
      avviso.hidden = false;
      return;
    }
    if (confirm(`Terminare "${coltura.nome}"? Passerà nello storico di ${coltura.aiuoleIds.join(', ')} e nel registro verrà aggiunto il raccolto.`)) {
      terminaColtura(coltura, dataFine);
    }
  });
  return modulo;
}

function pulsanteRiattiva(dati, coltura) {
  const pulsante = elemento('button', 'Riattiva coltura', 'pulsante secondario');
  pulsante.type = 'button';
  pulsante.addEventListener('click', () => {
    const conflitti = coltura.aiuoleIds.filter(id => {
      const parte = coltura.parti?.[id];
      const asse = divisione(dati, id);
      return parte && asse && ASSI[parte] !== asse;
    });
    if (conflitti.length > 0) {
      alert(`Non si può riattivare: in ${conflitti.join(', ')} le colture attive dividono l'aiuola in un altro modo.`);
      return;
    }
    if (confirm(`Riattivare "${coltura.nome}"? Tornerà tra le colture attive e la data di fine verrà cancellata.`)) {
      riattivaColtura(coltura);
    }
  });
  return pulsante;
}

function terminaColtura(coltura, dataFine) {
  try {
    const dati = carica();
    Object.assign(dati.colture.find(c => c.id === coltura.id), { stato: 'terminata', dataFine });
    // Il raccolto finisce da solo nel registro, con il periodo della coltura
    dati.registro.push({
      id: nuovoId('r'), tipo: 'raccolto', data: dataFine, dal: coltura.dataInizio,
      aiuoleIds: coltura.aiuoleIds, parti: coltura.parti ?? {}, colturaId: coltura.id, quantita: '', note: '',
    });
    salva(dati);
    history.back();
  } catch (errore) {
    alert(errore.message);
  }
}

function riattivaColtura(coltura) {
  try {
    const dati = carica();
    Object.assign(dati.colture.find(c => c.id === coltura.id), { stato: 'attiva', dataFine: null });
    // Toglie il raccolto automatico creato quando era stata terminata
    dati.registro = dati.registro.filter(v => !(v.colturaId === coltura.id && v.tipo === 'raccolto' && v.dal));
    salva(dati);
    history.back();
  } catch (errore) {
    alert(errore.message);
  }
}

function nomeColtura(c) {
  return c.varieta ? `${c.nome} – ${c.varieta}` : c.nome;
}

// Dalla più recente; a parità di data, prima l'ultima inserita
function ordinaVoci(voci) {
  return voci.filter(v => v.data <= oggi()).reverse().sort((x, y) => y.data.localeCompare(x.data));
}

function doveVoce(dati, v) {
  return tuttoOrto(dati, v) ? 'tutto l\'orto' : doveColtura(v);
}

function elencoVoci(dati, voci, testoSeVuoto) {
  if (voci.length === 0) return elemento('p', testoSeVuoto);
  const ul = elemento('ul', '', 'registro');
  for (const v of voci) {
    const coltura = dati.colture.find(c => c.id === v.colturaId);
    const dove = doveVoce(dati, v);
    const periodo = v.dal ? `dal ${dataPerUtente(v.dal)} al ${dataPerUtente(v.data)}` : '';
    const dettagli = [coltura && nomeColtura(coltura), dove, periodo, v.quantita].filter(Boolean).join(' · ');
    const collegamento = link('', `#/voce/${v.id}`);
    collegamento.append(elemento('strong', `${dataPerUtente(v.data)} · ${testoTipo(v)}`), elemento('br'), dettagli);
    if (v.note) collegamento.append(elemento('br'), v.note);
    const voce = elemento('li');
    voce.append(collegamento);
    ul.append(voce);
  }
  return ul;
}

export function registro(dati, aiuola = null) {
  const voci = aiuola ? dati.registro.filter(v => v.aiuoleIds.includes(aiuola.id)) : dati.registro;
  const sezione = document.createElement('section');
  sezione.append(
    aiuola ? link(`← Aiuola ${aiuola.id}`, `#/aiuola/${aiuola.id}`, 'indietro') : link('← Mappa', '#/', 'indietro'),
    elemento('h2', aiuola ? `Registro ${aiuola.id}` : 'Registro'),
    link('Aggiungi al registro', aiuola ? `#/aiuola/${aiuola.id}/nuova-voce` : '#/registro/nuova-voce', 'pulsante'),
    elencoVoci(dati, ordinaVoci(voci), 'Nessuna voce nel registro.'),
  );
  return sezione;
}

export function nuovaVoce(dati, { aiuoleIds = [], coltura = null } = {}) {
  const modulo = document.createElement('form');
  modulo.className = 'modulo';
  modulo.noValidate = true;
  // Solo testo fisso e dati dell'app: i nomi delle colture si aggiungono sotto, con textContent
  modulo.innerHTML = `
    <fieldset>
      <legend>Attività (scorri la rotella)</legend>
      <div class="posto-rotella"></div>
      <input type="hidden" name="tipo" value="">
    </fieldset>
    <label class="campo-altro" hidden>Che attività è?<input type="text" name="attivita" autocomplete="off" placeholder="es. Pacciamatura"></label>
    <label>Data<input type="text" name="data" placeholder="gg/mm/aaaa" value="${dataPerUtente(oggi())}"></label>
    <label>Coltura (facoltativa)<select name="coltura"><option value="">Nessuna</option></select></label>
    <div class="posto-aiuole"></div>
    <label>Quantità (facoltativa)<input type="text" name="quantita" autocomplete="off" placeholder="es. 3 kg, 20 litri"></label>
    <label>Note (facoltative)<textarea name="note" rows="3"></textarea></label>
    <p class="errore" role="alert" hidden></p>
    <button type="submit" class="pulsante">Salva nel registro</button>
  `;

  // Prima voce vuota, così non si salva per sbaglio un'attività mai scelta; "nota" si chiama "Altro"
  const tipi = ['', ...Object.keys(TIPI)];
  const etichette = tipi.map(k => !k ? 'Scegli l\'attività…' : k === 'nota' ? 'Altro' : TIPI[k]);
  const campoAltro = modulo.querySelector('.campo-altro');
  const rotella = creaRotella(etichette, 0, i => {
    modulo.elements.tipo.value = tipi[i];
    campoAltro.hidden = tipi[i] !== 'nota';
  });
  modulo.querySelector('.posto-rotella').replaceWith(rotella.elemento);

  riempiColture(modulo.querySelector('select[name="coltura"]'), dati, coltura);
  modulo.querySelector('.posto-aiuole').replaceWith(selettoreAiuole(dati, scelteDa(aiuoleIds, coltura?.parti)));
  modulo.addEventListener('submit', evento => {
    evento.preventDefault();
    salvaVoce(modulo);
  });

  const indietro = elemento('button', '← Indietro', 'indietro');
  indietro.type = 'button';
  indietro.addEventListener('click', () => history.back());

  const sezione = document.createElement('section');
  sezione.append(indietro, elemento('h2', 'Nuova voce di registro'), modulo);
  return sezione;
}

// Riempie la tendina "Coltura" con le colture attive (più quella di partenza, se c'è)
function riempiColture(scelta, dati, coltura) {
  for (const c of dati.colture.filter(c => c.stato === 'attiva' || c.id === coltura?.id)) {
    const opzione = elemento('option', nomeColtura(c));
    opzione.value = c.id;
    opzione.selected = c.id === coltura?.id;
    scelta.append(opzione);
  }
}

function salvaVoce(modulo) {
  const campi = new FormData(modulo);
  const tipo = campi.get('tipo');
  const data = dataPerArchivio(campi.get('data'));

  const attivita = (campi.get('attivita') ?? '').trim();

  const errori = [];
  if (!tipo) errori.push('Scegli l\'attività con la rotella.');
  if (tipo === 'nota' && !attivita) errori.push('Scrivi che attività è.');
  if (!data) errori.push('Scrivi la data come gg/mm/aaaa, es. 02/10/2026.');

  const avviso = modulo.querySelector('.errore');
  if (errori.length > 0) {
    avviso.textContent = errori.join('\n');
    avviso.hidden = false;
    return;
  }

  try {
    const dati = carica();
    dati.registro.push({
      id: nuovoId('r'), data, tipo, aiuoleIds: campi.getAll('aiuole'),
      parti: leggiParti(campi, campi.getAll('aiuole')),
      colturaId: campi.get('coltura') || null,
      quantita: campi.get('quantita').trim(), note: campi.get('note').trim(),
      ...(tipo === 'nota' && { attivita }),
    });
    salva(dati);
    history.back();
  } catch (errore) {
    avviso.textContent = errore.message;
    avviso.hidden = false;
  }
}

export function schedaVoce(dati, voce) {
  const indietro = elemento('button', '← Indietro', 'indietro');
  indietro.type = 'button';
  indietro.addEventListener('click', () => history.back());

  const coltura = dati.colture.find(c => c.id === voce.colturaId);
  const elimina = elemento('button', 'Elimina voce', 'pulsante pericolo');
  elimina.type = 'button';
  elimina.addEventListener('click', () => eliminaVoce(voce));

  const sezione = document.createElement('section');
  sezione.append(indietro, elemento('h2', testoTipo(voce)), riga('Data', dataPerUtente(voce.data)));
  if (voce.dal) sezione.append(riga('Periodo', `dal ${dataPerUtente(voce.dal)} al ${dataPerUtente(voce.data)}`));
  if (coltura) sezione.append(riga('Coltura', nomeColtura(coltura)));
  sezione.append(riga('Aiuole', doveVoce(dati, voce) || 'Nessuna'));
  if (voce.quantita) sezione.append(riga('Quantità', voce.quantita));
  sezione.append(riga('Note', voce.note || 'Nessuna nota.'), elimina);
  return sezione;
}

function eliminaVoce(voce) {
  if (!confirm(`Eliminare la voce "${testoTipo(voce)} del ${dataPerUtente(voce.data)}"? Non si potrà recuperare.`)) return;
  try {
    const dati = carica();
    dati.registro = dati.registro.filter(v => v.id !== voce.id);
    salva(dati);
    history.back();
  } catch (errore) {
    alert(errore.message);
  }
}

function urgente(t) {
  return !t.fatto && t.scadenza && t.scadenza <= domani();
}

// Task di aiuole specifiche (non quelli su tutto l'orto, che vanno sul vialetto)
function taskAiuola(dati, aiuolaId) {
  return dati.task.filter(t => !tuttoOrto(dati, t) && t.aiuoleIds.includes(aiuolaId));
}

// 'urgente' se almeno un task da fare è urgente, 'programmato' se ce ne sono altri, altrimenti null
function segnoTask(tasks) {
  const daFare = tasks.filter(t => !t.fatto);
  if (daFare.some(urgente)) return 'urgente';
  return daFare.length > 0 ? 'programmato' : null;
}

function puntino(segno) {
  return elemento('span', segno === 'urgente' ? '!' : '', `puntino puntino-${segno}`);
}

function testoScadenza(t) {
  if (!t.scadenza) return '';
  if (t.scadenza < oggi()) return `scaduto il ${dataPerUtente(t.scadenza)}`;
  if (t.scadenza === oggi()) return 'entro oggi';
  if (t.scadenza === domani()) return 'entro domani';
  return `entro ${dataPerUtente(t.scadenza)}`;
}

// Prima quelli con scadenza (dalla più vicina; gli scaduti finiscono in cima), poi quelli senza
function ordinaTask(tasks) {
  return [...tasks].sort((x, y) => (x.scadenza ?? '9999').localeCompare(y.scadenza ?? '9999'));
}

function elencoTask(dati, tasks, testoSeVuoto) {
  if (tasks.length === 0) return elemento('p', testoSeVuoto);
  const ul = elemento('ul', '', 'lista-task');
  for (const t of tasks) {
    const casella = elemento('input');
    casella.type = 'checkbox';
    casella.checked = t.fatto;
    casella.setAttribute('aria-label', `Fatto: ${t.titolo}`);
    casella.addEventListener('change', () => segnaTask(t.id, casella.checked));

    const coltura = dati.colture.find(c => c.id === t.colturaId);
    const dettagli = [doveVoce(dati, t), coltura && nomeColtura(coltura)].filter(Boolean).join(' · ');
    const quando = t.fatto ? `fatto il ${dataPerUtente(t.fattoIl)}` : testoScadenza(t);

    const testo = elemento('div');
    testo.append(link(t.titolo, `#/task/${t.id}`, 'titolo-task'));
    if (quando) testo.append(' · ', elemento('span', quando, urgente(t) ? 'urgente' : ''));
    testo.append(elemento('br'), dettagli);

    const voce = elemento('li');
    voce.append(casella, testo);
    ul.append(voce);
  }
  return ul;
}

function segnaTask(id, fatto) {
  try {
    const dati = carica();
    Object.assign(dati.task.find(t => t.id === id), { fatto, fattoIl: fatto ? oggi() : null });
    salva(dati);
    document.dispatchEvent(new Event('dati-cambiati'));
  } catch (errore) {
    alert(errore.message);
  }
}

export function listaTask(dati, fatti = false) {
  const sezione = document.createElement('section');
  if (fatti) {
    const elenco = dati.task.filter(t => t.fatto).sort((x, y) => y.fattoIl.localeCompare(x.fattoIl));
    sezione.append(
      link('← Da fare', '#/task', 'indietro'),
      elemento('h2', 'Fatti'),
      elencoTask(dati, elenco, 'Nessun task fatto.'),
    );
  } else {
    const daFare = ordinaTask(dati.task.filter(t => !t.fatto));
    const quantiFatti = dati.task.length - daFare.length;
    sezione.append(
      link('← Mappa', '#/', 'indietro'),
      elemento('h2', 'Da fare'),
      link('Aggiungi task', '#/task/nuovo', 'pulsante'),
      elencoTask(dati, daFare, 'Niente da fare.'),
      link(`Mostra quelli fatti (${quantiFatti})`, '#/task/fatti', 'pulsante secondario'),
    );
  }
  return sezione;
}

export function moduloTask(dati, { aiuoleIds = [], coltura = null, task = null } = {}) {
  const modulo = document.createElement('form');
  modulo.className = 'modulo';
  modulo.noValidate = true;
  // Solo testo fisso e dati dell'app: titolo e nomi delle colture si aggiungono sotto, senza innerHTML
  modulo.innerHTML = `
    <label>Cosa fare<input type="text" name="titolo" autocomplete="off" placeholder="es. Legare i pomodori"></label>
    <label>Scadenza (facoltativa)<input type="text" name="scadenza" placeholder="gg/mm/aaaa"></label>
    <div class="posto-aiuole"></div>
    <label>Coltura (facoltativa)<select name="coltura"><option value="">Nessuna</option></select></label>
    <p class="errore" role="alert" hidden></p>
    <button type="submit" class="pulsante">${task ? 'Salva modifiche' : 'Salva task'}</button>
  `;
  riempiColture(modulo.querySelector('select[name="coltura"]'), dati,
    task ? dati.colture.find(c => c.id === task.colturaId) : coltura);
  if (task) {
    modulo.elements.titolo.value = task.titolo;
    modulo.elements.scadenza.value = dataPerUtente(task.scadenza);
  }
  modulo.querySelector('.posto-aiuole').replaceWith(selettoreAiuole(dati,
    task ? scelteDa(task.aiuoleIds, task.parti) : scelteDa(aiuoleIds, coltura?.parti)));
  modulo.addEventListener('submit', evento => {
    evento.preventDefault();
    salvaTask(modulo, task?.id);
  });

  const indietro = elemento('button', '← Indietro', 'indietro');
  indietro.type = 'button';
  indietro.addEventListener('click', () => history.back());

  const sezione = document.createElement('section');
  sezione.append(indietro, elemento('h2', task ? 'Modifica task' : 'Nuovo task'), modulo);
  return sezione;
}

function salvaTask(modulo, id = null) {
  const campi = new FormData(modulo);
  const titolo = campi.get('titolo').trim();
  const testoScad = campi.get('scadenza').trim();
  const scadenza = testoScad ? dataPerArchivio(testoScad) : null;

  const errori = [];
  if (!titolo) errori.push('Scrivi cosa c\'è da fare.');
  if (testoScad && !scadenza) errori.push('Scrivi la scadenza come gg/mm/aaaa, es. 05/10/2026, oppure lasciala vuota.');

  const avviso = modulo.querySelector('.errore');
  if (errori.length > 0) {
    avviso.textContent = errori.join('\n');
    avviso.hidden = false;
    return;
  }

  try {
    const campiTask = {
      titolo, scadenza, aiuoleIds: campi.getAll('aiuole'), parti: leggiParti(campi, campi.getAll('aiuole')),
      colturaId: campi.get('coltura') || null,
    };
    const dati = carica();
    if (id) Object.assign(dati.task.find(t => t.id === id), campiTask);
    else dati.task.push({ id: nuovoId('t'), ...campiTask, fatto: false, fattoIl: null });
    salva(dati);
    history.back();
  } catch (errore) {
    avviso.textContent = errore.message;
    avviso.hidden = false;
  }
}

export function schedaTask(dati, task) {
  const indietro = elemento('button', '← Indietro', 'indietro');
  indietro.type = 'button';
  indietro.addEventListener('click', () => history.back());

  const elimina = elemento('button', 'Elimina task', 'pulsante pericolo');
  elimina.type = 'button';
  elimina.addEventListener('click', () => eliminaTask(task));

  const coltura = dati.colture.find(c => c.id === task.colturaId);
  const sezione = document.createElement('section');
  sezione.append(
    indietro,
    elemento('h2', task.titolo),
    riga('Stato', task.fatto ? `Fatto il ${dataPerUtente(task.fattoIl)}` : 'Da fare'),
    riga('Scadenza', task.scadenza ? dataPerUtente(task.scadenza) : 'Nessuna'),
    riga('Aiuole', doveVoce(dati, task) || 'Nessuna'),
  );
  if (coltura) sezione.append(riga('Coltura', nomeColtura(coltura)));
  sezione.append(link('Modifica task', `#/task/${task.id}/modifica`, 'pulsante'), elimina);
  return sezione;
}

function eliminaTask(task) {
  if (!confirm(`Eliminare il task "${task.titolo}"? Non si potrà recuperare.`)) return;
  try {
    const dati = carica();
    dati.task = dati.task.filter(t => t.id !== task.id);
    salva(dati);
    history.back();
  } catch (errore) {
    alert(errore.message);
  }
}

// ---- Pagina Test: le colture nel tempo, un binario per aiuola, raggruppate per settore ----

let spostamentoTest = 0;   // di quanti mesi è spostata la vista (le frecce spostano di 3)
const INIZIALI_MESI = ['G', 'F', 'M', 'A', 'M', 'G', 'L', 'A', 'S', 'O', 'N', 'D'];
const COLORE_SENZA_TAPPA = '#8b7d6b';

export function paginaTest(dati) {
  const sezione = document.createElement('section');
  sezione.className = 'pagina-test';
  const corpo = elemento('div');
  sezione.append(link('← Mappa', '#/', 'indietro'), elemento('h2', 'Test'), corpo);
  disegnaTest(dati, corpo);
  return sezione;
}

function disegnaTest(dati, corpo) {
  // 13 mesi: da un mese fa (più lo spostamento) a 12 mesi avanti
  const oggiData = new Date(oggi());
  const inizio = new Date(oggiData.getFullYear(), oggiData.getMonth() - 1 + spostamentoTest, 1);
  const fine = new Date(inizio.getFullYear(), inizio.getMonth() + 13, 1);
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const daIni = iso(inizio), aFin = iso(fine);
  const durata = fine - inizio;
  const pos = d => Math.min(1, Math.max(0, (new Date(d) - inizio) / durata)) * 100;

  const frecce = elemento('div', '', 'test-frecce');
  const indietro = elemento('button', '◀', 'freccia-test');
  const avanti = elemento('button', '▶', 'freccia-test');
  indietro.type = avanti.type = 'button';
  indietro.setAttribute('aria-label', '3 mesi prima');
  avanti.setAttribute('aria-label', '3 mesi dopo');
  indietro.addEventListener('click', () => { spostamentoTest -= 3; disegnaTest(dati, corpo); });
  avanti.addEventListener('click', () => { spostamentoTest += 3; disegnaTest(dati, corpo); });
  const ultimo = new Date(fine.getFullYear(), fine.getMonth() - 1, 1);
  frecce.append(indietro, elemento('span', `${MESI[inizio.getMonth()]} ${inizio.getFullYear()} – ${MESI[ultimo.getMonth()]} ${ultimo.getFullYear()}`, 'test-periodo'), avanti);

  const mesi = elemento('div', '', 'test-mesi');
  mesi.append(elemento('span'));
  for (let i = 0; i < 13; i++) mesi.append(elemento('span', INIZIALI_MESI[(inizio.getMonth() + i) % 12]));

  const settori = elemento('div');
  for (const settore of [1, 2, 3, 4]) {
    const aiuole = dati.aiuole.filter(a => a.settore === settore).sort((x, y) => x.posizione - y.posizione);
    const testa = elemento('div', '', 'test-settore');
    testa.append(elemento('span', `Settore ${settore}`));
    settori.append(testa);
    for (const a of aiuole) {
      const fila = elemento('div', '', 'test-fila');
      const binario = elemento('div', '', 'test-binario');
      for (const c of dati.colture.filter(c => c.aiuoleIds.includes(a.id) && c.stato !== 'pianificata')) {
        const fineC = fineDi(c) ?? aFin;
        if (fineC < daIni || c.dataInizio >= aFin) continue;
        const scheda = colturaDaNome(c.nome);
        const parte = c.parti?.[a.id];
        const posto = !parte ? 'pieno' : parte === 'fondo' || parte === 'vialetto' ? 'alto' : 'basso';
        const barra = link('', `#/coltura/${c.id}`, `test-barra ${posto}${iniziata(c) ? '' : ' futura'}`);
        barra.style.left = `${pos(c.dataInizio)}%`;
        barra.style.width = `${Math.max(1.5, pos(fineC) - pos(c.dataInizio))}%`;
        barra.style.backgroundColor = scheda ? TAPPE[scheda.tappa].c : COLORE_SENZA_TAPPA;
        barra.title = `${nomeColtura(c)} · dal ${dataPerUtente(c.dataInizio)}`;
        barra.append(icona(c.nome, 'icona-barra', 2.2), elemento('span', c.nome));
        binario.append(barra);
      }
      const riga = elemento('span', '', 'test-oggi');
      riga.style.left = `${pos(oggi())}%`;
      if (oggi() >= daIni && oggi() < aFin) binario.append(riga);
      fila.append(elemento('b', a.id), binario);
      settori.append(fila);
    }
  }

  const legenda = elemento('div', '', 'test-legenda');
  legenda.innerHTML = '<span><i></i>nell\'orto</span><span><i class="fut"></i>in programma</span><span><i class="og"></i>oggi</span>';
  const aiuto = elemento('p', 'Tocca una barra per aprire la coltura. Il colore è il gruppo della rotazione; senza data di fine, la barra arriva alla fine della raccolta indicata dal catalogo.', 'test-aiuto');
  corpo.replaceChildren(frecce, mesi, settori, legenda, aiuto);
}
