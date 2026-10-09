import { carica, salva, sincronizza, inProva, inArcade, esciArcade, simulazioneAttiva, accessoDaLink, completaCollegamento, ortoAttuale,
  soloLettura, MESSAGGIO_SOLA_LETTURA, aggiornaDatiSalvati, cambiaSviluppatore } from './dati.js';
import { CATALOGO } from './catalogo.js';
import { aggiornaMeteo } from './meteo.js';
import { PROVE } from './terreno.js';
import {
  mappa, schedaAiuola, storicoAiuola, infoAiuola, impostazioni, moduloColtura, schedaColtura, registro, nuovaVoce, schedaVoce,
  listaTask, moduloTask, schedaTask, paginaTest, paginaSimulazioni, ortoNelTempo, paginaArcade, paginaRaccolto,
  paginaImpara, paginaMese, paginaGuide, paginaGuida, paginaGlossario, paginaNuovaPassword, chiediSostituzione, paginaOrti, paginaPersone, paginaSolaLettura,
  impostaNomiAiuole, paginaDisegna, puoDisegnare, paginaOrto, paginaTerrenoOrto, paginaTerrenoAttuale, paginaSole, paginaSoleAiuola, paginaMeteo, paginaCatalogo, schedaCatalogo, paginaTerreno, paginaProva, paginaAnalisi,
} from './viste.js';

const contenuto = document.getElementById('contenuto');

