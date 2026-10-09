# Orto App

App per gestire un orto comunale, che curo insieme a mio padre.

## L'orto
- Circa 24 m², 8 aiuole disposte 4 per lato di un vialetto centrale
- Lato sinistro, dal fondo al davanti: 1A, 1B, 3A, 3B
- Lato destro, dal fondo al davanti: 2A, 2B, 4A, 4B
- Settori (coppie di aiuole): 1 = 1A+1B, 2 = 2A+2B, 3 = 3A+3B, 4 = 4A+4B
- La rotazione delle colture ragiona per settore

## Requisiti
- Interfaccia in italiano
- Mobile-first: si usa in piedi nell'orto, spesso al sole (contrasto alto, pulsanti grandi)
- Funziona offline (PWA)
- Dati salvati nel browser, con esporta/importa JSON per il backup
- Sincronizzazione e backup automatico su Supabase (piano gratuito, regione Francoforte), due account (io e mio padre). Esporta/importa JSON resta come riserva
- Modalità prova (solo per me che sviluppo): copia separata dei dati, mai sincronizzata, scritta "PROVA" nella barra. Nelle Impostazioni compare solo se su quel telefono si è aperto una volta `#/sviluppatore` (accende/spegne, `orto-sviluppatore` in localStorage) o se è già attiva. Gli altri usano Test (orto nel tempo) e Arcade

## Stack
- HTML + CSS + JavaScript puro (moduli ES), senza framework, senza npm, senza build
- Dati in `localStorage`, letti e scritti solo da `js/dati.js`; il dialogo con Supabase (solo `fetch`, nessuna libreria) sta in `js/server.js`
- PWA con `manifest.webmanifest` e service worker (`sw.js`) scritti a mano
- Pubblicazione prevista su GitHub Pages (serve HTTPS)
- In locale serve un piccolo server (es. `python -m http.server`): il service worker non funziona aprendo il file con doppio clic

## Struttura delle cartelle
```
orto-app/
├── CLAUDE.md
├── index.html            ← l'unica pagina
├── manifest.webmanifest
├── sw.js                 ← service worker (offline)
├── css/style.css
├── js/
│   ├── app.js            ← avvio e navigazione
│   ├── dati.js           ← lettura/scrittura dati, esporta/importa, sincronizzazione, modalità prova
│   ├── server.js         ← login e richieste a Supabase
│   ├── disegni.js        ← disegni SVG degli ortaggi, scelti dal nome della coltura
│   ├── catalogo.js       ← catalogo delle colture (conoscenza generale), calcolo di piante e resa
│   ├── terreno.js        ← terreno delle aiuole: prove guidate, stime, avvisi
│   ├── arcade.js         ← Arcade: riempimento automatico secondo rotazione e preferenze, calcolo del raccolto
│   ├── impara.js         ← Impara: guide brevi (testi e disegni) e lavori di ogni mese
│   ├── geometria.js      ← forme delle aiuole (rettangolo, rotonda, a L, girate): dentro/fuori, metà, misure, posti dei disegnini
│   └── viste.js          ← disegna le schermate
└── icone/                ← icona-192.png, icona-512.png
```

