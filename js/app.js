import { carica } from './dati.js';
import { mappa } from './viste.js';

const contenuto = document.getElementById('contenuto');
try {
  contenuto.replaceChildren(mappa(carica()));
} catch (errore) {
  contenuto.textContent = errore.message;
}
