// Funzione di Supabase (Edge Function) "invita-persona": la chiama l'app quando il gestore aggiunge un'email
// a un orto (o preme "Manda invito"). Controlla che chi chiama sia gestore di quell'orto e manda l'email
// di invito con Brevo. Secrets: BREVO_API_KEY (chiave API di Brevo, xkeysib-…), MITTENTE_EMAIL (mittente
// verificato su Brevo). Verify JWT acceso: la chiama solo chi ha fatto l'accesso nell'app.

import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const NOMI_RUOLO: Record<string, string> = { gestore: 'gestore', membro: 'membro', lettore: 'sola lettura' };
const APP = 'https://marcofilini97-jpg.github.io/orto-app/';
// Il nome dell'orto lo scrive l'utente: nell'HTML dell'email va "disinnescato"
const sicuro = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

Deno.serve(async richiesta => {
  if (richiesta.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const risposta = (corpo: unknown, stato = 200) =>
    new Response(JSON.stringify(corpo), { status: stato, headers: { ...CORS, 'Content-Type': 'application/json' } });
  try {
    const { orto_id: ortoId, email: emailGrezza } = await richiesta.json();
    const email = String(emailGrezza ?? '').trim().toLowerCase();
    // Il client "come l'utente": le funzioni del database vedono chi sta chiamando
    const utente = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY') ?? richiesta.headers.get('apikey') ?? '', {
      global: { headers: { Authorization: richiesta.headers.get('Authorization') ?? '' } },
    });
    const { data: ruolo } = await utente.rpc('ruolo_in', { o: ortoId });
    if (ruolo !== 'gestore') return risposta({ errore: 'Solo chi gestisce l\'orto può mandare inviti.' }, 403);
    const { data: persone } = await utente.rpc('persone_orto', { o: ortoId });
    const persona = (persone ?? []).find((p: { email: string }) => p.email === email);
    if (!persona) return risposta({ errore: 'Questa email non fa parte dell\'orto: aggiungila prima.' }, 400);
    const { data: orti } = await utente.rpc('miei_orti');
    const orto = (orti ?? []).find((o: { id: string }) => o.id === ortoId);
    const { data: chi } = await utente.auth.getUser();
    const daChi = chi?.user?.email ?? 'Chi gestisce l\'orto';

    const nomeOrto = sicuro(orto?.nome ?? 'un orto');
    const ruoloTesto = NOMI_RUOLO[persona.ruolo] ?? persona.ruolo;
    const istruzioni = persona.iscritta
      ? `<p>Apri l'app <b>Orto</b>: lo trovi in <b>I miei orti</b> (tocca il nome dell'orto in alto, nella barra verde).</p>`
      : `<p>Per entrare:</p><ol><li>apri l'app <b>Orto</b> (link qui sotto);</li><li>vai in <b>Impostazioni</b> → <b>Iscriviti</b> con questa email (${sicuro(email)});</li><li>conferma l'iscrizione con il link che ti arriverà;</li><li>troverai l'orto in <b>I miei orti</b>.</li></ol>`;
    const html = `<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #2a1e12;">
      <h2 style="color: #3f6b2e;">Sei stato aggiunto a un orto 🌱</h2>
      <p>${sicuro(daChi)} ti ha aggiunto all'orto <b>${nomeOrto}</b> come <b>${ruoloTesto}</b>.</p>
      ${istruzioni}
      <p style="text-align: center; margin: 28px 0;">
        <a href="${APP}" style="background: #3f6b2e; color: #fff8e7; padding: 12px 22px; border-radius: 10px; text-decoration: none; font-weight: bold;">Apri l'app Orto</a>
      </p>
      <p style="font-size: 13px; color: #5c3d22;">Se non conosci chi ti ha invitato, ignora questa email.</p>
    </div>`;

    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': Deno.env.get('BREVO_API_KEY') ?? '', 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Orto', email: Deno.env.get('MITTENTE_EMAIL') },
        to: [{ email }],
        subject: `Ti hanno aggiunto all'orto "${orto?.nome ?? ''}"`,
        htmlContent: html,
      }),
    });
    if (!r.ok) return risposta({ errore: `L'email non è partita (Brevo ${r.status}): ${(await r.text()).slice(0, 200)}` }, 502);
    return risposta({ ok: true, iscritta: persona.iscritta });
  } catch (e) {
    return risposta({ errore: String(e) }, 500);
  }
});