## Date
- Nell'interfaccia: mostrate e accettate come `gg/mm/aaaa`
- Internamente e nel JSON: `AAAA-MM-GG` (così l'ordinamento funziona)
- La conversione avviene in un solo punto del codice

## Struttura dei dati
Un unico oggetto JSON, che è anche il formato del file di backup:

```json
{
  "versione": 1,
  "aiuole": [
    { "id": "1A", "settore": 1, "lato": "sinistra", "posizione": 1, "note": "" }
  ],
  "colture": [
    {
      "id": "c-…", "nome": "Pomodoro", "varieta": "Cuore di bue",
      "aiuoleIds": ["2A"], "parti": {}, "dataInizio": "2026-04-20", "metodo": "trapianto",
      "stato": "attiva", "dataFine": null, "note": ""
    }
  ],
  "registro": [
    {
      "id": "r-…", "data": "2026-06-12", "tipo": "irrigazione",
      "aiuoleIds": ["2A"], "parti": {}, "colturaId": null,
      "quantita": "", "note": ""
    }
  ],
  "task": [
    {
      "id": "t-…", "titolo": "Legare i pomodori", "scadenza": "2026-06-15",
      "aiuoleIds": ["2A"], "parti": {}, "colturaId": "c-…",
      "fatto": false, "fattoIl": null
    }
  ]
}
```

- `versione`: permette di riconoscere e convertire i backup vecchi se la struttura cambia
- `aiuole`: fisse (8); l'id è il nome. `posizione` va da 1 (fondo) a 4 (davanti) sul proprio lato
- `metodo` (colture): `semina`, `trapianto` oppure `altro`; con `altro` il testo libero sta in `metodoAltro` (es. "pianta perenne") e la voce automatica nel registro è una nota "Inizio coltura: …"
- Le colture attive si modificano dalla scheda coltura, link "(modifica)": nome, varietà, aiuole/metà, data di inizio, metodo e note (le note si scrivono solo lì, non alla creazione). Modificando si aggiorna anche la voce automatica di inizio nel registro, e si cancellano le posizioni a mano delle aiuole tolte
- `colture`: ogni record è una coltivazione (anche su più aiuole), non una specie in generale, così resta lo storico per la rotazione
- `parti` (nelle colture): aiuole occupate solo a metà, con valore fondo, davanti, vialetto o esterno; le aiuole non elencate sono occupate per intero. In un'aiuola le colture attive usano un solo modo di dividere (fondo/davanti oppure vialetto/esterno). Anche voci di registro e task hanno `parti`, con le stesse regole; "tutto l'orto" = tutte e 8 le aiuole intere
- Nei moduli le aiuole si scelgono da una mini-mappa: tocco = aiuola intera, tocco su una già scelta = pop-up con rotella per scegliere la metà o togliere l'aiuola
- `registro`: diario delle attività (semina, trapianto, irrigazione, concimazione, trattamento, raccolto, nota); aiuole e coltura facoltative
- `task`: cose da fare, con scadenza e stato fatto/non fatto

## Registro
- Tipi (`tipo`, nome breve → testo mostrato): semina, trapianto, irrigazione, concimazione, trattamento, diserbo (Diserbo/pulizia), lavorazione (Zappatura/lavorazione del terreno), raccolto, nota
- Nel modulo l'attività si sceglie con una rotella (prima voce "Scegli l'attività…", obbligatorio sceglierne una). Il tipo `nota` nel modulo si chiama "Altro": scegliendolo compare il campo obbligatorio "Che attività è?", salvato in `attivita` (solo in queste voci). Nel registro queste voci si leggono "Nota personalizzata: …"; le note automatiche senza `attivita` restano "Nota"
- Rotelle (attività e metà dell'aiuola): stessa funzione `creaRotella`, con frecce ▲ ▼ sopra e sotto per far capire che si scorre
- `quantita`: testo libero facoltativo (es. "3 kg", "20 litri"), niente totali
- Quando si crea una coltura, l'app aggiunge da sola la voce di registro "semina" o "trapianto"
- Quando si termina una coltura, l'app aggiunge da sola una voce "raccolto" con `data` = fine e `dal` = inizio della coltura (campo `dal` presente solo in queste voci). Riattivando la coltura, quella voce viene tolta
- Non si registra chi ha fatto un'attività (scelta tolta perché poco utile)

## Task
- `scadenza` facoltativa (`null` se manca); aiuole e coltura facoltative
- Non si indica chi deve fare un task; quando è fatto si salva solo la data (`fattoIl`)
- Urgente = non fatto e scaduto, oppure in scadenza oggi o domani
- Niente task ripetuti e nessuna voce di registro automatica quando un task è fatto
- Segni sulla mappa per i task da fare: puntino arancione = programmato, cerchio rosso con "!" = almeno uno urgente. Il segno va sull'angolo delle aiuole per i task su aiuole specifiche, in cima al vialetto per i task su tutto l'orto, sull'icona "Da fare" per i task senza aiuole

## Grafica
- Stile "cartone" scelto da un'anteprima: prato verde puntinato come sfondo, barra verde a pillola centrata
- Aiuole: terra con solchi (#8B5E3C / #7A5134), bordo marroncino chiaro (#A87444), cartellino crema in alto a sinistra con il nome in Fredoka
- Vialetto in ghiaia beige a puntini; staccionata 3D davanti con l'ingresso libero al centro
- Pulsanti Registro / Da fare come cartelli di legno; le altre schermate stanno in un riquadro crema con bordo di legno
- Caratteri: Baloo 2 (testi) e Fredoka (cartellini delle aiuole), file in `font/` per funzionare offline (licenza OFL)
- Disegni degli ortaggi: SVG stilizzati, contorno scuro, piantati nella terra (ombra/buca); approvati carota, pomodoro con fusto, lattuga, cavolfiore, zucchina, melanzana, peperone, cetriolo, fagiolino, pisello, cipolla, aglio, patata, bietola, finocchio, broccolo

- Stile dei disegni (definitivo): solo l'ortaggio nella sua forma più riconoscibile, appoggiato sulla terra con l'ombra, niente piante né buche. Aglio con gli spicchi visibili
- Il disegno si sceglie da parole chiave nel nome (minuscole, senza accenti, es. "pomodor"); senza corrispondenza: piantina generica
- Sulla mappa: tanti disegnini piccoli per aiuola (4 se intera, 2 per metà, 38px); più colture nello stesso spazio si alternano
- Gruppo 2 aggiunto: verza, cavolo nero, cavolo cappuccio, spinacio, valerianella, rucola, ravanello, carciofo, radicchio, cicoria, porro, scalogno, fava, fagiolo rampicante, zucca, mais, melone, anguria, asparago, fragola, sedano (mazzo di coste con le foglie in cima)
- Disegnini sulla mappa: mai tagliati. Possono sporgere solo oltre il lato lungo verso il fondo (in alto); mai oltre il lato verso il davanti (nemmeno l'ombra), mai oltre i lati corti né oltre il confine della propria metà. La metà davanti quindi li contiene del tutto (si rimpiccioliscono se serve)
- Disposizione automatica a caselle (intera 2×2; metà fondo/davanti 2 affiancati; metà vialetto/esterno 2 in colonna), con variazione "casuale" ma fissa solo dentro la propria casella
- Spostamento a mano: tenendo premuto mezzo secondo un ortaggio si solleva e si trascina dentro la sua sezione (verso il fondo può sporgere al massimo per metà). La posizione si salva nel campo facoltativo `posizioni` della coltura: `{ "2A": [ { "x": 0.12, "y": 0.4 }, … ] }` (frazioni della sezione, una per disegnino). Pulsante "Riposiziona gli ortaggi" nella pagina info dell'aiuola per tornare alla disposizione automatica
- Aiuola scelta nei moduli (mini-mappa e pop-up della metà): la parte scelta diventa terra arata (`icone/terra-arata.svg`: zolle di misure diverse viste dall'alto un po' inclinate, con fianchi, ombre e riflessi; si ripete senza giunture, 60 × 28,8) con bordo verde #5c9e3a solo attorno alla parte scelta
- Gruppo 3 aggiunto: basilico, prezzemolo, rosmarino, salvia, timo, origano, erba cipollina, menta, lavanda, santolina, calendula, alisso, facelia, borragine, favino, veccia, avena, orzo, grano saraceno, pesco, vite
- Parole chiave (come in `colturaDaNome` del catalogo): contano solo a inizio parola, così "aglio" non scatta in "bietola da taglio"; se ne scattano più vince la più lunga ("erba cipollina" batte "cipoll", "cavolo nero" batte "cavol"), a parità la prima in `DISEGNI`

## Offline e installazione
- `manifest.webmanifest`: nome, colori e icone dell'app installata
- Icone: `icone/icona-192.png` = solo la zappa (schermata Home), `icone/icona-512.png` = zappa e cesto (avvio). Sorgenti SVG in `icone/`, PNG creati con Edge headless tramite `icone/genera-png.html`
- `sw.js`: strategia "prima la rete" (`fetch` con `cache: 'no-cache'`), copia salvata solo senza rete. Ogni nuovo file dell'app va aggiunto all'elenco `FILE` in `sw.js`
- iPhone: l'app installata ha dati separati da Safari (spostarli con esporta/importa backup)

## Sincronizzazione (Supabase)
- Tabella `elementi`: una riga per aiuola/coltura/voce/task (`id`, `tipo`, `dati` jsonb, `modificato`, `eliminato`, `ricevuto` messo dal server con un trigger). Tabella `membri`: gli account autorizzati. Row Level Security: leggono/scrivono solo i membri dopo il login; nessuna cancellazione vera (si usa `eliminato`)
- In `js/server.js` stanno URL del progetto e chiave pubblica (`sb_publishable_…`, fatta per stare nel codice). Mai mettere nel codice la chiave `secret`/`service_role`
- `salva()` confronta i dati prima/dopo e mette le modifiche in "da inviare" (localStorage `orto-sync`), con l'ora di modifica per elemento. `sincronizza()`: prima scarica le righe ricevute dopo l'ultima volta (`ricevuto`), vince la modifica più recente; poi invia. Parte all'avvio, 2 s dopo ogni salvataggio, al ritorno sull'app e della rete, e dal pulsante nelle Impostazioni
- Primo collegamento: se il server ha già dati si sceglie se usarli (consigliato) o unirli a quelli del telefono
- Se arrivano dati dall'altro telefono la schermata si ridisegna, ma non mentre si compila un modulo
- Il service worker non intercetta le richieste verso altri siti (Supabase)
- Il progetto gratuito va in pausa dopo 7 giorni senza uso: si riattiva dal pannello di Supabase
- Oltre alle policy servono i permessi sulle tabelle (nei progetti nuovi non sono automatici, altrimenti errore "permission denied for table elementi"):
  `grant usage on schema public to authenticated; grant select, insert, update on table elementi to authenticated; grant select on table membri to authenticated; notify pgrst, 'reload schema';`
- Il codice SQL va eseguito in un editor vuoto: se un blocco dà errore, Supabase annulla tutto il blocco
- Più orti e più utenti (tappa 1, fatta): tabelle `orti` (id, nome, creato) e `persone` (orto_id, email minuscola, ruolo `gestore` | `membro` | `lettore`); `elementi` ha `orto_id` e chiave (orto_id, id). Funzioni `ruolo_in(orto)` (vale solo un'email confermata, legge `auth.users`), `miei_orti()`, `crea_orto(nome)` (chi crea è gestore). Regole: legge chi fa parte dell'orto, scrivono gestori e membri, il gestore gestisce le persone e il nome. La vecchia tabella `membri` non si usa più (il primo orto "Il mio orto" ha preso i suoi account come gestori)
- Iscrizione aperta con conferma dell'email obbligatoria (Supabase: "Confirm email" acceso; email spedite con SMTP di Brevo; in Brevo va tenuto disattivato il blocco degli "IP autorizzati", perché Supabase spedisce da indirizzi che cambiano, altrimenti "error sending … email"; testi delle email in italiano nei Templates di Supabase). Site URL e Redirect URLs: l'indirizzo di GitHub Pages e `http://localhost:8000/`. Il link dell'email torna all'app con `#access_token=…&type=signup|recovery`: app.js lo legge all'avvio (`accessoDaLink`), poi collega il telefono o apre `#/nuova-password`
- Impostazioni → Sincronizzazione: schede Entra / Iscriviti e "Password dimenticata?". Il telefono resta legato a un orto (`orto` nello stato `orto-sync`): il primo dell'account, creato se non ne ha; in sola lettura non invia modifiche. L'app funziona anche senza account
- Più orti sul telefono (tappa 2, fatta): `#/orti` "I miei orti" (elenco dal server con il ruolo, ultimo elenco salvato in `orto-elenco-orti` per l'offline; tocco = passa a quell'orto; il gestore cambia il nome; "+ Crea il nuovo orto", che parte con le 8 aiuole di base). L'orto in uso sta in `orto-dati`/`orto-sync`; gli altri restano da parte in `orto-dati:<id>` e `orto-sync:<id>` (`cambiaOrto` in dati.js: prima sincronizza, poi scambia; senza copia da parte scarica tutto). A ogni sincronizzazione nome e ruolo dell'orto si aggiornano; se non se ne fa più parte compare un errore. Scollegando si cancellano gli orti da parte e l'elenco
- Persone e ruoli (tappa 3, fatta): `#/orti/persone` "Persone dell'orto" (funzione `persone_orto(o)`: email, ruolo, iscritta sì/no). Il gestore aggiunge email con il ruolo, cambia ruoli (tendina), toglie persone; gli altri vedono solo l'elenco. Sul server: `mia_email()`, ognuno può togliere se stesso ("Esci da questo orto"), un orto ha sempre almeno un gestore (trigger `almeno_un_gestore`), `elimina_orto(o)` solo per il gestore (cancella anche persone e dati). In "I miei orti": "Esci da questo orto" e, per il gestore, "Elimina questo orto" (conferma scrivendo il nome). Dopo l'uscita o l'eliminazione il telefono apre il primo altro orto, o ne crea uno nuovo
- Sola lettura (`soloLettura()` in dati.js: ruolo `lettore`, fuori da prova e Arcade): `salva()` rifiuta con `MESSAGGIO_SOLA_LETTURA` (app.js lo mostra con un alert), striscia gialla in cima, le pagine dei moduli diventano "Sola lettura" (app.js), e il CSS `.sola-lettura` nasconde i collegamenti per aggiungere/modificare e gli elementi con classe `modifica-dati`; caselle dei task disattivate, ortaggi non trascinabili
- Nella barra verde, dopo "Orto", il nome dell'orto in uso con ▾ (`.nome-barra`, tocco = `#/orti`); in Arcade lo stesso posto mostra il nome della simulazione; in prova e senza account resta vuoto

## Forma dell'orto (tappa 4, in corso)
- Fatto (pezzo 1, la mappa dalle misure): ogni aiuola ha `nome`, `settore`, `forma` (`rettangolo` | `ellisse` | `elle` con `taglio: { w, h, angolo: 'ne'|'no'|'se'|'so' }`), centro `x`, `y`, misure `w`, `h` e `rot` (gradi), tutto in cm; x da sinistra, y dal fondo (in alto) al davanti. Nuovi gruppi sincronizzati: `terreno` (un elemento `{ id: 'terreno', larghezza, lunghezza, staccionata, esposizione }`), `vialetti` (`{ id, x, y, w, h, rot }`), `alberi` (per dopo)
- L'orto di partenza: 8 aiuole 180 × 120, terreno 390 × 520, vialetto centrale largo 30. `normalizza()` in dati.js porta i dati vecchi alla forma nuova (anche quelli che arrivano da telefoni non aggiornati); `aggiornaDatiSalvati()` all'avvio li salva
- Metà: `fondo` / `davanti` (sopra / sotto il centro sulla mappa) e `sinistra` / `destra` (prima "vialetto" / "esterno": per 1A, 1B, 3A, 3B vialetto = destra, per 2A, 2B, 4A, 4B vialetto = sinistra)
- La mappa (`terrenoOrto` in viste.js) mette tutto in percentuale del terreno; ogni aiuola è un SVG della sua forma (solchi girati con l'aiuola, riga tratteggiata delle metà, terra arata nella scelta) e il cartellino col nome nel punto della forma più vicino all'angolo in alto a sinistra. Il terreno si adatta all'altezza dello schermo
- Disegnini: `disponiPiantine` li mette quando la mappa è sullo schermo (e a ogni ridimensionamento): sempre tutti dentro la forma e la metà, senza coprire il cartellino; se non ci stanno si rimpiccioliscono. Le posizioni a mano restano frazioni della parte dell'aiuola; trascinando si sposta solo dove il disegno ci sta tutto (non sporge più verso il fondo)
- Resa e piante (catalogo, Arcade) usano le misure vere: `misure(aiuola, metà)` = lato lungo e larghezza equivalente alla superficie
- Fatto (pezzo 2, l'editor): `#/disegna` "Disegna l'orto" (`paginaDisegna`, `puoDisegnare()`: gestore, senza account o in prova; mai in Arcade o in sola lettura), dalle Impostazioni ("Forma dell'orto") e da "I miei orti". Misure del terreno e staccionata; "+ Aiuola", "+ Rotonda", "+ A L", "+ Vialetto"; tocco = sceglie (l'elemento scelto va sopra gli altri), trascinamento = sposta, quadratino giallo = misure (simmetriche attorno al centro, anche se girato); tutto agganciato a 10 cm. Pannello: nome, settore, forma, larghezza ↔, lunghezza ↕, inclinazione (passi di 5°), taglio e angolo della L, "↻ Gira di 90°", "Elimina" (disattivato per le aiuole con colture, voci o task). Si lavora su una copia: "Salva il disegno" (nomi obbligatori e diversi) o "Annulla". Le aiuole nuove hanno id `a-…` e nome a parte: lo schermo mostra sempre il nome (`nomeId`, impostato da app.js a ogni schermata)
- Settori: qualsiasi numero (binari, Arcade); oltre il 4 il giro di partenza continua L → C → A → S
- Fatto (pezzo 3, l'esposizione): `terreno.esposizione` = cosa c'è in alto sulla mappa (al fondo): `N` | `E` | `S` | `O` | null. Nel "Disegna l'orto" una rotella ("Non lo so", Nord, Est, Sud, Ovest), la spiegazione (dove sorge, è a mezzogiorno e tramonta il sole; colture alte verso Nord) e sulla tela il percorso del sole (alba a Est, mezzogiorno verso Sud, tramonto a Ovest) con le lettere dei punti cardinali. Sulla mappa: "Fondo · Nord" / "Davanti · Sud" e una piccola bussola in alto a destra. Creando un orto nuovo si apre subito il "Disegna l'orto"
- Fatto (pezzo 4, gli alberi): gruppo `alberi` `{ id, tipo, x, y (tronco, cm), diametro (chioma, cm), altezza (m) }`. Tipi (`TIPI_ALBERO` in viste.js, con chioma e altezza di partenza): melo, pero, pesco, albicocco, ciliegio, susino, fico, cachi, noce, olivo, conifera, altro albero. Disegno dall'alto: chioma a ciuffi con i frutti (conifera a stella). Con l'esposizione nota, ombra di mezzogiorno (primavera/autunno) verso Nord, lunga 0,6 × l'altezza
- Sulla mappa gli alberi stanno sopra aiuole e cartellini (le ombre sotto le chiome), non si toccano (il dito arriva alle aiuole) e possono uscire dal terreno: li tagliano solo i bordi dello schermo (`main { overflow-x: clip }`). Premendo un'aiuola o un ortaggio diventano quasi trasparenti (per 1,5 s dopo il rilascio). Non compaiono nella mini-mappa dei moduli
- Nell'editor: "+ Albero" (primo posto libero lungo i bordi), si sceglie e si trascina dal tronco (la chioma lascia passare il dito); il tronco non può andare su un'aiuola né fuori dal terreno; pannello con tipo, chioma larga (cm), altezza (m), "Elimina albero". Nella tela chiome e ombre restano dentro i bordi

- Rifatto (pezzo 5): "Disegna l'orto" (orto nuovo, `#/disegna/nuovo`: si parte dal prato vuoto) / "Modifica orto" (`#/disegna`) si fa sulla mappa grande, a passi in un pop-up al centro (dietro la mappa cambia in tempo reale): 1 · terreno (dimensioni attuali o personalizzate "Largo: … cm", "Lungo: … cm"; staccionata sì/no), 2 · vialetto principale (`vialetti[0]`; lascia com'è, al centro dal fondo al davanti, da sinistra a destra, a croce, nessuno; "Largo: … cm"; "Personalizza sulla mappa"), 3 · aiuole, vialetti e alberi sulla mappa, 4 · esposizione, poi salva e 5 · terreno delle aiuole (prove ora → `#/orto/terreno`, "Fai più tardi", "Salta"). Ogni passo ha "Salta"
- Passo 3: legenda che segue in basso (sticky) con le categorie Aiuole / Vialetti / Alberi (si tocca e si sposta solo la categoria scelta; due tocchi su un'altra categoria → avviso "Seleziona aiuola, vialetto o albero nella legenda in fondo per spostare"), il nome e le misure dell'elemento scelto e i modi del quadratino giallo: "Misure ⤡" e "Inclinazione ↻" (si gira trascinando). Misure scritte sopra il lato in alto. Scorrendo, la legenda si unisce al pannello dell'elemento scelto (nome, settore, forma, misure, inclinazione, taglio della L, gira, elimina); sotto "+ Aiuola", "+ Albero" (chioma 150 cm), "+ Vialetto"; poi "Avanti: esposizione ›"
- Esposizione in gradi (`terreno.esposizione`: verso dove guarda il fondo, 0 = Nord, 90 = Est…; le lettere vecchie N/E/S/O si convertono in `normalizza`). Pop-up grande: l'orto resta dritto al centro e si gira con il dito la bussola (anello d'ottone con le tacche, piccola rosa dei venti, lettere sempre dritte), a passi di 5°; "Non lo so". Nomi in 8 direzioni (Nord-Ovest…) per le etichette "Fondo · …" e i testi
- Alberi disegnati di tre quarti in stile cartone (tronco con radici, chioma a strati con ombra e riflessi, contorno scuro, frutti, ombra a terra); la base del tronco è il punto (x, y)
- Pagina `#/orto` "L'orto": misure del terreno, aiuole e superficie coltivabile, vialetti e alberi, esposizione, "Disegna l'orto" / "Modifica orto", il terreno delle aiuole e "Modifica il terreno" (`#/orto/terreno`: le prove per tutto l'orto, che alla fine si salvano in tutte le aiuole, l'analisi, oppure una sola aiuola)

- Ritocchi (pezzo 6): mentre si sistema un vialetto compaiono le distanze dai due lati del terreno paralleli a lui ("… cm", "al centro ✓"); "Duplica ⧉" nella legenda (a sinistra di "Misure") copia l'elemento scelto 20 cm più in là (le aiuole con un nome nuovo e senza note né terreno)
- Alberi ovunque, anche dentro un'aiuola: lasciandolo in un'aiuola un pop-up chiede conferma ("No" lo rimette dov'era). Il tronco in un'aiuola le toglie un cerchio di raggio `RAGGIO_TRONCO` = 40 cm (`misureLibere` in geometria.js: meno piante e meno resa, anche in Arcade); i disegnini gli girano attorno; nell'info dell'aiuola "Albero nell'aiuola: … m² in meno"
- Disegni degli alberi più riconoscibili (`TIPI_ALBERO`, `svgAlbero`): chioma tonda, ovale (pero), larga (ciliegio, noce), a foglie lobate (fico), a ciuffi argentati con tronco contorto (olivo), a strati (conifera); frutti diversi (mele, pere, pesche, albicocche, ciliegie a coppie, susine, fichi, cachi col calice, noci, olive)
- Sulla mappa, se gli alberi escono dal terreno, attorno si lascia spazio e la mappa si scorre con il dito (`.scorri-mappa`), partendo centrata sul terreno
- Esposizione: mentre si gira la bussola la mappa sotto non si ridisegna (niente sfarfallio); arco del sole ed etichette si aggiornano lasciando la bussola
## Prossimi passi (decisi, da costruire in quest'ordine)
1. Catalogo delle colture in `js/catalogo.js`: conoscenza generale, uguale per tutti gli orti di Bologna (periodi in `MM-GG`, distanze, piante per aiuola da 1,2 × 1,8 m, resa in kg sempre "stima indicativa", famiglia, tappa della rotazione, consigli). Nel codice va solo conoscenza generale: mai il piano o dati personali di un orto. **Fatto**: esporta `CATALOGO` (53 colture, con `parole` per riconoscere il nome), `TAPPE`, `ESIGENZA`, `GLOSSARIO`, `AIUOLA`, `numero()`, `disposizione()`, `resa()`, `colturaDaNome()` (parola chiave a inizio parola, vince la più lunga). Nessuna schermata lo usa ancora
2. Pianificatore
3. Suolo (proprietà del terreno, con stima guidata se non note)
4. Arcade (simulatore)
5. Impara (schede dal catalogo e guide brevi)
6. Più orti e più utenti

## Terreno
- `js/terreno.js`: valori di partenza, le cinque prove guidate (pugno, aceto, barattolo, buca, lombrichi) con un disegnino SVG per ogni passo, regole degli avvisi. Le schermate stanno in viste.js
- Il terreno sta dentro ogni aiuola, campo facoltativo `suolo` (così si sincronizza senza cambiare Supabase): `tessitura`, `ph`, `calcare`, `sostanzaOrganica`, `drenaggio`, `lombrichi`, ognuno `{ valore, fonte: 'stima'|'prova'|'analisi', da, data }` (tessitura anche `sabbia`, `limo`, `argilla` in %), più `analisi` con i valori del laboratorio. Senza valori si usa la stima della pianura bolognese (limoso-argilloso, calcareo, pH 7,5–8)
- Pagine: riquadro "Terreno" nella pagina info dell'aiuola → `#/aiuola/<id>/terreno` (proprietà con etichetta stima/prova/analisi, consigli, "Usa questo terreno per tutto l'orto", elenco prove) → `#/aiuola/<id>/terreno/<prova>` (un passo alla volta, risultato spiegato, salva in questa aiuola o in tutte) e `#/aiuola/<id>/terreno/analisi` (valori facoltativi; calcare totale > 10% = molto, 1–10% = poco). Riepilogo "Il terreno dell'orto" nelle Impostazioni
- Avvisi del terreno per le colture (modulo coltura, sempre, e scheda coltura): carote in terreno argilloso o limoso-argilloso; drenaggio lento (< 2,5 cm/ora) per le colture che soffrono i ristagni; terreno sabbioso per le colture esigenti. Consigli generali (terreno pesante, calcareo, drenaggio lento, pochi lombrichi) nella pagina del terreno

## Catalogo nell'app
- Si apre da Impara (riquadro "Catalogo delle colture") → `#/catalogo`: casella "Cerca", colture raggruppate per gruppo della rotazione con la barra dei 12 mesi (semina marrone, trapianto verde, raccolta arancio) e la lente di ogni gruppo (pop-up "cos'hanno in comune")
- `#/catalogo/<id>`: scheda della coltura come nell'anteprima approvata: lente in alto a destra (spenta = lente di legno; accesa = germoglio nel vetro con i raggi, fumetto di spiegazione) che evidenzia le parole del `GLOSSARIO` (tocco = pop-up), avviso, calendario, distanze, "Quanto spazio usi?" (aiuola intera, metà, misure a mano; lo spazio resta cambiando coltura) con disegno e resa, consigli, "Da tenere d'occhio"
- Dalla scheda di una coltura dell'orto, se il nome è riconosciuto: pulsante "Scheda … nel catalogo"
- Le pagine del catalogo non leggono i dati dell'orto (conoscenza generale)
- Icona del cartello Registro: quaderno ad anelli con il segnalibro che spunta di lato

## Pianificatore
- Si pianifica con il normale "Aggiungi coltura": una coltura `attiva` con `dataInizio` nel futuro è "in programma" (nessuno stato a parte). Non compare sulla mappa finché non arriva quel giorno; nella scheda aiuola sta sotto "In programma" (stesso formato di "Colture attive"). Nella scheda coltura: stato "In programma", "(modifica)" e "Togli dal programma" (cancella la coltura e la sua voce automatica). Lo storico mostra solo le colture `terminata`
- La voce automatica di semina/trapianto si crea subito, con la data futura, ma il registro mostra solo le voci con data fino a oggi (`ordinaVoci`)
- `catalogoId` (salvato a ogni salvataggio): id della scheda del catalogo ricavato dal nome con `colturaDaNome`, oppure null
- Nei moduli delle colture un riquadro "Dal catalogo" mostra, se il nome è riconosciuto: periodi a Bologna, piante e resa stimata nelle aiuole/metà scelte (intera 180 × 120 cm, metà fondo/davanti 180 × 60, metà vialetto/esterno 90 × 120) e l'eventuale avviso. Per una coltura nuova propone il metodo se il catalogo ha solo semina o solo trapianto
- Se la data di inizio è nel futuro, prima di "Salva" compaiono gli avvisi (non bloccano mai): fuori stagione (data fuori dai periodi del catalogo per quel metodo), rotazione (regola base: stessa famiglia nello stesso settore negli ultimi 3 anni dell'orto, ottobre–settembre; esclusi jolly, perenni, fiori, sovesci), aiuola occupata quel giorno (fine vera o stimata dal catalogo; perenni e colture ancora attive oltre la stima = senza fine), aiuola vuota 8 settimane o più
- Cartello "Test" → `#/test` pagina "Simulazioni": "Orto reale nel tempo" (`#/test/reale`), "Arcade" e "Calendario delle colture" (`#/test/calendario`, la vista a binari descritta sotto)
- Orto reale nel tempo (solo da guardare): la mappa delle colture vere in un giorno scelto con la barra del tempo in basso (cursore a settimane dalla prima data dell'orto a 4 anni da oggi; ◀ settimana, ▶▶ scorri / ❚❚ ferma, oggi, settimana ▶) con data e stagione. Una coltura c'è se iniziata e non finita; senza data di fine sparisce alla fine stimata della raccolta (perenni e colture ancora attive oggi restano). Niente spostamenti, segni dei task né collegamenti; paletto dei 30 giorni calcolato dal giorno mostrato. Sulle aiuole vuote nel futuro un cartellino "tocca a: …" con la tappa che toccherebbe al settore (dall'ultima tappa avuta, giro L → C → A → S): è un suggerimento, non una coltura
- Il prato cambia con il giorno mostrato: colore che sfuma tra metà stagione (inverno grigio-verde, primavera verde fresco, estate verde caldo, autunno ocra) e puntini della stagione (fiori gialli, foglie arancioni, brina bianca) via `--prato`, `--prato-punti` e `body[data-stagione]`; app.js li toglie a ogni altra schermata
- La vista a binari (prima "pagina Test") (cartello con il cronometro sotto la mappa, accanto a Registro e Da fare; `#/test`): un binario per aiuola raggruppate per settore, da un mese fa a 12 mesi avanti, frecce ◀ ▶ di 3 mesi; barre piene = già iniziate, tratteggiate = in programma, colore = gruppo della rotazione (`TAPPE`), riga rossa = oggi; senza data di fine la barra arriva alla fine stimata. Le barre aprono la coltura
- Le colture `stato: "pianificata"` di una versione di prova vengono convertite all'avvio (app.js) in attive con inizio futuro
- Sulla mappa, le aiuole con una coltura in programma nei prossimi 30 giorni hanno in basso a sinistra un paletto di legno con il disegnino della coltura e i giorni che mancano ("12 g"); se sono più d'una, la prima che inizia
- Da fare: scelta della regola di rotazione nelle Impostazioni (base, personalizzata con anni da 2 a 5 e famiglie, nessuna); il tasto per accelerare il tempo (Arcade)

## Barra verde e Impostazioni
- Icone a destra nella barra verde: cappello da studente (Impara), aiuola con la lente (`#/orto` "L'orto": "Disegna l'orto" e "Il terreno dell'orto"; nascosta in Arcade), ingranaggio (Impostazioni). Il catalogo non è più nella barra: sta dentro Impara
- Impostazioni, in ordine: Sincronizzazione (accesso, stato, "Sincronizza ora", "Scollega questo telefono", "I miei orti"), "Backup manuale" (→ `#/impostazioni/backup` con Esporta e Importa), modalità prova (solo sviluppo), Cancella dati

## Impara
- Icona nella barra verde (cappello da studente), tra il libro del catalogo e l'ingranaggio → `#/impara`: quattro riquadri: "Questo mese" (in evidenza), "Guide brevi", "Catalogo delle colture" (`#/catalogo`), "Glossario"
- `#/impara/mese/<MM>`: "<Mese> a Bologna", con le colture del catalogo che in quel mese si seminano, si trapiantano (o si mettono a dimora) e si raccolgono (fiori e sovesci esclusi dalla raccolta), come pastiglie che aprono la scheda; poi i "Lavori del mese" (`LAVORI` in impara.js, 4 per mese, con il collegamento alla guida) e le frecce mese prima/dopo. Il riquadro della pagina principale apre il mese di oggi (data vera)
- `#/impara/guide` e `#/impara/guida/<id>`: 12 guide (`GUIDE` in impara.js: seminare, trapiantare, annaffiare, pacciamare, compost, concimare, rotazione, consociazioni, sovescio, difesa senza veleni, pomodori, inverno), ognuna con disegno SVG, introduzione, "Come si fa" (passi), "Quando", "Attenzione a" e colture collegate al catalogo. Nei testi `{id:testo}` = parola del `GLOSSARIO`, sempre evidenziata (tocco = pop-up)
- `#/impara/glossario`: tutte le parole del `GLOSSARIO` in ordine alfabetico, con ricerca; tocco = pop-up
- Numeri delle guide controllati con una ricerca sul web (ottobre 2026): acqua d'estate 20–35 l/m² a settimana, compost 2–4 kg/m², letame maturo 3–4 kg/m², pacciamatura 5–10 cm, cimatura dei pomodori fine luglio–inizio agosto, fosfato ferrico ammesso nel biologico. Le consociazioni sono presentate come consigli della tradizione (le fonti non concordano)

## Arcade (simulatore)
- Fatto: pagina Simulazioni (`#/test`) con "Arcade", le simulazioni salvate e "+ Nuova simulazione Arcade". Parametri (`#/test/arcade/nuova` o `#/test/arcade/<id>`): nome (predefinito "Simulazione del gg/mm/aaaa"), mese e anno di partenza, rotazione (base, personalizzata con 2–5 anni, nessuna), partenza (orto vuoto o dall'orto reale a una data: errore se prima della prima coltura/voce dell'orto reale o nel futuro), terreno (quello reale delle aiuole o la stima). Cambiando partenza, data o terreno di una simulazione salvata, ricomincia da capo (con conferma)
- Dati in `js/dati.js`: localStorage `orto-arcade` (elenco `{ id, nome, creata, parametri, dati, giorno }`) e `orto-arcade-attiva` (id della simulazione in corso). Dentro Arcade `carica()`/`salva()` usano i dati della simulazione (mai sincronizzati) e `oggi()` è il giorno della simulazione (`oggiVero()` = data vera); `caricaReali()`, `datiPerSimulazione()`, `inizioOrtoReale()`
- Dentro Arcade l'app funziona come quella vera (aiuole, colture, registro, task, avvisi), con barra in alto rosso scuro (#8e3b30) ed etichetta "ARCADE", uscita (`#/arcade/esci`, torna ai parametri) al posto dell'ingranaggio, nome della simulazione sopra la mappa e, al posto dei cartelli, la barra del tempo (da un mese prima della partenza a 4 anni dopo; pulsante "partenza"). Le colture spariscono dalla mappa a fine raccolta stimata. Il prato cambia con le stagioni come nell'orto nel tempo. La regola di rotazione scelta vale per gli avvisi
- Preferenze (nei parametri, salvate in `parametri.preferenze = { preferite, escluse, obiettivo }`): un pulsante per coltura del giro di rotazione che gira tra normale → ♥ mi piace → ✕ non la voglio; obiettivo "Un po' di tutto" (`varieta`) o "Più preferite possibile" (`preferite`). Casella "Riempi l'orto in automatico per 4 anni" (spuntata per le nuove simulazioni)
- `js/arcade.js`: `pianoAutomatico(dati, { dal, anni, preferenze, nuovoId })` restituisce colture e voci di registro da aggiungere. Per ogni settore e anno dell'orto (ottobre–settembre) segue la tappa della rotazione (dall'ultima coltura nota, altrimenti 1 = L, 2 = A, 3 = C, 4 = S), con due momenti per tappa (es. L: leguminose in autunno, cavoli d'estate; S: solo primavera), il primo giorno utile dal catalogo (preferendo il trapianto) e solo se l'aiuola è libera. Mai le escluse; le colture con avviso solo se preferite. Le colture aggiunte hanno la nota "Aggiunta in automatico da Arcade"
- In Arcade una coltura esclusa dà l'avviso "Non la volevi." (non blocca)
- Riempimento automatico, dopo le colture principali: sovesci e fiori utili nei vuoti dove l'aiuola resta libera abbastanza (con 2 settimane di margine prima della coltura dopo): in autunno favino/veccia/avena, in primavera facelia/calendula/borragine/alisso, d'estate grano saraceno/facelia. Anche fiori e sovesci stanno nella griglia delle preferenze
- Sovesci (tappa V): la fine stimata è l'inizio del periodo di taglio, ma almeno 6 settimane dopo la semina (`fineSovescio` in arcade.js, usata anche da `fineSuggerita` in viste.js)
- Raccolto (solo Arcade): kg stimati dal catalogo (`resa` per lo spazio occupato, aiuola intera o metà), raccolti un po' alla volta lungo il periodo di raccolta (il primo dopo l'inizio; le perenni ogni anno; se la coltura è terminata prima, si ferma alla fine). In arcade.js `resaColtura`, `kgTra`, `inRaccolta`. Fiori, sovesci e colture senza resa non contano
- Sulla mappa di Arcade: cestino accanto al nome delle aiuole dove quel giorno si raccoglie; sopra la barra del tempo la barra "Raccolto finora circa N kg" (dalla partenza al giorno della simulazione) → `#/raccolto`, pagina "Il raccolto": totale con la forbice da… a…, anni dell'orto (ottobre–settembre), grafico per mese (pieno = raccolto, tratteggiato = ancora da raccogliere), colture con stato in raccolta / finita / da venire
- Il nome della simulazione sta nella barra rossa, accanto a "Orto ARCADE" (`.nome-arcade` in index.html, riempito da app.js)
- Rotazione personalizzata: oltre agli anni (2–5), "Famiglie da controllare": una casella per ogni famiglia delle colture del giro L → C → A → S (con due esempi), tutte accese di partenza; salvate in `parametri.famiglie`. L'avviso di rotazione scatta solo per le famiglie accese; almeno una è obbligatoria. Il riempimento automatico segue comunque il giro delle tappe
- Diverso dalla modalità prova: PROVA serve solo allo sviluppatore per collaudare l'app; Arcade è per tutti gli utenti
- Si parte dal piano vero (copia) o da zero; si accelera il tempo e si vede cosa cresce, quando e quanto si raccoglie, cosa piantare dopo
- Non tocca mai i dati veri e non si sincronizza: resta nella sezione Arcade del singolo telefono
- Chiede le priorità dell'utente e personalizza la coltivazione (es. "non mi piace l'aglio", "niente finocchi", "massimizza i pomodori")
- Spazio quasi creativo, da gioco

## Idee per il futuro
- Grafica più accattivante in stile cartone animato: disegni stilizzati delle colture sulla mappa e nelle aiuole (es. carote disegnate nell'aiuola dove sono piantate le carote)
- Ordine concordato: prima pubblicazione su GitHub Pages (senza offline), poi grafica provata sul telefono, per ultimo offline e installazione

## Regole di lavoro
- Sto imparando terminale e git: spiega ogni comando prima di eseguirlo, in modo semplice, e aspetta la mia approvazione
- Cambia solo ciò che ti chiedo, senza riscrivere tutto
- Dopo ogni passo concluso fai un commit git con un messaggio chiaro e dimmi cosa contiene
- Se qualcosa non è chiaro, chiedi invece di inventare
