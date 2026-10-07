import { carica, salva, sincronizza, inProva } from './dati.js';
import {
  mappa, schedaAiuola, storicoAiuola, infoAiuola, impostazioni, moduloColtura, schedaColtura, registro, nuovaVoce, schedaVoce,
  listaTask, moduloTask, schedaTask, paginaTest,
} from './viste.js';

const contenuto = document.getElementById('contenuto');

// Sceglie la schermata in base all'indirizzo, es. #/aiuola/2A/storico
function schermata() {
  const [, pagina, id, sotto] = location.hash.split('/');
  // Impostazioni non legge i dati: così si può ripristinare un backup anche se sono danneggiati
  if (pagina === 'impostazioni') return impostazioni();
  const dati = carica();
  if (pagina === 'task') {
    if (id === 'nuovo') return moduloTask(dati);
    if (id === 'fatti') return listaTask(dati, true);
    const task = dati.task.find(t => t.id === id);
    if (task && sotto === 'modifica') return moduloTask(dati, { task });
    if (task) return schedaTask(dati, task);
    return listaTask(dati);
  }
  if (pagina === 'test') return paginaTest(dati);
  if (pagina === 'registro') {
    return id === 'nuova-voce' ? nuovaVoce(dati) : registro(dati);
  }
  const aiuola = dati.aiuole.find(a => a.id === id);
  if (pagina === 'aiuola' && aiuola) {
    if (sotto === 'storico') return storicoAiuola(dati, aiuola);
    if (sotto === 'info') return infoAiuola(dati, aiuola);
    if (sotto === 'nuova-coltura') return moduloColtura(dati, { aiuola });
    if (sotto === 'registro') return registro(dati, aiuola);
    if (sotto === 'nuova-voce') return nuovaVoce(dati, { aiuoleIds: [aiuola.id] });
    if (sotto === 'nuovo-task') return moduloTask(dati, { aiuoleIds: [aiuola.id] });
    return schedaAiuola(dati, aiuola);
  }
  if (pagina === 'coltura') {
    const coltura = dati.colture.find(c => c.id === id);
    if (coltura?.stato === 'attiva' && sotto === 'modifica') return moduloColtura(dati, { coltura });
    if (coltura && sotto === 'nuova-voce') return nuovaVoce(dati, { aiuoleIds: coltura.aiuoleIds, coltura });
    if (coltura && sotto === 'nuovo-task') return moduloTask(dati, { aiuoleIds: coltura.aiuoleIds, coltura });
    if (coltura) return schedaColtura(dati, coltura);
  }
  if (pagina === 'voce') {
    const voce = dati.registro.find(v => v.id === id);
    if (voce) return schedaVoce(dati, voce);
  }
  return mappa(dati);
}

function disegna() {
  document.body.classList.toggle('prova', inProva());
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

// Le colture "pianificata" di una versione di prova del pianificatore diventano colture attive
// con l'inizio nel futuro, cioè "in programma"
try {
  const dati = carica();
  const vecchie = dati.colture.filter(c => c.stato === 'pianificata');
  if (vecchie.length > 0) {
    for (const c of vecchie) {
      c.stato = 'attiva';
      delete c.finePrevista;
    }
    salva(dati);
  }
} catch {
  // dati danneggiati: se ne occupa la schermata (messaggio di errore)
}

window.addEventListener('hashchange', mostra);
// Dopo una modifica che non cambia schermata (es. spuntare un task) si ridisegna restando dove si è
document.addEventListener('dati-cambiati', disegna);
// Arrivano modifiche dall'altro telefono: si ridisegna, ma non se si sta compilando un modulo
document.addEventListener('dati-sincronizzati', () => {
  if (!contenuto.querySelector('form')) disegna();
});
mostra();

// Sincronizzazione: all'avvio, quando torna la rete e quando si torna sull'app
sincronizza();
window.addEventListener('online', sincronizza);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') sincronizza();
});

// Offline e aggiornamenti: il service worker (sw.js) gestisce la copia dei file
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' });
}
