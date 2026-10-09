// Funzione di Supabase (Edge Function) "avvisi-meteo": ogni sera la fa partire un Cron.
// Scarica le previsioni di Bologna (Open-Meteo), guarda le colture attive di ogni orto con telefoni iscritti
// e manda le notifiche degli avvisi (stesse regole di avvisiMeteo in js/meteo.js). Ogni avviso parte una volta sola.
// Secrets da impostare nel pannello: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (es. mailto:tua@email), PAROLA_PROVA.
// SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY ci sono già: la chiave di servizio resta sul server, mai nell'app.

import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2';

const CALDE = new Set(['pomodor', 'peperon', 'melanzan', 'zucchin', 'cetriol', 'zucca', 'melon', 'anguri', 'mais', 'fagiol', 'basilic']);
const NOMI_GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];

const piu = (iso: string, n: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const giorniTra = (da: string, a: string) => Math.round((Date.parse(a) - Date.parse(da)) / 86400000);
const quando = (iso: string, oggi: string) => {
  const n = giorniTra(oggi, iso);
  return n === 0 ? 'oggi' : n === 1 ? 'domani' : NOMI_GIORNI[new Date(`${iso}T12:00:00Z`).getUTCDay()];
};
const senzaAccenti = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

type Giorno = { d: string; massima: number; minima: number; pioggia: number };
type Avviso = { chiave: string; titolo: string; testo: string };

function avvisi(giorni: Map<string, Giorno>, oggi: string, colture: string[], delicate: string[]): Avviso[] {
  if (colture.length === 0) return [];
  const out: Avviso[] = [];
  const prossimi = [0, 1, 2, 3].map(i => giorni.get(piu(oggi, i))).filter(Boolean) as Giorno[];
  const gelo = prossimi.find(g => g.minima <= 1);
  if (gelo && delicate.length) {
    out.push({ chiave: `gelo-${gelo.d}`, titolo: `Gelata ${quando(gelo.d, oggi)}`,
      testo: `Minima prevista ${Math.round(gelo.minima)} °C: copri con il tessuto non tessuto (${delicate.slice(0, 4).join(', ')}${delicate.length > 4 ? '…' : ''}).` });
  }
  const caldo = prossimi.find(g => g.massima >= 33);
  if (caldo) {
    out.push({ chiave: `caldo-${caldo.d}`, titolo: `Caldo forte ${quando(caldo.d, oggi)}`,
      testo: `Massima prevista ${Math.round(caldo.massima)} °C: annaffia la sera o al mattino presto e pacciama.` });
  }
  const pioggia = prossimi.slice(0, 2).find(g => g.pioggia >= 10);
  if (pioggia) {
    out.push({ chiave: `pioggia-${pioggia.d}`, titolo: `Pioggia ${quando(pioggia.d, oggi)}`,
      testo: `Previsti circa ${Math.round(pioggia.pioggia)} mm: puoi saltare l'annaffiatura.` });
  }
  const mese = Number(oggi.slice(5, 7));
  if (mese >= 4 && mese <= 9) {
    const ultimi = [1, 2, 3, 4, 5, 6, 7].map(i => giorni.get(piu(oggi, -i)));
    if (ultimi.every(Boolean) && ultimi.reduce((s, g) => s + g!.pioggia, 0) < 2 && prossimi.reduce((s, g) => s + g.pioggia, 0) < 2) {
      out.push({ chiave: `secco-${oggi.slice(0, 8)}${Number(oggi.slice(8)) < 15 ? 'a' : 'b'}`, titolo: 'Niente pioggia da una settimana',
        testo: 'E non ne è prevista: controlla la terra con un dito e annaffia a fondo dove è asciutta.' });
    }
  }
  return out;
}

Deno.serve(async richiesta => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT') ?? 'mailto:orto@example.com', Deno.env.get('VAPID_PUBLIC_KEY')!, Deno.env.get('VAPID_PRIVATE_KEY')!);

  // Prova: ?prova=<PAROLA_PROVA> manda una notifica di prova a tutti i telefoni iscritti (la parola sta nei Secrets)
  const prova = new URL(richiesta.url).searchParams.get('prova');
  if (prova) {
    if (prova !== Deno.env.get('PAROLA_PROVA')) return new Response('Parola di prova sbagliata', { status: 403 });
    const { data } = await supabase.from('iscrizioni_notifiche').select('dati');
    let ok = 0;
    for (const t of data ?? []) {
      try {
        await webpush.sendNotification(t.dati, JSON.stringify({ titolo: 'Orto: notifica di prova', testo: 'Le notifiche funzionano!', chiave: 'prova' }));
        ok++;
      } catch { /* telefono non raggiungibile */ }
    }
    return new Response(JSON.stringify({ prova: true, mandate: ok }), { headers: { 'Content-Type': 'application/json' } });
  }

  // Previsioni e ultimi giorni di Bologna
  const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=44.49&longitude=11.34&timezone=Europe%2FRome&past_days=8&forecast_days=5&daily=temperature_2m_max,temperature_2m_min,precipitation_sum');
  const j = await r.json();
  const giorni = new Map<string, Giorno>();
  j.daily.time.forEach((d: string, i: number) => giorni.set(d, { d, massima: j.daily.temperature_2m_max[i], minima: j.daily.temperature_2m_min[i], pioggia: j.daily.precipitation_sum[i] ?? 0 }));
  const oggi = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome' }).format(new Date());

  // Telefoni iscritti, raggruppati per orto
  const { data: iscrizioni, error } = await supabase.from('iscrizioni_notifiche').select('id, orto_id, endpoint, dati');
  if (error) return new Response(error.message, { status: 500 });
  const perOrto = new Map<string, typeof iscrizioni>();
  for (const s of iscrizioni ?? []) perOrto.set(s.orto_id, [...(perOrto.get(s.orto_id) ?? []), s]);

  let mandate = 0;
  for (const [ortoId, telefoni] of perOrto) {
    // Colture attive dell'orto (iniziate, senza data di fine)
    const { data: righe } = await supabase.from('elementi').select('dati').eq('orto_id', ortoId).eq('tipo', 'coltura').eq('eliminato', false);
    type Coltura = { nome: string; stato: string; dataInizio: string; dataFine: string | null };
    const attive = (righe ?? []).map(x => x.dati as Coltura).filter(c => c?.stato === 'attiva' && c.dataInizio <= oggi && !c.dataFine);
    const colture: string[] = [...new Set(attive.map(c => c.nome))];
    const delicate: string[] = [...new Set(attive.filter(c => [...CALDE].some(p => senzaAccenti(c.nome).includes(p)) || giorniTra(c.dataInizio, oggi) <= 21).map(c => c.nome.toLowerCase()))];
    for (const a of avvisi(giorni, oggi, colture, delicate)) {
      // Già mandato? (la chiave contiene il giorno)
      const { error: doppio } = await supabase.from('avvisi_inviati').insert({ orto_id: ortoId, chiave: a.chiave });
      if (doppio) continue;
      for (const t of telefoni!) {
        try {
          await webpush.sendNotification(t.dati, JSON.stringify({ titolo: a.titolo, testo: a.testo, chiave: a.chiave, url: './#/orto/meteo' }));
          mandate++;
        } catch (e) {
          // Iscrizione scaduta o tolta dal telefono: si cancella
          if ((e as { statusCode?: number }).statusCode === 404 || (e as { statusCode?: number }).statusCode === 410) {
            await supabase.from('iscrizioni_notifiche').delete().eq('id', t.id);
          }
        }
      }
    }
  }
  return new Response(JSON.stringify({ oggi, orti: perOrto.size, mandate }), { headers: { 'Content-Type': 'application/json' } });
});
