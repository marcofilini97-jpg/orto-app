import { carica } from './dati.js';
import {
  mappa, schedaAiuola, storicoAiuola, impostazioni, nuovaColtura, schedaColtura, registro, nuovaVoce, schedaVoce,
  listaTask, nuovoTask, schedaTask,
} from './viste.js';

const contenuto = document.getElementById('contenuto');

// Sceglie la schermata in base all'indirizzo, es. #/aiuola/2A/storico
function schermata() {
  const [, pagina, id, sotto] = location.hash.split('/');
  // Impostazioni non legge i dati: così si può ripristinare un backup anche se sono danneggiati
  if (pagina === 'impostazioni') return impostazioni();
  const dati = carica();
  if (pagina === 'task') {
    if (id === 'nuovo') return nuovoTask(dati);
    if (id === 'fatti') return listaTask(dati, true);
    const task = dati.task.find(t => t.id === id);
    if (task) return schedaTask(dati, task);
    return listaTask(dati);
  }
  if (pagina === 'registro') {
    return id === 'nuova-voce' ? nuovaVoce(dati) : registro(dati);
  }
  const aiuola = dati.aiuole.find(a => a.id === id);
  if (pagina === 'aiuola' && aiuola) {
    if (sotto === 'storico') return storicoAiuola(dati, aiuola);
    if (sotto === 'nuova-coltura') return nuovaColtura(dati, aiuola);
    if (sotto === 'registro') return registro(dati, aiuola);
    if (sotto === 'nuova-voce') return nuovaVoce(dati, { aiuoleIds: [aiuola.id] });
    if (sotto === 'nuovo-task') return nuovoTask(dati, { aiuoleIds: [aiuola.id] });
    return schedaAiuola(dati, aiuola);
  }
  if (pagina === 'coltura') {
    const coltura = dati.colture.find(c => c.id === id);
    if (coltura && sotto === 'nuova-voce') return nuovaVoce(dati, { aiuoleIds: coltura.aiuoleIds, coltura });
    if (coltura && sotto === 'nuovo-task') return nuovoTask(dati, { aiuoleIds: coltura.aiuoleIds, coltura });
    if (coltura) return schedaColtura(dati, coltura);
  }
  if (pagina === 'voce') {
    const voce = dati.registro.find(v => v.id === id);
    if (voce) return schedaVoce(dati, voce);
  }
  return mappa(dati);
}

function disegna() {
  try {
    contenuto.replaceChildren(schermata());
  } catch (errore) {
    contenuto.textContent = errore.message;
  }
}

function mostra() {
  disegna();
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', mostra);
// Dopo una modifica che non cambia schermata (es. spuntare un task) si ridisegna restando dove si è
document.addEventListener('dati-cambiati', disegna);
mostra();
