// Funzioni che costruiscono le schermate. Ricevono i dati e restituiscono elementi da mostrare.

import {
  carica, salva, esporta, importa, oggi, domani, nuovoId, dataPerUtente, dataPerArchivio,
} from './dati.js';
import { iconaSvg } from './disegni.js';

const TIPI = {
  semina: 'Semina', trapianto: 'Trapianto', irrigazione: 'Irrigazione',
  concimazione: 'Concimazione', trattamento: 'Trattamento',
  diserbo: 'Diserbo/pulizia', lavorazione: 'Zappatura/lavorazione del terreno',
  raccolto: 'Raccolto', nota: 'Nota',
};

// Icone di Feather Icons (licenza MIT)
const ICONE = {
  registro: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  task: '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
};

// Ogni metà appartiene a uno dei due modi di dividere un'aiuola
const ASSI = {
  fondo: 'fondo-davanti', davanti: 'fondo-davanti',
  vialetto: 'vialetto-esterno', esterno: 'vialetto-esterno',
};

// Come è divisa un'aiuola dalle colture attive: 'fondo-davanti', 'vialetto-esterno' o null
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
  const attive = dati.colture.filter(c => c.stato === 'attiva' && c.aiuoleIds.includes(aiuola.id));
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
  scorciatoie.append(scorciatoia('Registro', '#/registro', 'registro'), daFare);
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
    colonna.append(link);
  }
  return colonna;
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
  const attive = dati.colture.filter(c => c.stato === 'attiva' && c.aiuoleIds.includes(aiuola.id));
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

const PRESSIONE = 1000;   // millisecondi di pressione per "sollevare" un ortaggio

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
  const attive = colturePer(dati, aiuola.id).filter(c => c.stato === 'attiva');
  const intestazione = elemento('div', '', 'intestazione');
  intestazione.append(elemento('h2', `Aiuola ${aiuola.id}`), link('(info)', `#/aiuola/${aiuola.id}/info`, 'link-info'));
  const sezione = document.createElement('section');
  sezione.append(
    link('← Mappa', '#/', 'indietro'),
    intestazione,
    elemento('h3', 'Colture attive'),
    elencoColture(attive, 'Nessuna coltura attiva.'),
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
    .filter(c => c.stato !== 'attiva')
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
  );
  return sezione;
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
      'Sostituire tutti i dati attuali? Se ti servono, esportali prima.'
    );
    if (!conferma) return;
    salva(dati);
    alert('Backup importato.');
    location.hash = '#/';
  } catch (errore) {
    alert(errore.message);
  }
}

