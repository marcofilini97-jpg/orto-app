// Funzioni che costruiscono le schermate. Ricevono i dati e restituiscono elementi da mostrare.

import {
  carica, salva, esporta, importa, oggi, domani, nuovoId, dataPerUtente, dataPerArchivio, orarioPerUtente,
  inProva, attivaProva, disattivaProva, ricominciaProva,
  sincronizza, collegaTelefono, scollegaTelefono, statoSincronizzazione, cancellaDatiTelefono,
  iscriviti, recuperaPassword, cambiaPassword, ortoAttuale, elencoOrti, cambiaOrto, nuovoOrto, rinominaOrto,
  personeOrto, aggiungiPersona, cambiaRuolo, togliPersona, eliminaOrto, esciDallOrto, soloLettura,
  elencoSimulazioni, leggiSimulazione, salvaSimulazione, eliminaSimulazione, entraArcade, inArcade,
  simulazioneAttiva, impostaGiornoArcade, datiPerSimulazione, inizioOrtoReale, oggiVero,
} from './dati.js';
import { iconaSvg } from './disegni.js';
import { colturaDaNome, disposizione, resa, AIUOLA, TAPPE, CATALOGO, GLOSSARIO, ESIGENZA } from './catalogo.js';
import {
  PROVE, TESSITURE, NOMI_PROPRIETA, suoloDi, suoloDiPartenza, testoValore, giudizioDrenaggio, classeDaPercentuali,
  spiegaEsito, consigliTerreno, avvisiTerrenoColtura,
} from './terreno.js';
import { GUIDE, LAVORI } from './impara.js';
import { pianoAutomatico, resaColtura, kgTra, inRaccolta, fineSovescio } from './arcade.js';

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
  // Quaderno ad anelli con il segnalibro che spunta di lato
  registro: '<rect x="5" y="2.5" width="13.5" height="19" rx="2"/><path d="M3 6h4M3 10h4M3 14h4M3 18h4"/><path d="M9.5 8h5.5M9.5 12h5.5M9.5 16h3.5"/><path d="M18.5 5.5h4l-1.3 2 1.3 2h-4"/>',
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
    if ((giornoMappa === null ? c.stato === 'attiva' : visibile(c)) && parte) return ASSI[parte];
  }
  return null;
}

// es. "2A, 2B metà fondo"
function doveColtura(c) {
  return c.aiuoleIds.map(id => c.parti?.[id] ? `${id} metà ${c.parti[id]}` : id).join(', ');
}

// Spazi dell'aiuola dove più colture attive si sovrappongono, es. [{ zona: 'fondo', n: 2 }]
function bollini(dati, aiuola) {
  const attive = dati.colture.filter(c => visibile(c) && c.aiuoleIds.includes(aiuola.id));
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
  if (inArcade()) return mappaArcade(dati);
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
    const nome = elemento('span', a.id, 'nome');
    // In Arcade: cestino accanto al nome se in quel giorno si raccoglie qualcosa
    if (modoArcade && dati.colture.some(c => c.aiuoleIds.includes(a.id) && inRaccoltaIl(c, oggi()))) {
      const cestino = elemento('span', '', 'cestino');
      cestino.innerHTML = CESTO;
      cestino.title = 'Si raccoglie';
      nome.append(cestino);
    }
    link.append(nome, ...piantine(dati, a));
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
// Giorni da oggi (o dal giorno mostrato nella mappa nel tempo)
const giorniDaOggi = iso => Math.round((new Date(iso) - new Date(giornoMappa ?? oggi())) / GIORNO);

// La prima coltura in programma nell'aiuola che inizia entro 30 giorni, oppure null
function prossimoArrivo(dati, aiuolaId) {
  return dati.colture
    .filter(c => c.stato === 'attiva' && c.aiuoleIds.includes(aiuolaId) && giorniDaOggi(c.dataInizio) > 0 && giorniDaOggi(c.dataInizio) <= 30)
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
  const attive = dati.colture.filter(c => visibile(c) && c.aiuoleIds.includes(aiuola.id));
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
      if (giornoMappa === null) rendiSpostabile(pianta, spazio, { colturaId: coltura.id, aiuolaId: aiuola.id, k, sporgeInAlto: posto !== 'sotto' });
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
    if (soloLettura()) return;
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
  modulo.className = 'modulo modifica-dati';
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
    elemento('h3', 'Terreno'),
    cartaTerreno(aiuola),
    modulo,
    pulsanteRiposiziona(aiuola),
  );
  return sezione;
}