// Sceglie la schermata in base all'indirizzo, es. #/aiuola/2A/storico
function schermata() {
  const [, pagina, id, sotto, altro] = location.hash.split('/');
  // Impostazioni non legge i dati: così si può ripristinare un backup anche se sono danneggiati
  if (pagina === 'impostazioni') return impostazioni(id === 'backup');
  if (pagina === 'sviluppatore') {
    alert(cambiaSviluppatore() ? 'Strumenti per lo sviluppo accesi su questo telefono: la modalità prova è nelle Impostazioni.' : 'Strumenti per lo sviluppo spenti.');
    location.replace('#/impostazioni');
    return document.createElement('section');
  }
  if (pagina === 'nuova-password') return paginaNuovaPassword();
  if (pagina === 'orti') return id === 'persone' ? paginaPersone() : paginaOrti();
  // Il catalogo è conoscenza generale: non legge i dati dell'orto
  if (pagina === 'impara') {
    if (id === 'mese') return paginaMese(sotto);
    if (id === 'guide') return paginaGuide();
    if (id === 'guida') return paginaGuida(sotto);
    if (id === 'glossario') return paginaGlossario();
    return paginaImpara();
  }
  if (pagina === 'catalogo') {
    const scheda = CATALOGO.find(c => c.id === id);
    return scheda ? schedaCatalogo(scheda) : paginaCatalogo();
  }
  // In sola lettura i moduli per aggiungere e modificare non si aprono
  if (soloLettura() && (['nuova-coltura', 'nuova-voce', 'nuovo-task', 'modifica'].includes(sotto)
    || (pagina === 'task' && id === 'nuovo') || (pagina === 'registro' && id === 'nuova-voce')
    || (pagina === 'aiuola' && sotto === 'terreno' && altro))) return paginaSolaLettura();
  const dati = carica();
  impostaNomiAiuole(dati);
  if (pagina === 'disegna') return puoDisegnare() ? paginaDisegna(dati, { nuovo: id === 'nuovo' }) : paginaSolaLettura();
  if (pagina === 'orto') {
    if (id === 'meteo') return paginaMeteo();
    if (id === 'terreno') return sotto === 'modifica' ? paginaTerrenoOrto(dati) : paginaTerrenoAttuale();
    if (id === 'sole') {
      const a = dati.aiuole.find(x => x.id === sotto);
      return a ? paginaSoleAiuola(dati, a) : paginaSole(dati);
    }
    return paginaOrto(dati);
  }
  if (pagina === 'task') {
    if (id === 'nuovo') return moduloTask(dati);
    if (id === 'fatti') return listaTask(dati, true);
    const task = dati.task.find(t => t.id === id);
    if (task && sotto === 'modifica') return moduloTask(dati, { task });
    if (task) return schedaTask(dati, task);
    return listaTask(dati);
  }
  if (pagina === 'arcade' && id === 'esci') {
    // Uscita da Arcade: si torna ai parametri della simulazione
    const sim = simulazioneAttiva();
    esciArcade();
    location.replace(sim ? `#/test/arcade/${sim.id}` : '#/test');
    return document.createElement('section');
  }
  if (pagina === 'raccolto' && inArcade()) return paginaRaccolto(dati);
  if (pagina === 'test') {
    if (id === 'arcade') return paginaArcade(sotto && sotto !== 'nuova' ? sotto : null);
    if (inArcade()) return mappa(dati);
    if (id === 'reale') return ortoNelTempo(dati);
    if (id === 'calendario') return paginaTest(dati);
    return paginaSimulazioni();
  }
  if (pagina === 'registro') {
    return id === 'nuova-voce' ? nuovaVoce(dati) : registro(dati);
  }
  const aiuola = dati.aiuole.find(a => a.id === id);
  if (pagina === 'aiuola' && aiuola) {
    if (sotto === 'storico') return storicoAiuola(dati, aiuola);
    if (sotto === 'info') return infoAiuola(dati, aiuola);
    if (sotto === 'terreno') {
      if (altro === 'analisi') return paginaAnalisi(dati, aiuola);
      if (PROVE[altro]) return paginaProva(dati, aiuola, altro);
      return paginaTerreno(dati, aiuola);
    }
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
  // Il prato delle stagioni lo colora solo la mappa nel tempo
  document.body.style.removeProperty('--prato');
  document.body.style.removeProperty('--prato-punti');
  delete document.body.dataset.stagione;
  document.body.classList.toggle('prova', inProva() && !inArcade());
  document.body.classList.toggle('arcade', inArcade());
  // Nella barra: il nome della simulazione in Arcade, altrimenti il nome dell'orto (tocco = I miei orti)
  const nomeBarra = document.querySelector('.nome-barra');
  const orto = ortoAttuale();
  nomeBarra.textContent = inArcade() ? simulazioneAttiva().nome : orto && !inProva() ? orto.nome : '';
  if (inArcade()) nomeBarra.removeAttribute('href');
  else nomeBarra.href = '#/orti';
  document.body.classList.toggle('sola-lettura', soloLettura());
  try {
    contenuto.replaceChildren(schermata());
    if (soloLettura()) contenuto.prepend(Object.assign(document.createElement('p'), { className: 'avviso-lettura', textContent: 'Sola lettura: puoi guardare questo orto, non modificarlo.' }));
  } catch (errore) {
    contenuto.textContent = errore.message;
  }
}

function mostra() {
  disegna();
  window.scrollTo(0, 0);
}

// Dati di una versione precedente (es. aiuole senza misure, metà vialetto/esterno): si aggiornano e si salvano
try {
  aggiornaDatiSalvati();
} catch {
  // dati danneggiati: se ne occupa la schermata (messaggio di errore)
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

// Link dell'email di Supabase (conferma dell'iscrizione o nuova password): l'accesso arriva nell'indirizzo
async function linkDellEmail() {
  try {
    const tipo = await accessoDaLink();
    if (!tipo) return;
    history.replaceState(null, '', location.pathname);
    if (tipo === 'recovery') {
      location.replace('#/nuova-password');
      return;
    }
    await completaCollegamento(chiediSostituzione);
    alert('Account confermato: questo telefono è collegato.');
    location.replace('#/impostazioni');
  } catch (errore) {
    history.replaceState(null, '', location.pathname);
    alert(errore instanceof TypeError ? 'Server non raggiungibile: riprova più tardi.' : errore.message);
    location.replace('#/impostazioni');
  }
}
if (/[#&](access_token|error_description)=/.test(location.hash)) await linkDellEmail();

// Un salvataggio rifiutato perché l'orto è in sola lettura: lo si dice, invece di non fare niente
window.addEventListener('error', evento => {
  if (evento.error?.message === MESSAGGIO_SOLA_LETTURA) {
    evento.preventDefault();
    alert(MESSAGGIO_SOLA_LETTURA);
  }
});

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

// Meteo di Bologna: all'avvio e quando torna la rete; con i dati nuovi si ridisegna (non mentre si compila un modulo)
aggiornaMeteo();
window.addEventListener('online', aggiornaMeteo);
document.addEventListener('meteo-aggiornato', () => {
  if (!contenuto.querySelector('form')) disegna();
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') sincronizza();
});

// Offline e aggiornamenti: il service worker (sw.js) gestisce la copia dei file
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' });
}
