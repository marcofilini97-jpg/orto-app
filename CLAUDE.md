# Orto App

App per gestire un orto comunale, che curo insieme a mio padre Mauro.

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
- Niente backend e niente account (almeno all'inizio)
- Sincronizzazione: per ora solo export/import JSON a mano. In futuro un NAS condiviso potrebbe fare da server: tenere la struttura dei dati e `js/dati.js` isolati dal resto per permetterlo, ma non costruire niente adesso

## Stack
- HTML + CSS + JavaScript puro (moduli ES), senza framework, senza npm, senza build
- Dati in `localStorage`, letti e scritti solo da `js/dati.js`
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
│   ├── dati.js           ← lettura/scrittura dati, esporta/importa
│   ├── disegni.js        ← disegni SVG degli ortaggi, scelti dal nome della coltura
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
- `colture`: ogni record è una coltivazione (anche su più aiuole), non una specie in generale, così resta lo storico per la rotazione
- `parti` (nelle colture): aiuole occupate solo a metà, con valore fondo, davanti, vialetto o esterno; le aiuole non elencate sono occupate per intero. In un'aiuola le colture attive usano un solo modo di dividere (fondo/davanti oppure vialetto/esterno). Anche voci di registro e task hanno `parti`, con le stesse regole; "tutto l'orto" = tutte e 8 le aiuole intere
- Nei moduli le aiuole si scelgono da una mini-mappa: tocco = aiuola intera, tocco su una già scelta = pop-up con rotella per scegliere la metà o togliere l'aiuola
- `registro`: diario delle attività (semina, trapianto, irrigazione, concimazione, trattamento, raccolto, nota); aiuole e coltura facoltative
- `task`: cose da fare, con scadenza e stato fatto/non fatto

## Registro
- Tipi (`tipo`, nome breve → testo mostrato): semina, trapianto, irrigazione, concimazione, trattamento, diserbo (Diserbo/pulizia), lavorazione (Zappatura/lavorazione del terreno), raccolto, nota
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
- Gruppo 2 aggiunto: verza, cavolo nero, cavolo cappuccio, spinacio, valerianella, rucola, ravanello, carciofo, radicchio, cicoria, porro, scalogno, fava, fagiolo rampicante, zucca, mais, melone, anguria, asparago, fragola
- I disegnini sulla mappa non vanno mai tagliati: meglio che sbordino un po' dall'aiuola
- Da disegnare: gruppo 3 (aromatiche, fiori, sovesci, frutta)

## Idee per il futuro
- Grafica più accattivante in stile cartone animato: disegni stilizzati delle colture sulla mappa e nelle aiuole (es. carote disegnate nell'aiuola dove sono piantate le carote)
- Ordine concordato: prima pubblicazione su GitHub Pages (senza offline), poi grafica provata sul telefono, per ultimo offline e installazione

## Regole di lavoro
- Sto imparando terminale e git: spiega ogni comando prima di eseguirlo, in modo semplice, e aspetta la mia approvazione
- Cambia solo ciò che ti chiedo, senza riscrivere tutto
- Dopo ogni passo concluso fai un commit git con un messaggio chiaro e dimmi cosa contiene
- Se qualcosa non è chiaro, chiedi invece di inventare