// Cancella le posizioni scelte a mano in questa aiuola: si torna alla disposizione automatica
function pulsanteRiposiziona(aiuola) {
  const contenitore = elemento('div', '', 'modifica-dati');
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
    elemento('h3', "Il terreno dell'orto"),
    riepilogoTerreno(),
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

const NOMI_RUOLO = { gestore: 'gestore', membro: 'membro', lettore: 'sola lettura' };

// Domanda del primo collegamento, se sul server l'orto ha già dei dati
export function chiediSostituzione() {
  return confirm('Sul server ci sono già i dati dell\'orto.\n\n' +
    'OK = usa i dati del server su questo telefono (consigliato)\n' +
    'Annulla = unisci i dati di questo telefono a quelli del server');
}

// Entra / Iscriviti / Password dimenticata
function moduloAccesso() {
  let modo = 'entra';
  const modulo = document.createElement('form');
  modulo.className = 'modulo modulo-accesso';
  modulo.noValidate = true;
  modulo.innerHTML = `
    <div class="schede-accesso" role="tablist">
      <button type="button" role="tab" data-modo="entra">Entra</button>
      <button type="button" role="tab" data-modo="iscriviti">Iscriviti</button>
    </div>
    <p class="spiega-accesso"></p>
    <label>Email<input type="email" name="email" autocomplete="username"></label>
    <label class="campo-password">Password<input type="password" name="password" autocomplete="current-password"></label>
    <p class="errore" role="alert" hidden></p>
    <p class="fatto-accesso" role="status" hidden></p>
    <button type="submit" class="pulsante"></button>
    <button type="button" class="link-info dimenticata">Password dimenticata?</button>`;
  const c = modulo.elements;
  const avviso = modulo.querySelector('.errore');
  const fatto = modulo.querySelector('.fatto-accesso');
  const invia = modulo.querySelector('[type="submit"]');
  const TESTI = {
    entra: ["Entra con il tuo account: i dati dell'orto si salvano anche online e si condividono con le persone dell'orto.", 'Entra'],
    iscriviti: ["Crea un account: ti mandiamo un'email con il link per confermarlo. Senza account l'app funziona lo stesso, con i dati solo su questo telefono.", 'Iscriviti'],
    recupera: ["Scrivi la tua email: ti mandiamo un link per scegliere una nuova password.", 'Mandami il link'],
  };
  const mostra = m => {
    modo = m;
    for (const b of modulo.querySelectorAll('[data-modo]')) b.setAttribute('aria-selected', String(b.dataset.modo === m));
    modulo.querySelector('.spiega-accesso').textContent = TESTI[m][0];
    invia.textContent = TESTI[m][1];
    modulo.querySelector('.campo-password').hidden = m === 'recupera';
    modulo.querySelector('.dimenticata').hidden = m !== 'entra';
    c.password.autocomplete = m === 'iscriviti' ? 'new-password' : 'current-password';
    avviso.hidden = true;
    fatto.hidden = true;
  };
  for (const b of modulo.querySelectorAll('[data-modo]')) b.addEventListener('click', () => mostra(b.dataset.modo));
  modulo.querySelector('.dimenticata').addEventListener('click', () => mostra('recupera'));
  mostra('entra');

  modulo.addEventListener('submit', async evento => {
    evento.preventDefault();
    const email = c.email.value.trim().toLowerCase();
    const password = c.password.value;
    const errore = testo => { avviso.textContent = testo; avviso.hidden = false; };
    avviso.hidden = true;
    fatto.hidden = true;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return errore("Scrivi un'email valida.");
    if (modo !== 'recupera' && password.length < 8) return errore('La password deve avere almeno 8 caratteri.');
    invia.disabled = true;
    const testo = invia.textContent;
    invia.textContent = 'Un momento…';
    try {
      if (modo === 'entra') {
        await collegaTelefono(email, password, chiediSostituzione);
        document.dispatchEvent(new Event('dati-cambiati'));
        return;
      }
      if (modo === 'iscriviti') await iscriviti(email, password);
      else await recuperaPassword(email);
      fatto.textContent = modo === 'iscriviti'
        ? `Fatto! Ti abbiamo mandato un'email a ${email}: apri il link per confermare l'account (guarda anche nello spam).`
        : `Se esiste un account con ${email}, ti è arrivata un'email con il link per la nuova password.`;
      fatto.hidden = false;
    } catch (e) {
      errore(e instanceof TypeError ? 'Server non raggiungibile: controlla la connessione.' : e.message);
    }
    invia.disabled = false;
    invia.textContent = testo;
  });
  return modulo;
}

// Pagina del link "nuova password" dell'email
export function paginaNuovaPassword() {
  const sezione = document.createElement('section');
  const modulo = document.createElement('form');
  modulo.className = 'modulo';
  modulo.noValidate = true;
  modulo.innerHTML = `
    <label>Nuova password<input type="password" name="password" autocomplete="new-password"></label>
    <p class="errore" role="alert" hidden></p>
    <button type="submit" class="pulsante">Salva la nuova password</button>`;
  modulo.addEventListener('submit', async evento => {
    evento.preventDefault();
    const avviso = modulo.querySelector('.errore');
    const password = modulo.elements.password.value;
    if (password.length < 8) {
      avviso.textContent = 'La password deve avere almeno 8 caratteri.';
      avviso.hidden = false;
      return;
    }
    try {
      await cambiaPassword(password);
      alert('Password cambiata.');
      location.replace('#/impostazioni');
    } catch (e) {
      avviso.textContent = e instanceof TypeError ? 'Server non raggiungibile: controlla la connessione.' : e.message;
      avviso.hidden = false;
    }
  });
  sezione.append(elemento('h2', 'Nuova password'), modulo);
  return sezione;
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
    box.append(moduloAccesso());
    return box;
  }

  box.append(
    riga('Collegato come', stato.email ?? '—'),
    riga('Orto', stato.orto ? `${stato.orto.nome} · ${NOMI_RUOLO[stato.orto.ruolo]}` : '—'),
    riga('Ultima sincronizzazione', stato.ultimaSync ? orarioPerUtente(stato.ultimaSync) : 'mai'),
  );
  box.append(link('I miei orti', '#/orti', 'pulsante secondario'));
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
  return scheda.tappa === 'V' && date[0] ? fineSovescio(scheda, inizio, date[0]) : date[0] ?? null;
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

    const aiuoleScelte = aiuoleIds.map(id => dati.aiuole.find(a => a.id === id)).filter(Boolean);
    const avvisi = [
      ...avvisiTerrenoColtura(scheda, aiuoleScelte).map(([titolo, testo, ids]) => [titolo, `${testo} (${ids.join(', ')})`]),
      ...(inizio && inizio > oggi() ? avvisiColtura(dati, { scheda, aiuoleIds, parti, inizio, metodo, colturaId }) : []),
    ];
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
  if (scheda && simulazioneAttiva()?.parametri.preferenze?.escluse?.includes(scheda.id)) {
    avvisi.push(['Non la volevi. ', 'Nelle preferenze di questa simulazione hai escluso questa coltura.']);
  }
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

  // Rotazione: la stessa famiglia non torna nello stesso settore prima di 4 anni (in Arcade: la regola scelta)
  const regola = simulazioneAttiva()?.parametri ?? { rotazione: 'base' };
  const anniGiro = regola.rotazione === 'personalizzata' ? regola.anni : 4;
  const famigliaControllata = regola.rotazione !== 'personalizzata' || !regola.famiglie || regola.famiglie.includes(scheda?.famiglia);
  if (scheda && regola.rotazione !== 'nessuna' && famigliaControllata && !['J', 'P', 'F', 'V'].includes(scheda.tappa)) {
    const anno = annoOrto(inizio);
    const settori = [...new Set(aiuoleIds.map(id => dati.aiuole.find(a => a.id === id).settore))];
    for (const settore of settori) {
      const stesse = altre.filter(c => {
        const s = colturaDaNome(c.nome);
        const a = annoOrto(c.dataInizio);
        return s && s.famiglia === scheda.famiglia && !['J', 'P', 'F', 'V'].includes(s.tappa)
          && a >= anno - (anniGiro - 1) && a < anno
          && c.aiuoleIds.some(id => dati.aiuole.find(x => x.id === id).settore === settore);
      });
      if (stesse.length) {
        const ultimo = Math.max(...stesse.map(c => annoOrto(c.dataInizio)));
        const nomi = [...new Set(stesse.map(c => c.nome))].join(', ');
        avvisi.push(['Rotazione. ', `Nel settore ${settore} ci sono già state ${scheda.famiglia.toLowerCase()} (${nomi}, anno dell'orto ${ultimo}–${ultimo + 1}). La stessa famiglia non dovrebbe tornare prima di ${anniGiro} anni: meglio dall'autunno ${ultimo + anniGiro}, oppure in un altro settore.`]);
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
  const schedaCat = colturaDaNome(coltura.nome);
  const aiuoleColtura = coltura.aiuoleIds.map(id => dati.aiuole.find(a => a.id === id)).filter(Boolean);
  for (const [titolo, testo, ids] of avvisiTerrenoColtura(schedaCat, aiuoleColtura)) {
    const p = elemento('p', '', 'avviso-modulo');
    p.append(elemento('strong', titolo), `${testo} (${ids.join(', ')})`);
    sezione.append(p);
  }
  sezione.append(
    riga('Metodo', testoMetodo(coltura)),
    riga('Note', coltura.note || 'Nessuna nota.'),
    ...(schedaCat ? [link(`Scheda "${schedaCat.nome}" nel catalogo`, `#/catalogo/${schedaCat.id}`, 'pulsante secondario')] : []),
    elemento('h3', 'Da fare'),
    elencoTask(dati, ordinaTask(dati.task.filter(t => !t.fatto && t.colturaId === coltura.id)), 'Niente da fare.'),
    link('Aggiungi task', `#/coltura/${coltura.id}/nuovo-task`, 'pulsante secondario'),
    elemento('h3', 'Registro'),
    elencoVoci(dati, ordinaVoci(dati.registro.filter(v => v.colturaId === coltura.id)), 'Nessuna voce nel registro.'),
    link('Aggiungi al registro', `#/coltura/${coltura.id}/nuova-voce`, 'pulsante secondario'),
    modificaDati(inProgramma ? pulsanteEliminaProgramma(dati, coltura) : attiva ? moduloTermina(coltura) : pulsanteRiattiva(dati, coltura)),
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
  const elimina = elemento('button', 'Elimina voce', 'pulsante pericolo modifica-dati');
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
    casella.disabled = soloLettura();
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

  const elimina = elemento('button', 'Elimina task', 'pulsante pericolo modifica-dati');
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

// ---- Catalogo delle colture: elenco con calendario e scheda di ogni coltura ----

let misuraCatalogo = { L: AIUOLA.L, W: AIUOLA.W };   // spazio scelto nelle schede: resta cambiando coltura
let lenteAccesa = false;                              // parole con spiegazione evidenziate

const COLORI_CAL = { s: '#8b5e3c', t: '#3f8a2e', r: '#e2861b' };
const GIORNI_MESE = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const semplice = testo => testo.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// Posizione di 'MM-GG' nell'anno, da 0 a 1
function frazioneAnno(mmgg, fine) {
  const [m, g] = mmgg.split('-').map(Number);
  return (m - 1 + (g - (fine ? 0 : 1)) / GIORNI_MESE[m - 1]) / 12;
}

// Barra dei 12 mesi con semina, trapianto (in alto) e raccolta (in basso)
function barraMesi(scheda) {
  let html = '';
  for (const [k, lista] of [['s', scheda.s], ['t', scheda.t], ['r', scheda.r]]) {
    for (const [dal, al] of lista ?? []) {
      const a = frazioneAnno(dal), b = frazioneAnno(al, true);
      for (const [x, y] of a <= b ? [[a, b]] : [[a, 1], [0, b]]) {
        html += `<i class="cal-${k}" style="left:${x * 100}%;width:${(y - x) * 100}%"></i>`;
      }
    }
  }
  return `<div class="cal">${html}</div>`;
}

const termine = (id, testo) => `<button type="button" class="termine" data-termine="${id}">${testo}</button>`;
const conTermini = testo => testo.replace(/\{(\w+):([^}]+)\}/g, (_, id, t) => termine(id, t));

// Lente: spenta (legno, vetro azzurro) e accesa (germoglio nel vetro, con i raggi di luce)
const LENTE_BASE = `<ellipse cx="36" cy="54" rx="14" ry="2.6" fill="#4E3220" stroke="none"/>
  <path d="M35 35 L49 49" fill="none" stroke="#2B1D12" stroke-width="9.6"/><path d="M35 35 L49 49" fill="none" stroke="#A66B35" stroke-width="6.4"/>
  <path d="M37.5 35.5 L47 45" fill="none" stroke="#D9A86C" stroke-width="1.4"/><circle cx="24" cy="24" r="15" fill="#D9A86C"/>
  <path d="M13.5 16.5 C15 13.5 17.5 11.5 20.5 10.5" fill="none" stroke="#F5DDB0" stroke-width="1.3"/><circle cx="24" cy="24" r="10.8" fill="#CBE6EA" stroke-width="1.2"/>`;
const LENTE_SPENTA = `<svg class="spenta" viewBox="0 0 60 60" stroke="#2B1D12" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${LENTE_BASE}
  <path d="M16.5 22 C17 18.5 19.5 16.2 23 15.6" fill="none" stroke="#FFFFFF" stroke-width="2.2"/><circle cx="17.2" cy="26.8" r="1.1" fill="#FFFFFF" stroke="none"/></svg>`;
const LENTE_ACCESA = `<svg class="accesa" viewBox="0 0 60 60" stroke="#2B1D12" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">
  <defs><clipPath id="vetro-lente"><circle cx="24" cy="24" r="10.4"/></clipPath></defs>${LENTE_BASE}
  <g clip-path="url(#vetro-lente)"><path d="M11 34 C16 29.5 32 29.5 37 34 V40 H11 Z" fill="#7A4F2A"/><path d="M24 32 V22" fill="none" stroke="#4E9A3A" stroke-width="2.4"/>
  <path d="M24 26 C20 26 17.5 23.5 17 20.5 C21 20.5 23.5 22.5 24 26 Z" fill="#6FBF45" stroke-width="1.2"/><path d="M24 22 C24.5 18 27 16 30 16.2 C30 19.5 27.5 22 24 22 Z" fill="#5FA83C" stroke-width="1.2"/></g>
  <circle cx="24" cy="24" r="10.8" fill="none" stroke-width="1.2"/><path d="M16.2 21 C16.7 18 18.8 16 21.5 15.2" fill="none" stroke="#FFFFFF" stroke-width="2"/>
  <path d="M41 8 L46 2.5 M44.5 13.5 L52 10 M45.5 20 L53.5 20.5" fill="none" stroke="#2B1D12" stroke-width="5"/>
  <path d="M41 8 L46 2.5 M44.5 13.5 L52 10 M45.5 20 L53.5 20.5" fill="none" stroke="#FFD43B" stroke-width="2.8"/>
  <path d="M55 4 l1.2 2.6 2.6 1.2 -2.6 1.2 -1.2 2.6 -1.2 -2.6 -2.6 -1.2 2.6 -1.2 Z" fill="#FFF3B0" stroke-width="1"/></svg>`;

// Spiegazione di una parola (o di un gruppo) in un pop-up
function apriParola(id) {
  const g = GLOSSARIO[id];
  if (!g) return;
  const sezione = (titolo, html) => (html ? `<h3>${titolo}</h3>${html}` : '');
  const finestra = elemento('dialog', '', 'popup parola');
  const gruppo = g.gruppo ? `<p class="elenco-gruppo">${CATALOGO.filter(c => c.tappa === g.gruppo)
    .map(c => `<a href="#/catalogo/${c.id}">${iconaSvg(c.nome, 2)}${c.nome}</a>`).join('')}</p>` : '';
  // Testi fissi del catalogo, nessun testo dell'utente
  finestra.innerHTML = `<div class="parola-testa"><button type="button" class="chiudi">← Indietro</button><span>Parole dell'orto</span></div>
    <div class="popup-contenuto">
      <p class="tipo-parola">${g.tipo}</p><h2>${g.titolo}</h2><p>${g.def}</p>
      ${sezione(g.percheTitolo || 'Perché si fa', g.perche && `<p>${g.perche}</p>`)}
      ${sezione('Come prevenirlo', g.prevenzione && `<p>${g.prevenzione}</p>`)}
      ${sezione('Se serve intervenire', g.intervento && `<p>${g.intervento}</p>`)}
      ${sezione('Come si fa', g.passi && `<ol class="passi">${g.passi.map(x => `<li>${x}</li>`).join('')}</ol>`)}
      ${sezione('Attenzione a', g.attenzione && `<ul class="attenzione">${g.attenzione.map(x => `<li>${x}</li>`).join('')}</ul>`)}
      ${sezione('In questo gruppo', gruppo)}
      ${g.vedi ? `<p class="nota-parola">${g.vedi}</p>` : ''}
    </div>`;
  finestra.addEventListener('click', evento => {
    if (evento.target === finestra || evento.target.closest('.chiudi') || evento.target.closest('a')) finestra.close();
  });
  finestra.addEventListener('close', () => finestra.remove());
  document.body.append(finestra);
  finestra.showModal();
}

// Clic sulle parole spiegate e sulle lenti dei gruppi (delegato alla sezione)
function attivaParole(sezione) {
  sezione.addEventListener('click', evento => {
    const t = evento.target.closest('[data-termine]');
    if (t) apriParola(t.dataset.termine);
  });
}

function lenteGruppo(k) {
  return `<button type="button" class="lente-gruppo" data-termine="gruppo-${k}" aria-label="Cos'hanno in comune: ${TAPPE[k].nome}">
    ${LENTE_SPENTA.replace('class="spenta"', '')}</button>`;
}

export function paginaCatalogo() {
  const sezione = document.createElement('section');
  sezione.className = 'catalogo';
  // Testi fissi del catalogo; la ricerca dell'utente si legge solo con .value
  sezione.innerHTML = `
    <a href="#/" class="indietro">← Mappa</a>
    <h2>Catalogo dell'orto</h2>
    <p class="intro-catalogo">${CATALOGO.length} colture, con i periodi a Bologna. Tocca una coltura per la sua scheda, o la lente accanto a un gruppo per sapere cos'hanno in comune.</p>
    <input type="search" class="cerca-catalogo" placeholder="Cerca una coltura" aria-label="Cerca una coltura" autocomplete="off">
    <div class="testata-cal">
      <div class="legenda-cal"><span class="l-s">semina</span><span class="l-t">trapianto</span><span class="l-r">raccolta</span></div>
      <div class="mesi-cal">${MESI.map(m => `<span>${m[0].toUpperCase()}</span>`).join('')}</div>
    </div>
    ${Object.keys(TAPPE).map(k => `
      <div class="gruppo-catalogo" data-gruppo="${k}">
        <h3><span class="pallino-gruppo" style="background:${TAPPE[k].c}"></span>${TAPPE[k].nome}${lenteGruppo(k)}</h3>
        ${CATALOGO.filter(c => c.tappa === k).map(c => `
          <a class="riga-catalogo" href="#/catalogo/${c.id}" data-cerca="${semplice([c.nome, ...c.parole].join(' '))}">
            <span class="nome-catalogo">${iconaSvg(c.nome, 2)}${c.nome}</span>${barraMesi(c)}
          </a>`).join('')}
      </div>`).join('')}
    <p class="nessuna" hidden>Nessuna coltura con questo nome.</p>`;
  const cerca = sezione.querySelector('.cerca-catalogo');
  cerca.addEventListener('input', () => {
    const q = semplice(cerca.value.trim());
    let trovate = 0;
    for (const g of sezione.querySelectorAll('.gruppo-catalogo')) {
      let qui = 0;
      for (const r of g.querySelectorAll('.riga-catalogo')) {
        r.hidden = Boolean(q) && !r.dataset.cerca.includes(q);
        if (!r.hidden) qui++;
      }
      g.hidden = qui === 0;
      trovate += qui;
    }
    sezione.querySelector('.nessuna').hidden = trovate > 0;
  });
  attivaParole(sezione);
  return sezione;
}

// Lo spazio visto dall'alto (lunghezza × larghezza scelte) con le piante al loro posto
const metri = cm => (cm / 100).toLocaleString('it-IT', { maximumFractionDigits: 2 }) + ' m';
function disegnoSpazio(scheda, d) {
  const W = d.L, H = d.W, y = i => H * (i + 0.5) / d.file, x = j => W * (j + 0.5) / d.perFila;
  const fs = Math.max(W, H) / 20;
  let segni = '';
  if (scheda.id === 'fava' && d.perFila) {
    const coppie = d.file / 2, inizio = (H - ((coppie - 1) * 75 + 25)) / 2;
    for (let k = 0; k < coppie; k++) for (const yy of [inizio + k * 75, inizio + k * 75 + 25])
      for (let j = 0; j < d.perFila; j++) segni += `<circle cx="${x(j)}" cy="${yy}" r="4"/>`;
  } else if (!d.perFila && scheda.traLeFile.includes('spaglio')) {
    const passo = Math.max(W, H) / 22;
    for (let yy = passo / 2; yy < H; yy += passo) for (let xx = passo / 2; xx < W; xx += passo) {
      const s = Math.sin(xx * 12.9898 + yy * 78.233) * 43758.5453, v = s - Math.floor(s);
      segni += `<circle cx="${xx + (v - 0.5) * passo * 0.7}" cy="${yy + (((v * 7) % 1) - 0.5) * passo * 0.7}" r="${passo * 0.18}"/>`;
    }
  } else if (!d.perFila) {
    for (let i = 0; i < d.file; i++) segni += `<line x1="8" x2="${W - 8}" y1="${y(i)}" y2="${y(i)}" stroke-dasharray="1 5"/>`;
  } else if (d.piante <= 30) {
    const lato = Math.min(H / d.file, W / d.perFila) * 0.9;
    const disegno = iconaSvg(scheda.nome, 2.4).replace(/^<svg[^>]*>|<\/svg>$/g, '');
    for (let i = 0; i < d.file; i++) for (let j = 0; j < d.perFila; j++)
      segni += `<g stroke-width="2.4" transform="translate(${x(j) - lato / 2} ${y(i) - lato / 2}) scale(${lato / 60})">${disegno}</g>`;
  } else {
    const r = Math.max(1.6, Math.min(4, W / d.perFila / 2.4));
    for (let i = 0; i < d.file; i++) for (let j = 0; j < d.perFila; j++) segni += `<circle cx="${x(j)}" cy="${y(i)}" r="${r}"/>`;
  }
  const semi = d.piante > 40 ? 'semi' : 'piante';
  const descr = scheda.traLeFile.includes('spaglio') ? 'seminato a spaglio su tutto lo spazio'
    : d.perFila ? `${d.file} ${d.file === 1 ? 'fila' : 'file'} da ${d.perFila} ${semi}`
      : `${d.file} ${d.file === 1 ? 'fila seminata fitta' : 'file seminate fitte'}`;
  return `<figure class="spazio-disegno">
    <svg viewBox="${-fs * 1.6} ${-fs * 0.5} ${W + fs * 2} ${H + fs * 2}" style="max-width:${Math.min(340, 340 * Math.max(W, H * 1.5) / 180)}px" role="img" aria-label="Spazio visto dall'alto: ${descr}">
      <rect x="0" y="0" width="${W}" height="${H}" rx="${fs * 0.6}" class="terra-spazio"/>
      <g class="segni-spazio" stroke="#2B1D12" stroke-linejoin="round" stroke-linecap="round">${segni}</g>
      <text x="${W / 2}" y="${H + fs * 1.3}" text-anchor="middle" style="font-size:${fs}px">${metri(W)}</text>
      <text x="${-fs * 0.6}" y="${H / 2}" text-anchor="middle" style="font-size:${fs}px" transform="rotate(-90 ${-fs * 0.6} ${H / 2})">${metri(H)}</text>
    </svg>
    <figcaption>${descr}${d.piante ? ` = <b>${d.piante} ${semi}</b>` : ''}</figcaption>
  </figure>`;
}

export function schedaCatalogo(scheda) {
  const righe = [
    scheda.s && ['Semina', scheda.s.map(periodoCatalogo).join(' · ')],
    scheda.t && [scheda.tLabel ?? termine('trapianto', 'Trapianto'), scheda.t.map(periodoCatalogo).join(' · ')],
    [scheda.rLabel ?? 'Raccolta', scheda.r.map(periodoCatalogo).join(' · ')],
    scheda.giorni && ['Dalla semina', `${scheda.giorni} giorni`],
    scheda.prof && ['Profondità', scheda.prof],
  ].filter(Boolean);
  const famigliaDoppia = scheda.famiglia.toLowerCase() === TAPPE[scheda.tappa].breve.toLowerCase();
  const sezione = document.createElement('section');
  sezione.className = 'scheda-catalogo';
  // Testi fissi del catalogo, nessun testo dell'utente
  sezione.innerHTML = `
    <a href="#/catalogo" class="indietro">← Catalogo</a>
    <span class="lente-box">
      <button type="button" class="lente" aria-pressed="${lenteAccesa}" aria-label="Lente: evidenzia le parole con spiegazione">${LENTE_SPENTA}${LENTE_ACCESA}</button>
      <span class="fumetto" role="status" hidden><b>Lente accesa!</b> Le parole evidenziate hanno una spiegazione: toccane una per leggerla. Premi di nuovo la lente per spegnerla.<button type="button" class="capito">Ho capito</button></span>
    </span>
    <div class="testa-scheda">
      <div class="disegno-scheda">${iconaSvg(scheda.nome)}</div>
      <div>
        <h2>${scheda.nome}</h2>
        <div class="chips">
          <span class="chip" style="background:${TAPPE[scheda.tappa].c}">${TAPPE[scheda.tappa].breve}</span>
          ${famigliaDoppia ? '' : `<span class="chip chiaro">${scheda.famiglia}</span>`}
          <span class="chip chiaro">${ESIGENZA[scheda.esigenza]}</span>
        </div>
      </div>
    </div>
    ${scheda.avviso ? `<p class="avviso-scheda">${conTermini(scheda.avviso)}</p>` : ''}
    <h3>Calendario a Bologna</h3>
    <div class="legenda-cal">${scheda.s ? '<span class="l-s">semina</span>' : ''}${scheda.t ? `<span class="l-t">${(scheda.tLabel ?? 'trapianto').toLowerCase()}</span>` : ''}<span class="l-r">${(scheda.rLabel ?? 'raccolta').toLowerCase()}</span></div>
    ${barraMesi(scheda)}
    <div class="mesi-cal">${MESI.map(m => `<span>${m}</span>`).join('')}</div>
    <dl class="fatti">${righe.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl>
    <h3>Nell'aiuola</h3>
    <dl class="fatti">
      <dt>Tra le piante, sulla fila</dt><dd>${scheda.sullaFila === 'fitta' ? 'seme fitto' : scheda.sullaFila + ' cm'}</dd>
      <dt>Tra una fila e l'altra</dt><dd>${/^\d/.test(scheda.traLeFile) ? scheda.traLeFile + ' cm' : scheda.traLeFile}</dd>
    </dl>
    <div class="misura">
      <p>Quanto spazio usi?</p>
      <div class="preset-riga">
        <button type="button" class="preset" data-l="180" data-w="120">Aiuola intera<small>1,8 × 1,2 m</small></button>
        <button type="button" class="preset" data-l="180" data-w="60">Metà fondo o davanti<small>1,8 × 0,6 m</small></button>
        <button type="button" class="preset" data-l="90" data-w="120">Metà vialetto o esterno<small>0,9 × 1,2 m</small></button>
      </div>
      <div class="campi-misura">
        <label>Lunghezza<span><input type="number" name="lunghezza" inputmode="numeric" min="20" max="600" step="10"> cm</span></label>
        <label>Larghezza<span><input type="number" name="larghezza" inputmode="numeric" min="20" max="600" step="10"> cm</span></label>
      </div>
    </div>
    <div class="spazio-scelto"></div>
    <h3>Consigli</h3>
    <ul class="consigli">${scheda.consigli.map(x => `<li>${conTermini(x)}</li>`).join('')}</ul>
    ${scheda.problemi.length ? `<h3>Da tenere d'occhio</h3><p>${scheda.problemi.map(p => termine(p, GLOSSARIO[p]?.titolo ?? p)).join(' · ')}</p>` : ''}
    <p class="nota-scheda">Periodi, distanze e consigli sono indicativi: la terra, l'annata e la varietà contano.</p>`;

  const lunghezza = sezione.querySelector('[name="lunghezza"]');
  const larghezza = sezione.querySelector('[name="larghezza"]');
  function aggiornaSpazio() {
    lunghezza.value = misuraCatalogo.L;
    larghezza.value = misuraCatalogo.W;
    const d = disposizione(scheda, misuraCatalogo.L, misuraCatalogo.W);
    const intera = misuraCatalogo.L === AIUOLA.L && misuraCatalogo.W === AIUOLA.W;
    const r = resa(scheda, d);
    const dettaglio = scheda.kgM2
      ? `${String(scheda.kgM2[0]).replace('.', ',')}–${String(scheda.kgM2[1]).replace('.', ',')} kg/m² × ${String(Math.round(d.area * 100) / 100).replace('.', ',')} m²`
      : scheda.kgP ? `${d.piante} piante × ${String(scheda.kgP[0]).replace('.', ',')}–${String(scheda.kgP[1]).replace('.', ',')} kg${scheda.unita ? ' di ' + scheda.unita : ''} ciascuna` : '';
    sezione.querySelector('.spazio-scelto').innerHTML = disegnoSpazio(scheda, d) + (r
      ? `<p class="resa-scheda">Resa stimata: <b>${kgTesto(r[0])}–${kgTesto(r[1])} kg</b> ${intera ? "nell'aiuola intera" : 'in questo spazio'}<small>${dettaglio}. Stima indicativa: dipende da varietà, annata e terreno.</small></p>`
      : `<p class="resa-scheda">A cosa serve<small>${conTermini(scheda.scopo ?? '')}</small></p>`);
    sezione.querySelectorAll('.preset').forEach(b => b.setAttribute('aria-pressed', Number(b.dataset.l) === misuraCatalogo.L && Number(b.dataset.w) === misuraCatalogo.W));
  }
  sezione.querySelectorAll('.preset').forEach(b => b.addEventListener('click', () => {
    misuraCatalogo = { L: Number(b.dataset.l), W: Number(b.dataset.w) };
    aggiornaSpazio();
  }));
  for (const campo of [lunghezza, larghezza]) {
    campo.addEventListener('input', () => {
      const L = Number(lunghezza.value), W = Number(larghezza.value);
      if (L >= 20 && L <= 600 && W >= 20 && W <= 600) {
        misuraCatalogo = { L, W };
        const fuoco = document.activeElement;
        aggiornaSpazio();
        fuoco.focus();
      }
    });
  }
  aggiornaSpazio();

  // Lente: accende o spegne le parole evidenziate; la prima volta che si accende spiega cosa fa
  const lente = sezione.querySelector('.lente');
  const fumetto = sezione.querySelector('.fumetto');
  sezione.classList.toggle('evidenzia', lenteAccesa);
  lente.addEventListener('click', () => {
    lenteAccesa = !lenteAccesa;
    lente.setAttribute('aria-pressed', lenteAccesa);
    sezione.classList.toggle('evidenzia', lenteAccesa);
    fumetto.hidden = !lenteAccesa;
  });
  sezione.querySelector('.capito').addEventListener('click', () => { fumetto.hidden = true; });
  attivaParole(sezione);
  return sezione;
}

// ---- Terreno delle aiuole: scheda, prove guidate, analisi ----

const NOMI_FONTE = { stima: 'stima', prova: 'prova', analisi: 'analisi' };
const DA_PROVA = { pugno: 'prova del pugno', aceto: "prova dell'aceto", barattolo: 'prova del barattolo', buca: 'prova della buca', lombrichi: 'conta dei lombrichi', analisi: 'analisi di laboratorio' };
const numeroDa = testo => {
  const n = parseFloat(String(testo ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

// Riassunto di una riga: "Limoso-argilloso, calcareo · pH 7,5–8 · drenaggio lento"
function riassuntoTerreno(suolo) {
  const t = TESSITURE[suolo.tessitura.valore] ?? 'Tessitura non nota';
  const calc = ['molto', 'poco', 'probabile'].includes(suolo.calcare.valore) ? ', calcareo' : '';
  const parti = [`${t}${calc}`, `pH ${testoValore('ph', suolo.ph)}`];
  if (typeof suolo.drenaggio.valore === 'number') parti.push(`drenaggio ${giudizioDrenaggio(suolo.drenaggio.valore).toLowerCase()}`);
  return parti.join(' · ');
}
const proveFatte = suolo => Object.keys(PROVE).filter(id => Object.values(suolo).some(v => v?.da === id));

const ZOLLA = `<svg viewBox="0 0 48 48" stroke="#2b1d12" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M6 30 L12 18 L24 14 L38 17 L43 28 L37 37 L20 39 Z" fill="#a06a3c"/><path d="M6 30 L20 39 L37 37 L43 28 L43 32 L37 41 L20 43 L6 34 Z" fill="#6e4326"/><path d="M14 22 L22 19 M27 18 L34 20" fill="none" stroke="#e2b07a" stroke-width="1.6" stroke-linecap="round"/><circle cx="20" cy="28" r="1.6" fill="#5e3820" stroke="none"/><circle cx="30" cy="26" r="1.3" fill="#5e3820" stroke="none"/></svg>`;

// Riquadro del terreno nella pagina info dell'aiuola
function cartaTerreno(aiuola) {
  const suolo = suoloDi(aiuola);
  const carta = link('', `#/aiuola/${aiuola.id}/terreno`, 'carta-terreno');
  const zolla = elemento('span', '', 'zolla');
  zolla.innerHTML = ZOLLA;
  const testo = elemento('span');
  testo.append(elemento('strong', riassuntoTerreno(suolo)), elemento('br'),
    elemento('small', `${proveFatte(suolo).length} prove fatte su ${Object.keys(PROVE).length} · tocca per aprire`));
  carta.append(zolla, testo);
  return carta;
}

// Salva nel terreno di un'aiuola (o di tutte) i valori nuovi, con la fonte
function salvaTerreno(aiuolaId, valori, tutte = false) {
  const dati = carica();
  for (const a of dati.aiuole.filter(a => tutte || a.id === aiuolaId)) {
    a.suolo = { ...(a.suolo ?? {}), ...structuredClone(valori) };
  }
  salva(dati);
}

export function paginaTerreno(dati, aiuola) {
  const suolo = suoloDi(aiuola);
  const sezione = document.createElement('section');
  sezione.className = 'pagina-terreno';
  sezione.append(link(`← Info ${aiuola.id}`, `#/aiuola/${aiuola.id}/info`, 'indietro'), elemento('h2', `Terreno della ${aiuola.id}`));

  const elenco = elemento('div', '', 'proprieta');
  for (const k of Object.keys(NOMI_PROPRIETA)) {
    const v = suolo[k];
    const riga = elemento('div', '', 'prop-terreno');
    const nome = elemento('span', NOMI_PROPRIETA[k], 'nome-prop');
    if (v.fonte !== 'stima' && v.da) nome.append(' · ', elemento('em', DA_PROVA[v.da] ?? v.da));
    else if (v.valore !== null && v.valore !== undefined) nome.append(' · ', elemento('em', 'tipico della pianura bolognese'));
    riga.append(nome, elemento('span', NOMI_FONTE[v.fonte] ?? 'stima', `fonte fonte-${v.fonte ?? 'stima'}`), elemento('span', testoValore(k, v), 'valore-prop'));
    if (k === 'tessitura' && v.sabbia !== undefined) {
      const barra = elemento('span', '', 'barra-tess');
      for (const [parte, colore] of [['sabbia', '#e3c27a'], ['limo', '#b98a5a'], ['argilla', '#7a4a2a']]) {
        const s = elemento('span');
        s.style.width = `${v[parte]}%`;
        s.style.background = colore;
        barra.append(s);
      }
      riga.append(barra);
    }
    elenco.append(riga);
  }
  sezione.append(elenco);
  if (suolo.analisi) {
    const a = suolo.analisi;
    const extra = [a.azoto !== null && `azoto ${String(a.azoto).replace('.', ',')} g/kg`, a.fosforo !== null && `fosforo ${a.fosforo} mg/kg`,
      a.potassio !== null && `potassio ${a.potassio} mg/kg`, a.metalli && `metalli: ${a.metalli}`].filter(Boolean);
    if (extra.length) sezione.append(elemento('p', `Analisi del ${dataPerUtente(a.data)}: ${extra.join(' · ')}.`, 'nota-terreno'));
  }

  const consigli = consigliTerreno(suolo);
  if (consigli.length) {
    sezione.append(elemento('h3', 'Consigli per questo terreno'));
    const ul = elemento('ul', '', 'consigli-terreno');
    for (const [titolo, testo] of consigli) {
      const li = elemento('li');
      li.append(elemento('strong', `${titolo}: `), testo);
      ul.append(li);
    }
    sezione.append(ul);
  }

  const tutte = elemento('button', 'Usa questo terreno per tutto l\'orto', 'pulsante secondario modifica-dati');
  tutte.type = 'button';
  tutte.addEventListener('click', () => {
    if (!confirm(`Copiare il terreno della ${aiuola.id} in tutte le altre aiuole? I loro valori verranno sostituiti.`)) return;
    try {
      salvaTerreno(aiuola.id, aiuola.suolo ?? suoloDiPartenza(), true);
      alert('Fatto: tutte le aiuole hanno ora questo terreno.');
    } catch (errore) {
      alert(errore.message);
    }
  });
  sezione.append(link('Scrivi i risultati dell\'analisi', `#/aiuola/${aiuola.id}/terreno/analisi`, 'pulsante secondario'), tutte);

  sezione.append(elemento('h3', 'Prove da fare a mano'));
  const fatte = proveFatte(suolo);
  const prove = elemento('div', '', 'elenco-prove');
  for (const [id, p] of Object.entries(PROVE)) {
    const voce = link('', `#/aiuola/${aiuola.id}/terreno/${id}`, 'voce-prova');
    const icona = elemento('span', '', 'icona-prova');
    icona.innerHTML = ICONE_PROVE[id];
    const testo = elemento('span');
    testo.append(elemento('strong', p.breve), elemento('small', `${p.durata} · ${p.misura}`));
    voce.append(icona, testo, elemento('span', fatte.includes(id) ? '✓ fatta' : '', 'stato-prova'));
    prove.append(voce);
  }
  sezione.append(prove);
  return sezione;
}

const icProva = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICONE_PROVE = {
  pugno: icProva('<path d="M7 11V6a1.5 1.5 0 0 1 3 0v4M10 10V4.5a1.5 1.5 0 0 1 3 0V10M13 10V5.5a1.5 1.5 0 0 1 3 0V12M16 9.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1a6 6 0 0 1-5.4-3.4L4.5 13a1.5 1.5 0 0 1 2.6-1.5L9 14"/>'),
  aceto: icProva('<path d="M10 2h4M11 2v4l-4 6v8a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-8l-4-6V2"/><path d="M8 15h8"/>'),
  barattolo: icProva('<path d="M7 3h10v2a2 2 0 0 1-1 1.7V20a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V6.7A2 2 0 0 1 7 5z"/><path d="M8 17h8M8 13.5h8M8 10.5h8"/>'),
  buca: icProva('<path d="M3 9h18"/><path d="M6 9v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9"/><path d="M9 13c1 .8 2 .8 3 0s2-.8 3 0"/><path d="M12 3v3M10.5 4.5L12 6l1.5-1.5"/>'),
  lombrichi: icProva('<path d="M4 15c2-4 4 2 6-2s4 2 6-2 3 1 4 0"/><circle cx="20.5" cy="11" r="1"/>'),
};

// Prova guidata: un passo alla volta, con il disegno; alla fine il risultato e il salvataggio
export function paginaProva(dati, aiuola, idProva) {
  const prova = PROVE[idProva];
  const risposte = {};
  let indice = 0;
  const sezione = document.createElement('section');
  sezione.className = 'pagina-prova';
  const corpo = elemento('div');
  sezione.append(link(`← Terreno della ${aiuola.id}`, `#/aiuola/${aiuola.id}/terreno`, 'indietro'), elemento('h2', prova.nome), corpo);
  const passi = () => prova.passi.filter(p => !p.se || p.se(risposte));

  function mostra() {
    const elenco = passi();
    if (indice >= elenco.length) return mostraEsito();
    const passo = elenco[indice];
    const titolo = elemento('p', '', 'titolo-passo');
    titolo.append(elemento('span', String(indice + 1), 'numero-passo'), elemento('strong', passo.titolo));
    const disegno = elemento('div', '', 'disegno-passo');
    disegno.innerHTML = passo.disegno;
    const parti = [titolo, disegno, elemento('p', passo.testo, 'testo-passo')];
    const avanti = elemento('button', indice === elenco.length - 1 && !passo.scelte ? 'Vedi il risultato' : 'Avanti', 'pulsante');
    avanti.type = 'button';
    const errore = elemento('p', '', 'errore');
    errore.hidden = true;

    if (passo.scelte) {
      const scelte = elemento('div', '', 'scelte-prova');
      for (const [valore, testo] of passo.scelte) {
        const b = elemento('button', testo, 'scelta-prova');
        b.type = 'button';
        b.setAttribute('aria-pressed', risposte[passo.chiave] === valore);
        b.addEventListener('click', () => {
          risposte[passo.chiave] = valore;
          indice++;
          mostra();
        });
        scelte.append(b);
      }
      parti.push(scelte);
    } else if (passo.numeri) {
      const campi = elemento('div', '', 'numeri-prova');
      for (const [k, etichetta] of passo.numeri) {
        const label = elemento('label', etichetta);
        const input = elemento('input');
        input.type = 'text';
        input.inputMode = 'decimal';
        input.name = k;
        input.value = risposte[passo.chiave]?.[k] ?? '';
        label.append(input);
        campi.append(label);
      }
      parti.push(campi, errore, avanti);
      avanti.addEventListener('click', () => {
        const valori = {};
        for (const [k] of passo.numeri) valori[k] = numeroDa(campi.querySelector(`[name="${k}"]`).value);
        if (Object.values(valori).some(v => v === null || v < 0) || (passo.chiave === 'strati' && valori.sabbia + valori.limo + valori.argilla <= 0)) {
          errore.textContent = 'Scrivi un numero in ogni casella (anche 0).';
          errore.hidden = false;
          return;
        }
        risposte[passo.chiave] = valori;
        indice++;
        mostra();
      });
    } else {
      parti.push(avanti);
      avanti.addEventListener('click', () => { indice++; mostra(); });
    }
    if (indice > 0) {
      const indietro = elemento('button', '← Passo precedente', 'pulsante secondario');
      indietro.type = 'button';
      indietro.addEventListener('click', () => { indice--; mostra(); });
      parti.push(indietro);
    }
    parti.push(puntiniPassi(indice, elenco.length));
    corpo.replaceChildren(...parti);
    window.scrollTo(0, 0);
  }

  function mostraEsito() {
    const esito = prova.esito(risposte);
    const valori = Object.fromEntries(Object.entries(esito).map(([k, v]) => [k, { ...v, fonte: 'prova', da: idProva, data: oggi() }]));
    const box = elemento('div', '', 'esito-prova');
    box.append(elemento('strong', 'Risultato: '), spiegaEsito(idProva, esito));
    const qui = elemento('button', `Salva nel terreno della ${aiuola.id}`, 'pulsante');
    const tutte = elemento('button', 'Salva per tutte le aiuole', 'pulsante secondario');
    const rifai = elemento('button', 'Rifai la prova', 'pulsante secondario');
    for (const b of [qui, tutte, rifai]) b.type = 'button';
    const salvaE = tutteLe => {
      try {
        salvaTerreno(aiuola.id, valori, tutteLe);
        location.hash = `#/aiuola/${aiuola.id}/terreno`;
      } catch (errore) {
        alert(errore.message);
      }
    };
    qui.addEventListener('click', () => salvaE(false));
    tutte.addEventListener('click', () => { if (confirm('Salvare questo risultato in tutte le 8 aiuole?')) salvaE(true); });
    rifai.addEventListener('click', () => { indice = 0; for (const k of Object.keys(risposte)) delete risposte[k]; mostra(); });
    corpo.replaceChildren(box, qui, tutte, rifai);
  }

  mostra();
  return sezione;
}

function puntiniPassi(attuale, totale) {
  const p = elemento('div', '', 'puntini-passi');
  for (let i = 0; i < totale; i++) p.append(elemento('span', '', i === attuale ? 'ora' : ''));
  return p;
}

// Risultati dell'analisi di laboratorio: ogni campo è facoltativo
export function paginaAnalisi(dati, aiuola) {
  const a = suoloDi(aiuola).analisi ?? {};
  const modulo = document.createElement('form');
  modulo.className = 'modulo';
  modulo.noValidate = true;
  const campo = (nome, etichetta, unita) => `<label>${etichetta}${unita ? ` <small>(${unita})</small>` : ''}<input type="text" inputmode="decimal" name="${nome}" autocomplete="off"></label>`;
  modulo.innerHTML = `
    <p>Copia i valori dal foglio del laboratorio: quelli che non ci sono lasciali vuoti.</p>
    <label>Data dell'analisi<input type="text" name="data" placeholder="gg/mm/aaaa"></label>
    ${campo('ph', 'pH')}
    <fieldset><legend>Tessitura</legend><div class="tre-colonne">${campo('sabbia', 'Sabbia', '%')}${campo('limo', 'Limo', '%')}${campo('argilla', 'Argilla', '%')}</div></fieldset>
    ${campo('calcareTotale', 'Calcare totale', '%')}
    ${campo('sostanzaOrganica', 'Sostanza organica', '%')}
    ${campo('azoto', 'Azoto totale', 'g/kg')}
    ${campo('fosforo', 'Fosforo assimilabile', 'mg/kg')}
    ${campo('potassio', 'Potassio scambiabile', 'mg/kg')}
    <label>Metalli pesanti (facoltativo)<input type="text" name="metalli" autocomplete="off" placeholder="es. piombo e cadmio nella norma"></label>
    <label class="opzione-tutte"><input type="checkbox" name="tutte"> Vale per tutte le aiuole (un campione unico per tutto l'orto)</label>
    <p class="errore" role="alert" hidden></p>
    <button type="submit" class="pulsante">Salva l'analisi</button>`;
  const c = modulo.elements;
  c.data.value = a.data ? dataPerUtente(a.data) : dataPerUtente(oggi());
  for (const k of ['ph', 'calcareTotale', 'sostanzaOrganica', 'azoto', 'fosforo', 'potassio']) {
    if (a[k] !== null && a[k] !== undefined) c[k].value = String(a[k]).replace('.', ',');
  }
  const t = suoloDi(aiuola).tessitura;
  if (t.fonte === 'analisi') for (const k of ['sabbia', 'limo', 'argilla']) c[k].value = t[k] ?? '';
  c.metalli.value = a.metalli ?? '';

  modulo.addEventListener('submit', evento => {
    evento.preventDefault();
    const avviso = modulo.querySelector('.errore');
    const data = dataPerArchivio(c.data.value);
    const n = k => numeroDa(c[k].value);
    const errori = [];
    if (!data) errori.push('Scrivi la data come gg/mm/aaaa.');
    const [s, l, ar] = [n('sabbia'), n('limo'), n('argilla')];
    const conTessitura = s !== null || l !== null || ar !== null;
    if (conTessitura && (s === null || l === null || ar === null)) errori.push('Per la tessitura servono tutte e tre le percentuali.');
    if (errori.length) {
      avviso.textContent = errori.join('\n');
      avviso.hidden = false;
      return;
    }
    const fonte = { fonte: 'analisi', da: 'analisi', data };
    const valori = {
      analisi: { data, ph: n('ph'), calcareTotale: n('calcareTotale'), sostanzaOrganica: n('sostanzaOrganica'),
        azoto: n('azoto'), fosforo: n('fosforo'), potassio: n('potassio'), metalli: c.metalli.value.trim() },
    };
    if (n('ph') !== null) valori.ph = { valore: n('ph'), ...fonte };
    if (n('sostanzaOrganica') !== null) valori.sostanzaOrganica = { valore: n('sostanzaOrganica'), ...fonte };
    if (n('calcareTotale') !== null) {
      const ct = n('calcareTotale');
      valori.calcare = { valore: ct > 10 ? 'molto' : ct >= 1 ? 'poco' : 'no', ...fonte };
    }
    if (conTessitura) {
      const tot = s + l + ar;
      const [ps, pl] = [Math.round(s / tot * 100), Math.round(l / tot * 100)];
      valori.tessitura = { valore: classeDaPercentuali(ps, pl, 100 - ps - pl), sabbia: ps, limo: pl, argilla: 100 - ps - pl, ...fonte };
    }
    try {
      salvaTerreno(aiuola.id, valori, c.tutte.checked);
      location.hash = `#/aiuola/${aiuola.id}/terreno`;
    } catch (errore) {
      avviso.textContent = errore.message;
      avviso.hidden = false;
    }
  });

  const sezione = document.createElement('section');
  sezione.append(link(`← Terreno della ${aiuola.id}`, `#/aiuola/${aiuola.id}/terreno`, 'indietro'), elemento('h2', 'Analisi del terreno'), modulo);
  return sezione;
}

// Riepilogo nelle Impostazioni: una riga per aiuola
function riepilogoTerreno() {
  let dati;
  try {
    dati = carica();
  } catch {
    return elemento('p', 'Dati non leggibili: ripristina un backup.');
  }
  const tabella = elemento('table', '', 'tabella-terreno');
  tabella.innerHTML = '<tr><th></th><th>Tessitura</th><th>pH</th><th>Drenaggio</th></tr>';
  for (const a of [...dati.aiuole].sort((x, y) => x.id.localeCompare(y.id))) {
    const s = suoloDi(a);
    const tr = elemento('tr');
    const nome = elemento('td');
    nome.append(link(a.id, `#/aiuola/${a.id}/terreno`, 'aiuola-terreno'));
    const tess = elemento('td');
    tess.append(elemento('span', '', `pallino-fonte fonte-${s.tessitura.fonte}`), TESSITURE[s.tessitura.valore] ?? 'Non so');
    tr.append(nome, tess, elemento('td', testoValore('ph', s.ph)),
      elemento('td', typeof s.drenaggio.valore === 'number' ? giudizioDrenaggio(s.drenaggio.valore).toLowerCase() : '—'));
    tabella.append(tr);
  }
  const box = elemento('div');
  box.append(tabella, elemento('p', "Tocca un'aiuola per aprire il suo terreno. Il pallino dice da dove viene la tessitura: grigio stima, blu prova, verde analisi.", 'nota-terreno'));
  return box;
}

// ---- Simulazioni (cartello Test): scelta, orto reale nel tempo ----

export function paginaSimulazioni() {
  const sezione = document.createElement('section');
  sezione.className = 'simulazioni';
  const scheda = (href, classe, icona, titolo, testo) => {
    const a = link('', href, `scheda-sim ${classe}`);
    const ico = elemento('span', '', 'ico-sim');
    ico.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icona}</svg>`;
    const t = elemento('span');
    t.append(elemento('strong', titolo), elemento('small', testo));
    a.append(ico, t);
    return a;
  };
  sezione.append(
    link('← Mappa', '#/', 'indietro'),
    elemento('h2', 'Simulazioni'),
    scheda('#/test/reale', 'sim-reale', ICONE.test, 'Orto reale nel tempo',
      'La tua mappa con le colture vere: vai avanti e indietro nel tempo e vedi cosa c\'era e cosa ci sarà, con le stime del catalogo. Solo da guardare.'),
    scheda('#/test/arcade/nuova', 'sim-arcade', '<rect x="2" y="7" width="20" height="12" rx="5"/><path d="M7 11v4M5 13h4"/><circle cx="16" cy="12" r="1.2"/><circle cx="18.5" cy="14.5" r="1.2"/>',
      'Arcade', 'Un orto inventato, da zero o copiato dal tuo: prova colture e rotazioni e guarda come va negli anni. Non tocca i dati veri.'),
    elemento('h3', 'Simulazioni Arcade salvate'),
    paginaSimulazioniArcade(),
    link('+ Nuova simulazione Arcade', '#/test/arcade/nuova', 'pulsante pulsante-arcade'),
    link('Calendario delle colture (binari per aiuola)', '#/test/calendario', 'pulsante secondario'),
  );
  return sezione;
}

let giornoMappa = null;   // se impostato, la mappa mostra l'orto in quel giorno (solo da guardare)

// La coltura è nell'orto il giorno g? Le colture senza fine spariscono a fine raccolta stimata
function presenteIl(c, g) {
  if (c.stato === 'pianificata' || c.dataInizio > g) return false;
  if (c.dataFine) return g < c.dataFine;
  const scheda = colturaDaNome(c.nome);
  if (!scheda || scheda.tappa === 'P' || g <= oggi()) return true;
  const stima = fineSuggerita(scheda, c.dataInizio);
  return Boolean(stima) && g < stima;
}

// Colture da disegnare sulla mappa: quelle attive oggi, oppure (nel tempo) quelle presenti quel giorno
function visibile(c) {
  if (modoArcade) return presenteInSimulazione(c, oggi());
  return giornoMappa === null ? c.stato === 'attiva' && iniziata(c) : presenteIl(c, giornoMappa);
}

// Tappa della rotazione che toccherebbe al settore nell'anno dell'orto del giorno g (dall'ultima avuta)
const GIRO = ['L', 'C', 'A', 'S'];
function tappaAttesa(dati, settore, g) {
  const anno = annoOrto(g);
  let ultima = null;
  for (const c of dati.colture) {
    const s = colturaDaNome(c.nome);
    if (!s || !GIRO.includes(s.tappa) || c.stato === 'pianificata') continue;
    if (!c.aiuoleIds.some(id => dati.aiuole.find(a => a.id === id)?.settore === settore)) continue;
    const a = annoOrto(c.dataInizio);
    if (a <= anno && (!ultima || a > ultima.anno)) ultima = { anno: a, tappa: s.tappa };
  }
  if (!ultima) return null;
  return GIRO[(GIRO.indexOf(ultima.tappa) + anno - ultima.anno) % 4];
}

const MESI_LUNGHI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const dataLunga = iso => { const [a, m, g] = iso.split('-').map(Number); return `${g} ${MESI_LUNGHI[m - 1]} ${a}`; };
const isoDi = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const piuGiorni = (iso, n) => { const d = new Date(iso); d.setDate(d.getDate() + n); return isoDi(d); };

function stagioneDi(iso) {
  const md = iso.slice(5);
  if (md >= '03-21' && md < '06-21') return 'primavera';
  if (md >= '06-21' && md < '09-23') return 'estate';
  if (md >= '09-23' && md < '12-21') return 'autunno';
  return 'inverno';
}

// Colore del prato nel giorno: sfuma tra i colori di metà stagione
const COLORI_STAGIONE = [[20, [159, 176, 168]], [120, [140, 191, 90]], [217, [169, 184, 78]], [309, [184, 154, 78]], [385, [159, 176, 168]]];
function coloriPrato(iso) {
  const d = new Date(iso);
  let giorno = Math.round((d - new Date(d.getFullYear(), 0, 1)) / GIORNO);
  if (giorno < COLORI_STAGIONE[0][0]) giorno += 365;
  let i = 0;
  while (giorno > COLORI_STAGIONE[i + 1][0]) i++;
  const [g1, c1] = COLORI_STAGIONE[i], [g2, c2] = COLORI_STAGIONE[i + 1];
  const t = (giorno - g1) / (g2 - g1);
  const c = c1.map((v, k) => Math.round(v + (c2[k] - v) * t));
  return { prato: `rgb(${c.join(' ')})`, punti: `rgb(${c.map(v => Math.round(v * 0.86)).join(' ')})` };
}

function coloraPrato(iso) {
  const { prato, punti } = coloriPrato(iso);
  document.body.style.setProperty('--prato', prato);
  document.body.style.setProperty('--prato-punti', punti);
  document.body.dataset.stagione = stagioneDi(iso);
}

// La mappa del giorno g, solo da guardare: niente spostamenti, niente segni dei task, aiuole non cliccabili
function mappaDelGiorno(dati, g) {
  giornoMappa = g;
  try {
    const m = elemento('div', '', 'mappa-tempo');
    m.append(etichetta('Fondo'), colonna(dati, 'sinistra'), vialetto(dati), colonna(dati, 'destra'), staccionata(), etichetta('Davanti'));
    for (const a of m.querySelectorAll('a.aiuola')) {
      a.removeAttribute('href');
      const aiuola = dati.aiuole.find(x => x.id === a.querySelector('.nome').textContent);
      if (g > oggi() && !a.querySelector('.piantina')) {
        const tappa = tappaAttesa(dati, aiuola.settore, g);
        if (tappa) {
          const segno = elemento('span', `tocca a: ${TAPPE[tappa].breve}`, 'tocca-a');
          segno.style.borderColor = TAPPE[tappa].c;
          a.append(segno);
        }
      }
    }
    for (const p of m.querySelectorAll('.puntino')) p.remove();
    return m;
  } finally {
    giornoMappa = null;
  }
}

// Barra del tempo: cursore a settimane tra `inizio` e `fine`, pulsanti, data e stagione.
// cambia(giorno) viene chiamata a ogni spostamento; `centro` = [testo, giorno] per il pulsante centrale
function barraDelTempo(inizio, fine, giorno, cambia, centro) {
  const passi = Math.max(1, Math.ceil((new Date(fine) - new Date(inizio)) / (7 * GIORNO)));
  const indiceDi = g => Math.max(0, Math.min(passi, Math.round((new Date(g) - new Date(inizio)) / (7 * GIORNO))));
  let attuale = giorno;
  const barra = elemento('div', '', 'barra-tempo');
  const data = elemento('div', '', 'data-tempo');
  const stagione = elemento('span', '', 'stagione-tempo');
  const cursore = elemento('input', '', 'cursore-tempo');
  cursore.type = 'range';
  cursore.min = '0';
  cursore.max = String(passi);
  cursore.setAttribute('aria-label', 'Giorno mostrato sulla mappa');
  const pulsante = (testo, nome) => {
    const b = elemento('button', testo, 'comando-tempo');
    b.type = 'button';
    b.setAttribute('aria-label', nome);
    return b;
  };
  const prima = pulsante('◀ settimana', 'Una settimana prima');
  const scorri = pulsante('▶▶ scorri', 'Fai scorrere il tempo');
  const mezzo = pulsante(centro[0], `Vai a: ${centro[0]}`);
  const dopo = pulsante('settimana ▶', 'Una settimana dopo');
  const comandi = elemento('div', '', 'comandi-tempo');
  comandi.append(prima, scorri, mezzo, dopo);
  barra.append(data, stagione, cursore, comandi);

  function vai(g) {
    attuale = g < inizio ? inizio : g > fine ? fine : g;
    cursore.value = String(indiceDi(attuale));
    data.textContent = dataLunga(attuale) + (attuale === oggiVero() && !inArcade() ? ' · oggi' : '');
    stagione.textContent = stagioneDi(attuale);
    cambia(attuale);
  }
  cursore.addEventListener('input', () => vai(piuGiorni(inizio, Number(cursore.value) * 7)));
  prima.addEventListener('click', () => vai(piuGiorni(attuale, -7)));
  dopo.addEventListener('click', () => vai(piuGiorni(attuale, 7)));
  mezzo.addEventListener('click', () => vai(centro[1]));
  let timer = null;
  const ferma = () => { clearInterval(timer); timer = null; scorri.textContent = '▶▶ scorri'; };
  scorri.addEventListener('click', () => {
    if (timer) return ferma();
    scorri.textContent = '❚❚ ferma';
    timer = setInterval(() => {
      if (!barra.isConnected || attuale >= fine) return ferma();
      vai(piuGiorni(attuale, 7));
    }, 450);
  });
  // Primo disegno, senza chiamare cambia due volte: lo fa chi crea la barra
  cursore.value = String(indiceDi(attuale));
  data.textContent = dataLunga(attuale) + (attuale === oggiVero() && !inArcade() ? ' · oggi' : '');
  stagione.textContent = stagioneDi(attuale);
  return barra;
}

export function ortoNelTempo(dati) {
  const sezione = document.createElement('section');
  sezione.className = 'mappa orto-tempo';
  // Da quando c'è l'orto (prima coltura o voce) a 4 anni da oggi
  const date = [...dati.colture.map(c => c.dataInizio), ...dati.registro.map(v => v.data)].filter(Boolean).sort();
  const inizio = date[0] && date[0] < oggi() ? date[0] : piuGiorni(oggi(), -30);
  const testa = elemento('div', '', 'testa-tempo');
  testa.append(link('← Simulazioni', '#/test', 'indietro-tempo'), elemento('span', 'Orto reale nel tempo · solo da guardare', 'titolo-tempo'));
  const posto = elemento('div');
  const mostra = g => {
    posto.replaceChildren(mappaDelGiorno(dati, g));
    coloraPrato(g);
  };
  sezione.append(testa, posto, barraDelTempo(inizio, piuGiorni(oggi(), 4 * 365), oggi(), mostra, ['oggi', oggi()]));
  mostra(oggi());
  return sezione;
}

// ---- Arcade ----

let modoArcade = false;   // vero mentre si disegna la mappa di una simulazione

// In una simulazione le colture spariscono a fine raccolta (vera o stimata), anche se nessuno le termina
function presenteInSimulazione(c, g) {
  if (c.stato === 'pianificata' || c.dataInizio > g) return false;
  if (c.dataFine) return g < c.dataFine;
  const scheda = colturaDaNome(c.nome);
  if (!scheda || scheda.tappa === 'P') return true;
  const stima = fineSuggerita(scheda, c.dataInizio);
  return !stima || g < stima;
}

function mappaArcade(dati) {
  const sim = simulazioneAttiva();
  const sezione = document.createElement('section');
  sezione.className = 'mappa orto-tempo mappa-arcade';
  const posto = elemento('div', '', 'posto-mappa');
  const partenza = `${sim.parametri.inizio}-01`;
  const disegnaMappa = () => {
    modoArcade = true;
    try {
      const m = elemento('div', '', 'mappa-tempo');
      m.append(etichetta('Fondo'), colonna(dati, 'sinistra'), vialetto(dati), colonna(dati, 'destra'), staccionata(), etichetta('Davanti'));
      posto.replaceChildren(m);
    } finally {
      modoArcade = false;
    }
    coloraPrato(oggi());
  };
  const cesto = link('', '#/raccolto', 'cesto-raccolto');
  const contaCesto = () => {
    const kg = totaleRaccolto(dati, partenza, piuGiorni(oggi(), 1));
    const circa = `circa ${testoKg((kg[0] + kg[1]) / 2)}`;
    const testo = elemento('span', '', 'testo-cesto');
    testo.append(elemento('small', 'Raccolto finora'), ' ', elemento('strong', circa));
    cesto.innerHTML = CESTO;
    cesto.append(testo, elemento('span', '›', 'freccia-cesto'));
    cesto.setAttribute('aria-label', `Raccolto finora: ${circa}. Apri il raccolto`);
  };
  const barra = barraDelTempo(piuGiorni(partenza, -30), piuGiorni(partenza, 4 * 365), sim.giorno, g => {
    impostaGiornoArcade(g);
    disegnaMappa();
    contaCesto();
  }, ['partenza', partenza]);
  contaCesto();
  sezione.append(posto, cesto, barra);
  disegnaMappa();
  return sezione;
}

// ---- Raccolto in Arcade ----

// Cesto con pomodoro, carota e cavolo (anche cestino sulle aiuole)
const CESTO = `<svg viewBox="0 0 48 48" aria-hidden="true">
  <path d="M10 20c0-10 28-10 28 0" fill="none" stroke="#5c3d22" stroke-width="3.5"/>
  <circle cx="17" cy="19" r="6" fill="#e2412b" stroke="#2a1e12" stroke-width="2"/>
  <path d="M26 21l9-8" stroke="#e86f1c" stroke-width="5" stroke-linecap="round"/>
  <circle cx="29" cy="20" r="5" fill="#6aa83a" stroke="#2a1e12" stroke-width="2"/>
  <path d="M6 21h36l-4 19a3 3 0 0 1-3 2H13a3 3 0 0 1-3-2z" fill="#d9a86c" stroke="#2a1e12" stroke-width="2.2"/>
  <path d="M9 28h30M10 34h28M17 22l2 19M24 22v19M31 22l-2 19" stroke="#7a4f2a" stroke-width="1.6"/>
</svg>`;

// es. "38 kg", "2,5 kg", "0,3 kg"
function testoKg(n) {
  return `${n >= 10 ? Math.round(n) : String(Math.round(n * 10) / 10).replace('.', ',')} kg`;
}

function inRaccoltaIl(c, g) {
  const info = resaColtura(c);
  return !!info && inRaccolta(info, g);
}

// kg [min, max] di tutte le colture tra da (compreso) e a (escluso)
function totaleRaccolto(dati, da, a) {
  return dati.colture.map(resaColtura).filter(Boolean)
    .map(info => kgTra(info, da, a))
    .reduce((t, kg) => [t[0] + kg[0], t[1] + kg[1]], [0, 0]);
}

const MESI_ANNO_ORTO = ['O', 'N', 'D', 'G', 'F', 'M', 'A', 'M', 'G', 'L', 'A', 'S'];

// Pagina "Il raccolto": totale fino al giorno della simulazione, grafico per mese e colture di un anno dell'orto
export function paginaRaccolto(dati) {
  const sim = simulazioneAttiva();
  const partenza = `${sim.parametri.inizio}-01`;
  const g = oggi();
  const fino = piuGiorni(g, 1);
  const sezione = document.createElement('section');
  sezione.append(link('← Mappa', '#/', 'indietro'), elemento('h2', 'Il raccolto'));

  const kg = totaleRaccolto(dati, partenza, fino);
  const totale = elemento('div', '', 'totale-raccolto');
  totale.innerHTML = CESTO;
  const testo = elemento('span');
  const dettaglio = elemento('small', `dalla partenza al ${dataPerUtente(g)}`);
  dettaglio.append(elemento('br'), `stima indicativa: da ${testoKg(kg[0])} a ${testoKg(kg[1])}`);
  testo.append(elemento('strong', `circa ${testoKg((kg[0] + kg[1]) / 2)}`), dettaglio);
  totale.append(testo);

  const primo = annoOrto(partenza);
  const anni = elemento('div', '', 'anni-raccolto');
  const posto = elemento('div');
  const mostraAnno = y => {
    for (const b of anni.children) b.setAttribute('aria-pressed', String(Number(b.dataset.anno) === y));
    posto.replaceChildren(...annoDiRaccolto(dati, y, g, fino));
  };
  for (let y = primo; y <= primo + 4; y++) {
    const b = elemento('button', `${y}–${String(y + 1).slice(2)}`);
    b.type = 'button';
    b.dataset.anno = String(y);
    b.addEventListener('click', () => mostraAnno(y));
    anni.append(b);
  }
  sezione.append(totale, anni, posto);
  mostraAnno(Math.min(primo + 4, Math.max(primo, annoOrto(g))));
  return sezione;
}

// Grafico dei 12 mesi (ottobre–settembre) e colture con raccolta nell'anno dell'orto y
function annoDiRaccolto(dati, y, g, fino) {
  const infos = dati.colture.map(resaColtura).filter(Boolean);
  const mezzo = kg => (kg[0] + kg[1]) / 2;
  const mesi = MESI_ANNO_ORTO.map((_, i) => {
    const m = (i + 9) % 12 + 1;
    const anno = i < 3 ? y : y + 1;
    const da = `${anno}-${String(m).padStart(2, '0')}-01`;
    const a = m === 12 ? `${anno + 1}-01-01` : `${anno}-${String(m + 1).padStart(2, '0')}-01`;
    let fatto = 0, previsto = 0;
    for (const info of infos) {
      if (da < fino) fatto += mezzo(kgTra(info, da, a < fino ? a : fino));
      if (a > fino) previsto += mezzo(kgTra(info, da > fino ? da : fino, a));
    }
    return { fatto, previsto };
  });
  const massimo = Math.max(1, ...mesi.map(x => x.fatto + x.previsto));
  const grafico = elemento('div', '', 'grafico-raccolto');
  mesi.forEach(({ fatto, previsto }, i) => {
    const colonna = elemento('div', '', 'mese-raccolto');
    colonna.title = `${MESI_LUNGHI[(i + 9) % 12]}: ${testoKg(fatto + previsto)}`;
    if (previsto > 0.05) colonna.append(Object.assign(elemento('span', '', 'previsto'), { style: `height:${previsto / massimo * 100}%` }));
    if (fatto > 0.05) colonna.append(Object.assign(elemento('span', '', 'fatto'), { style: `height:${fatto / massimo * 100}%` }));
    grafico.append(colonna);
  });
  const lettere = elemento('div', '', 'mesi-raccolto');
  for (const l of MESI_ANNO_ORTO) lettere.append(elemento('span', l));
  const legenda = elemento('div', '', 'legenda-raccolto');
  const pezzo = (testo, stile) => {
    const s = elemento('span');
    s.append(Object.assign(elemento('i'), { style: stile }), testo);
    return s;
  };
  legenda.append(pezzo('raccolto', 'background:#e9933a'), pezzo('ancora da raccogliere', 'background:#fff;border-style:dashed'));

  // Colture con raccolta in quest'anno dell'orto
  const inizioAnno = `${y}-10-01`, fineAnno = `${y + 1}-10-01`;
  const voci = infos
    .filter(info => info.periodi.some(p => p.dal < fineAnno && p.stop > inizioAnno))
    .sort((x, z) => x.periodi[0].dal.localeCompare(z.periodi[0].dal))
    .map(info => {
      const c = info.coltura;
      const kgAnno = kgTra(info, inizioAnno, fineAnno);
      const finora = mezzo(kgTra(info, inizioAnno, fino < fineAnno ? fino : fineAnno));
      const periodi = info.periodi.filter(p => p.dal < fineAnno && p.stop > inizioAnno);
      const stato = periodi.some(p => p.dal <= g && g < p.stop) ? 'in' : periodi.every(p => p.stop <= g) ? 'finita' : 'dopo';
      const forbice = `${testoKg(kgAnno[0]).replace(' kg', '')}–${testoKg(kgAnno[1])}`;
      const voce = link('', `#/coltura/${c.id}`, 'voce-raccolto');
      const nome = elemento('b', c.nome);
      nome.append(elemento('span', { in: 'in raccolta', finita: 'finita', dopo: 'da venire' }[stato], `stato-raccolto stato-${stato}`));
      const dove = doveColtura(c);
      const nota = stato === 'in' ? `${dove} · finora, su ${forbice} previsti`
        : stato === 'finita' ? `${dove} · ${forbice}`
        : `${dove} · ${forbice} da ${MESI_LUNGHI[Number(periodi[0].dal.slice(5, 7)) - 1]}`;
      voce.append(icona(c.nome, 'icona-raccolto', 2), nome, elemento('em', stato === 'dopo' ? '—' : testoKg(finora)), elemento('small', nota));
      return voce;
    });
  if (voci.length === 0) voci.push(elemento('p', 'Nessun raccolto in quest\'anno.', 'nota-terreno'));
  return [grafico, lettere, legenda, ...voci,
    elemento('p', 'Stime indicative dal catalogo. Fiori, sovesci e colture senza resa nel catalogo non contano.', 'nota-terreno')];
}

export function paginaSimulazioniArcade() {
  const elenco = elemento('div', '', 'simulazioni-salvate');
  const tutte = elencoSimulazioni();
  if (tutte.length === 0) elenco.append(elemento('p', 'Nessuna simulazione salvata.', 'nota-terreno'));
  for (const s of tutte) {
    const voce = link('', `#/test/arcade/${s.id}`, 'salvata');
    const testo = elemento('span');
    testo.append(elemento('strong', s.nome), elemento('br'),
      elemento('small', `creata il ${dataPerUtente(s.creata)} · ${s.parametri.partenza === 'reale' ? `dall'orto reale al ${dataPerUtente(s.parametri.dal)}` : 'orto vuoto'}`));
    voce.append(testo, elemento('span', '›', 'freccia-salvata'));
    elenco.append(voce);
  }
  return elenco;
}

const MESI_SCELTA = MESI_LUNGHI.map((m, i) => [String(i + 1).padStart(2, '0'), m]);

// Famiglie che la rotazione controlla (quelle delle colture del giro L → C → A → S), con due esempi ciascuna
const FAMIGLIE_ROTAZIONE = [...new Set(CATALOGO.filter(s => GIRO.includes(s.tappa)).map(s => s.famiglia))].sort();
function esempiFamiglia(f) {
  return CATALOGO.filter(s => GIRO.includes(s.tappa) && s.famiglia === f).slice(0, 2)
    .map(s => s.nome.toLowerCase()).join(', ');
}

// Parametri di una simulazione nuova (id null) o di una salvata
export function paginaArcade(id) {
  const sim = id ? leggiSimulazione(id) : null;
  const p = sim?.parametri ?? {
    inizio: oggiVero().slice(0, 7), rotazione: 'base', anni: 4, partenza: 'vuoto', dal: oggiVero(), terreno: 'reale',
  };
  const modulo = document.createElement('form');
  modulo.className = 'modulo modulo-arcade';
  modulo.noValidate = true;
  const scelte = (nome, opzioni) => `<div class="scelte-arcade">${opzioni.map(([v, t]) =>
    `<label><input type="radio" name="${nome}" value="${v}"><span>${t}</span></label>`).join('')}</div>`;
  modulo.innerHTML = `
    <label>Nome<input type="text" name="nome" autocomplete="off"></label>
    <fieldset><legend>Si parte</legend><div class="due-colonne">
      <label class="senza-margine">Mese<select name="mese">${MESI_SCELTA.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select></label>
      <label class="senza-margine">Anno<input type="text" inputmode="numeric" name="anno"></label></div></fieldset>
    <fieldset><legend>Rotazione</legend>${scelte('rotazione', [['base', 'Base'], ['personalizzata', 'Personalizzata'], ['nessuna', 'Nessuna']])}</fieldset>
    <label class="campo-anni" hidden>La stessa famiglia torna dopo
      <select name="anni"><option value="2">2 anni</option><option value="3">3 anni</option><option value="4">4 anni</option><option value="5">5 anni</option></select></label>
    <fieldset class="campo-famiglie" hidden><legend>Famiglie da controllare</legend>
      <div class="scelte-arcade scelte-famiglie">${FAMIGLIE_ROTAZIONE.map(f =>
        `<label><input type="checkbox" name="famiglie" value="${f}"><span>${f}<small>${esempiFamiglia(f)}</small></span></label>`).join('')}</div>
    </fieldset>
    <fieldset><legend>Partenza</legend>${scelte('partenza', [['vuoto', 'Orto vuoto'], ['reale', "Dall'orto reale"]])}</fieldset>
    <label class="campo-dal" hidden>Com'era l'orto reale il<input type="text" name="dal" placeholder="gg/mm/aaaa"></label>
    <fieldset><legend>Terreno</legend>${scelte('terreno', [['reale', 'Quello reale'], ['stima', 'Stima di Bologna']])}</fieldset>
    <fieldset class="preferenze"><legend>Preferenze</legend>
      <p class="aiuto-pref">Tocca una coltura: una volta <b class="pref-si">♥ mi piace</b>, due volte <b class="pref-no">✕ non la voglio</b>, tre volte torna normale.</p>
      <div class="posto-preferenze"></div>
      <p class="aiuto-pref">Quando riempie l'orto in automatico:</p>
      ${scelte('obiettivo', [['varieta', 'Un po\' di tutto'], ['preferite', 'Più preferite possibile']])}
    </fieldset>
    <label class="opzione-tutte"><input type="checkbox" name="riempi"> ${sim ? 'Riempi in automatico gli spazi vuoti, da oggi per 4 anni' : "Riempi l'orto in automatico per 4 anni"}</label>
    <p class="errore" role="alert" hidden></p>
    <button type="submit" class="pulsante pulsante-arcade">${sim ? 'Riprendi simulazione' : 'Inizia simulazione'}</button>`;
  const c = modulo.elements;
  c.nome.value = sim?.nome ?? `Simulazione del ${dataPerUtente(oggiVero())}`;
  c.mese.value = p.inizio.slice(5, 7);
  c.anno.value = p.inizio.slice(0, 4);
  c.anni.value = String(p.anni ?? 4);
  c.dal.value = dataPerUtente(p.dal);
  for (const k of ['rotazione', 'partenza', 'terreno']) modulo.querySelector(`[name="${k}"][value="${p[k]}"]`).checked = true;
  for (const casella of modulo.querySelectorAll('[name="famiglie"]')) casella.checked = (p.famiglie ?? FAMIGLIE_ROTAZIONE).includes(casella.value);
  const pref = { preferite: [], escluse: [], obiettivo: 'varieta', ...(p.preferenze ?? {}) };
  modulo.querySelector(`[name="obiettivo"][value="${pref.obiettivo}"]`).checked = true;
  c.riempi.checked = !sim;
  // Preferenze: un pulsante per coltura dell'orto, che gira tra normale → mi piace → non la voglio
  const statoPref = new Map(CATALOGO.map(s => [s.id, pref.preferite.includes(s.id) ? 'si' : pref.escluse.includes(s.id) ? 'no' : '']));
  const griglia = elemento('div', '', 'griglia-preferenze');
  for (const s of CATALOGO.filter(s => ['L', 'C', 'A', 'S', 'J', 'F', 'V'].includes(s.tappa))) {
    const b = elemento('button', '', 'preferenza');
    b.type = 'button';
    const segna = () => {
      b.dataset.stato = statoPref.get(s.id);
      b.setAttribute('aria-label', `${s.nome}: ${{ si: 'mi piace', no: 'non la voglio', '': 'normale' }[statoPref.get(s.id)]}`);
    };
    b.innerHTML = iconaSvg(s.nome, 2);
    b.append(elemento('span', s.nome));
    b.addEventListener('click', () => {
      statoPref.set(s.id, { '': 'si', si: 'no', no: '' }[statoPref.get(s.id)]);
      segna();
    });
    segna();
    griglia.append(b);
  }
  modulo.querySelector('.posto-preferenze').replaceWith(griglia);
  const mostraCampi = () => {
    const personalizzata = modulo.querySelector('[name="rotazione"]:checked').value === 'personalizzata';
    modulo.querySelector('.campo-anni').hidden = !personalizzata;
    modulo.querySelector('.campo-famiglie').hidden = !personalizzata;
    modulo.querySelector('.campo-dal').hidden = modulo.querySelector('[name="partenza"]:checked').value !== 'reale';
  };
  modulo.addEventListener('change', mostraCampi);
  mostraCampi();

  modulo.addEventListener('submit', evento => {
    evento.preventDefault();
    const avviso = modulo.querySelector('.errore');
    const scelto = k => modulo.querySelector(`[name="${k}"]:checked`).value;
    const anno = Number(c.anno.value.trim());
    const nuovi = {
      inizio: `${anno}-${c.mese.value}`, rotazione: scelto('rotazione'), anni: Number(c.anni.value),
      famiglie: [...modulo.querySelectorAll('[name="famiglie"]:checked')].map(x => x.value),
      partenza: scelto('partenza'), dal: dataPerArchivio(c.dal.value) ?? '', terreno: scelto('terreno'),
      preferenze: {
        preferite: [...statoPref].filter(([, v]) => v === 'si').map(([k]) => k),
        escluse: [...statoPref].filter(([, v]) => v === 'no').map(([k]) => k),
        obiettivo: scelto('obiettivo'),
      },
    };
    const errori = [];
    if (!c.nome.value.trim()) errori.push('Scrivi un nome per la simulazione.');
    if (!Number.isInteger(anno) || anno < 2000 || anno > 2100) errori.push("Scrivi l'anno di partenza, es. 2027.");
    if (nuovi.rotazione === 'personalizzata' && nuovi.famiglie.length === 0) errori.push('Scegli almeno una famiglia da controllare, oppure la rotazione "Nessuna".');
    if (nuovi.partenza === 'reale') {
      const primo = inizioOrtoReale();
      if (!nuovi.dal) errori.push("Scrivi la data dell'orto reale come gg/mm/aaaa.");
      else if (!primo) errori.push("L'orto reale è ancora vuoto: scegli \"Orto vuoto\".");
      else if (nuovi.dal < primo) errori.push(`L'orto reale comincia il ${dataPerUtente(primo)}: scegli una data da lì in poi.`);
      else if (nuovi.dal > oggiVero()) errori.push("La data dell'orto reale non può essere nel futuro.");
    }
    if (errori.length) {
      avviso.textContent = errori.join('\n');
      avviso.hidden = false;
      return;
    }
    const base = ['inizio', 'partenza', 'dal', 'terreno'];
    const ricomincia = !sim || base.some(k => (k === 'dal' && nuovi.partenza !== 'reale') ? false : nuovi[k] !== p[k]);
    if (sim && ricomincia && !confirm('Hai cambiato la partenza: la simulazione ricomincia da capo e perde le colture aggiunte. Continuare?')) return;
    const nuova = sim ?? { id: nuovoId('s'), creata: oggiVero() };
    Object.assign(nuova, { nome: c.nome.value.trim(), parametri: nuovi });
    if (ricomincia) Object.assign(nuova, { dati: datiPerSimulazione(nuovi), giorno: `${nuovi.inizio}-01` });
    if (c.riempi.checked) {
      const piano = pianoAutomatico(nuova.dati, { dal: nuova.giorno, anni: 4, preferenze: nuovi.preferenze, nuovoId });
      nuova.dati.colture.push(...piano.colture);
      nuova.dati.registro.push(...piano.registro);
    }
    salvaSimulazione(nuova);
    entraArcade(nuova.id);
    location.hash = '#/';
  });

  const sezione = document.createElement('section');
  sezione.className = 'pagina-arcade';
  sezione.append(link('← Simulazioni', '#/test', 'indietro'), elemento('h2', sim ? sim.nome : 'Nuova simulazione Arcade'), modulo);
  if (sim) {
    const elimina = elemento('button', 'Elimina simulazione', 'pulsante pericolo');
    elimina.type = 'button';
    elimina.addEventListener('click', () => {
      if (!confirm(`Eliminare "${sim.nome}"? Non si potrà recuperare.`)) return;
      eliminaSimulazione(sim.id);
      location.hash = '#/test';
    });
    sezione.append(elimina);
  }
  return sezione;
}

// ---- Impara: questo mese, guide brevi, catalogo e glossario (conoscenza generale, non legge i dati dell'orto) ----

const ICONE_IMPARA = {
  mese: '<rect x="6" y="9" width="36" height="33" rx="5" fill="#fff8e7" stroke="#2a1e12" stroke-width="2.4"/><rect x="6" y="9" width="36" height="9" rx="4" fill="#e9933a" stroke="#2a1e12" stroke-width="2.4"/><path d="M15 5v8M33 5v8" stroke="#2a1e12" stroke-width="3" stroke-linecap="round"/><path d="M16 34c0-6 4-9 8-9-1 5-4 8-8 9z" fill="#6aa83a" stroke="#2a1e12" stroke-width="1.8"/><path d="M24 25v12" stroke="#2a1e12" stroke-width="1.8"/>',
  guide: '<path d="M10 40L34 12" stroke="#a87444" stroke-width="5" stroke-linecap="round"/><path d="M30 8l12 8-4 4-11-7z" fill="#9aa3a8" stroke="#2a1e12" stroke-width="2" stroke-linejoin="round"/>',
  catalogo: '<path d="M4 12c6-3 13-3 20 2 7-5 14-5 20-2v26c-6-3-13-3-20 2-7-5-14-5-20-2z" fill="#fff8e7" stroke="#2a1e12" stroke-width="2.4" stroke-linejoin="round"/><path d="M24 14v26" stroke="#2a1e12" stroke-width="2.4"/><path d="M18 19c-5 0-8 3-8 8 5 0 8-3 8-8z" fill="#6aa83a" stroke="#2a1e12" stroke-width="1.8"/>',
  glossario: '<path d="M6 10h36v22H22l-9 8v-8H6z" fill="#fff8e7" stroke="#2a1e12" stroke-width="2.4" stroke-linejoin="round"/><text x="24" y="27" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="600" font-size="14" fill="#3f6b2e">A–Z</text>',
};

function cartaImpara(href, icona, titolo, testo, classe = '') {
  const carta = link('', href, `carta-impara ${classe}`.trim());
  carta.innerHTML = `<svg viewBox="0 0 48 48" aria-hidden="true">${ICONE_IMPARA[icona]}</svg>`;
  const t = elemento('span');
  t.append(elemento('strong', titolo), elemento('small', testo));
  carta.append(t);
  return carta;
}

export function paginaImpara() {
  const sezione = document.createElement('section');
  const mese = oggiVero().slice(5, 7);
  sezione.append(
    link('← Mappa', '#/', 'indietro'),
    elemento('h2', 'Impara'),
    cartaImpara(`#/impara/mese/${mese}`, 'mese', `Questo mese: ${MESI_LUNGHI[Number(mese) - 1]}`, 'Cosa seminare, trapiantare e raccogliere a Bologna, e i lavori del mese', 'carta-mese'),
    cartaImpara('#/impara/guide', 'guide', 'Guide brevi', `I lavori dell'orto spiegati in pochi passi, con un disegno (${GUIDE.length} guide)`),
    cartaImpara('#/catalogo', 'catalogo', 'Catalogo delle colture', `${CATALOGO.length} schede: periodi, distanze, resa, consigli`),
    cartaImpara('#/impara/glossario', 'glossario', 'Glossario', "Le parole dell'orto: rincalzare, sfemminellare, sovescio…"),
  );
  return sezione;
}

// Il periodo ['MM-GG', 'MM-GG'] tocca il mese mm? (anche a cavallo di capodanno)
function periodoNelMese([dal, al], mm) {
  const inizio = `${mm}-01`, fine = `${mm}-31`;
  return dal <= al ? dal <= fine && al >= inizio : dal <= fine || al >= inizio;
}

function elencoMese(colture) {
  const p = elemento('p', '', 'elenco-gruppo elenco-mese');
  // Nomi fissi del catalogo, nessun testo dell'utente
  p.innerHTML = colture.map(c => `<a href="#/catalogo/${c.id}">${iconaSvg(c.nome, 2)}${c.nome}</a>`).join('');
  return p;
}

export function paginaMese(mm) {
  const n = Number(mm);
  if (!(n >= 1 && n <= 12)) return paginaImpara();
  const due = x => String(x).padStart(2, '0');
  const prima = due(n === 1 ? 12 : n - 1), dopo = due(n === 12 ? 1 : n + 1);
  const sezione = document.createElement('section');
  sezione.append(link('← Impara', '#/impara', 'indietro'), elemento('h2', `${MESI_LUNGHI[n - 1][0].toUpperCase()}${MESI_LUNGHI[n - 1].slice(1)} a Bologna`));
  const gruppi = [
    ['Si semina', CATALOGO.filter(c => c.s?.some(p => periodoNelMese(p, mm)))],
    ['Si trapianta o si mette a dimora', CATALOGO.filter(c => c.t?.some(p => periodoNelMese(p, mm)))],
    ['Si raccoglie', CATALOGO.filter(c => !['F', 'V'].includes(c.tappa) && c.r.some(p => periodoNelMese(p, mm)))],
  ];
  for (const [titolo, colture] of gruppi) {
    sezione.append(elemento('h3', titolo), colture.length ? elencoMese(colture) : elemento('p', 'Niente in questo mese.', 'nota-terreno'));
  }
  sezione.append(elemento('h3', 'Lavori del mese'));
  const lavori = elemento('ul', '', 'lavori-mese');
  for (const [testo, guida] of LAVORI[mm]) {
    const voce = elemento('li', testo);
    if (guida) voce.append(' ', link(`→ ${GUIDE.find(g => g.id === guida).titolo}`, `#/impara/guida/${guida}`, 'link-guida'));
    lavori.append(voce);
  }
  sezione.append(lavori, elemento('p', 'Periodi indicativi per la pianura bolognese: dipendono dall\'annata e dal meteo.', 'nota-terreno'));
  const frecce = elemento('div', '', 'frecce-mese');
  frecce.append(link(`◀ ${MESI_LUNGHI[Number(prima) - 1]}`, `#/impara/mese/${prima}`, 'pulsante secondario'),
    link(`${MESI_LUNGHI[Number(dopo) - 1]} ▶`, `#/impara/mese/${dopo}`, 'pulsante secondario'));
  sezione.append(frecce);
  return sezione;
}

export function paginaGuide() {
  const sezione = document.createElement('section');
  sezione.append(link('← Impara', '#/impara', 'indietro'), elemento('h2', 'Guide brevi'));
  const elenco = elemento('div', '', 'elenco-guide');
  for (const g of GUIDE) {
    const voce = link('', `#/impara/guida/${g.id}`, 'voce-guida');
    const testo = elemento('span');
    testo.append(elemento('strong', g.titolo), elemento('small', g.sottotitolo));
    voce.append(testo, elemento('span', '›', 'freccia-salvata'));
    elenco.append(voce);
  }
  sezione.append(elenco);
  return sezione;
}

export function paginaGuida(id) {
  const g = GUIDE.find(x => x.id === id);
  if (!g) return paginaGuide();
  const sezione = document.createElement('section');
  sezione.className = 'guida evidenzia';
  const colture = g.colture.map(c => CATALOGO.find(s => s.id === c)).filter(Boolean);
  // Testi fissi delle guide, nessun testo dell'utente
  sezione.innerHTML = `
    <a href="#/impara/guide" class="indietro">← Guide</a>
    <h2>${g.titolo}</h2>
    <p class="sottotitolo-guida">${g.sottotitolo}</p>
    <div class="disegno-guida">${g.disegno}</div>
    <p>${conTermini(g.intro)}</p>
    <h3>Come si fa</h3>
    <ol class="passi">${g.passi.map(x => `<li>${conTermini(x)}</li>`).join('')}</ol>
    <p class="quando-guida"><b>Quando:</b> ${conTermini(g.quando)}</p>
    ${g.attenzione?.length ? `<h3>Attenzione a</h3><ul class="attenzione">${g.attenzione.map(x => `<li>${conTermini(x)}</li>`).join('')}</ul>` : ''}
    ${colture.length ? `<h3>Colture</h3><p class="elenco-gruppo">${colture.map(c => `<a href="#/catalogo/${c.id}">${iconaSvg(c.nome, 2)}${c.nome}</a>`).join('')}</p>` : ''}
    <p class="nota-terreno">Le parole evidenziate hanno una spiegazione: toccale.</p>`;
  attivaParole(sezione);
  return sezione;
}

export function paginaGlossario() {
  const sezione = document.createElement('section');
  sezione.append(link('← Impara', '#/impara', 'indietro'), elemento('h2', 'Glossario'));
  const cerca = elemento('input', '', 'cerca-catalogo');
  cerca.type = 'search';
  cerca.placeholder = 'Cerca una parola';
  cerca.setAttribute('aria-label', 'Cerca una parola');
  cerca.autocomplete = 'off';
  const elenco = elemento('div', '', 'elenco-glossario');
  const voci = Object.entries(GLOSSARIO).sort(([, a], [, b]) => a.titolo.localeCompare(b.titolo, 'it'));
  for (const [id, g] of voci) {
    const b = elemento('button', '', 'voce-glossario');
    b.type = 'button';
    b.dataset.termine = id;
    b.append(elemento('strong', g.titolo), elemento('small', g.tipo));
    elenco.append(b);
  }
  const senza = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  cerca.addEventListener('input', () => {
    const q = senza(cerca.value.trim());
    for (const b of elenco.children) b.hidden = q !== '' && !senza(b.textContent).includes(q);
  });
  sezione.append(cerca, elenco);
  attivaParole(sezione);
  return sezione;
}

// ---- I miei orti: elenco degli orti dell'account, cambio, nuovo orto e nome ----

export function paginaOrti() {
  const sezione = document.createElement('section');
  sezione.append(link('← Mappa', '#/', 'indietro'), elemento('h2', 'I miei orti'));
  const attuale = ortoAttuale();
  if (!attuale) {
    sezione.append(
      elemento('p', 'Senza account i dati restano solo su questo telefono, in un solo orto. Entra o iscriviti per avere più orti e condividerli con altre persone.'),
      link('Entra o iscriviti', '#/impostazioni', 'pulsante'),
    );
    return sezione;
  }
  const elenco = elemento('div', '', 'elenco-orti');
  elenco.append(elemento('p', 'Carico gli orti…', 'nota-terreno'));
  const avviso = elemento('p', '', 'errore');
  avviso.hidden = true;
  const errore = e => {
    avviso.textContent = e instanceof TypeError ? 'Server non raggiungibile: controlla la connessione.' : e.message;
    avviso.hidden = false;
  };
  elencoOrti().then(orti => {
    elenco.replaceChildren();
    for (const o of orti) {
      const voce = elemento('button', '', `voce-orto${o.id === attuale.id ? ' attuale' : ''}`);
      voce.type = 'button';
      const nome = elemento('span');
      nome.append(elemento('strong', o.nome), elemento('small', o.id === attuale.id ? 'quello che stai usando' : 'tocca per passare a questo orto'));
      voce.append(nome, elemento('span', NOMI_RUOLO[o.ruolo], `ruolo-orto ruolo-${o.ruolo}`));
      voce.addEventListener('click', async () => {
        if (o.id === attuale.id) return;
        voce.disabled = true;
        try {
          await cambiaOrto(o);
          location.hash = '#/';
        } catch (e) {
          errore(e);
          voce.disabled = false;
        }
      });
      elenco.append(voce);
    }
    if (orti.length === 0) elenco.append(elemento('p', 'Nessun orto trovato.', 'nota-terreno'));
  });
  sezione.append(elenco, avviso, link('Persone dell\'orto', '#/orti/persone', 'pulsante secondario'));

  // Nome dell'orto attuale (solo il gestore)
  if (attuale.ruolo === 'gestore') {
    const rinomina = moduloNome('Nome', attuale.nome, 'Salva il nome', async nome => {
      await rinominaOrto(nome);
      document.dispatchEvent(new Event('dati-cambiati'));
    });
    sezione.append(elemento('h3', 'Nome dell\'orto'), rinomina);
  }

  // Nuovo orto
  const nuovo = moduloNome('Nome', '', '+ Crea il nuovo orto', async nome => {
    await nuovoOrto(nome);
    location.hash = '#/';
  });
  sezione.append(elemento('h3', 'Nuovo orto'),
    elemento('p', 'Ne sarai il gestore. Parte con le 8 aiuole di base: la forma dell\'orto si potrà disegnare più avanti.', 'nota-terreno'),
    nuovo);

  // Uscire dall'orto in uso, o eliminarlo (solo il gestore)
  const esci = elemento('button', 'Esci da questo orto', 'pulsante secondario');
  esci.type = 'button';
  esci.addEventListener('click', async () => {
    if (!confirm(`Uscire da "${attuale.nome}"? Non lo vedrai più, finché un gestore non ti aggiunge di nuovo.`)) return;
    try {
      await esciDallOrto();
      location.hash = '#/';
    } catch (e) {
      errore(e);
    }
  });
  sezione.append(elemento('h3', 'Questo orto'), esci);
  if (attuale.ruolo === 'gestore') {
    const elimina = elemento('button', 'Elimina questo orto', 'pulsante pericolo');
    elimina.type = 'button';
    elimina.addEventListener('click', async () => {
      const scritto = prompt(`Eliminare "${attuale.nome}" con tutte le colture, il registro e i task, per tutte le persone dell'orto? Non si può annullare.\n\nPer confermare scrivi il nome dell'orto:`);
      if (scritto === null) return;
      if (scritto.trim() !== attuale.nome) {
        alert('Il nome non corrisponde: l\'orto non è stato eliminato.');
        return;
      }
      try {
        await eliminaOrto();
        location.hash = '#/';
      } catch (e) {
        errore(e);
      }
    });
    sezione.append(elimina);
  }
  return sezione;
}

// Piccolo modulo con un nome (max 60 caratteri) e un pulsante
function moduloNome(etichetta, valore, testoPulsante, azione) {
  const modulo = document.createElement('form');
  modulo.className = 'modulo';
  modulo.noValidate = true;
  const campo = elemento('input');
  campo.type = 'text';
  campo.maxLength = 60;
  campo.value = valore;
  campo.autocomplete = 'off';
  const label = elemento('label', etichetta);
  label.append(campo);
  const avviso = elemento('p', '', 'errore');
  avviso.hidden = true;
  const pulsante = elemento('button', testoPulsante, 'pulsante');
  pulsante.type = 'submit';
  modulo.append(label, avviso, pulsante);
  modulo.addEventListener('submit', async evento => {
    evento.preventDefault();
    const nome = campo.value.trim();
    avviso.hidden = true;
    if (!nome) {
      avviso.textContent = 'Scrivi un nome.';
      avviso.hidden = false;
      return;
    }
    pulsante.disabled = true;
    try {
      await azione(nome);
    } catch (e) {
      avviso.textContent = e instanceof TypeError ? 'Server non raggiungibile: controlla la connessione.' : e.message;
      avviso.hidden = false;
    }
    pulsante.disabled = false;
  });
  return modulo;
}

// ---- Persone dell'orto: elenco con il ruolo; il gestore aggiunge email, cambia ruoli e toglie persone ----

const SCELTE_RUOLO = [['membro', 'Membro: usa l\'orto normalmente'], ['lettore', 'Sola lettura: può solo guardare'], ['gestore', 'Gestore: anche persone, nome ed eliminazione']];

function sceltaRuolo(valore) {
  const s = elemento('select', '', 'scelta-ruolo');
  for (const [v, t] of SCELTE_RUOLO) {
    const o = elemento('option', t.split(':')[0]);
    o.value = v;
    s.append(o);
  }
  s.value = valore;
  return s;
}

export function paginaPersone() {
  const sezione = document.createElement('section');
  sezione.append(link('← I miei orti', '#/orti', 'indietro'));
  const orto = ortoAttuale();
  if (!orto) {
    sezione.append(elemento('p', 'Entra con un account per condividere l\'orto con altre persone.'), link('Entra o iscriviti', '#/impostazioni', 'pulsante'));
    return sezione;
  }
  const gestore = orto.ruolo === 'gestore';
  const mia = statoSincronizzazione().email?.toLowerCase();
  sezione.append(elemento('h2', 'Persone dell\'orto'), elemento('p', orto.nome, 'sottotitolo-guida'));
  const elenco = elemento('div', '', 'elenco-orti');
  const avviso = elemento('p', '', 'errore');
  avviso.hidden = true;
  const errore = e => {
    avviso.textContent = e instanceof TypeError ? 'Server non raggiungibile: controlla la connessione.' : e.message;
    avviso.hidden = false;
  };

  const ricarica = async () => {
    try {
      const persone = await personeOrto(orto.id);
      elenco.replaceChildren();
      for (const p of persone) {
        const voce = elemento('div', '', 'voce-persona');
        const testo = elemento('span');
        testo.append(elemento('strong', p.email), elemento('small', p.email === mia ? 'tu' : p.iscritta ? 'iscritta' : 'non ancora iscritta: entrerà iscrivendosi con questa email'));
        voce.append(testo);
        if (gestore) {
          const ruolo = sceltaRuolo(p.ruolo);
          ruolo.setAttribute('aria-label', `Ruolo di ${p.email}`);
          ruolo.addEventListener('change', async () => {
            avviso.hidden = true;
            try {
              await cambiaRuolo(orto.id, p.email, ruolo.value);
              await sincronizza();
            } catch (e) {
              errore(e);
            }
            ricarica();
          });
          const togli = elemento('button', 'Togli', 'pulsante-piccolo');
          togli.type = 'button';
          togli.hidden = p.email === mia;
          togli.addEventListener('click', async () => {
            if (!confirm(`Togliere ${p.email} dall'orto? Non potrà più vederlo.`)) return;
            avviso.hidden = true;
            try {
              await togliPersona(orto.id, p.email);
            } catch (e) {
              errore(e);
            }
            ricarica();
          });
          const comandi = elemento('span', '', 'comandi-persona');
          comandi.append(ruolo, togli);
          voce.append(comandi);
        } else {
          voce.append(elemento('span', NOMI_RUOLO[p.ruolo], `ruolo-orto ruolo-${p.ruolo}`));
        }
        elenco.append(voce);
      }
    } catch (e) {
      elenco.replaceChildren();
      errore(e);
    }
  };
  elenco.append(elemento('p', 'Carico le persone…', 'nota-terreno'));
  ricarica();
  sezione.append(elenco, avviso);

  if (gestore) {
    const modulo = document.createElement('form');
    modulo.className = 'modulo';
    modulo.noValidate = true;
    const campo = elemento('input');
    campo.type = 'email';
    campo.autocomplete = 'off';
    const label = elemento('label', 'Email');
    label.append(campo);
    const ruolo = sceltaRuolo('membro');
    const labelRuolo = elemento('label', 'Ruolo');
    labelRuolo.append(ruolo);
    const errAgg = elemento('p', '', 'errore');
    errAgg.hidden = true;
    const pulsante = elemento('button', 'Aggiungi', 'pulsante');
    pulsante.type = 'submit';
    modulo.append(label, labelRuolo, errAgg, pulsante);
    modulo.addEventListener('submit', async evento => {
      evento.preventDefault();
      const email = campo.value.trim().toLowerCase();
      errAgg.hidden = true;
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        errAgg.textContent = 'Scrivi un\'email valida.';
        errAgg.hidden = false;
        return;
      }
      pulsante.disabled = true;
      try {
        await aggiungiPersona(orto.id, email, ruolo.value);
        campo.value = '';
        ricarica();
      } catch (e) {
        errAgg.textContent = e instanceof TypeError ? 'Server non raggiungibile: controlla la connessione.' : e.message;
        errAgg.hidden = false;
      }
      pulsante.disabled = false;
    });
    sezione.append(elemento('h3', 'Aggiungi una persona'),
      elemento('p', 'Scrivi la sua email: se si iscrive (o è già iscritta) con questa email, trova l\'orto in "I miei orti". Chi fa parte dell\'orto vede le email delle altre persone.', 'nota-terreno'),
      modulo);
  }
  const ruoli = elemento('ul', '', 'nota-terreno spiega-ruoli');
  for (const [, t] of SCELTE_RUOLO) ruoli.append(elemento('li', t));
  sezione.append(elemento('h3', 'I ruoli'), ruoli);
  return sezione;
}

// Pagina al posto dei moduli quando l'orto è in sola lettura
export function paginaSolaLettura() {
  const sezione = document.createElement('section');
  sezione.append(link('← Mappa', '#/', 'indietro'), elemento('h2', 'Sola lettura'),
    elemento('p', 'In questo orto puoi guardare tutto, ma non aggiungere né modificare. Se ti serve, chiedi a un gestore di cambiare il tuo ruolo.'),
    link('Persone dell\'orto', '#/orti/persone', 'pulsante secondario'));
  return sezione;
}

// Bottone che cambia i dati: in sola lettura non si mostra (vedi .sola-lettura .modifica-dati nel CSS)
function modificaDati(el) {
  el.classList.add('modifica-dati');
  return el;
}
