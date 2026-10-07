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
- Modalità prova (per me): copia separata dei dati, mai sincronizzata, scritta "PROVA" nella barra

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

## Prossimi passi (decisi, da costruire in quest'ordine)
1. Catalogo delle colture in `js/catalogo.js`: conoscenza generale, uguale per tutti gli orti di Bologna (periodi in `MM-GG`, distanze, piante per aiuola da 1,2 × 1,8 m, resa in kg sempre "stima indicativa", famiglia, tappa della rotazione, consigli). Nel codice va solo conoscenza generale: mai il piano o dati personali di un orto. **Fatto**: esporta `CATALOGO` (53 colture, con `parole` per riconoscere il nome), `TAPPE`, `ESIGENZA`, `GLOSSARIO`, `AIUOLA`, `numero()`, `disposizione()`, `resa()`, `colturaDaNome()` (parola chiave a inizio parola, vince la più lunga). Nessuna schermata lo usa ancora
2. Pianificatore
3. Suolo (proprietà del terreno, con stima guidata se non note)
4. Arcade (simulatore)
5. Impara (schede dal catalogo e guide brevi)
6. Più orti e più utenti

## Pianificatore
- Si pianifica con il normale "Aggiungi coltura": una coltura `attiva` con `dataInizio` nel futuro è "in programma" (nessuno stato a parte). Non compare sulla mappa finché non arriva quel giorno; nella scheda aiuola sta sotto "In programma" (stesso formato di "Colture attive"). Nella scheda coltura: stato "In programma", "(modifica)" e "Togli dal programma" (cancella la coltura e la sua voce automatica). Lo storico mostra solo le colture `terminata`
- La voce automatica di semina/trapianto si crea subito, con la data futura, ma il registro mostra solo le voci con data fino a oggi (`ordinaVoci`)
- `catalogoId` (salvato a ogni salvataggio): id della scheda del catalogo ricavato dal nome con `colturaDaNome`, oppure null
- Nei moduli delle colture un riquadro "Dal catalogo" mostra, se il nome è riconosciuto: periodi a Bologna, piante e resa stimata nelle aiuole/metà scelte (intera 180 × 120 cm, metà fondo/davanti 180 × 60, metà vialetto/esterno 90 × 120) e l'eventuale avviso. Per una coltura nuova propone il metodo se il catalogo ha solo semina o solo trapianto
- Se la data di inizio è nel futuro, prima di "Salva" compaiono gli avvisi (non bloccano mai): fuori stagione (data fuori dai periodi del catalogo per quel metodo), rotazione (regola base: stessa famiglia nello stesso settore negli ultimi 3 anni dell'orto, ottobre–settembre; esclusi jolly, perenni, fiori, sovesci), aiuola occupata quel giorno (fine vera o stimata dal catalogo; perenni e colture ancora attive oltre la stima = senza fine), aiuola vuota 8 settimane o più
- Pagina "Test" (cartello con il cronometro sotto la mappa, accanto a Registro e Da fare; `#/test`): un binario per aiuola raggruppate per settore, da un mese fa a 12 mesi avanti, frecce ◀ ▶ di 3 mesi; barre piene = già iniziate, tratteggiate = in programma, colore = gruppo della rotazione (`TAPPE`), riga rossa = oggi; senza data di fine la barra arriva alla fine stimata. Le barre aprono la coltura
- Le colture `stato: "pianificata"` di una versione di prova vengono convertite all'avvio (app.js) in attive con inizio futuro
- Da fare: scelta della regola di rotazione nelle Impostazioni (base, personalizzata con anni da 2 a 5 e famiglie, nessuna); segnino sulla mappa per le aiuole con qualcosa in programma nei prossimi 30 giorni; il tasto per accelerare il tempo (Arcade)

## Arcade (simulatore)
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