export function nuovaColtura(dati, aiuola) {
  const modulo = document.createElement('form');
  modulo.className = 'modulo';
  modulo.noValidate = true;
  // Solo testo fisso e dati dell'app: nessun testo scritto dall'utente finisce qui dentro
  modulo.innerHTML = `
    <label>Nome<input type="text" name="nome" autocomplete="off" placeholder="es. Pomodoro"></label>
    <label>Varietà (facoltativa)<input type="text" name="varieta" autocomplete="off" placeholder="es. Cuore di bue"></label>
    <div class="posto-aiuole"></div>
    <label>Data di inizio<input type="text" name="data" placeholder="gg/mm/aaaa" value="${dataPerUtente(oggi())}"></label>
    <fieldset>
      <legend>Metodo</legend>
      <div class="due-colonne">
        <label class="opzione"><input type="radio" name="metodo" value="semina"> Semina</label>
        <label class="opzione"><input type="radio" name="metodo" value="trapianto"> Trapianto</label>
      </div>
    </fieldset>
    <label>Note (facoltative)<textarea name="note" rows="3"></textarea></label>
    <p class="errore" role="alert" hidden></p>
    <button type="submit" class="pulsante">Salva coltura</button>
  `;
  modulo.querySelector('.posto-aiuole').replaceWith(selettoreAiuole(dati, { [aiuola.id]: '' }));
  modulo.addEventListener('submit', evento => {
    evento.preventDefault();
    salvaColtura(modulo);
  });

  const sezione = document.createElement('section');
  sezione.append(
    link(`← Aiuola ${aiuola.id}`, `#/aiuola/${aiuola.id}`, 'indietro'),
    elemento('h2', `Nuova coltura in ${aiuola.id}`),
    modulo,
  );
  return sezione;
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

// Riquadro di un'aiuola con la parte scelta in verde scuro: parte = null (non scelta), 'intera' o una metà
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

// Pop-up: disegno dell'aiuola a sinistra, rotella delle parti a destra.
// scegli(parte) riceve la parte confermata, oppure null se l'aiuola va tolta
function apriPopup(dati, aiuola, parteAttuale, scegli) {
  const asse = divisione(dati, aiuola.id);
  const opzioni = ['', ...Object.keys(ASSI).filter(p => !asse || ASSI[p] === asse)];
  let indice = Math.max(0, opzioni.indexOf(parteAttuale));

  const anteprima = elemento('div', '', 'anteprima');
  const rotella = elemento('div', '', 'rotella');
  const voci = opzioni.map((parte, i) => {
    const voce = elemento('button', parte ? `Metà ${parte}` : 'Intera', 'voce-rotella');
    voce.type = 'button';
    voce.addEventListener('click', () => rotella.scrollTo({ top: i * ALTEZZA_VOCE, behavior: 'smooth' }));
    return voce;
  });
  rotella.append(...voci);

  function mostraScelta() {
    voci.forEach((voce, i) => voce.classList.toggle('attiva', i === indice));
    anteprima.replaceChildren(disegnoAiuola(aiuola, opzioni[indice] || 'intera'));
  }
  rotella.addEventListener('scroll', () => {
    const nuovo = Math.min(opzioni.length - 1, Math.max(0, Math.round(rotella.scrollTop / ALTEZZA_VOCE)));
    if (nuovo !== indice) {
      indice = nuovo;
      mostraScelta();
    }
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
  corpo.append(anteprima, rotella);
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
  rotella.scrollTop = indice * ALTEZZA_VOCE;
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

function salvaColtura(modulo) {
  const campi = new FormData(modulo);
  const nome = campi.get('nome').trim();
  const aiuoleIds = campi.getAll('aiuole');
  const dataInizio = dataPerArchivio(campi.get('data'));
  const metodo = campi.get('metodo');

  const errori = [];
  if (!nome) errori.push('Scrivi il nome della coltura.');
  if (aiuoleIds.length === 0) errori.push('Scegli almeno un\'aiuola.');
  if (!dataInizio) errori.push('Scrivi la data come gg/mm/aaaa, es. 20/04/2026.');
  if (!metodo) errori.push('Scegli semina o trapianto.');

  const avviso = modulo.querySelector('.errore');
  if (errori.length > 0) {
    avviso.textContent = errori.join('\n');
    avviso.hidden = false;
    return;
  }

  try {
    const parti = leggiParti(campi, aiuoleIds);
    const dati = carica();
    const colturaId = nuovoId('c');
    dati.colture.push({
      id: colturaId, nome, varieta: campi.get('varieta').trim(), aiuoleIds, parti,
      dataInizio, metodo, stato: 'attiva', dataFine: null, note: campi.get('note').trim(),
    });
    // La semina o il trapianto finiscono anche nel registro
    dati.registro.push({
      id: nuovoId('r'), data: dataInizio, tipo: metodo, aiuoleIds, parti, colturaId,
      quantita: '', note: '',
    });
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
  const sezione = document.createElement('section');
  sezione.append(
    indietro,
    elemento('h2', coltura.varieta ? `${coltura.nome} – ${coltura.varieta}` : coltura.nome),
    riga('Stato', attiva ? 'Attiva' : 'Terminata'),
    riga('Aiuole', doveColtura(coltura)),
    riga('Inizio', dataPerUtente(coltura.dataInizio)),
  );
  if (!attiva) sezione.append(riga('Fine', dataPerUtente(coltura.dataFine)));
  sezione.append(
    riga('Metodo', coltura.metodo === 'semina' ? 'Semina' : 'Trapianto'),
    riga('Note', coltura.note || 'Nessuna nota.'),
    elemento('h3', 'Da fare'),
    elencoTask(dati, ordinaTask(dati.task.filter(t => !t.fatto && t.colturaId === coltura.id)), 'Niente da fare.'),
    link('Aggiungi task', `#/coltura/${coltura.id}/nuovo-task`, 'pulsante secondario'),
    elemento('h3', 'Registro'),
    elencoVoci(dati, ordinaVoci(dati.registro.filter(v => v.colturaId === coltura.id)), 'Nessuna voce nel registro.'),
    link('Aggiungi al registro', `#/coltura/${coltura.id}/nuova-voce`, 'pulsante secondario'),
    attiva ? moduloTermina(coltura) : pulsanteRiattiva(dati, coltura),
  );
  return sezione;
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
  return [...voci].reverse().sort((x, y) => y.data.localeCompare(x.data));
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
    collegamento.append(elemento('strong', `${dataPerUtente(v.data)} · ${TIPI[v.tipo]}`), elemento('br'), dettagli);
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
      <legend>Attività</legend>
      <div class="due-colonne">${opzioniRadio('tipo', Object.entries(TIPI))}</div>
    </fieldset>
    <label>Data<input type="text" name="data" placeholder="gg/mm/aaaa" value="${dataPerUtente(oggi())}"></label>
    <label>Coltura (facoltativa)<select name="coltura"><option value="">Nessuna</option></select></label>
    <div class="posto-aiuole"></div>
    <label>Quantità (facoltativa)<input type="text" name="quantita" autocomplete="off" placeholder="es. 3 kg, 20 litri"></label>
    <label>Note (facoltative)<textarea name="note" rows="3"></textarea></label>
    <p class="errore" role="alert" hidden></p>
    <button type="submit" class="pulsante">Salva nel registro</button>
  `;

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

function opzioniRadio(nome, opzioni, scelta) {
  return opzioni
    .map(([valore, testo]) => `<label class="opzione"><input type="radio" name="${nome}" value="${valore}"${valore === scelta ? ' checked' : ''}> ${testo}</label>`)
    .join('');
}

function salvaVoce(modulo) {
  const campi = new FormData(modulo);
  const tipo = campi.get('tipo');
  const data = dataPerArchivio(campi.get('data'));

  const errori = [];
  if (!tipo) errori.push('Scegli l\'attività.');
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
  sezione.append(indietro, elemento('h2', TIPI[voce.tipo]), riga('Data', dataPerUtente(voce.data)));
  if (voce.dal) sezione.append(riga('Periodo', `dal ${dataPerUtente(voce.dal)} al ${dataPerUtente(voce.data)}`));
  if (coltura) sezione.append(riga('Coltura', nomeColtura(coltura)));
  sezione.append(riga('Aiuole', doveVoce(dati, voce) || 'Nessuna'));
  if (voce.quantita) sezione.append(riga('Quantità', voce.quantita));
  sezione.append(riga('Note', voce.note || 'Nessuna nota.'), elimina);
  return sezione;
}

function eliminaVoce(voce) {
  if (!confirm(`Eliminare la voce "${TIPI[voce.tipo]} del ${dataPerUtente(voce.data)}"? Non si potrà recuperare.`)) return;
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
