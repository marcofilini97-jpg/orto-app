// Catalogo delle colture: conoscenza generale, uguale per tutti gli orti di Bologna.
// Solo dati e calcoli, niente schermate. Mai mettere qui il piano o i dati di un orto.

// Tappe della rotazione (colore = quello delle barre nel piano)
export const TAPPE = {
  L: { nome: 'Leguminose, poi cavoli', breve: 'Leguminose e cavoli', c: '#3d6fa8' },
  C: { nome: 'Cucurbitacee', breve: 'Cucurbitacee', c: '#4c8a3a' },
  A: { nome: 'Aglio e cipolle, poi finocchi, radicchi, bietole e carote', breve: 'Aglio, cipolle, finocchi…', c: '#b07a1e' },
  S: { nome: 'Solanacee', breve: 'Solanacee', c: '#b5443a' },
  J: { nome: 'Jolly: riempiono i vuoti', breve: 'Jolly', c: '#7d6a9e' },
  P: { nome: 'Perenni, fuori rotazione', breve: 'Perenne', c: '#6b6b6b' },
  F: { nome: 'Fiori utili', breve: 'Fiore utile', c: '#b0508a' },
  V: { nome: 'Sovesci: il piano B per le aiuole vuote', breve: 'Sovescio', c: '#5e7d2e' },
};
export const ESIGENZA = { alta: 'molto esigente', media: 'esigenza media', bassa: 'poco esigente', arricchisce: 'arricchisce il terreno' };

// Aiuola di riferimento: 1,8 × 1,2 m (le file corrono lungo il lato lungo L)
export const AIUOLA = { L: 180, W: 120 };

