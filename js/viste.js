// Funzioni che costruiscono le schermate. Ricevono i dati e restituiscono elementi da mostrare.

import { carica, salva, esporta, importa, oggi, nuovoId, dataPerUtente, dataPerArchivio } from './dati.js';

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
    link.className = 'aiuola';
    link.href = `#/aiuola/${a.id}`;
    link.textContent = a.id;
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
    const dove = c.aiuoleIds.length > 1 ? ` (${c.aiuoleIds.join(', ')})` : '';
    ul.append(elemento('li', `${nome} · ${periodo}${dove}`));
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
    const dati = carica();
    dati.colture.push({
      id: nuovoId('c'), nome, varieta: campi.get('varieta').trim(), aiuoleIds,
      dataInizio, metodo, stato: 'attiva', dataFine: null, note: campi.get('note').trim(),
    });
    salva(dati);
    history.back();
  } catch (errore) {
    avviso.textContent = errore.message;
    avviso.hidden = false;
  }
}
