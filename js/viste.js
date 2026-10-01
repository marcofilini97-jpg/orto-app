// Funzioni che costruiscono le schermate. Ricevono i dati e restituiscono elementi da mostrare.

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
    const pulsante = document.createElement('button');
    pulsante.type = 'button';
    pulsante.className = 'aiuola';
    pulsante.dataset.id = a.id;
    pulsante.textContent = a.id;
    colonna.append(pulsante);
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