// Campi delle voci:
// - parole: parole chiave (minuscole, senza accenti) per riconoscere il nome scritto dall'utente
// - s / t / r = semina / trapianto / raccolta: elenchi di periodi [dal, al] in 'MM-GG'
//   (un periodo può scavalcare capodanno, es. ['11-01','02-28']); tLabel/rLabel cambiano l'etichetta
// - sullaFila / traLeFile: distanze in cm, come testo ('50–60' vale la media; testo senza numeri = una fila sola)
// - fitta: true = semina fitta a file, senza contare le piante
// - kgP = kg per pianta [min, max]; kgM2 = kg per m² [min, max] (per le colture fitte). Sempre stime indicative
// - unita: cosa si raccoglie (se non sono semplicemente "kg"); prof: profondità di semina o messa a dimora
// - giorni: dalla semina/trapianto alla raccolta; avviso: sconsigliata e perché; scopo: a cosa serve (fiori, sovesci, aromatiche)
// - consigli: nei testi {id:testo} è una parola con spiegazione, id = chiave di GLOSSARIO; problemi: id di GLOSSARIO
export const CATALOGO = [
  { id: 'fava', nome: 'Fava', parole: ['fava', 'fave'], famiglia: 'Leguminose', tappa: 'L', esigenza: 'arricchisce',
    s: [['11-01','11-20'],['02-15','02-28']], r: [['05-01','05-31']],
    sullaFila: '20', traLeFile: '25 nella coppia, 50 tra le coppie', prof: '4–5 cm', kgP: [0.2, 0.3], unita: 'baccelli',
    consigli: [
      "Semina a inizio novembre una varietà che regge il freddo, come {aguadulce:Aguadulce}: passa l'inverno da piccola e a maggio dà i baccelli. In alternativa semina a fine febbraio.",
      "Le file vanno a coppie: due file vicine (25 cm), poi un corridoio di 50 cm per passare a raccogliere.",
      "Quando compaiono i primi baccelli, {cimare:cima} le piante, cioè taglia gli ultimi 10 cm della punta: lì si radunano gli {afidi:afidi} neri, e la pianta mette le forze nei baccelli.",
      "A fine raccolta {tagliopiede:taglia le piante al piede} invece di strapparle: le radici restano nel terreno e lasciano l'azoto ai cavoli che vengono dopo.",
    ], problemi: ['afidi', 'uccelli'] },
  { id: 'pisello', nome: 'Pisello nano', parole: ['pisell'], famiglia: 'Leguminose', tappa: 'L', esigenza: 'arricchisce',
    s: [['02-15','03-15'],['11-01','11-30']], r: [['05-20','06-30']],
    sullaFila: '5', traLeFile: '35', prof: '3–4 cm', kgP: [0.03, 0.04], unita: 'baccelli',
    consigli: [
      "Si semina fitto: ogni seme fa uno stelo sottile con pochi baccelli, per questo in un'aiuola ne vanno un centinaio (3 file da circa 36 semi).",
      "Il momento più sicuro è tra metà febbraio e metà marzo. Si può seminare anche a novembre, ma una gelata forte può far morire le piantine.",
      "Anche se è \"nano\" (40–60 cm), cresce meglio appoggiato: lungo ogni fila stendi una rete bassa o pianta qualche ramoscello.",
      "A fine raccolta {tagliopiede:taglia le piante al piede}, come per le fave: le radici lasciano azoto nel terreno.",
    ], problemi: ['oidio', 'uccelli'] },
  { id: 'fagiolino', nome: 'Fagiolino nano', parole: ['fagiolin'], famiglia: 'Leguminose', tappa: 'L', esigenza: 'arricchisce',
    s: [['05-01','07-15']], r: [['07-01','09-30']], giorni: '55–65',
    sullaFila: '7', traLeFile: '40', prof: '3–4 cm', kgP: [0.04, 0.06],
    consigli: [
      "Semina solo quando la terra è calda, da maggio in poi: nella terra fredda e bagnata il seme marcisce prima di nascere.",
      "Invece di seminare tutto insieme, fai una fila ogni 3 settimane fino a metà luglio ({scalare:semina a scalare}): avrai fagiolini freschi per tutta l'estate.",
      "Raccogli ogni 2–3 giorni, quando i baccelli sono sottili e si spezzano con uno schiocco: più raccogli, più la pianta ne produce.",
      "Varietà adatte: {bobis:Bobis a grano nero} o {contender:Contender}.",
    ], problemi: ['ragnetto', 'cimice'] },
  { id: 'cavolfiore', nome: 'Cavolfiore', parole: ['cavolfior'], famiglia: 'Brassicacee', tappa: 'L', esigenza: 'alta',
    t: [['07-20','08-25']], r: [['11-01','02-28']],
    sullaFila: '60', traLeFile: '60', kgP: [0.6, 1],
    consigli: [
      "Il giorno stesso del trapianto copri le piante con la {rete:rete antinsetto}: d'estate la {cavolaia:cavolaia} depone le uova sulle foglie e in pochi giorni i bruchi le divorano.",
      "È tra le colture più affamate: prima del trapianto spargi 2–3 kg di {compost:compost} per m². Al trapianto, e di nuovo dopo 4 settimane, aggiungi 80–100 g/m² di {pollina:pollina} attorno alle piante.",
      "Lascia 60 cm tra le piante: sembra tanto, ma a fine crescita ogni pianta è larga mezzo metro. Più vicine fanno teste piccole.",
      "Quando la testa bianca è grande come un pugno, piegale sopra qualche foglia: resta bianca e tenera.",
    ], problemi: ['cavolaia', 'altica', 'moscabianca', 'uccelli'] },
  { id: 'verza', nome: 'Verza e cappuccio', parole: ['verz', 'cappucc', 'cavol'], famiglia: 'Brassicacee', tappa: 'L', esigenza: 'alta',
    t: [['07-20','08-25']], r: [['11-01','02-28']],
    sullaFila: '60', traLeFile: '60', kgP: [1, 1.5],
    consigli: [
      "Copri con la {rete:rete antinsetto} il giorno del trapianto, come per tutti i cavoli.",
      "Concima come il cavolfiore: {compost:compost} prima del trapianto e {pollina:pollina} al trapianto e dopo 4 settimane.",
      "Reggono bene il freddo: la verza dopo le prime gelate diventa anche più dolce, quindi puoi raccoglierla con calma per tutto l'inverno.",
    ], problemi: ['cavolaia', 'moscabianca', 'lumache'] },
  { id: 'broccolo', nome: 'Broccolo', parole: ['broccol'], famiglia: 'Brassicacee', tappa: 'L', esigenza: 'alta',
    t: [['08-01','08-31']], r: [['10-01','12-31']],
    sullaFila: '50', traLeFile: '60', kgP: [0.4, 0.6],
    consigli: [
      "Trapianta ad agosto e copri subito con la {rete:rete antinsetto}. Varietà adatta: {calabrese:Calabrese}.",
      "Taglia la testa centrale quando i boccioli sono ancora chiusi e verde scuro: se vedi spuntare fiorellini gialli sei in ritardo.",
      "Dopo il primo taglio non togliere la pianta: per qualche settimana fa altre teste più piccole ai lati ({getti:getti laterali}).",
    ], problemi: ['cavolaia', 'afidi'] },
  { id: 'cavolonero', nome: 'Cavolo nero', parole: ['cavolo nero'], famiglia: 'Brassicacee', tappa: 'L', esigenza: 'alta',
    t: [['07-01','09-30']], r: [['10-01','04-30']],
    sullaFila: '50', traLeFile: '60', kgP: [0.8, 1.2],
    consigli: [
      "Raccogli le foglie più basse, poche alla volta, lasciando il ciuffo in cima: la pianta continua a crescere e ne produce da ottobre fino ad aprile.",
      "Regge bene il freddo e un po' d'ombra: va bene anche in un'aiuola con qualche ora d'ombra d'estate.",
      "Anche lui va coperto con la {rete:rete antinsetto} dal trapianto.",
    ], problemi: ['cavolaia', 'moscabianca'] },
  { id: 'zucchina', nome: 'Zucchina', parole: ['zucchin'], famiglia: 'Cucurbitacee', tappa: 'C', esigenza: 'alta',
    t: [['05-01','05-20']], s: [['06-20','06-30']], r: [['06-01','09-30']],
    sullaFila: '100', traLeFile: '100', prof: '2–3 cm', kgP: [4, 8],
    consigli: [
      "Ogni pianta occupa circa un metro quadro: in un'aiuola ne stanno 2, e per due persone bastano.",
      "Prima del trapianto metti 3–5 litri di {compost:compost} nella buca di ogni pianta.",
      "Bagna solo alla base, mai sulle foglie: le foglie bagnate favoriscono l'{oidio:oidio}, che d'estate arriva quasi sempre. Varietà: {bolognese:Bolognese} o un ibrido con scritto in etichetta \"tollerante all'oidio\".",
      "A luglio raccogli ogni 1–2 giorni, quando sono lunghe 15–20 cm: se le lasci crescere diventano grosse e acquose, e la pianta ne fa meno.",
      "Se a fine giugno semini una seconda pianta, avrai zucchine fino all'autunno, quando le prime piante sono stanche.",
    ], problemi: ['oidio', 'afidi'] },
  { id: 'cetriolo', nome: 'Cetriolo su rete', parole: ['cetriol'], famiglia: 'Cucurbitacee', tappa: 'C', esigenza: 'alta',
    t: [['05-10','05-25']], r: [['07-01','09-30']],
    sullaFila: '35', traLeFile: '— (una fila sola)', prof: '2 cm', kgP: [2, 4],
    consigli: [
      "Fallo arrampicare su una rete alta 1,5–2 m messa sul lato nord dell'aiuola: occupa una sola fila e non fa ombra alle altre colture.",
      "Raccogli i cetrioli giovani, lunghi 15–20 cm: se ne lasci uno a ingiallire sulla pianta, la produzione rallenta.",
      "Bagna con regolarità e alla base: con l'acqua a singhiozzo i frutti diventano amari.",
      "Varietà adatta: {marketmore:Marketmore}.",
    ], problemi: ['oidio', 'ragnetto'] },
  { id: 'aglio', nome: 'Aglio', parole: ['aglio'], famiglia: 'Alliacee', tappa: 'A', esigenza: 'bassa',
    t: [['10-15','11-30']], r: [['06-15','07-10']],
    sullaFila: '12–15', traLeFile: '25–30', prof: 'spicchio coperto da 2–3 cm', kgP: [0.03, 0.05], unita: 'teste',
    consigli: [
      "Pianta gli spicchi più grossi, con la punta in alto, coperti da 2–3 cm di terra. Usa aglio da seme certificato, come il {biancopiacentino:Bianco piacentino}: quello del supermercato spesso è trattato per non germogliare o porta malattie.",
      "Niente letame né compost fresco prima dell'aglio: fa marcire i bulbi. Gli basta il nutrimento lasciato dalla coltura precedente.",
      "Togli spesso le erbacce tra le file: l'aglio ha poche foglie strette e non regge la concorrenza.",
      "Raccogli quando metà delle foglie è secca, tra metà giugno e inizio luglio, poi lascia asciugare le teste all'ombra per 2–3 settimane.",
    ], problemi: ['ruggine', 'infestanti'] },
  { id: 'cipolla', nome: 'Cipolla da bulbillo', parole: ['cipoll'], famiglia: 'Alliacee', tappa: 'A', esigenza: 'bassa',
    t: [['10-01','11-30']], r: [['05-01','06-30']],
    sullaFila: '10', traLeFile: '25', prof: 'punta a filo del terreno', kgP: [0.06, 0.1],
    consigli: [
      "In autunno pianta i {bulbilli:bulbilli} di una varietà autunnale, come {senshyu:Senshyu} o {radar:Radar}: passano l'inverno e si raccolgono già a fine primavera.",
      "Ad aprile {diradare:dirada}: togli una pianta ogni due e mangiala come {cipollotto:cipollotto}. Quelle rimaste hanno più spazio e ingrossano.",
      "Raccogli tra maggio e giugno, quando le foglie si piegano da sole. Niente letame prima delle cipolle.",
    ], problemi: ['moscacipolla', 'peronospora'] },
  { id: 'finocchio', nome: 'Finocchio', parole: ['finocch'], famiglia: 'Apiacee', tappa: 'A', esigenza: 'media',
    t: [['07-20','08-25']], r: [['10-01','12-31']],
    sullaFila: '30', traLeFile: '40', kgP: [0.25, 0.35],
    consigli: [
      "Trapianta tra il 20 luglio e il 25 agosto. Varietà adatta: {romanesco:Romanesco}.",
      "Quando il {grumolo:grumolo} (la parte bianca che si mangia) è largo 3–4 cm, {rincalzare:rincalzalo}: diventa più bianco e tenero.",
      "Bagna con regolarità: se la terra passa da secca a bagnata, il grumolo si spacca o la pianta va in fiore.",
      "Raccogli entro dicembre, prima delle gelate sotto i −4 °C.",
    ], problemi: ['lumache'] },
  { id: 'radicchio', nome: 'Radicchio e cicorie', parole: ['radicch', 'cicori', 'catalogn'], famiglia: 'Asteracee', tappa: 'A', esigenza: 'media',
    t: [['08-01','08-31']], r: [['10-01','01-31']],
    sullaFila: '30', traLeFile: '40', kgP: [0.2, 0.4],
    consigli: [
      "Trapianta ad agosto, nel posto lasciato libero da aglio e cipolle: chiede poco concime e chiude bene l'anno.",
      "Regge il freddo: con le prime gelate le foglie diventano più colorate e croccanti.",
      "Raccogli tagliando il cespo alla base, da ottobre a gennaio.",
    ], problemi: ['lumache'] },
  { id: 'bietola', nome: 'Bietola da taglio', parole: ['biet', 'erbett'], famiglia: 'Amarantacee', tappa: 'A', esigenza: 'media',
    s: [['03-01','05-31'],['07-01','08-31']], r: [['05-15','12-15']],
    sullaFila: '30', traLeFile: '40', prof: '2 cm', kgP: [0.6, 1],
    consigli: [
      "Taglia le foglie esterne a 3–4 cm da terra, lasciando il cuore: la pianta ricaccia e raccogli per mesi.",
      "Due periodi di semina: marzo–maggio per l'estate, luglio–agosto per l'autunno.",
      "Va bene anche in {mezzombra:mezz'ombra}: d'estate soffre meno il caldo.",
    ], problemi: ['lumache', 'afidi'] },
  { id: 'carota', nome: 'Carota corta', parole: ['carot'], famiglia: 'Apiacee', tappa: 'A', esigenza: 'bassa',
    s: [['03-01','07-31']], r: [['06-15','11-30']], giorni: '90–120',
    sullaFila: '4–5', traLeFile: '25', fitta: true, prof: '1 cm', kgM2: [2, 4],
    consigli: [
      "Scegli varietà corte o tonde: nella terra argillosa le carote lunghe si deformano o si dividono in due.",
      "Copri il seme con {compost:compost} setacciato invece che con la terra del posto: la terra argillosa fa la crosta e le piantine non riescono a uscire.",
      "Quando sono alte 5 cm, {diradare:dirada} lasciandone una ogni 4–5 cm.",
      "Niente letame: fa carote biforcute e piene di radichette.",
    ], problemi: ['moscacarota', 'ferretti'] },
  { id: 'pomodoro', nome: 'Pomodoro', parole: ['pomodor'], famiglia: 'Solanacee', tappa: 'S', esigenza: 'alta',
    t: [['04-25','05-15']], r: [['07-15','10-10']],
    sullaFila: '50–60', traLeFile: '60', kgP: [3, 5],
    consigli: [
      "Pianta un {tutore:tutore} alto 2 m accanto a ogni pianta, sul lato nord dell'aiuola: così la sua ombra non copre le altre colture.",
      "Coltivalo con un solo fusto: ogni settimana togli i germogli che nascono tra fusto e foglie ({sfemminellare:sfemminella}) e lega il fusto al tutore. Così le piante stanno più strette e ne entrano 8 invece di 6.",
      "Togli le foglie basse fino a 30 cm da terra: gli schizzi dell'acqua portano la {peronospora:peronospora} dal terreno alle foglie.",
      "A luglio servono 2–3 litri al giorno per pianta, sempre alla base e con regolarità: l'acqua a singhiozzo provoca il {marciume:marciume apicale}.",
      "Concime: 4–5 kg/m² di {compost:compost} in inverno e 40–60 g/m² di {cornunghia:cornunghia} al trapianto. Non esagerare: troppo azoto fa tante foglie e pochi frutti.",
      "Lo spazio libero ai piedi delle piante è perfetto per il basilico.",
    ], problemi: ['peronospora', 'cimice', 'tuta', 'marciume', 'ragnetto'] },
  { id: 'peperone', nome: 'Peperone', parole: ['peperon'], famiglia: 'Solanacee', tappa: 'S', esigenza: 'alta',
    t: [['05-05','05-20']], r: [['07-01','10-10']],
    sullaFila: '45', traLeFile: '60', kgP: [0.8, 1.5],
    consigli: [
      "Compra le piantine: seminate in casa senza calore e luce artificiale vengono deboli.",
      "Trapianta tra il 5 e il 20 maggio, quando anche di notte fa caldo: col freddo si blocca per settimane.",
      "Bagna con regolarità: l'acqua a singhiozzo provoca il {marciume:marciume apicale}.",
      "Quando i rami sono carichi di frutti, sostienili con un piccolo {tutore:tutore}: si spezzano facilmente.",
    ], problemi: ['afidi', 'cimice', 'marciume'] },
  { id: 'melanzana', nome: 'Melanzana', parole: ['melanzan'], famiglia: 'Solanacee', tappa: 'S', esigenza: 'alta',
    t: [['05-05','05-20']], r: [['07-01','10-10']],
    sullaFila: '60', traLeFile: '60', kgP: [2, 3],
    consigli: [
      "Compra le piantine e trapianta tra il 5 e il 20 maggio, come il peperone.",
      "Ogni settimana guarda sotto le foglie: la {dorifora:dorifora} e le sue uova arancioni si tolgono a mano.",
      "Raccogli quando la buccia è lucida: se diventa opaca il frutto è troppo maturo, pieno di semi e amaro.",
    ], problemi: ['dorifora', 'ragnetto', 'cimice'] },
  { id: 'lattuga', nome: 'Lattughe e insalate', parole: ['lattug', 'insalat'], famiglia: 'Asteracee', tappa: 'J', esigenza: 'media',
    t: [['03-01','09-30']], r: [['04-15','11-30']], giorni: '45–70',
    sullaFila: '30', traLeFile: '30', kgP: [0.25, 0.35],
    consigli: [
      "Trapianta poche piantine ogni 3 settimane, da marzo a settembre ({scalare:trapianto a scalare}): avrai sempre insalata pronta invece che tutta insieme.",
      "D'estate mettile dove c'è un po' d'ombra: col caldo vanno in fiore e diventano amare.",
      "Puoi metterle negli spazi liberi tra pomodori o cavoli appena trapiantati: le raccogli prima che le piante grandi chiudano lo spazio.",
    ], problemi: ['lumache', 'afidi', 'ferretti'] },
  { id: 'lattugainv', nome: 'Lattuga invernale', parole: ['lattuga invernale', 'meraviglia'], famiglia: 'Asteracee', tappa: 'J', esigenza: 'media',
    t: [['09-01','10-31']], r: [['01-01','04-30']],
    sullaFila: '30', traLeFile: '30', kgP: [0.2, 0.3],
    consigli: [
      "Trapianta a settembre–ottobre una varietà che regge il freddo, come {meraviglia:Meraviglia d'inverno}: si raccoglie da gennaio ad aprile.",
      "Nelle notti sotto i −3 °C coprila con il {tnt:tessuto non tessuto}.",
    ], problemi: ['lumache'] },
  { id: 'spinacio', nome: 'Spinacio', parole: ['spinac'], famiglia: 'Amarantacee', tappa: 'J', esigenza: 'media',
    s: [['09-15','10-20'],['02-15','03-15']], r: [['11-01','04-30']],
    sullaFila: '8–10', traLeFile: '25', fitta: true, prof: '2 cm', kgM2: [1, 1.5],
    consigli: [
      "Semina tra metà settembre e il 20 ottobre, per esempio {gigante:Gigante d'inverno}: raccogli in autunno e di nuovo a fine inverno. Se semini più tardi nasce, ma cresce solo da febbraio.",
      "Quando le piantine sono nate, {diradare:dirada} lasciandone una ogni 8–10 cm.",
      "Raccogli le foglie esterne: la pianta continua a produrne.",
    ], problemi: ['peronospora', 'lumache'] },
  { id: 'valerianella', nome: 'Valerianella', parole: ['valerian', 'songino', 'gallinell'], famiglia: 'Caprifogliacee', tappa: 'J', esigenza: 'bassa',
    s: [['08-01','10-31']], r: [['11-01','03-31']],
    sullaFila: '3–5', traLeFile: '15', fitta: true, prof: '0,5–1 cm', kgM2: [0.5, 1],
    consigli: [
      "È piccola e non dà fastidio: seminala negli spazi liberi, per esempio tra cavoli e finocchi.",
      "Il seme sta quasi in superficie: tieni la terra umida finché non nasce.",
      "Si raccoglie tutta la rosetta, tagliandola alla base.",
    ], problemi: ['lumache'] },
  { id: 'rucola', nome: 'Rucola', parole: ['rucol', 'rucchet'], famiglia: 'Brassicacee', tappa: 'J', esigenza: 'bassa',
    s: [['03-01','05-31'],['08-01','10-31']], r: [['04-01','06-30'],['09-01','11-30']], giorni: '25–40',
    sullaFila: 'fitta', traLeFile: '20', fitta: true, prof: '0,5 cm', kgM2: [0.8, 1.2],
    consigli: [
      "Cresce in un mese: semina una fila ogni 2–3 settimane in primavera e a fine estate.",
      "Tra giugno e luglio va subito in fiore e diventa troppo piccante: meglio evitarla.",
      "È della stessa famiglia dei cavoli: nella rotazione conta come un cavolo.",
    ], problemi: ['altica'] },
  { id: 'ravanello', nome: 'Ravanello', parole: ['ravanell'], famiglia: 'Brassicacee', tappa: 'J', esigenza: 'bassa',
    s: [['02-01','05-31'],['08-01','10-31']], r: [['03-01','06-30'],['09-01','11-30']], giorni: '25–35',
    sullaFila: '3–4', traLeFile: '15', fitta: true, prof: '1 cm', kgM2: [1, 2],
    consigli: [
      "È pronto in un mese: raccoglilo subito, se aspetti diventa legnoso e piccante.",
      "Semina poco alla volta, ogni 2–3 settimane ({scalare:semina a scalare}).",
      "È della stessa famiglia dei cavoli: nella rotazione conta come un cavolo.",
    ], problemi: ['altica'] },
  { id: 'prezzemolo', nome: 'Prezzemolo', parole: ['prezzemol'], famiglia: 'Apiacee', tappa: 'J', esigenza: 'bassa',
    s: [['03-01','04-30'],['08-01','09-30']], r: [['05-01','03-31']],
    sullaFila: '15', traLeFile: '25', prof: '1 cm', kgP: [0.1, 0.2],
    consigli: [
      "Il seme ci mette anche 3–4 settimane a nascere: tieni la terra umida e non perdere la pazienza.",
      "Per una famiglia bastano 10–15 piante: non serve un'aiuola intera, anche un angolo o un bordo va bene.",
      "Taglia gli steli esterni: la pianta ricaccia e dura quasi tutto l'anno. Va bene anche in {mezzombra:mezz'ombra}.",
    ], problemi: [] },
  { id: 'basilico', nome: 'Basilico', parole: ['basilic'], famiglia: 'Lamiacee', tappa: 'J', esigenza: 'media',
    t: [['05-15','06-30']], r: [['06-01','09-30']],
    sullaFila: '20–25', traLeFile: '— (una fila sul bordo)', prof: '0,5 cm', kgP: [0.15, 0.25],
    consigli: [
      "Trapianta da metà maggio, quando fa caldo anche di notte: sotto i 10 °C si blocca e le foglie anneriscono.",
      "Mettilo ai piedi dei pomodori o in una fila lungo il bordo dell'aiuola.",
      "{cimare:Cima} le punte prima che fiorisca: la pianta si allarga e fa più foglie.",
      "Raccogli tutto prima del primo freddo di ottobre.",
    ], problemi: [] },
  { id: 'carciofo', nome: 'Carciofo', parole: ['carciof'], famiglia: 'Asteracee', tappa: 'P', esigenza: 'alta',
    t: [['03-01','04-30']], r: [['04-01','06-30']],
    sullaFila: '100', traLeFile: '100', kgP: [1, 2], unita: 'capolini',
    consigli: [
      "È una pianta perenne: resta nello stesso posto per 3–4 anni, poi va rinnovata. Per questo sta fuori dalla rotazione.",
      "Tra marzo e aprile lascia 2–3 {carducci:carducci} per pianta. Gli altri, staccati con un pezzo di radice, diventano piante nuove.",
      "Raccogli il capolino centrale quando è ancora chiuso e sodo, con 10–15 cm di gambo.",
      "A luglio–agosto taglia gli steli alla base e bagna poco: la pianta riposa. Da fine agosto ricomincia a bagnare.",
      "D'inverno evita che l'acqua ristagni attorno alla base: nella terra argillosa marcisce.",
    ], problemi: ['afidi'] },
  // ---- Aggiunte: altre colture dell'orto ----
  { id: 'porro', nome: 'Porro', parole: ['porr'], famiglia: 'Alliacee', tappa: 'A', esigenza: 'media',
    t: [['05-15','07-15']], r: [['10-01','03-31']],
    sullaFila: '15', traLeFile: '30', kgP: [0.15, 0.25],
    consigli: [
      "Compra le piantine o seminale in vaschetta a fine inverno; trapiantale da metà maggio a metà luglio, quando sono grosse come una matita.",
      "Mettile in un solco profondo 10–15 cm e, man mano che crescono, {rincalzare:rincalza}: la parte bianca, quella che si mangia, diventa più lunga.",
      "Regge il freddo: lo lasci nell'aiuola e lo raccogli quando serve, da ottobre fino a marzo.",
    ], problemi: ['moscacipolla'] },
  { id: 'scalogno', nome: 'Scalogno', parole: ['scalogn'], famiglia: 'Alliacee', tappa: 'A', esigenza: 'bassa',
    t: [['10-15','11-30'],['02-15','03-15']], r: [['06-15','07-15']],
    sullaFila: '15', traLeFile: '25', prof: 'punta a filo del terreno', kgP: [0.1, 0.15],
    consigli: [
      "Si pianta come l'aglio: un bulbo con la punta a filo del terreno, in autunno o a fine inverno. Ogni bulbo ne fa un ciuffo di 6–8.",
      "Niente letame, come per aglio e cipolle.",
      "Raccogli quando le foglie seccano, poi lascia asciugare all'ombra: si conserva per mesi.",
    ], problemi: ['moscacipolla'] },
  { id: 'sedano', nome: 'Sedano', parole: ['sedan'], famiglia: 'Apiacee', tappa: 'A', esigenza: 'alta',
    t: [['05-01','06-30']], r: [['08-15','11-30']],
    sullaFila: '30', traLeFile: '40', kgP: [0.4, 0.7],
    consigli: [
      "Compra le piantine: il seme è minuscolo e nasce molto lentamente.",
      "Vuole terreno ricco e acqua costante: con la terra secca le coste diventano dure e filose. Prima del trapianto metti del {compost:compost}.",
      "Raccogli la pianta intera tagliandola alla base, oppure qualche costa esterna alla volta.",
    ], problemi: ['lumache'] },
  { id: 'fagiolorampicante', nome: 'Fagiolo rampicante', parole: ['fagiolo rampicante', 'rampicant', 'fagiol', 'borlott', 'cannellin'], famiglia: 'Leguminose', tappa: 'L', esigenza: 'arricchisce',
    s: [['05-01','06-30']], r: [['07-15','09-30']], giorni: '65–80',
    sullaFila: '10', traLeFile: '— (una fila lungo la rete)', prof: '3–4 cm', kgP: [0.15, 0.25],
    consigli: [
      "Semina lungo una rete o dei pali alti 2 m, messi sul lato nord dell'aiuola: la pianta sale da sola e non fa ombra alle altre.",
      "Semina solo con la terra calda, da maggio: nella terra fredda il seme marcisce.",
      "Raccogli spesso: più baccelli togli, più la pianta ne produce. Per i fagioli da sgranare (borlotti, cannellini) aspetta che i baccelli siano gonfi.",
      "A fine raccolta {tagliopiede:taglia al piede}: le radici lasciano azoto nel terreno.",
    ], problemi: ['ragnetto', 'cimice'] },
  { id: 'patata', nome: 'Patata', parole: ['patat'], famiglia: 'Solanacee', tappa: 'S', esigenza: 'alta', tLabel: 'Messa a dimora',
    t: [['03-01','04-15']], r: [['07-01','08-31']], giorni: '90–120',
    sullaFila: '30', traLeFile: '60', prof: '10 cm', kgP: [0.5, 1], unita: 'tuberi',
    avviso: "Sconsigliata in un orto piccolo: occupa molto spazio per mesi e, nei primi anni dopo un prato, attira i {ferretti:ferretti}.",
    consigli: [
      "Usa patate da seme certificate, non quelle da cucina: sono sane e germogliano bene.",
      "Quando le piante sono alte 15–20 cm, {rincalzare:rincalza}: le patate si formano nella terra ammucchiata e non diventano verdi.",
      "Raccogli quando la pianta ingiallisce e secca. È della stessa famiglia del pomodoro: nella rotazione sta con le solanacee.",
    ], problemi: ['dorifora', 'peronospora', 'ferretti'] },
  { id: 'zucca', nome: 'Zucca', parole: ['zucca', 'zucche'], famiglia: 'Cucurbitacee', tappa: 'C', esigenza: 'alta',
    t: [['05-01','05-31']], r: [['09-01','10-31']],
    sullaFila: '150', traLeFile: '150', kgP: [5, 10], unita: 'frutti',
    avviso: "Sconsigliata in un orto piccolo: ogni pianta occupa 3–4 m², più di un'aiuola intera.",
    consigli: [
      "Metti 3–5 litri di {compost:compost} nella buca e lascia correre i rami fuori dall'aiuola, oppure su una rete robusta.",
      "Raccogli quando il picciolo è secco e duro: lasciando 5 cm di picciolo, la zucca si conserva per mesi in un posto fresco e asciutto.",
    ], problemi: ['oidio'] },
  { id: 'melone', nome: 'Melone', parole: ['melon'], famiglia: 'Cucurbitacee', tappa: 'C', esigenza: 'alta',
    t: [['05-01','05-31']], r: [['07-15','09-15']],
    sullaFila: '80', traLeFile: '100', kgP: [2, 4], unita: 'frutti',
    avviso: "Sconsigliato in un orto piccolo: occupa circa 1 m² a pianta e vuole molto caldo e acqua costante.",
    consigli: [
      "Quando la pianta ha 4–5 foglie, {cimare:cimala}: fa rami laterali, che sono quelli che portano i frutti.",
      "Pacciama il terreno e metti una tavoletta sotto ogni frutto, così non marcisce a contatto con la terra.",
      "È maturo quando profuma e il picciolo si stacca quasi da solo.",
    ], problemi: ['oidio'] },
  { id: 'anguria', nome: 'Anguria', parole: ['anguri', 'cocomer'], famiglia: 'Cucurbitacee', tappa: 'C', esigenza: 'alta',
    t: [['05-10','06-05']], r: [['08-01','09-15']],
    sullaFila: '100', traLeFile: '150', kgP: [5, 10], unita: 'frutti',
    avviso: "Sconsigliata in un orto piccolo: ogni pianta occupa più di un metro quadro e fa pochi frutti.",
    consigli: [
      "Bagna molto finché i frutti crescono, poi meno: maturano più dolci.",
      "È matura quando il viticcio più vicino al frutto è secco e la macchia sotto, dove poggia a terra, è diventata gialla.",
    ], problemi: ['oidio'] },
  { id: 'mais', nome: 'Mais dolce', parole: ['mais', 'granoturc'], famiglia: 'Poacee', tappa: 'C', esigenza: 'alta',
    s: [['04-20','05-31']], r: [['08-01','09-15']], giorni: '80–100',
    sullaFila: '25', traLeFile: '60', prof: '3–4 cm', kgP: [0.2, 0.3], unita: 'pannocchie',
    avviso: "Sconsigliato in un orto piccolo: ogni pianta dà 1–2 pannocchie, in uno spazio dove potresti raccogliere molto di più.",
    consigli: [
      "Semina a blocco, in più file vicine, non in una fila sola: il polline passa da pianta a pianta col vento, e le pannocchie vengono piene.",
      "Bagna bene durante la fioritura, quando spuntano i \"capelli\" in cima alle pannocchie.",
      "Raccogli quando i capelli sono secchi e marroni e i chicchi, schiacciati con l'unghia, fanno un succo lattiginoso.",
      "Non è una cucurbitacea, ma nella rotazione lo puoi mettere con zucchine e cetrioli: anche lui è una coltura estiva affamata.",
    ], problemi: [] },

  // ---- Perenni: restano nello stesso posto per anni ----
  { id: 'asparago', nome: 'Asparago', parole: ['asparag'], famiglia: 'Asparagacee', tappa: 'P', esigenza: 'alta', tLabel: 'Messa a dimora',
    t: [['03-01','04-15']], r: [['04-01','05-31']],
    sullaFila: '35', traLeFile: '— (una fila sola)', prof: '20 cm', kgP: [0.3, 0.5],
    avviso: "Sconsigliato in un orto piccolo: occupa lo stesso posto per 10–15 anni e si raccoglie solo dal terzo anno.",
    consigli: [
      "Si pianta da {zampe:zampe} in un fosso profondo 20 cm, che si riempie di terra man mano che spuntano i getti.",
      "Non raccogliere nei primi due anni: la pianta deve fare radici forti.",
      "Dopo la raccolta lascia crescere le fronde fino all'autunno: nutrono le radici per l'anno dopo.",
    ], problemi: [] },
  { id: 'fragola', nome: 'Fragola', parole: ['fragol'], famiglia: 'Rosacee', tappa: 'P', esigenza: 'media',
    t: [['08-15','10-15'],['03-01','04-15']], r: [['05-01','06-30']],
    sullaFila: '30', traLeFile: '40', kgP: [0.2, 0.4],
    consigli: [
      "Trapianta a fine estate per raccogliere già la primavera dopo. Va bene anche su una fascia di bordo.",
      "Metti la paglia sotto le piante quando fioriscono: i frutti restano puliti e non marciscono.",
      "La pianta fa lunghi rami striscianti, gli {stoloni:stoloni}: toglili, oppure lasciali radicare per avere piante nuove. Dopo 3 anni rinnova le piante.",
    ], problemi: ['lumache', 'uccelli'] },
  { id: 'rosmarino', nome: 'Rosmarino', parole: ['rosmarin'], famiglia: 'Lamiacee', tappa: 'P', esigenza: 'bassa',
    t: [['03-15','05-15']], r: [['01-01','12-31']],
    sullaFila: '70', traLeFile: '— (una fila sul bordo)',
    scopo: "Aromatica da tenere sulla fascia di bordo: si taglia un rametto quando serve, tutto l'anno. I fiori attirano api e insetti utili.",
    consigli: [
      "Trapiantalo a marzo–aprile, non in autunno: nell'argilla bagnata le radici marciscono.",
      "Vuole sole pieno e terreno che non ristagna; non ha bisogno di concime né di molta acqua.",
    ], problemi: [] },
  { id: 'salvia', nome: 'Salvia', parole: ['salvia'], famiglia: 'Lamiacee', tappa: 'P', esigenza: 'bassa',
    t: [['03-15','05-15']], r: [['03-01','11-30']],
    sullaFila: '50', traLeFile: '— (una fila sul bordo)',
    scopo: "Aromatica per la fascia di bordo: si colgono le foglie quando servono.",
    consigli: [
      "Trapiantala in primavera, al sole, in terreno che non ristagna.",
      "A fine inverno accorcia i rami di un terzo: la pianta resta compatta e rifà foglie nuove.",
    ], problemi: [] },
  { id: 'timo', nome: 'Timo', parole: ['timo'], famiglia: 'Lamiacee', tappa: 'P', esigenza: 'bassa',
    t: [['03-15','05-15']], r: [['03-01','11-30']],
    sullaFila: '30', traLeFile: '— (una fila sul bordo)',
    scopo: "Aromatica bassa per la fascia di bordo; i fiori attirano le api.",
    consigli: [
      "Trapiantalo in primavera, nel punto più assolato e asciutto.",
      "Dopo la fioritura accorcia i rametti: resta folto.",
    ], problemi: [] },
  { id: 'origano', nome: 'Origano', parole: ['origan'], famiglia: 'Lamiacee', tappa: 'P', esigenza: 'bassa',
    t: [['03-15','05-15']], r: [['05-01','10-31']],
    sullaFila: '40', traLeFile: '— (una fila sul bordo)',
    scopo: "Aromatica per la fascia di bordo; i fiori attirano api e insetti utili.",
    consigli: [
      "Trapiantalo in primavera, al sole. Più il terreno è asciutto, più le foglie sono profumate.",
      "Per farlo seccare, taglia i rametti quando inizia la fioritura e appendili a testa in giù all'ombra.",
    ], problemi: [] },
  { id: 'erbacipollina', nome: 'Erba cipollina', parole: ['erba cipollina', 'cipollina'], famiglia: 'Alliacee', tappa: 'P', esigenza: 'bassa',
    t: [['03-15','05-15']], r: [['03-01','10-31']],
    sullaFila: '25', traLeFile: '— (una fila sul bordo)',
    scopo: "Aromatica per la fascia di bordo: si tagliano le foglie quando servono, e ricrescono.",
    consigli: [
      "Taglia le foglie a 3–4 cm da terra: in poche settimane ricrescono.",
      "Ogni 3–4 anni dividi il cespo in più pezzi e ripiantali: si rinnova.",
    ], problemi: [] },
  { id: 'menta', nome: 'Menta', parole: ['menta'], famiglia: 'Lamiacee', tappa: 'P', esigenza: 'media',
    t: [['03-15','05-15']], r: [['04-01','10-31']],
    sullaFila: '40', traLeFile: '— (una fila sola)',
    avviso: "Da coltivare solo in vaso: in piena terra si allarga con le radici e invade tutto.",
    scopo: "Aromatica: si colgono le foglie quando servono.",
    consigli: [
      "Tienila in un vaso, anche interrato, così le radici non escono.",
      "Ama un po' d'ombra e la terra sempre umida.",
    ], problemi: [] },
  { id: 'lavanda', nome: 'Lavanda', parole: ['lavand'], famiglia: 'Lamiacee', tappa: 'P', esigenza: 'bassa',
    t: [['03-15','05-15']], r: [['06-01','07-31']], rLabel: 'Fioritura',
    sullaFila: '60', traLeFile: '— (una fila sul bordo)',
    scopo: "Pianta da bordura: in fioritura attira tantissime api e altri impollinatori, utili anche all'orto.",
    consigli: [
      "Trapiantala in primavera, al sole pieno, in terreno che non ristagna.",
      "Dopo la fioritura taglia i fiori secchi e un po' di rametti, senza arrivare al legno vecchio.",
    ], problemi: [] },

  // ---- Fiori utili: richiamano insetti utili e impollinatori ----
  { id: 'calendula', nome: 'Calendula', parole: ['calendul'], famiglia: 'Asteracee', tappa: 'F', esigenza: 'bassa',
    s: [['03-01','04-30'],['09-01','10-15']], r: [['05-01','10-31']], rLabel: 'Fioritura',
    sullaFila: '25', traLeFile: '— (agli angoli o sul bordo)', prof: '1 cm',
    scopo: "Fiore utile: un cespo a ogni angolo di aiuola richiama sirfidi e coccinelle, che mangiano gli {afidi:afidi}.",
    consigli: [
      "Seminala direttamente agli angoli delle aiuole, in primavera o a fine estate.",
      "Togli i fiori appassiti: ne fa di nuovi fino all'autunno. Lasciandone qualcuno, si risemina da sola.",
    ], problemi: [] },
  { id: 'alisso', nome: 'Alisso', parole: ['aliss'], famiglia: 'Brassicacee', tappa: 'F', esigenza: 'bassa',
    s: [['03-01','05-31']], r: [['05-01','10-31']], rLabel: 'Fioritura',
    sullaFila: '20', traLeFile: '— (agli angoli o sul bordo)', prof: 'in superficie',
    scopo: "Fiore utile basso e profumato: richiama sirfidi e piccoli insetti che tengono a bada gli {afidi:afidi}.",
    consigli: [
      "Seminalo in superficie, appena coperto, agli angoli delle aiuole o lungo i bordi.",
      "Fiorisce per mesi; a metà estate accorcialo di un terzo e rifiorisce.",
    ], problemi: [] },
  { id: 'facelia', nome: 'Facelia', parole: ['facelia', 'phacelia'], famiglia: 'Boraginacee', tappa: 'F', esigenza: 'bassa',
    s: [['03-15','05-31'],['08-15','09-30']], r: [['06-01','09-30']], rLabel: 'Fioritura',
    sullaFila: 'fitta', traLeFile: '— (a spaglio)', fitta: true, prof: '1 cm',
    scopo: "Fiore utile per api e impollinatori; si usa anche come {sovescio:sovescio} nei vuoti estivi di 6–8 settimane.",
    consigli: [
      "Seminala a spaglio negli spazi liberi o sui bordi.",
      "Se la usi come sovescio, tagliala in fioritura, prima che faccia i semi, e lasciala sul terreno.",
    ], problemi: [] },
  { id: 'borragine', nome: 'Borragine', parole: ['borragin'], famiglia: 'Boraginacee', tappa: 'F', esigenza: 'bassa',
    s: [['03-15','05-31']], r: [['05-15','09-30']], rLabel: 'Fioritura',
    sullaFila: '40', traLeFile: '— (agli angoli o sul bordo)', prof: '1–2 cm',
    scopo: "Fiore utile: i fiori azzurri attirano moltissime api. Foglie e fiori sono commestibili.",
    consigli: [
      "Seminala in un angolo: diventa una pianta grande (fino a 60 cm) e si risemina da sola ogni anno.",
    ], problemi: [] },

  // ---- Sovesci: il "piano B" per le aiuole che restano vuote ----
  { id: 'favino', nome: 'Favino', parole: ['favino'], famiglia: 'Leguminose', tappa: 'V', esigenza: 'arricchisce',
    s: [['09-20','10-20']], r: [['04-01','04-30']], rLabel: 'Taglio in fioritura',
    sullaFila: 'fitta', traLeFile: '— (a spaglio)', fitta: true, prof: '2–3 cm',
    scopo: "{sovescio:Sovescio}: si semina dove l'aiuola resta vuota fino ad aprile, di solito insieme a veccia e avena (15–20 g/m² di miscuglio). Lascia azoto nel terreno.",
    consigli: [
      "Semina tra fine settembre e il 20 ottobre e copri con 2–3 cm di terra.",
      "Ad aprile, in fioritura, taglia, sminuzza e lascia appassire una settimana; poi interra nei primi 10 cm o lascia in superficie. Trapianta dopo 2–3 settimane.",
    ], problemi: [] },
  { id: 'veccia', nome: 'Veccia', parole: ['veccia'], famiglia: 'Leguminose', tappa: 'V', esigenza: 'arricchisce',
    s: [['09-20','10-20']], r: [['04-01','04-30']], rLabel: 'Taglio in fioritura',
    sullaFila: 'fitta', traLeFile: '— (a spaglio)', fitta: true, prof: '2 cm',
    scopo: "{sovescio:Sovescio} invernale, nel miscuglio con favino e avena: è una leguminosa rampicante che lascia azoto nel terreno.",
    consigli: [
      "Semina in miscuglio tra fine settembre e il 20 ottobre: l'avena le fa da sostegno.",
      "Taglia ad aprile, in fioritura, come il favino.",
    ], problemi: [] },
  { id: 'avena', nome: 'Avena', parole: ['avena', 'orzo'], famiglia: 'Poacee', tappa: 'V', esigenza: 'bassa',
    s: [['09-20','10-20']], r: [['04-01','04-30']], rLabel: 'Taglio in fioritura',
    sullaFila: 'fitta', traLeFile: '— (a spaglio)', fitta: true, prof: '2–3 cm',
    scopo: "{sovescio:Sovescio} invernale, nel miscuglio con favino e veccia: le sue radici fitte rendono il terreno più soffice e lo proteggono dalla pioggia. Al posto dell'avena va bene anche l'orzo.",
    consigli: [
      "Semina in miscuglio tra fine settembre e il 20 ottobre.",
      "Taglia ad aprile, prima che faccia i semi.",
    ], problemi: [] },
  { id: 'saraceno', nome: 'Grano saraceno', parole: ['saracen'], famiglia: 'Poligonacee', tappa: 'V', esigenza: 'bassa',
    s: [['05-15','08-15']], r: [['07-01','09-30']], rLabel: 'Taglio in fioritura',
    sullaFila: 'fitta', traLeFile: '— (a spaglio)', fitta: true, prof: '2–3 cm',
    scopo: "{sovescio:Sovescio} estivo per i vuoti di 6–8 settimane: cresce in fretta, copre il terreno e soffoca le erbacce. I fiori attirano le api.",
    consigli: [
      "Seminalo a spaglio in un'aiuola che resta libera d'estate.",
      "Taglialo in fioritura, dopo circa 6 settimane, prima che faccia i semi.",
    ], problemi: [] },
];

