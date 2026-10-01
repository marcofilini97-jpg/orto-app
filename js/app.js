import { carica } from './dati.js';
import { mappa, schedaAiuola, storicoAiuola, impostazioni } from './viste.js';

const contenuto = document.getElementById('contenuto');

// Sceglie la schermata in base all'indirizzo, es. #/aiuola/2A/storico
function schermata() {
  const [, pagina, id, sotto] = location.hash.split('/');
  // Impostazioni non legge i dati: così si può ripristinare un backup anche se sono danneggiati
  if (pagina === 'impostazioni') return impostazioni();
  const dati = carica();
  const aiuola = dati.aiuole.find(a => a.id === id);
  if (pagina === 'aiuola' && aiuola) {
    return sotto === 'storico' ? storicoAiuola(dati, aiuola) : schedaAiuola(dati, aiuola);
  }
  return mappa(dati);
}

function mostra() {
  try {
    contenuto.replaceChildren(schermata());
  } catch (errore) {
    contenuto.textContent = errore.message;
  }
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', mostra);
mostra();
