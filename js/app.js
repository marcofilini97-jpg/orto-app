import { carica } from './dati.js';
import { mappa, schedaAiuola, storicoAiuola } from './viste.js';

const contenuto = document.getElementById('contenuto');

// Sceglie la schermata in base all'indirizzo, es. #/aiuola/2A/storico
function schermata(dati) {
  const [, pagina, id, sotto] = location.hash.split('/');
  const aiuola = dati.aiuole.find(a => a.id === id);
  if (pagina === 'aiuola' && aiuola) {
    return sotto === 'storico' ? storicoAiuola(dati, aiuola) : schedaAiuola(dati, aiuola);
  }
  return mappa(dati);
}

function mostra() {
  try {
    contenuto.replaceChildren(schermata(carica()));
  } catch (errore) {
    contenuto.textContent = errore.message;
  }
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', mostra);
mostra();