// Parole con spiegazione, usate nei consigli e nei problemi del catalogo
export const GLOSSARIO = {
  trapianto: {
    titolo: 'Trapianto', tipo: 'Lavoro',
    def: "Spostare una piantina già cresciuta, nata in semenzaio o comprata, nel suo posto definitivo nell'aiuola. Si usa per le colture che hanno bisogno di partire al caldo e di molto tempo, come pomodori, peperoni e melanzane.",
    perche: "Guadagni settimane di stagione, scegli solo le piantine più robuste e non occupi l'aiuola mentre la pianta è ancora piccola.",
    passi: [
      "<b>Prepara il terreno</b> con compost e rastrella: deve essere soffice, senza zolle grosse.",
      "<b>Annaffia le piantine</b> un'ora prima: la zolla resta unita quando le estrai.",
      "<b>Scegli il momento giusto</b>: sera o giornata coperta. Per pomodori e peperoni aspetta che le gelate siano passate.",
      "<b>Scava una buca</b> poco più grande della zolla, alle distanze indicate sulla scheda.",
      "<b>Estrai la piantina</b> tenendola per la zolla o per le foglie, mai per il fusto, senza rompere le radici.",
      "<b>Mettila a dimora</b> allo stesso livello del vaso. Il pomodoro si può interrare di più, fino alle prime foglie: il fusto emette altre radici.",
      "<b>Comprimi leggermente</b> attorno e <b>annaffia abbondante al piede</b>, senza bagnare le foglie.",
      "<b>Proteggi nei primi giorni</b> dal sole forte (una cassetta rovesciata basta) e metti subito il tutore."
    ],
    attenzione: [
      "Piantine ancora piccole o già troppo lunghe e filate attecchiscono male.",
      "Niente concime fresco o letame nella buca: brucia le radici.",
      "Nell'argilla di Bologna evita la buca che ristagna: se ha piovuto, aspetta che il terreno sia lavorabile."
    ],
    vedi: "Diverso dalla semina diretta, dove il seme va nel terreno e la pianta nasce lì."
  },

  // Lavori
  cimare: { titolo: 'Cimare', tipo: 'Lavoro',
    def: "Tagliare la punta di una pianta, cioè gli ultimi centimetri del fusto, con le dita o con le forbici.",
    perche: "La pianta smette di allungarsi e mette le forze altrove: nelle fave nei baccelli, nel basilico in nuovi rametti laterali, così diventa più folto." },
  tagliopiede: { titolo: 'Tagliare al piede', tipo: 'Lavoro',
    def: "Tagliare la pianta a filo del terreno invece di strapparla, lasciando le radici sotto terra.",
    perche: "Fave, piselli e fagioli hanno sulle radici dei piccoli rigonfiamenti, i noduli, dove vivono batteri che catturano l'azoto dall'aria. Se lasci le radici nel terreno, quell'azoto resta lì e lo usa la coltura che viene dopo, per esempio i cavoli. Se le strappi, lo porti via." },
  scalare: { titolo: 'Semina a scalare', tipo: 'Lavoro',
    def: "Seminare o trapiantare poche piante alla volta, a qualche settimana di distanza, invece che tutte insieme.",
    perche: "Il raccolto si distribuisce nel tempo: ogni settimana hai qualcosa di fresco, invece di troppa roba tutta insieme e poi niente." },
  diradare: { titolo: 'Diradare', tipo: 'Lavoro',
    def: "Togliere una parte delle piantine nate troppo vicine, lasciando le più robuste alla distanza giusta.",
    perche: "Ammassate restano piccole e si ammalano più facilmente. Molte piantine tolte si mangiano: cipollotti, spinacini, carotine." },
  rincalzare: { titolo: 'Rincalzare', tipo: 'Lavoro',
    def: "Accumulare terra attorno alla base della pianta, formando un piccolo cumulo.",
    perche: "Nel finocchio tiene al buio il grumolo, che diventa più bianco e tenero. In altre piante, come i cavoli, le rende più stabili contro il vento." },
  sfemminellare: { titolo: 'Sfemminellare', tipo: 'Lavoro',
    def: "Togliere i germogli che nascono nell'angolo tra il fusto e le foglie del pomodoro, chiamati femminelle.",
    perche: "Se li lasci crescere ognuno diventa un ramo: la pianta si trasforma in un cespuglio con tante foglie, pochi frutti e più malattie.",
    passi: ["Controlla le piante una volta a settimana.", "Cerca il germoglio nell'angolo tra il fusto e una foglia.", "Spezzalo con le dita finché è lungo meno di 10 cm: più è piccolo, più la ferita è piccola."] },
  getti: { titolo: 'Getti laterali', tipo: 'Lavoro',
    def: "Piccole teste di broccolo che spuntano sui lati del fusto dopo che hai tagliato la testa centrale. Si raccolgono come la testa principale, per qualche settimana." },

  // Materiali
  tutore: { titolo: 'Tutore', tipo: 'Materiale',
    def: "Un palo (canna, legno o metallo) piantato accanto a una pianta per sostenerla. La pianta si lega al tutore con un laccio morbido, senza stringere, man mano che cresce. Per il pomodoro serve alto circa 2 m." },
  compost: { titolo: 'Compost', tipo: 'Materiale',
    def: "Terriccio scuro che si ottiene lasciando decomporre scarti vegetali: foglie, erba, scarti di cucina. Nutre il terreno lentamente e, soprattutto, lo rende più soffice e capace di trattenere l'acqua.",
    attenzione: ["Va usato maturo: scuro, a grumi, con odore di bosco, senza resti riconoscibili. Quello fresco può bruciare le radici."] },
  pollina: { titolo: 'Pollina', tipo: 'Materiale',
    def: "Concime fatto con lo sterco di gallina essiccato, di solito in pellet. È ricco di azoto e agisce in fretta: serve alle colture più affamate, come i cavoli.",
    attenzione: ["Nutre le piante ma non migliora il terreno: non sostituisce il compost.", "Rispetta le dosi: troppa brucia le radici."] },
  cornunghia: { titolo: 'Cornunghia', tipo: 'Materiale',
    def: "Concime fatto con corna e zoccoli macinati. Rilascia l'azoto lentamente, per settimane, senza il rischio di eccessi improvvisi." },
  rete: { titolo: 'Rete antinsetto', tipo: 'Materiale',
    def: "Una rete a maglie molto fitte (fino a 1 mm) stesa su archetti sopra le piante, con i bordi interrati. Gli insetti non arrivano alle foglie, mentre luce, aria e pioggia passano. È la difesa più efficace per i cavoli." },
  tnt: { titolo: 'Tessuto non tessuto', tipo: 'Materiale',
    def: "Un telo bianco leggerissimo (17–19 g/m²) da stendere sopra le piante. D'inverno le protegge dal gelo di qualche grado; tiene lontani anche insetti e uccelli." },
  bulbilli: { titolo: 'Bulbilli', tipo: 'Materiale',
    def: "Piccole cipolle, grandi come una nocciola, coltivate apposta per essere ripiantate. Partono più in fretta e con meno rischi rispetto al seme." },
  cipollotto: { titolo: 'Cipollotto', tipo: 'Materiale',
    def: "Cipolla raccolta giovane, prima che il bulbo si ingrossi. Si mangia tutta, anche la parte verde." },
  grumolo: { titolo: 'Grumolo', tipo: 'Materiale',
    def: "La parte bianca e carnosa del finocchio, quella che si mangia, formata dalla base delle foglie strette l'una sull'altra." },
  carducci: { titolo: 'Carducci', tipo: 'Materiale',
    def: "I germogli che nascono alla base del carciofo. Se ne lasciano 2–3 per pianta; gli altri, staccati con un pezzo di radice, si ripiantano per fare piante nuove." },
  mezzombra: { titolo: "Mezz'ombra", tipo: 'Materiale',
    def: "Un posto che riceve sole solo per una parte del giorno, per esempio 3–4 ore in meno. A insalate, bietole e prezzemolo d'estate fa bene: soffrono meno il caldo." },

  // Varietà
  aguadulce: { titolo: 'Aguadulce', tipo: 'Varietà di fava',
    def: "Varietà di fava di origine spagnola, vigorosa e molto produttiva. Regge bene il freddo, per questo si può seminare in autunno (o a fine inverno), e fa baccelli molto lunghi, anche 30–40 cm, con 7–9 semi grandi." },
  bobis: { titolo: 'Bobis a grano nero', tipo: 'Varietà di fagiolino',
    def: "Fagiolino della tradizione ligure, coltivato soprattutto nella piana di Albenga: tenero, senza filo, facile da coltivare. \"A grano nero\" indica i semi neri dentro il baccello." },
  contender: { titolo: 'Contender', tipo: 'Varietà di fagiolino',
    def: "Fagiolino nano precoce (si raccoglie dopo circa 50–55 giorni), con baccelli dritti di 15–18 cm, tondi e senza filo. Regge bene il caldo e l'oidio." },
  calabrese: { titolo: 'Calabrese', tipo: 'Varietà di broccolo',
    def: "Il broccolo classico, a testa verde scuro larga circa 15 cm. Dopo la testa centrale produce molti getti laterali, che si raccolgono per qualche settimana in più." },
  bolognese: { titolo: 'Zucchina bolognese', tipo: 'Varietà di zucchina',
    def: "Antica varietà di zucchina, precoce, con frutti allungati e pieni, di colore verde chiaro. In alternativa va bene qualsiasi ibrido con scritto in etichetta \"tollerante all'oidio\"." },
  marketmore: { titolo: 'Marketmore', tipo: 'Varietà di cetriolo',
    def: "Cetriolo rampicante e vigoroso, con frutti verde scuro di 15–20 cm, quasi senza spine. Resiste bene a diverse malattie, tra cui l'oidio." },
  biancopiacentino: { titolo: 'Bianco piacentino', tipo: "Varietà d'aglio",
    def: "Aglio bianco tradizionale dell'Emilia, molto noto: si conserva benissimo, anche fino a un anno dal raccolto." },
  senshyu: { titolo: 'Senshyu', tipo: 'Varietà di cipolla',
    def: "Cipolla giapponese da piantare in autunno, tra metà settembre e metà ottobre: regge bene l'inverno e si raccoglie a giugno. Bulbo un po' schiacciato, buccia dorata e polpa bianca dal sapore dolce." },
  radar: { titolo: 'Radar', tipo: 'Varietà di cipolla',
    def: "Cipolla giapponese da piantare in autunno: regge bene il freddo, va poco in fiore e si conserva a lungo. Bulbo tondo, si raccoglie tra fine maggio e giugno." },
  romanesco: { titolo: 'Finocchio romanesco', tipo: 'Varietà di finocchio',
    def: "Finocchio a grumolo grosso, tondo, compatto e bianco, dal sapore dolce. Adatto alle semine e ai trapianti d'estate per raccogliere in autunno." },
  meraviglia: { titolo: "Meraviglia d'inverno", tipo: 'Varietà di lattuga',
    def: "Lattuga a cappuccio italiana, compatta e tenera, con foglie verdi ondulate. Resiste fino a circa −10 °C, quindi si raccoglie per tutto l'inverno." },
  gigante: { titolo: "Gigante d'inverno", tipo: 'Varietà di spinacio',
    def: "Spinacio a foglie grandi, lisce e verde scuro, molto resistente al gelo. Si semina da metà agosto a fine ottobre per raccogliere in autunno e a fine inverno." },

  // Parassiti e malattie
  afidi: { titolo: 'Afidi', tipo: 'Parassita',
    def: "I \"pidocchi delle piante\": piccoli insetti verdi o neri che vivono a colonie sulle punte e sotto le foglie e ne succhiano la linfa. Le foglie si arricciano e diventano appiccicose.",
    prevenzione: "Fiori come alisso e calendula attirano coccinelle e sirfidi, che li mangiano. Non esagerare con il concime azotato. Nelle fave, cima le punte.",
    intervento: "Getti d'acqua per staccarli; se sono tanti, sapone molle potassico all'1–2%." },
  cavolaia: { titolo: 'Cavolaia', tipo: 'Parassita',
    def: "Farfalla bianca che depone grappoli di uova gialle sotto le foglie dei cavoli. I bruchi verdi che nascono mangiano le foglie fino alle nervature. Attiva soprattutto da agosto a ottobre.",
    prevenzione: "Rete antinsetto dal giorno del trapianto. Ogni 3–4 giorni guarda sotto le foglie e schiaccia le uova.",
    intervento: "Sui bruchi giovani, la sera, Bacillus thuringiensis var. kurstaki (ammesso in biologico), da ripetere dopo 7 giorni." },
  altica: { titolo: 'Altica', tipo: 'Parassita',
    def: "Minuscoli coleotteri che saltano come pulci e riempiono di forellini le foglie di rucola, ravanelli e cavoli giovani.",
    prevenzione: "Rete antinsetto e terra sempre un po' umida: l'altica ama il secco." },
  moscabianca: { titolo: 'Mosca bianca', tipo: 'Parassita',
    def: "Minuscoli insetti bianchi che vivono sotto le foglie dei cavoli e si alzano in nuvoletta se scuoti la pianta. Indeboliscono le piante in autunno e inverno.",
    prevenzione: "Rete antinsetto.", intervento: "Sapone molle potassico sotto le foglie." },
  cimice: { titolo: 'Cimice asiatica', tipo: 'Parassita',
    def: "Cimice grigio-marrone arrivata dall'Asia. Punge frutti e baccelli, che si deformano e si riempiono di macchie. Molto presente da luglio a settembre.",
    prevenzione: "Rete antinsetto su archi alti sopra pomodori e peperoni.",
    intervento: "Raccoglila a mano all'alba, quando è lenta, in una bottiglia con acqua e sapone, due volte a settimana. Gli insetticidi ammessi in biologico funzionano poco e colpiscono anche gli insetti utili." },
  tuta: { titolo: 'Tuta absoluta', tipo: 'Parassita',
    def: "Piccola farfalla notturna le cui larve scavano gallerie nelle foglie e nei frutti del pomodoro: si vedono macchie chiare e trasparenti sulle foglie.",
    prevenzione: "Controlla foglie e frutti ogni settimana.", intervento: "Bacillus thuringiensis sulle larve giovani; togli le foglie colpite." },
  dorifora: { titolo: 'Dorifora', tipo: 'Parassita',
    def: "Coleottero giallo a strisce nere. Adulti e larve, rosse e panciute, mangiano le foglie di melanzane e patate.",
    intervento: "Raccogli a mano adulti, larve e i grappoli di uova arancioni sotto le foglie." },
  ragnetto: { titolo: 'Ragnetto rosso', tipo: 'Parassita',
    def: "Acaro minuscolo, quasi invisibile, che col caldo secco riempie le foglie di puntini gialli e di ragnatele sottilissime.",
    prevenzione: "Pacciamatura e piante mai stressate dalla sete.", intervento: "Spruzza acqua sotto le foglie al mattino; nei casi gravi zolfo o sapone molle." },
  lumache: { titolo: 'Lumache e limacce', tipo: 'Parassita',
    def: "Mangiano di notte foglie tenere e piantine appena nate, lasciando scie lucide. Abbondano con l'umido, in primavera e in autunno.",
    prevenzione: "Metti qualche tavola sul terreno: di giorno ci si nascondono sotto, e all'alba le raccogli. Bagna al mattino, non la sera.",
    intervento: "Esche al fosfato ferrico (ammesse in biologico), circa 5 g/m², o trappole con la birra." },
  ferretti: { titolo: 'Ferretti', tipo: 'Parassita',
    def: "Larve gialle, dure e sottili come un filo di ferro, che vivono nel terreno e scavano radici e tuberi. Abbondano nei primi anni dopo un prato.",
    intervento: "Trappole: mezze patate infilzate su un bastoncino e interrate a 5–10 cm. Ogni 3–4 giorni le tiri su e togli i ferretti." },
  moscacarota: { titolo: 'Mosca della carota', tipo: 'Parassita',
    def: "Piccola mosca le cui larve scavano gallerie nelle carote, che diventano marroni e immangiabili.",
    prevenzione: "Rete antinsetto sopra le file e rotazione." },
  moscacipolla: { titolo: 'Mosca della cipolla', tipo: 'Parassita',
    def: "Mosca le cui larve mangiano il bulbo di cipolle e porri: le foglie ingialliscono e la pianta si affloscia.",
    prevenzione: "Rotazione.", intervento: "Togli e butta le piante colpite." },
  uccelli: { titolo: 'Uccelli', tipo: 'Parassita',
    def: "Colombi, tortore e merli beccano le piantine appena nate di fave e piselli e, d'inverno, le foglie dei cavoli.",
    prevenzione: "Rete o tessuto non tessuto da novembre a marzo." },
  infestanti: { titolo: 'Erbe infestanti', tipo: 'Parassita',
    def: "Erbe spontanee che rubano acqua, luce e nutrimento alle colture. La più difficile è la gramigna, che ricaccia da ogni pezzetto di radice.",
    prevenzione: "Togli le erbe spesso, quando sono piccole, e copri il terreno con la pacciamatura." },
  oidio: { titolo: 'Oidio', tipo: 'Malattia',
    def: "Chiamato anche mal bianco: una muffa bianca come farina che ricopre le foglie, che poi ingialliscono e seccano. Colpisce soprattutto zucchine e cetrioli da luglio, e i piselli a fine ciclo.",
    prevenzione: "Varietà tolleranti, piante non troppo fitte, acqua solo alla base senza bagnare le foglie.",
    intervento: "Ai primi segni zolfo bagnabile (mai sopra i 30 °C) o bicarbonato di potassio; togli le foglie più colpite." },
  peronospora: { titolo: 'Peronospora', tipo: 'Malattia',
    def: "Malattia causata da un fungo che ama l'umidità: macchie brune e oleose su foglie e frutti, e la pianta può seccare in pochi giorni. Colpisce soprattutto il pomodoro, dopo periodi piovosi.",
    prevenzione: "Acqua solo alla base (meglio a goccia), foglie basse tolte fino a 30 cm, piante distanziate, pacciamatura contro gli schizzi.",
    intervento: "Togli subito le foglie colpite. Rame solo dopo piogge lunghe e alla dose minima in etichetta: si accumula nel terreno." },
  marciume: { titolo: 'Marciume apicale', tipo: 'Malattia',
    def: "Una macchia scura e secca sulla punta del frutto di pomodori e peperoni. Non è un'infezione: nasce dall'acqua data in modo irregolare, che impedisce al calcio di arrivare al frutto.",
    prevenzione: "Acqua regolare e pacciamatura, che tiene il terreno umido in modo uniforme.",
    intervento: "Nessun prodotto serve: regolarizza l'irrigazione e togli i frutti colpiti." },
  ruggine: { titolo: "Ruggine dell'aglio", tipo: 'Malattia',
    def: "Malattia causata da un fungo: puntini arancioni sulle foglie dell'aglio, che seccano in anticipo e danno teste più piccole.",
    prevenzione: "Rotazione e niente eccesso di concime.", intervento: "Togli le foglie o le piante colpite." },

// Gruppi della rotazione: cos'hanno in comune le colture di ogni gruppo
  'gruppo-L': { titolo: 'Leguminose, poi cavoli', tipo: 'Gruppo della rotazione · tappa 1', gruppo: 'L',
    def: "Fave, piselli e fagiolini sono leguminose: grazie a batteri che vivono sulle loro radici catturano l'azoto dall'aria e lo lasciano nel terreno. Subito dopo, nello stesso settore, vanno i cavoli, le colture più affamate di azoto, che lo trovano già pronto.",
    percheTitolo: 'Perché stanno insieme',
    perche: "Le leguminose non vogliono concime, i cavoli sì: le prime preparano il terreno ai secondi. Insieme occupano il settore da novembre fino a febbraio dell'anno dopo." },
  'gruppo-C': { titolo: 'Cucurbitacee', tipo: 'Gruppo della rotazione · tappa 2', gruppo: 'C',
    def: "Zucchine e cetrioli sono della stessa famiglia, le cucurbitacee: piante grandi che vogliono caldo, molta acqua e terreno ricco. Si trapiantano a maggio e producono fino a settembre.",
    percheTitolo: 'Perché stanno insieme',
    perche: "Ricevono il compost in primavera, e quello che avanza basta all'aglio che viene dopo. Soffrono delle stesse malattie, come l'oidio: per questo non si ripetono nello stesso punto prima di 4 anni." },
  'gruppo-A': { titolo: 'Aglio, cipolle, finocchi…', tipo: 'Gruppo della rotazione · tappa 3', gruppo: 'A',
    def: "Sono le colture che chiedono poco concime. Aglio e cipolle occupano il settore da ottobre a giugno; poi, nello stesso posto, vanno finocchi, radicchi, bietole e carote fino a fine anno.",
    percheTitolo: 'Perché stanno insieme',
    perche: "Aglio, cipolle e carote non vogliono letame: fa marcire i bulbi e biforcare le radici. Venendo dopo zucchine e cetrioli, sfruttano il nutrimento rimasto nel terreno senza bisogno d'altro." },
  'gruppo-S': { titolo: 'Solanacee', tipo: 'Gruppo della rotazione · tappa 4', gruppo: 'S',
    def: "Pomodori, peperoni e melanzane sono solanacee, la stessa famiglia della patata: vogliono caldo, sole pieno e terreno ben concimato. Si trapiantano a maggio e si raccolgono fino a ottobre.",
    percheTitolo: 'Perché stanno insieme',
    perche: "Arrivano su un terreno concimato in inverno con il compost. Hanno malattie in comune, come la peronospora, che restano nel terreno: per questo tornano nello stesso settore solo dopo 4 anni. Tolti i pomodori, a novembre si seminano le fave e il giro ricomincia." },
  'gruppo-J': { titolo: 'Jolly', tipo: 'Fuori dal giro', gruppo: 'J',
    def: "Colture che crescono in fretta e occupano poco spazio: si mettono negli spazi e nei periodi liberi di qualsiasi settore, tra una coltura e l'altra.",
    percheTitolo: 'Perché sono jolly',
    perche: "Così la terra non resta mai nuda e si raccoglie qualcosa anche nei vuoti. Attenzione: rucola e ravanelli sono della famiglia dei cavoli, quindi nella rotazione contano come cavoli." },
  'gruppo-P': { titolo: 'Perenni', tipo: 'Fuori dal giro', gruppo: 'P',
    def: "Piante che restano nello stesso posto per più anni: carciofo, asparago, fragola e le aromatiche come rosmarino, salvia e timo, che di solito stanno sulle fasce di bordo.",
    percheTitolo: 'Perché sono fuori dal giro',
    perche: "Non si possono spostare ogni anno: occupano sempre la stessa parte dell'aiuola, e la rotazione si fa nel resto del settore." },
  'gruppo-F': { titolo: 'Fiori utili', tipo: 'Fuori dal giro', gruppo: 'F',
    def: "Fiori che non si raccolgono ma aiutano l'orto: richiamano sirfidi, coccinelle e api. Un cespo agli angoli delle aiuole o lungo i bordi basta.",
    percheTitolo: 'Perché servono',
    perche: "Sirfidi e coccinelle mangiano gli afidi, le api impollinano zucchine, pomodori e fave. Più insetti utili ci sono, meno trattamenti servono." },
  'gruppo-V': { titolo: 'Sovesci', tipo: 'Fuori dal giro', gruppo: 'V',
    def: "Piante che si seminano non per raccoglierle, ma per tagliarle e lasciarle al terreno. Si usano quando un'aiuola resterebbe vuota per qualche mese.",
    percheTitolo: 'Perché servono',
    perche: "Coprono la terra, che altrimenti con la pioggia fa la crosta e perde l'azoto; tengono lontane le erbacce; tagliate, nutrono il terreno e lo rendono più soffice. Favino e veccia, essendo leguminose, lasciano anche azoto." },

// Parole nuove usate nelle schede aggiunte
  sovescio: { titolo: 'Sovescio', tipo: 'Lavoro',
    def: "Seminare piante, come favino, veccia, avena o facelia, non per raccoglierle ma per tagliarle in fioritura e lasciarle al terreno come nutrimento.",
    perche: "La terra resta coperta invece che nuda, le erbacce crescono meno e il terreno diventa più ricco e soffice." },
  stoloni: { titolo: 'Stoloni', tipo: 'Materiale',
    def: "Rami sottili che la fragola allunga sul terreno: dove toccano terra mettono radici e fanno una piantina nuova." },
  zampe: { titolo: 'Zampe di asparago', tipo: 'Materiale',
    def: "Le radici di asparago di un anno, vendute per essere piantate: sembrano un piccolo ragno di radici attorno a una gemma." },
};

