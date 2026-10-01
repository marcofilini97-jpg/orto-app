import { carica } from './dati.js';
import { mappa, schedaAiuola, storicoAiuola, impostazioni, nuovaColtura, schedaColtura } from './viste.js';

const contenuto = document.getElementById('contenuto');

// Sceglie la schermata in base all'indirizzo, es. #/aiuola/2A/storico
function schermata() {
  const [, pagina, id, sotto] = location.hash.split('/');
  // Impostazioni non legge i dati: così si può ripristinare un backup anche se sono danneggiati
  if (pagina === 'impostazioni') return impostazioni();
  const dati = carica();
  const aiuola = dati.aiuole.find(a => a.id === id);
  if (pagina === 'aiuola' && aiuola) {
    if (sotto === 'storico') return storicoAiuola(dati, aiuola);
    if (sotto === 'nuova-coltura') return nuovaColtura(dati, aiuola);
    return schedaAiuola(dati, aiuola);
  }
  if (pagina === 'coltura') {
    const coltura = dati.colture.find(c => c.id === id);
    if (coltura) return schedaColtura(dati, coltura);
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
