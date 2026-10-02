// Funzioni che costruiscono le schermate. Ricevono i dati e restituiscono elementi da mostrare.

import {
  carica, salva, esporta, importa, oggi, domani, nuovoId, dataPerUtente, dataPerArchivio,
} from './dati.js';

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
  mappa.append(etichetta('Fondo'), colonna(dati, 'sinistra'), vialetto(dati), colonna(dati, 'destra'), etichetta('Davanti'));
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
    link.append(elemento('span', a.id, 'nome'));
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
  const segno = segnoTask(dati.task.filter(t => t.aiuoleIds.length === dati.aiuole.length));
  if (segno) vialetto.append(puntino(segno));
  return vialetto;
}

function etichetta(testo) {
  const p = document.createElement('p');
  p.className = 'estremo';
  p.textContent = testo;
  return p;
}

export function schedaAiuola(dati, aiuola) {
  const attive = colturePer(dati, aiuola.id).filter(c => c.stato === 'attiva');
  const sezione = document.createElement('section');
  sezione.append(
    link('← Mappa', '#/', 'indietro'),
    elemento('h2', `Aiuola ${aiuola.id}`),
    elemento('h3', 'Colture attive'),
    elencoColture(attive, 'Nessuna coltura attiva.'),
    link('Aggiungi coltura', `#/aiuola/${aiuola.id}/nuova-coltura`, 'pulsante'),
    elemento('p', `Settore ${aiuola.settore} · a ${aiuola.lato} · ${aiuola.posizione}ª dal fondo`),
    elemento('p', divisione(dati, aiuola.id) === 'fondo-davanti' ? 'Divisa a metà: fondo / davanti'
      : divisione(dati, aiuola.id) === 'vialetto-esterno' ? 'Divisa a metà: vialetto / esterno'
      : 'Non divisa'),
    elemento('h3', 'Note'),
    elemento('p', aiuola.note || 'Nessuna nota.'),
    link('Mostra storico', `#/aiuola/${aiuola.id}/storico`, 'pulsante'),
    elemento('h3', 'Da fare'),
    elencoTask(dati, ordinaTask(dati.task.filter(t => !t.fatto && t.aiuoleIds.includes(aiuola.id))), 'Niente da fare.'),
    link('Aggiungi task', `#/aiuola/${aiuola.id}/nuovo-task`, 'pulsante secondario'),
    elemento('h3', 'Registro'),
    elencoVoci(dati, ordinaVoci(dati.registro.filter(v => v.aiuoleIds.includes(aiuola.id))).slice(0, 5), 'Nessuna voce nel registro.'),
    link('Aggiungi al registro', `#/aiuola/${aiuola.id}/nuova-voce`, 'pulsante'),
    link(`Vedi tutto il registro di ${aiuola.id}`, `#/aiuola/${aiuola.id}/registro`, 'pulsante secondario'),
  );
  return sezione;
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
    voce.append(link(`${nome} · ${periodo}${dove}`, `#/coltura/${c.id}`));
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
    <fieldset>
      <legend>Aiuole</legend>
      <div class="due-colonne">${caselleAiuole(dati, [aiuola.id])}</div>
    </fieldset>
    <fieldset>
      <legend>Parte occupata</legend>
      <div class="parti"></div>
    </fieldset>
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
  const aggiorna = () => aggiornaParti(modulo, dati);
  modulo.querySelectorAll('input[name="aiuole"]').forEach(casella => casella.addEventListener('change', aggiorna));
  aggiorna();
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

// Stesso ordine della mappa: riga per riga, prima sinistra poi destra
function caselleAiuole(dati, spuntate) {
  return [...dati.aiuole]
    .sort((x, y) => x.posizione - y.posizione || (x.lato === 'sinistra' ? -1 : 1))
    .map(a => `<label class="opzione"><input type="checkbox" name="aiuole" value="${a.id}"${spuntate.includes(a.id) ? ' checked' : ''}> ${a.id}</label>`)
    .join('');
}

// Una tendina per ogni aiuola spuntata, con solo le metà compatibili con la divisione esistente
function aggiornaParti(modulo, dati) {
  const scelte = new FormData(modulo);
  const righe = scelte.getAll('aiuole').map(id => {
    const asse = divisione(dati, id);
    const opzioni = Object.keys(ASSI)
      .filter(parte => !asse || ASSI[parte] === asse)
      .map(parte => `<option value="${parte}"${scelte.get(`parte-${id}`) === parte ? ' selected' : ''}>Metà ${parte}</option>`)
      .join('');
    return `<label class="parte">${id}<select name="parte-${id}"><option value="">Intera</option>${opzioni}</select></label>`;
  });
  modulo.querySelector('.parti').innerHTML = righe.join('') || '<p>Scegli prima almeno un\'aiuola.</p>';
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
    const parti = {};
    for (const id of aiuoleIds) {
      const parte = campi.get(`parte-${id}`);
      if (parte) parti[id] = parte;
    }
    const dati = carica();
    const colturaId = nuovoId('c');
    dati.colture.push({
      id: colturaId, nome, varieta: campi.get('varieta').trim(), aiuoleIds, parti,
      dataInizio, metodo, stato: 'attiva', dataFine: null, note: campi.get('note').trim(),
    });
    // La semina o il trapianto finiscono anche nel registro
    dati.registro.push({
      id: nuovoId('r'), data: dataInizio, tipo: metodo, aiuoleIds, colturaId,
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
    if (confirm(`Terminare "${coltura.nome}"? Passerà nello storico di ${coltura.aiuoleIds.join(', ')}.`)) {
      modificaColtura(coltura.id, { stato: 'terminata', dataFine });
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
      modificaColtura(coltura.id, { stato: 'attiva', dataFine: null });
    }
  });
  return pulsante;
}

function modificaColtura(id, modifiche) {
  try {
    const dati = carica();
    Object.assign(dati.colture.find(c => c.id === id), modifiche);
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
  return v.aiuoleIds.length === dati.aiuole.length ? 'tutto l\'orto' : v.aiuoleIds.join(', ');
}

function elencoVoci(dati, voci, testoSeVuoto) {
  if (voci.length === 0) return elemento('p', testoSeVuoto);
  const ul = elemento('ul', '', 'registro');
  for (const v of voci) {
    const coltura = dati.colture.find(c => c.id === v.colturaId);
    const dove = doveVoce(dati, v);
    const dettagli = [coltura && nomeColtura(coltura), dove, v.quantita].filter(Boolean).join(' · ');
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
    <fieldset>
      <legend>Aiuole</legend>
      <div class="due-colonne">${caselleAiuole(dati, aiuoleIds)}</div>
      <button type="button" class="pulsante secondario tutto-orto">Tutto l'orto</button>
    </fieldset>
    <label>Quantità (facoltativa)<input type="text" name="quantita" autocomplete="off" placeholder="es. 3 kg, 20 litri"></label>
    <label>Note (facoltative)<textarea name="note" rows="3"></textarea></label>
    <p class="errore" role="alert" hidden></p>
    <button type="submit" class="pulsante">Salva nel registro</button>
  `;

  riempiColture(modulo.querySelector('select[name="coltura"]'), dati, coltura);
  collegaTuttoOrto(modulo);
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

function collegaTuttoOrto(modulo) {
  modulo.querySelector('.tutto-orto').addEventListener('click', () => {
    modulo.querySelectorAll('input[name="aiuole"]').forEach(casella => { casella.checked = true; });
  });
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
  return dati.task.filter(t => t.aiuoleIds.length < dati.aiuole.length && t.aiuoleIds.includes(aiuolaId));
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

export function nuovoTask(dati, { aiuoleIds = [], coltura = null } = {}) {
  const modulo = document.createElement('form');
  modulo.className = 'modulo';
  modulo.noValidate = true;
  // Solo testo fisso e dati dell'app: i nomi delle colture si aggiungono sotto, con textContent
  modulo.innerHTML = `
    <label>Cosa fare<input type="text" name="titolo" autocomplete="off" placeholder="es. Legare i pomodori"></label>
    <label>Scadenza (facoltativa)<input type="text" name="scadenza" placeholder="gg/mm/aaaa"></label>
    <fieldset>
      <legend>Aiuole (facoltative)</legend>
      <div class="due-colonne">${caselleAiuole(dati, aiuoleIds)}</div>
      <button type="button" class="pulsante secondario tutto-orto">Tutto l'orto</button>
    </fieldset>
    <label>Coltura (facoltativa)<select name="coltura"><option value="">Nessuna</option></select></label>
    <p class="errore" role="alert" hidden></p>
    <button type="submit" class="pulsante">Salva task</button>
  `;
  riempiColture(modulo.querySelector('select[name="coltura"]'), dati, coltura);
  collegaTuttoOrto(modulo);
  modulo.addEventListener('submit', evento => {
    evento.preventDefault();
    salvaTask(modulo);
  });

  const indietro = elemento('button', '← Indietro', 'indietro');
  indietro.type = 'button';
  indietro.addEventListener('click', () => history.back());

  const sezione = document.createElement('section');
  sezione.append(indietro, elemento('h2', 'Nuovo task'), modulo);
  return sezione;
}

function salvaTask(modulo) {
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
    const dati = carica();
    dati.task.push({
      id: nuovoId('t'), titolo, scadenza, aiuoleIds: campi.getAll('aiuole'),
      colturaId: campi.get('coltura') || null, fatto: false, fattoIl: null,
    });
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
  sezione.append(elimina);
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
