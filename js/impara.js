// Impara: guide brevi e lavori del mese. Solo conoscenza generale per gli orti di Bologna, nessun dato di un orto.
// Nei testi {id:testo} è una parola con spiegazione, id = chiave di GLOSSARIO (come nel catalogo).
// I numeri sono indicazioni pratiche da manuali e siti di orticoltura, da adattare al proprio terreno e al meteo.

// Pezzi comuni dei disegni (300 × 110): terra con solchi e contorno scuro
const TERRA = '<rect x="0" y="72" width="300" height="38" fill="#8B5E3C"/><path d="M0 72h300" stroke="#2a1e12" stroke-width="2"/><path d="M0 86h300M0 98h300" stroke="#7A5134" stroke-width="3"/>';
const piantina = (x, y = 72, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0V-22" stroke="#3f6b2e" stroke-width="3.5"/><path d="M0-14C-12-14-17-21-17-28-6-28 0-22 0-14Z" fill="#6aa83a" stroke="#2a1e12" stroke-width="2"/><path d="M0-18C1-27 8-32 16-31 16-23 9-18 0-18Z" fill="#5fa83c" stroke="#2a1e12" stroke-width="2"/></g>`;
const etichetta = (x, y, testo) => `<text x="${x}" y="${y}" font-family="'Baloo 2', sans-serif" font-size="12" font-weight="700" fill="#fff8e7">${testo}</text>`;
const disegno = corpo => `<svg viewBox="0 0 300 110" aria-hidden="true" stroke-linecap="round" stroke-linejoin="round">${corpo}</svg>`;

const DISEGNI_GUIDE = {
  seminare: disegno(`${TERRA}<path d="M30 74q120 10 240 0" fill="none" stroke="#5a3a1d" stroke-width="5"/>
    ${[60, 95, 130, 165, 200, 235].map(x => `<ellipse cx="${x}" cy="76" rx="3.4" ry="2.4" fill="#f2d48a" stroke="#2a1e12" stroke-width="1.4"/>`).join('')}
    <g transform="translate(250 22) rotate(25)"><rect x="-14" y="-20" width="28" height="36" rx="3" fill="#f6e2b3" stroke="#2a1e12" stroke-width="2"/><path d="M-8-8h16M-8-1h16" stroke="#8b5e3c" stroke-width="2"/></g>
    <path d="M238 44l-6 12M232 50l-8 10" stroke="#f2d48a" stroke-width="3"/>${etichetta(12, 104, 'solco: 2–3 volte la grandezza del seme')}`),
  trapiantare: disegno(`${TERRA}<path d="M118 72a32 14 0 0 0 64 0" fill="#5a3a1d" stroke="#2a1e12" stroke-width="2"/>
    <ellipse cx="150" cy="70" rx="20" ry="10" fill="#6e4426" stroke="#2a1e12" stroke-width="2"/>${piantina(150, 64, 1.2)}
    ${piantina(60, 72, 1)}${piantina(240, 72, 1)}<path d="M200 40c10-10 22-10 30 0" fill="none" stroke="#fff8e7" stroke-width="2.4" stroke-dasharray="4 4"/>${etichetta(12, 104, 'buca grande quanto il pane di terra')}`),
  annaffiare: disegno(`${TERRA}${piantina(110, 72, 1.3)}${piantina(200, 72, 1.1)}
    <g transform="translate(160 6)"><path d="M14 36h52l-6 30H20z" fill="#5c9e3a" stroke="#2a1e12" stroke-width="2.2"/><path d="M22 36c0-14 36-14 36 0" fill="none" stroke="#2a1e12" stroke-width="3"/><path d="M16 46L-24 54" stroke="#2a1e12" stroke-width="5"/><path d="M16 46L-24 54" stroke="#5c9e3a" stroke-width="3"/></g>
    ${[0, 1, 2, 3].map(i => `<path d="M${132 - i * 6} ${64 + i * 2}l-4 7" stroke="#7fc4e8" stroke-width="2.6"/>`).join('')}${etichetta(12, 104, 'alla base, al mattino presto o la sera')}`),
  pacciamare: disegno(`${TERRA}<g fill="#e8c96a" stroke="#a8862c" stroke-width="1.4"><path d="M20 66l40-6M50 68l45-4M90 66l38-7M180 68l40-6M225 66l45-4M30 62l35 3M200 61l38 4M255 62l35 5M120 69l20-2M168 69l-14-3"/></g>
    ${piantina(150, 72, 1.3)}${etichetta(12, 104, 'paglia: 5–10 cm, lontano dal fusto')}`),
  compost: disegno(`${TERRA}<path d="M90 72V30h120v42" fill="#c08a52" stroke="#2a1e12" stroke-width="2.4"/><path d="M90 42h120M90 56h120M120 30v42M150 30v42M180 30v42" stroke="#8b5e3c" stroke-width="2"/>
    <path d="M96 30c10-14 30-16 40-6 8-10 26-10 34 0 10-8 28-4 34 6" fill="#6a8f3a" stroke="#2a1e12" stroke-width="2"/><path d="M120 22l6-6M160 20l4-7" stroke="#e86f1c" stroke-width="4"/>
    ${etichetta(12, 104, 'verde + marrone, umido come una spugna strizzata')}`),
  concimare: disegno(`${TERRA}<path d="M40 72c30-12 70-12 100 0" fill="#3b2a1c" stroke="#2a1e12" stroke-width="2"/>
    <g transform="translate(170 18)"><path d="M0 22l60-8 4 30-60 8z" fill="#9aa3a8" stroke="#2a1e12" stroke-width="2"/><path d="M4 52l-4 18M56 44l10 16" stroke="#2a1e12" stroke-width="3"/><circle cx="-2" cy="74" r="7" fill="#444" stroke="#2a1e12" stroke-width="2"/><path d="M8 26c10-12 34-14 46-6" fill="#3b2a1c" stroke="#2a1e12" stroke-width="2"/></g>
    ${etichetta(12, 104, 'compost o letame maturo, in autunno o fine inverno')}`),
  rotazione: disegno(`<rect width="300" height="110" fill="#7fa653"/>
    ${[['L', 40, 14, '#3d6fa8'], ['C', 160, 14, '#4c8a3a'], ['A', 160, 60, '#b07a1e'], ['S', 40, 60, '#b5443a']].map(([t, x, y, c]) =>
      `<rect x="${x}" y="${y}" width="100" height="38" rx="6" fill="#8B5E3C" stroke="#A87444" stroke-width="3"/><circle cx="${x + 50}" cy="${y + 19}" r="13" fill="${c}" stroke="#2a1e12" stroke-width="2"/><text x="${x + 50}" y="${y + 24}" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="15" font-weight="600" fill="#fff">${t}</text>`).join('')}
    <path d="M142 33h14M210 54v4M156 79h-14M90 58v-4" stroke="#fff8e7" stroke-width="3"/><path d="M152 29l5 4-5 4M206 54l4 5 4-5M146 75l-5 4 5 4M86 58l4-5 4 5" fill="none" stroke="#fff8e7" stroke-width="2.4"/>`),
  consociazioni: disegno(`${TERRA}${piantina(50, 72, 1)}${piantina(110, 72, 1)}${piantina(170, 72, 1)}${piantina(230, 72, 1)}
    ${[80, 140, 200].map(x => `<g transform="translate(${x} 72)"><path d="M-12 0c0-10 6-16 12-16s12 6 12 16z" fill="#9bd16a" stroke="#2a1e12" stroke-width="2"/></g>`).join('')}
    <g transform="translate(276 50)"><circle r="8" fill="#f2a23a" stroke="#2a1e12" stroke-width="2"/><circle r="3" fill="#8a4a14"/><path d="M0 8v14" stroke="#3f6b2e" stroke-width="3"/></g>
    ${etichetta(12, 104, 'insalate tra le file, fiori ai bordi')}`),
  sovescio: disegno(`${TERRA}${Array.from({ length: 22 }, (_, i) => { const x = 14 + i * 13; return `<path d="M${x} 72c-2-16 2-30 6-40" fill="none" stroke="${i % 3 ? '#5f8f2e' : '#c9b14a'}" stroke-width="3"/>${i % 4 === 0 ? `<circle cx="${x + 6}" cy="30" r="4" fill="#f4f4f4" stroke="#2a1e12" stroke-width="1.4"/><circle cx="${x + 6}" cy="30" r="1.6" fill="#2a1e12"/>` : ''}`; }).join('')}
    ${etichetta(12, 104, 'si taglia in fioritura e si lascia sul terreno')}`),
  difesa: disegno(`${TERRA}${piantina(90, 72, 1.4)}<g transform="translate(200 62)"><path d="M-18 8c0-10 8-16 18-16 6 0 10 4 10 10H-18z" fill="#d9a86c" stroke="#2a1e12" stroke-width="2"/><path d="M-26 10h44" stroke="#7a6a50" stroke-width="7"/><path d="M14 4l6-10M18 6l8-8" stroke="#2a1e12" stroke-width="2"/></g>
    <g transform="translate(130 30)"><ellipse rx="10" ry="8" fill="#d62c1a" stroke="#2a1e12" stroke-width="2"/><path d="M0-8v16" stroke="#2a1e12" stroke-width="1.6"/><circle cx="-4" cy="-2" r="1.8" fill="#2a1e12"/><circle cx="4" cy="3" r="1.8" fill="#2a1e12"/><circle cx="0" cy="-10" r="4" fill="#2a1e12"/></g>
    ${etichetta(12, 104, 'prima prevenire: le coccinelle mangiano gli afidi')}`),
  pomodori: disegno(`${TERRA}<path d="M150 72V8" stroke="#a87444" stroke-width="6"/><path d="M150 72V8" stroke="#2a1e12" stroke-width="1"/>
    <path d="M146 72c-2-20 4-40 2-62" fill="none" stroke="#3f6b2e" stroke-width="4"/>${[20, 40, 58].map(y => `<path d="M144 ${y}h12" stroke="#f2c230" stroke-width="3"/>`).join('')}
    ${[[128, 46], [168, 30], [124, 22]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#e2412b" stroke="#2a1e12" stroke-width="2"/>`).join('')}
    <path d="M148 36c8-4 14-10 16-16" fill="none" stroke="#6aa83a" stroke-width="3" stroke-dasharray="3 3"/><path d="M168 16l8-6M168 10l8 6" stroke="#b00020" stroke-width="2.6"/>
    ${etichetta(12, 104, 'legacci morbidi, via le femminelle da piccole')}`),
  inverno: disegno(`${TERRA}<path d="M30 72c0-40 110-40 110 0" fill="rgb(255 255 255 / .55)" stroke="#2a1e12" stroke-width="2"/>${piantina(85, 72, 1.1)}
    <g fill="#e8a23a" stroke="#8a4a14" stroke-width="1.4">${[180, 205, 230, 255, 275].map((x, i) => `<path d="M${x} ${66 - (i % 2) * 3}c6-6 14-6 18 0-6 6-14 6-18 0z"/>`).join('')}</g>
    ${[[60, 14], [170, 20], [240, 10], [120, 6]].map(([x, y]) => `<path d="M${x - 5} ${y}h10M${x} ${y - 5}v10M${x - 4} ${y - 4}l8 8M${x + 4} ${y - 4}l-8 8" stroke="#fff" stroke-width="2"/>`).join('')}
    ${etichetta(12, 104, 'tessuto non tessuto e foglie secche')}`),
};

export const GUIDE = [
  { id: 'seminare', titolo: 'Seminare', sottotitolo: 'In piena terra, a file',
    intro: 'Per le colture che non amano il {trapianto:trapianto} (carote, ravanelli, fagiolini, piselli) il seme va direttamente nell\'aiuola.',
    passi: [
      'Prepara la terra fine e livellata, senza zolle né sassi, e bagnala il giorno prima se è asciutta.',
      'Traccia un solco profondo circa due o tre volte la grandezza del seme: i semi piccoli quasi in superficie, fave e fagioli a qualche centimetro.',
      'Distribuisci i semi alla distanza della scheda del catalogo, o un po\' più fitti e poi {diradare:dirada} le piantine.',
      'Copri, premi leggermente con il dorso del rastrello e bagna a pioggia fine.',
      'Tieni la terra umida, senza allagarla, finché le piantine non sono nate.',
    ],
    quando: 'Nei periodi di semina del catalogo: guarda "Questo mese".',
    attenzione: ['Una crosta di terra secca impedisce ai semi piccoli di uscire: bagna spesso e poco.', 'Con il terreno freddo e bagnato molti semi marciscono: meglio aspettare qualche giorno.'],
    colture: ['carota', 'ravanello', 'fagiolino', 'pisello'] },
  { id: 'trapiantare', titolo: 'Trapiantare', sottotitolo: 'Dalla piantina al suo posto',
    intro: 'Il {trapianto:trapianto} fa guadagnare settimane: si mettono nell\'aiuola piantine già cresciute, nate in semenzaio o comprate.',
    passi: [
      'Scegli piantine robuste e compatte, con il fusto non filato e le foglie ben verdi.',
      'Bagna le piantine un\'ora prima e trapianta nel tardo pomeriggio o in una giornata nuvolosa.',
      'Fai una buca grande quanto il pane di terra, alla distanza del catalogo.',
      'Metti la piantina con il colletto a livello del terreno (il pomodoro si può interrare un po\' di più: fa radici anche sul fusto), poi premi bene la terra attorno.',
      'Annaffia subito alla base e tieni umido nei primi giorni.',
    ],
    quando: 'Nei periodi di trapianto del catalogo. Le colture estive solo quando non gela più (a Bologna di solito dalla seconda metà di aprile).',
    attenzione: ['Se il sole è forte, ombreggia le piantine per qualche giorno.', 'Non tirare la piantina per il fusto: prendila dal pane di terra o dalle foglie.'],
    colture: ['pomodoro', 'zucchina', 'lattuga', 'cavolfiore'] },
  { id: 'annaffiare', titolo: 'Annaffiare bene', sottotitolo: 'Meno volte, ma a fondo',
    intro: 'Bagnare poco ogni giorno fa restare le radici in superficie; poche bagnature abbondanti le spingono in profondità, dove la terra resta fresca.',
    passi: [
      'Prima di annaffiare infila un dito nella terra: se è asciutta per qualche centimetro, è ora.',
      'Bagna al mattino presto o la sera, quando la terra non scotta.',
      'Dai l\'acqua alla base delle piante, non sulle foglie: le foglie bagnate favoriscono malattie come la {peronospora:peronospora}.',
      'In piena estate servono indicativamente 20–35 litri per m² a settimana, divisi in due o tre volte; di più con caldo e vento, niente se piove.',
      'Dopo le semine e i trapianti bagna più spesso e con meno acqua, finché le piante non hanno radicato.',
    ],
    quando: 'Soprattutto da maggio a settembre.',
    attenzione: ['Un terreno argilloso, come spesso a Bologna, trattiene l\'acqua: bagna meno spesso ma a fondo. Uno sabbioso vuole acqua più spesso.', 'Annaffiature irregolari spaccano i pomodori e causano il marciume apicale.', 'La pacciamatura riduce molto l\'acqua necessaria.'],
    colture: ['pomodoro', 'zucchina', 'cetriolo', 'lattuga'] },
  { id: 'pacciamare', titolo: 'Pacciamare', sottotitolo: 'Una coperta per la terra',
    intro: 'Coprire la terra con paglia, foglie secche o erba falciata e appassita trattiene l\'acqua, frena le {infestanti:erbacce} e protegge il terreno dal sole.',
    passi: [
      'Togli le erbacce, radici comprese, e bagna bene.',
      'Stendi uno strato di 5–10 cm di paglia o foglie secche, lasciando libero qualche centimetro attorno al fusto.',
      'Rabbocca quando lo strato si assottiglia; a fine stagione lascialo sul terreno o mettilo nel compost.',
    ],
    quando: 'Da fine maggio, quando la terra si è scaldata e le piantine estive hanno attecchito. Le aiuole vuote d\'inverno si possono coprire con foglie secche.',
    attenzione: ['Se l\'estate è piovosa la pacciamatura dà riparo alle {lumache:lumache}: controlla sotto lo strato.', 'Mettila troppo presto e la terra resta fredda più a lungo.'],
    colture: ['pomodoro', 'zucchina', 'fragola', 'melanzana'] },
  { id: 'compost', titolo: 'Fare il compost', sottotitolo: 'Gli scarti diventano terra buona',
    intro: 'Il {compost:compost} è il concime più semplice: scarti dell\'orto e della cucina che, con il tempo, diventano terriccio scuro e profumato.',
    passi: [
      'Alterna materiali "verdi" (scarti vegetali di cucina, erba, residui dell\'orto) e "marroni" (foglie secche, paglia, rametti spezzati, cartone senza stampa).',
      'Tieni il cumulo umido come una spugna strizzata: se è secco bagnalo, se puzza aggiungi materiale marrone.',
      'Rigira il cumulo ogni mese o due, per far entrare aria.',
      'È pronto dopo circa 6–12 mesi, quando è scuro, sbriciolato e odora di bosco.',
    ],
    quando: 'Tutto l\'anno; in autunno ci sono più foglie e residui da mettere.',
    attenzione: ['Niente carne, pesce, latticini, piante malate o erbacce già piene di semi.', 'Il compost non ancora maturo non va interrato vicino alle radici.'],
    colture: [] },
  { id: 'concimare', titolo: 'Concimare', sottotitolo: 'Nutrire la terra, non solo la pianta',
    intro: 'La concimazione di fondo si fa con sostanza organica ben matura: migliora il terreno e nutre le colture per tutta la stagione.',
    passi: [
      'In autunno o a fine inverno spargi compost maturo (indicativamente 2–4 kg per m²) o letame ben maturo (3–4 kg per m²) sulle aiuole libere.',
      'Incorporalo leggermente nei primi 15–20 cm di terreno, con la vanga o la forca.',
      'Le colture esigenti (pomodori, zucchine, cavoli) ne vogliono di più; leguminose, aglio e cipolle si accontentano di poco.',
      'Durante la stagione, se serve, aggiungi piccole dosi di concime organico come la {pollina:pollina}, seguendo la confezione.',
    ],
    quando: 'Concimazione di fondo da ottobre a marzo; in stagione solo se le piante crescono stentate.',
    attenzione: ['Il letame fresco brucia le radici e fa diventare le carote bitorzolute: usalo solo maturo.', 'Troppo azoto dà tante foglie e pochi frutti, e attira gli {afidi:afidi}.'],
    colture: ['pomodoro', 'zucchina', 'cavolfiore'] },
  { id: 'rotazione', titolo: 'La rotazione', sottotitolo: 'Ogni anno in un posto diverso',
    intro: 'Coltivare la stessa famiglia sempre nello stesso punto impoverisce la terra e fa accumulare malattie e parassiti del terreno. Cambiare posto ogni anno li spezza.',
    passi: [
      'Dividi l\'orto in settori: nella nostra app sono 4, ognuno di due aiuole.',
      'Ogni anno, in ogni settore, passa al gruppo successivo del giro: leguminose e cavoli → cucurbitacee → aglio, cipolle e simili → solanacee → di nuovo leguminose.',
      'La stessa famiglia non dovrebbe tornare nello stesso settore prima di 3–4 anni.',
      'Le insalate e le colture veloci ("jolly") riempiono i vuoti; le perenni restano fuori dal giro.',
    ],
    quando: 'Si decide in autunno, quando si prepara l\'anno dell\'orto (da ottobre a settembre).',
    attenzione: ['Rucola e ravanelli sono parenti dei cavoli: contano come cavoli.', 'L\'app avvisa quando una coltura in programma torna troppo presto nello stesso settore.'],
    colture: [] },
  { id: 'consociazioni', titolo: 'Le consociazioni', sottotitolo: 'Piante che stanno bene vicine',
    intro: 'Mettere vicine colture diverse sfrutta meglio lo spazio e confonde i parassiti. Sono consigli della tradizione dell\'orto, più che regole sicure.',
    passi: [
      'Tra le file di colture lente (cavoli, pomodori) metti insalate e ravanelli, che si raccolgono prima che lo spazio serva.',
      'Ai bordi e agli angoli delle aiuole semina fiori utili (calendula, alisso, borragine): richiamano api e insetti che mangiano gli {afidi:afidi}.',
      'Il basilico accanto ai pomodori è un classico: hanno bisogno della stessa acqua e dello stesso sole.',
      'Tieni fagioli, fagiolini e piselli lontani da aglio e cipolle: è l\'accostamento sconsigliato più citato.',
    ],
    quando: 'Quando pianifichi le aiuole, insieme alla rotazione.',
    attenzione: ['Non mettere vicine piante che si fanno ombra a vicenda: le alte (pomodori, mais) a nord delle basse.'],
    colture: ['calendula', 'basilico', 'lattuga'] },
  { id: 'sovescio', titolo: 'Il sovescio', sottotitolo: 'Un concime che si semina',
    intro: 'Il {sovescio:sovescio} è una coltura che non si raccoglie: si semina dove l\'aiuola resta vuota, si taglia in fioritura e si lascia al terreno, che diventa più soffice e più ricco.',
    passi: [
      'Da fine settembre al 20 ottobre semina a spaglio un miscuglio di favino, veccia e avena (circa 15–20 g per m²) e copri con un po\' di terra.',
      'Ad aprile, in fioritura e prima che faccia i semi, taglialo e sminuzzalo.',
      'Lascialo appassire una settimana, poi interralo nei primi 10 cm o lascialo in superficie.',
      'Aspetta 2–3 settimane prima di seminare o trapiantare.',
      'D\'estate, per un vuoto di 6–8 settimane, va bene il grano saraceno.',
    ],
    quando: 'Autunno per quello invernale, da maggio ad agosto per quello estivo.',
    attenzione: ['Se lo lasci andare a seme diventa un\'erbaccia.'],
    colture: ['favino', 'veccia', 'avena', 'saraceno'] },
  { id: 'difesa', titolo: 'Difendersi senza veleni', sottotitolo: 'Prima prevenire',
    intro: 'Un orto sano si difende in buona parte da solo: piante non troppo fitte, rotazione, fiori utili e controlli frequenti evitano quasi sempre i guai grossi.',
    passi: [
      '{afidi:Afidi}: getti d\'acqua, sapone molle potassico nei casi gravi, e lascia lavorare coccinelle e sirfidi.',
      '{lumache:Lumache}: raccoglile la sera dopo la pioggia; trappole con la birra tra le aiuole; nei casi gravi esche al fosfato ferrico, ammesse nel biologico.',
      '{cavolaia:Cavolaia}: rete anti-insetto sui cavoli e controllo delle uova sotto le foglie; nei casi gravi Bacillus thuringiensis.',
      '{dorifora:Dorifora} sulle patate: raccogli a mano adulti e larve.',
      'Controlla l\'orto almeno due volte a settimana, guardando anche sotto le foglie.',
    ],
    quando: 'Da aprile a settembre soprattutto.',
    attenzione: ['Anche i prodotti ammessi nel biologico vanno usati solo se serve, seguendo l\'etichetta.', 'Togli e butta (non nel compost) le piante con malattie come la {peronospora:peronospora}.'],
    colture: ['cavolfiore', 'patata', 'lattuga'] },
  { id: 'pomodori', titolo: 'Legare e potare i pomodori', sottotitolo: 'Per le varietà a sviluppo indeterminato',
    intro: 'I pomodori che crescono in altezza (cuore di bue, San Marzano, ciliegini) vanno sostenuti e tenuti su un fusto solo, o due.',
    passi: [
      'Al trapianto pianta un {tutore:tutore} robusto alto circa 2 metri accanto a ogni pianta.',
      'Lega il fusto al tutore con legacci morbidi ogni 25–30 cm, senza stringere.',
      '{sfemminellare:Togli le femminelle}, i getti che nascono tra fusto e foglia, quando sono lunghi pochi centimetri: con le dita, di mattina.',
      'Togli le foglie basse che toccano terra o ingialliscono.',
      'Tra fine luglio e inizio agosto {cimare:cima} la pianta sopra l\'ultimo grappolo che farà in tempo a maturare.',
    ],
    quando: 'Da maggio ad agosto.',
    attenzione: ['Le varietà a cespuglio (determinate) non si sfemminellano.', 'Annaffiature regolari evitano frutti spaccati.'],
    colture: ['pomodoro'] },
  { id: 'inverno', titolo: 'Preparare l\'orto per l\'inverno', sottotitolo: 'Mai la terra nuda',
    intro: 'In inverno la terra scoperta si compatta con la pioggia e perde sostanza. Basta poco per proteggerla e averla pronta in primavera.',
    passi: [
      'Togli le piante estive finite: i residui sani nel compost, quelli malati via.',
      'Sulle aiuole libere spargi compost o letame maturo.',
      'Semina un {sovescio:sovescio} oppure copri la terra con foglie secche.',
      'Nelle notti di gelo copri le colture invernali (insalate, finocchi) con {tnt:tessuto non tessuto}.',
      'Lavora la terra solo quando non è bagnata: se una zolla si appiccica alla vanga, aspetta.',
    ],
    quando: 'Da ottobre a dicembre.',
    attenzione: ['Il terreno argilloso calpestato da bagnato diventa duro come un mattone.'],
    colture: ['favino', 'aglio', 'cipolla'] },
].map(g => ({ ...g, disegno: DISEGNI_GUIDE[g.id] }));

// Lavori di ogni mese a Bologna (oltre a semine, trapianti e raccolti, che vengono dal catalogo).
// Le voci possono rimandare a una guida: [testo, idGuida]
export const LAVORI = {
  '01': [
    ['Pianifica le colture e la rotazione dell\'anno', 'rotazione'],
    ['Nelle notti di gelo copri le colture invernali con tessuto non tessuto', 'inverno'],
    ['Non lavorare la terra gelata o bagnata'],
    ['Pulisci, affila e ripara gli attrezzi'],
  ],
  '02': [
    ['Se non l\'hai fatto in autunno, spargi compost o letame maturo sulle aiuole libere', 'concimare'],
    ['Quando il terreno è asciutto, smuovilo con la forca senza rivoltarlo'],
    ['A fine mese semina fave e piselli, se non l\'hai fatto a novembre', 'seminare'],
    ['Al caldo, in casa o in serra, si seminano pomodori, peperoni e melanzane da trapiantare in primavera'],
  ],
  '03': [
    ['Prepara le aiuole delle semine primaverili: terra fine e livellata', 'seminare'],
    ['Metti i sostegni ai piselli'],
    ['Tieni pronto il tessuto non tessuto per le gelate tardive', 'inverno'],
    ['Comincia a controllare lumache e afidi sulle piantine giovani', 'difesa'],
  ],
  '04': [
    ['Taglia il sovescio in fioritura e aspetta 2–3 settimane prima di trapiantare', 'sovescio'],
    ['Prepara i tutori dei pomodori', 'pomodori'],
    ['Dalla seconda metà del mese, se non gela più, trapianta i pomodori', 'trapiantare'],
    ['Lumache: raccoglile la sera dopo la pioggia', 'difesa'],
  ],
  '05': [
    ['Trapianta zucchine, cetrioli, peperoni, melanzane e meloni', 'trapiantare'],
    ['Lega i pomodori e togli le femminelle', 'pomodori'],
    ['Da fine mese pacciama le colture estive', 'pacciamare'],
    ['Imposta le annaffiature: poche ma abbondanti', 'annaffiare'],
  ],
  '06': [
    ['Annaffia al mattino presto o la sera, alla base delle piante', 'annaffiare'],
    ['Raccogli aglio e cipolle quando le foglie ingialliscono e si piegano'],
    ['Controlla la dorifora sulle patate e le cimici', 'difesa'],
    ['Continua a legare i pomodori e a togliere le femminelle', 'pomodori'],
  ],
  '07': [
    ['Trapianta cavoli, finocchi e radicchi per l\'autunno e l\'inverno, ombreggiandoli nei primi giorni', 'trapiantare'],
    ['Raccogli spesso zucchine, fagiolini e cetrioli: la pianta continua a produrre'],
    ['Dove l\'aiuola resta vuota, semina il grano saraceno come sovescio', 'sovescio'],
    ['Tra fine luglio e inizio agosto cima i pomodori', 'pomodori'],
  ],
  '08': [
    ['Continua i trapianti di cavoli, finocchi e insalate autunnali', 'trapiantare'],
    ['Annaffia con regolarità: è il mese più secco', 'annaffiare'],
    ['Con il caldo secco controlla il ragnetto rosso sotto le foglie', 'difesa'],
    ['Togli le colture finite e prepara le aiuole per l\'autunno'],
  ],
  '09': [
    ['Semina spinaci, valerianella, rucola e ravanelli', 'seminare'],
    ['Raccogli le zucche quando il picciolo è secco e la buccia dura'],
    ['Metti nel compost i residui sani dell\'estate', 'compost'],
    ['Da fine mese semina il sovescio invernale nelle aiuole che restano vuote fino ad aprile', 'sovescio'],
  ],
  '10': [
    ['Pianta aglio, scalogno e cipolle da bulbillo'],
    ['Semina il sovescio (favino, veccia, avena) entro il 20 del mese', 'sovescio'],
    ['Togli le piante estive finite: residui sani nel compost, malati via', 'inverno'],
    ['Raccogli gli ultimi pomodori, anche verdi: maturano in casa'],
  ],
  '11': [
    ['Semina fave e piselli', 'seminare'],
    ['Spargi compost o letame maturo sulle aiuole libere', 'concimare'],
    ['Raccogli le foglie secche: servono per pacciamare e per il compost', 'pacciamare'],
    ['Proteggi insalate e finocchi nelle prime notti fredde', 'inverno'],
  ],
  '12': [
    ['Nelle notti di gelo copri le colture invernali', 'inverno'],
    ['Rigira il compost', 'compost'],
    ['Ripara tutori, reti e recinzioni'],
    ['Rileggi il registro dell\'anno: cosa è andato bene e cosa cambiare'],
  ],
};
