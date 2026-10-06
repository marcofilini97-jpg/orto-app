// Collegamento a Supabase (database online), solo con fetch: nessuna libreria esterna.
// La chiave pubblica è fatta per stare nel codice: i dati sono protetti dalle regole del database
// (leggono e scrivono solo i membri dopo il login).

const URL_SERVER = 'https://mmjbkxznbjazhakbxdmg.supabase.co';
const CHIAVE_PUBBLICA = 'sb_publishable_HYLjUlG1oGqefZRofSOybA_swQ5_o2v';
const CHIAVE_SESSIONE = 'orto-sessione';

function sessione() {
  try {
    return JSON.parse(localStorage.getItem(CHIAVE_SESSIONE));
  } catch {
    return null;
  }
}

export function collegato() {
  return sessione() !== null;
}

export function emailCollegata() {
  return sessione()?.email ?? null;
}

// Una richiesta al server; se risponde con un errore, lancia un Error con il messaggio
async function chiedi(percorso, opzioni = {}) {
  const risposta = await fetch(URL_SERVER + percorso, {
    ...opzioni,
    headers: { apikey: CHIAVE_PUBBLICA, 'Content-Type': 'application/json', ...opzioni.headers },
  });
  if (!risposta.ok) {
    let messaggio = `Errore del server (${risposta.status}).`;
    try {
      const corpo = await risposta.json();
      messaggio = corpo.msg || corpo.message || corpo.error_description || messaggio;
    } catch { /* risposta senza dettagli */ }
    const errore = new Error(messaggio);
    errore.stato = risposta.status;
    throw errore;
  }
  const testo = await risposta.text();
  return testo ? JSON.parse(testo) : null;
}

async function ottieniAccesso(corpo, tipo) {
  const r = await chiedi(`/auth/v1/token?grant_type=${tipo}`, { method: 'POST', body: JSON.stringify(corpo) });
  localStorage.setItem(CHIAVE_SESSIONE, JSON.stringify({
    email: r.user?.email ?? emailCollegata(),
    accesso: r.access_token,
    rinnovo: r.refresh_token,
    scade: Date.now() + r.expires_in * 1000,
  }));
}

export async function accedi(email, password) {
  try {
    await ottieniAccesso({ email, password }, 'password');
  } catch (errore) {
    if (errore.stato === 400) throw new Error('Email o password sbagliate.');
    throw errore;
  }
}

export function esci() {
  localStorage.removeItem(CHIAVE_SESSIONE);
}

// L'accesso dura circa un'ora: poco prima che scada si rinnova da solo
async function intestazioneAccesso() {
  const s = sessione();
  if (!s) throw new Error('Non sei collegato.');
  if (Date.now() > s.scade - 60000) {
    try {
      await ottieniAccesso({ refresh_token: s.rinnovo }, 'refresh_token');
    } catch (errore) {
      if (errore.stato === 400 || errore.stato === 401) esci();   // accesso non più valido: va rifatto il login
      throw errore;
    }
  }
  return { Authorization: `Bearer ${sessione().accesso}` };
}

// Le righe ricevute dal server dopo l'ora "dopo" (tutte, se dopo è null), dalla più vecchia
export async function scaricaNovita(dopo) {
  const filtro = dopo ? `&ricevuto=gt.${encodeURIComponent(dopo)}` : '';
  return chiedi(`/rest/v1/elementi?select=*&order=ricevuto.asc${filtro}`, { headers: await intestazioneAccesso() });
}

// Aggiunge o aggiorna le righe (in base all'id)
export async function inviaModifiche(righe) {
  await chiedi('/rest/v1/elementi?on_conflict=id', {
    method: 'POST',
    headers: { ...await intestazioneAccesso(), Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(righe.map(({ id, tipo, dati, modificato, eliminato }) => ({ id, tipo, dati, modificato, eliminato }))),
  });
}
