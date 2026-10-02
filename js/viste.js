// Funzioni che costruiscono le schermate. Ricevono i dati e restituiscono elementi da mostrare.

import { carica, salva, esporta, importa, oggi, nuovoId, dataPerUtente, dataPerArchivio } from './dati.js';

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
  mappa.append(etichetta('Fondo'), colonna(dati, 'sinistra'), vialetto(), colonna(dati, 'destra'), etichetta('Davanti'));
  return mappa;
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
    link.append(elemento('span', a.id));
    for (const { zona, n } of bollini(dati, a)) {
      link.append(elemento('span', `× ${n}`, `bollino bollino-${posizioneBollino(zona, a.lato)}`));
    }
    colonna.append(link);
  }
  return colonna;
}

function vialetto() {
  const vialetto = document.createElement('div');
  vialetto.className = 'vialetto';
  vialetto.setAttribute('aria-hidden', 'true');
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
    elemento('p', `Settore ${aiuola.settore} · a ${aiuola.lato} · ${aiuola.posizione}ª dal fondo`),
    elemento('p', divisione(dati, aiuola.id) === 'fondo-davanti' ? 'Divisa a metà: fondo / davanti'
      : divisione(dati, aiuola.id) === 'vialetto-esterno' ? 'Divisa a metà: vialetto / esterno'
      : 'Non divisa'),
    elemento('h3', 'Colture attive'),
    elencoColture(attive, 'Nessuna coltura attiva.'),
    link('Aggiungi coltura', `#/aiuola/${aiuola.id}/nuova-coltura`, 'pulsante'),
    elemento('h3', 'Note'),
    elemento('p', aiuola.note || 'Nessuna nota.'),
    link('Mostra storico', `#/aiuola/${aiuola.id}/storico`, 'pulsante'),
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
      <div class="due-colonne">${caselleAiuole(dati, aiuola.id)}</div>
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
function caselleAiuole(dati, spuntata) {
  return [...dati.aiuole]
    .sort((x, y) => x.posizione - y.posizione || (x.lato === 'sinistra' ? -1 : 1))
    .map(a => `<label class="opzione"><input type="checkbox" name="aiuole" value="${a.id}"${a.id === spuntata ? ' checked' : ''}> ${a.id}</label>`)
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
    dati.colture.push({
      id: nuovoId('c'), nome, varieta: campi.get('varieta').trim(), aiuoleIds, parti,
      dataInizio, metodo, stato: 'attiva', dataFine: null, note: campi.get('note').trim(),
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