// Minuscole, senza accenti e senza segni: "Pomodòro (cuore di bue)" → "pomodoro cuore di bue"
function normalizza(testo) {
  return testo.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

// Voce del catalogo adatta al nome di una coltura, o null.
// Una parola chiave conta solo a inizio parola ("aglio" non scatta in "bietola da taglio", "timo" non in "ultimo").
// Se ne scattano più, vince la più lunga, cioè la più specifica: "cavolo nero" batte "cavol",
// "erba cipollina" batte "cipoll", "lattuga invernale" batte "lattug", "fagiolo rampicante" batte "fagiol".
// A parità vince la prima nell'ordine di CATALOGO.
export function colturaDaNome(nome) {
  const testo = ' ' + normalizza(nome ?? '');
  let trovata = null, lunghezza = 0;
  for (const c of CATALOGO) {
    for (const p of c.parole) {
      if (p.length > lunghezza && testo.includes(' ' + p)) { trovata = c; lunghezza = p.length; }
    }
  }
  return trovata;
}

// Numero da un testo come "50–60" (fa la media) o "12–15"; null se non ci sono numeri
export function numero(testo) {
  const n = (String(testo ?? '').match(/\d+(?:,\d+)?/g) ?? []).map(x => Number(x.replace(',', '.')));
  return n.length ? n.reduce((a, b) => a + b) / n.length : null;
}

// Quante piante stanno in uno spazio: la prima a mezza distanza dal bordo (al massimo 20 cm), poi una ogni d
const conta = (spazio, d) => Math.max(1, Math.floor((spazio - 2 * Math.min(d / 2, 20)) / d) + 1);

// Come si dispone la coltura in uno spazio L × W cm (file lungo L): area in m², numero di file e piante
export function disposizione(c, L, W) {
  let file;
  if (c.id === 'fava') file = 2 * Math.max(1, Math.floor((W - 25) / 75) + 1);   // coppie di file: 25 cm dentro, 50 tra le coppie
  else if (!/^\d/.test(c.traLeFile)) file = 1;                                   // una fila sola (rete, bordo)
  else file = conta(W, numero(c.traLeFile));
  const perFila = c.fitta ? null : conta(L, numero(c.sullaFila));
  return { L, W, area: L * W / 10000, file, perFila, piante: perFila ? file * perFila : null };
}

// Resa stimata [min, max] in kg nello spazio d (di base l'aiuola intera); null se il catalogo non la indica
export function resa(c, d = disposizione(c, AIUOLA.L, AIUOLA.W)) {
  if (c.kgM2) return c.kgM2.map(v => v * d.area);
  if (c.kgP && d.piante) return c.kgP.map(v => v * d.piante);
  return null;
}
