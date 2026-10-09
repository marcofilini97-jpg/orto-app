// Collegamento a Supabase (database online), solo con fetch: nessuna libreria esterna.
// La chiave pubblica è fatta per stare nel codice: i dati sono protetti dalle regole del database
// (ognuno legge solo gli orti di cui fa parte; chi è in sola lettura non scrive).

const URL_SERVER = 'https://mmjbkxznbjazhakbxdmg.supabase.co';
const CHIAVE_PUBBLICA = 'sb_publishable_HYLjUlG1oGqefZRofSOybA_swQ5_o2v';
const CHIAVE_SESSIONE = 'orto-sessione';
// Chiave pubblica per le notifiche (VAPID): quella segreta sta solo nei Secrets delle Edge Functions di Supabase
export const CHIAVE_NOTIFICHE = 'BCAFSaWf9DSde_18Li8EuYSJy2ebcwjZeW2nUBpMEVFu5yJdyyo5jODaWS-W64NY2j0RRtKJuqV3oVQlt4XfdOM';

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
    if (errore.stato === 400 && /confirm/i.test(errore.message)) throw new Error("Prima conferma l'email: apri il link che ti abbiamo mandato.");
    if (errore.stato === 400) throw new Error('Email o password sbagliate.');
    throw errore;
  }
}

// Dove torna chi apre il link dell'email (conferma dell'iscrizione o nuova password): questa stessa pagina
function indirizzoRitorno() {
  return encodeURIComponent(location.origin + location.pathname);
}

// Nuovo account: Supabase manda un'email con il link di conferma
export async function iscriviti(email, password) {
  await chiedi(`/auth/v1/signup?redirect_to=${indirizzoRitorno()}`, { method: 'POST', body: JSON.stringify({ email, password }) });
}

// Email con il link per scegliere una nuova password
export async function recuperaPassword(email) {
  await chiedi(`/auth/v1/recover?redirect_to=${indirizzoRitorno()}`, { method: 'POST', body: JSON.stringify({ email }) });
}

export async function cambiaPassword(password) {
  await chiedi('/auth/v1/user', { method: 'PUT', headers: await intestazioneAccesso(), body: JSON.stringify({ password }) });
}

// Chi apre il link dell'email arriva con l'accesso nell'indirizzo (#access_token=…&type=signup|recovery).
// Salva l'accesso e restituisce il tipo di link, oppure null se l'indirizzo è normale
export async function accessoDaLink() {
  const parti = new URLSearchParams(location.hash.slice(1));
  if (parti.get('error_description')) throw new Error(`Link non valido o scaduto: ${parti.get('error_description')}`);
  if (!parti.get('access_token')) return null;
  const accesso = parti.get('access_token');
  const utente = await chiedi('/auth/v1/user', { headers: { Authorization: `Bearer ${accesso}` } });
  localStorage.setItem(CHIAVE_SESSIONE, JSON.stringify({
    email: utente.email,
    accesso,
    rinnovo: parti.get('refresh_token'),
    scade: Date.now() + Number(parti.get('expires_in') ?? 3600) * 1000,
  }));
  return parti.get('type') ?? 'accesso';
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

// Gli orti di cui si fa parte: [{ id, nome, ruolo }], dal più vecchio
export async function mieiOrti() {
  return chiedi('/rest/v1/rpc/miei_orti', { method: 'POST', headers: await intestazioneAccesso(), body: '{}' });
}

// Nuovo orto (chi lo crea ne è il gestore); restituisce l'id
export async function creaOrto(nome) {
  return chiedi('/rest/v1/rpc/crea_orto', { method: 'POST', headers: await intestazioneAccesso(), body: JSON.stringify({ nome_orto: nome }) });
}

// Nuovo nome dell'orto (solo il gestore)
export async function rinominaOrtoServer(ortoId, nome) {
  await chiedi(`/rest/v1/orti?id=eq.${ortoId}`, {
    method: 'PATCH', headers: { ...await intestazioneAccesso(), Prefer: 'return=minimal' }, body: JSON.stringify({ nome }),
  });
}

// Le persone dell'orto: [{ email, ruolo, iscritta }]
export async function personeOrto(ortoId) {
  return chiedi('/rest/v1/rpc/persone_orto', { method: 'POST', headers: await intestazioneAccesso(), body: JSON.stringify({ o: ortoId }) });
}

export async function aggiungiPersona(ortoId, email, ruolo) {
  try {
    await chiedi('/rest/v1/persone', {
      method: 'POST', headers: { ...await intestazioneAccesso(), Prefer: 'return=minimal' },
      body: JSON.stringify({ orto_id: ortoId, email, ruolo }),
    });
  } catch (errore) {
    if (errore.stato === 409) throw new Error("Questa email fa già parte dell'orto.");
    throw errore;
  }
}

const filtroPersona = (ortoId, email) => `/rest/v1/persone?orto_id=eq.${ortoId}&email=eq.${encodeURIComponent(email)}`;

export async function cambiaRuolo(ortoId, email, ruolo) {
  await chiedi(filtroPersona(ortoId, email), {
    method: 'PATCH', headers: { ...await intestazioneAccesso(), Prefer: 'return=minimal' }, body: JSON.stringify({ ruolo }),
  });
}

// Toglie una persona dall'orto (il gestore toglie chiunque; ognuno può togliere se stesso)
export async function togliPersona(ortoId, email) {
  await chiedi(filtroPersona(ortoId, email), { method: 'DELETE', headers: await intestazioneAccesso() });
}

// Elimina l'orto con tutti i suoi dati (solo il gestore)
export async function eliminaOrtoServer(ortoId) {
  await chiedi('/rest/v1/rpc/elimina_orto', { method: 'POST', headers: await intestazioneAccesso(), body: JSON.stringify({ o: ortoId }) });
}

// Iscrizione di questo telefono alle notifiche dell'orto (sub = PushSubscription in JSON)
export async function salvaIscrizioneNotifiche(ortoId, email, sub) {
  await chiedi('/rest/v1/iscrizioni_notifiche?on_conflict=endpoint', {
    method: 'POST',
    headers: { ...await intestazioneAccesso(), Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ orto_id: ortoId, email, endpoint: sub.endpoint, dati: sub }),
  });
}

export async function togliIscrizioneNotifiche(endpoint) {
  await chiedi(`/rest/v1/iscrizioni_notifiche?endpoint=eq.${encodeURIComponent(endpoint)}`, { method: 'DELETE', headers: await intestazioneAccesso() });
}

// Le righe dell'orto ricevute dal server dopo l'ora "dopo" (tutte, se dopo è null), dalla più vecchia
export async function scaricaNovita(ortoId, dopo) {
  const filtro = dopo ? `&ricevuto=gt.${encodeURIComponent(dopo)}` : '';
  return chiedi(`/rest/v1/elementi?select=*&orto_id=eq.${ortoId}&order=ricevuto.asc${filtro}`, { headers: await intestazioneAccesso() });
}

// Aggiunge o aggiorna le righe dell'orto (in base all'id)
export async function inviaModifiche(ortoId, righe) {
  await chiedi('/rest/v1/elementi?on_conflict=orto_id,id', {
    method: 'POST',
    headers: { ...await intestazioneAccesso(), Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(righe.map(({ id, tipo, dati, modificato, eliminato }) => ({ orto_id: ortoId, id, tipo, dati, modificato, eliminato }))),
  });
}
