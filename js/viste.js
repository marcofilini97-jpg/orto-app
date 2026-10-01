// Funzioni che costruiscono le schermate. Ricevono i dati e restituiscono elementi da mostrare.

import { dataPerUtente } from './dati.js';

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
