// Terreno delle aiuole: valori di partenza, le cinque prove guidate (con un disegnino per ogni passo)
// e gli avvisi per le colture. Solo dati e calcoli: le schermate stanno in viste.js.
//
// Il terreno sta dentro ogni aiuola, nel campo facoltativo `suolo`:
//   { tessitura: { valore, fonte, da, data, sabbia?, limo?, argilla? }, ph: {...}, calcare: {...},
//     sostanzaOrganica: {...}, drenaggio: {...}, lombrichi: {...}, analisi?: { data, azoto, fosforo, potassio, calcareTotale, metalli } }
// fonte: 'stima' | 'prova' | 'analisi'; da: id della prova ('pugno', 'aceto', 'barattolo', 'buca', 'lombrichi') o 'analisi'

export const TESSITURE = {
  sabbioso: 'Sabbioso',
  medio: 'Medio impasto',
  limoso: 'Limoso',
  'limoso-argilloso': 'Limoso-argilloso',
  argilloso: 'Argilloso',
};

export const DESCRIZIONE_TESSITURA = {
  sabbioso: "Si lavora facilmente e si scalda presto in primavera, ma non trattiene acqua e nutrienti: va bagnato più spesso e concimato poco e spesso.",
  medio: "Il terreno più comodo: trattiene il giusto di acqua e nutrienti e si lavora bene.",
  limoso: "Fine e fertile, ma con la pioggia fa la crosta: tienilo coperto con la pacciamatura.",
  'limoso-argilloso': "Trattiene bene acqua e nutrienti, ma si compatta, fa le zolle se lavorato bagnato e la crosta dopo la pioggia.",
  argilloso: "Ricco ma pesante: trattiene molta acqua, ristagna e si scalda tardi. Migliora con tanto compost e senza calpestarlo.",
};

export const NOMI_PROPRIETA = {
  tessitura: 'Tessitura', ph: 'pH', calcare: 'Calcare', sostanzaOrganica: 'Sostanza organica',
  drenaggio: 'Drenaggio', lombrichi: 'Vita nel terreno',
};

// Valori di partenza: tipici della pianura bolognese, sempre segnati come stima
export function suoloDiPartenza() {
  return {
    tessitura: { valore: 'limoso-argilloso', fonte: 'stima' },
    ph: { valore: '7,5–8', fonte: 'stima' },
    calcare: { valore: 'probabile', fonte: 'stima' },
    sostanzaOrganica: { valore: null, fonte: 'stima' },
    drenaggio: { valore: null, fonte: 'stima' },
    lombrichi: { valore: null, fonte: 'stima' },
  };
}

// Il terreno di un'aiuola, con i valori di partenza dove non c'è niente
export function suoloDi(aiuola) {
  return { ...suoloDiPartenza(), ...(aiuola.suolo ?? {}) };
}

// Testo di un valore per l'utente
export function testoValore(chiave, v) {
  if (!v || v.valore === null || v.valore === undefined || v.valore === '') return 'Non so';
  const x = v.valore;
  if (chiave === 'tessitura') {
    const perc = v.sabbia !== undefined ? ` (sabbia ${v.sabbia}%, limo ${v.limo}%, argilla ${v.argilla}%)` : '';
    return (TESSITURE[x] ?? x) + perc;
  }
  if (chiave === 'ph') return typeof x === 'number' ? String(x).replace('.', ',') : x;
  if (chiave === 'calcare') return { molto: 'Sì, molto', poco: 'Sì, poco', no: 'No', probabile: 'Probabile' }[x] ?? x;
  if (chiave === 'sostanzaOrganica') return typeof x === 'number' ? `${String(x).replace('.', ',')}%` : x;
  if (chiave === 'drenaggio') return `${giudizioDrenaggio(x)} (${String(x).replace('.', ',')} cm all'ora)`;
  if (chiave === 'lombrichi') return `${giudizioLombrichi(x)} (${x} lombrichi)`;
  return String(x);
}

export const giudizioDrenaggio = cm => (cm < 2.5 ? 'Lento' : cm <= 7.5 ? 'Buono' : 'Rapido');
export const giudizioLombrichi = n => (n < 5 ? 'Poca' : n <= 10 ? 'Discreta' : 'Buona');

// Classe di tessitura dalle percentuali (semplificata, per l'orto)
export function classeDaPercentuali(sabbia, limo, argilla) {
  if (argilla >= 40) return 'argilloso';
  if (argilla >= 27) return limo >= 40 ? 'limoso-argilloso' : 'medio';
  if (limo >= 50) return 'limoso';
  if (sabbia >= 70) return 'sabbioso';
  return 'medio';
}

// ---- Disegnini dei passi (area 220 × 110, stesso tratto degli altri disegni) ----

const T = 'stroke="#2B1D12" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"';
const svg = corpo => `<svg viewBox="0 0 220 110" ${T} aria-hidden="true">${corpo}</svg>`;
const TERRA = '#8B5E3C', TERRA_SCURA = '#6E4326', PELLE = '#F1C9A5', PELLE_2 = '#E8B98F', ACQUA = '#9FD3E6', VETRO = '#E9F4F6';
const terreno = (y = 80) => `<path d="M0 ${y} H220 V110 H0 Z" fill="${TERRA}"/><path d="M0 ${y} H220" fill="none"/>`;
const righello = (x, y1, y2) => `<rect x="${x}" y="${y1}" width="10" height="${y2 - y1}" fill="#F2C230"/>`
  + Array.from({ length: Math.floor((y2 - y1) / 6) }, (_, i) => `<path d="M${x} ${y1 + 3 + i * 6} h${i % 2 ? 4 : 6}" stroke-width="1.2" fill="none"/>`).join('');
const etichetta = (x, y, testo, anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Baloo 2, sans-serif" font-size="12" font-weight="700" fill="#2A1E12" stroke="none">${testo}</text>`;
const barattolo = (contenuto = '') => `<path d="M80 14 H140 V22 C146 24 148 28 148 34 V96 C148 102 144 106 138 106 H82 C76 106 72 102 72 96 V34 C72 28 74 24 80 22 Z" fill="${VETRO}"/>
  ${contenuto}<path d="M80 14 H140 V22 H80 Z" fill="#B9C7CA"/><path d="M84 32 V92" stroke="#FFFFFF" stroke-width="3" fill="none"/>`;
// Mano aperta vista dal palmo, dita in su (x, y = centro del palmo)
const manoAperta = (x = 90, y = 80) => `<g transform="translate(${x - 90} ${y - 80})">
  <rect x="38" y="62" width="36" height="14" rx="7" fill="${PELLE}" transform="rotate(-38 66 70)"/>
  <rect x="63" y="26" width="13" height="42" rx="6.5" fill="${PELLE}"/><rect x="77" y="18" width="13" height="50" rx="6.5" fill="${PELLE}"/>
  <rect x="91" y="20" width="13" height="48" rx="6.5" fill="${PELLE}"/><rect x="105" y="30" width="12" height="38" rx="6" fill="${PELLE}"/>
  <path d="M62 106 C57 90 57 70 64 58 H117 C124 70 124 90 118 106 Z" fill="${PELLE}"/>
  <path d="M70 92 q18 6 40 -2" fill="none" stroke="#C98F6A" stroke-width="1.4"/></g>`;
// Dito visto di lato, con l'unghia: da sinistra verso destra (punta a destra) o al contrario
const dito = (x1, x2, y, spessore, colore, punta = 'destra') => {
  const r = spessore / 2;
  const corpo = punta === 'destra'
    ? `M${x1} ${y} H${x2 - r} A${r} ${r} 0 0 1 ${x2 - r} ${y + spessore} H${x1} Z`
    : `M${x1} ${y} H${x2 + r} A${r} ${r} 0 0 0 ${x2 + r} ${y + spessore} H${x1} Z`;
  const unghia = punta === 'destra'
    ? `<path d="M${x2 - r - 12} ${y + 2.5} H${x2 - r} A${r - 3} ${r - 3} 0 0 1 ${x2 - 2.5} ${y + r - 1} H${x2 - r - 12} Z" fill="#F7DED0" stroke-width="1.4"/>`
    : `<path d="M${x2 + r + 12} ${y + 2.5} H${x2 + r} A${r - 3} ${r - 3} 0 0 0 ${x2 + 2.5} ${y + r - 1} H${x2 + r + 12} Z" fill="#F7DED0" stroke-width="1.4"/>`;
  const nocca = punta === 'destra' ? x2 - r - 30 : x2 + r + 30;
  return `<path d="${corpo}" fill="${colore}"/>${unghia}<path d="M${nocca} ${y + 4} q-3 ${r - 4} 0 ${spessore - 8}" fill="none" stroke="#C98F6A" stroke-width="1.4"/>`;
};

const DISEGNI = {
  pugnoPrendi: svg(`${terreno(92)}<path d="M150 92 C152 78 178 74 198 82 L202 92 Z" fill="${TERRA_SCURA}"/>${etichetta(176, 106, 'a 10 cm')}
    ${manoAperta(80, 74)}<path d="M62 76 C64 62 96 58 100 74 C94 80 70 82 62 76 Z" fill="${TERRA}"/>
    <path d="M156 22 C156 30 166 30 166 22 C166 16 161 12 161 8 C161 12 156 16 156 22 Z" fill="${ACQUA}"/>
    <path d="M176 40 C176 46 184 46 184 40 C184 36 180 33 180 30 C180 33 176 36 176 40 Z" fill="${ACQUA}"/>${etichetta(170, 62, 'un po\' d\'acqua')}`),
  pugnoPalla: svg(`${manoAperta(70, 66)}<circle cx="70" cy="54" r="17" fill="${TERRA}"/><path d="M60 46 C64 42 70 41 74 42" fill="none" stroke="#C99460" stroke-width="2"/>
    ${etichetta(70, 106, 'sta insieme')}
    <path d="M150 74 l6 -4 l5 5 l-6 4 Z M168 80 l5 -3 l4 4 l-5 3 Z M158 90 l6 -2 l3 5 l-6 2 Z M178 92 l4 -4 l5 3 l-4 4 Z M188 76 l5 -3 l4 4 l-5 3 Z" fill="${TERRA}"/>
    ${etichetta(172, 106, 'si sbriciola')}<path d="M122 60 h24 M122 60 l6 -5 M122 60 l6 5" fill="none" stroke-width="1.6"/>${etichetta(170, 40, 'oppure?')}`),
  pugnoDita: svg(`${dito(-10, 120, 34, 26, PELLE, 'destra')}${dito(230, 100, 62, 26, PELLE_2, 'sinistra')}
    <circle cx="104" cy="60" r="2.2" fill="${TERRA}" stroke="none"/><circle cx="112" cy="61" r="1.8" fill="${TERRA}" stroke="none"/><circle cx="108" cy="57" r="1.6" fill="${TERRA_SCURA}" stroke="none"/>
    <path d="M40 22 h30 M40 22 l6 -4 M40 22 l6 4 M70 22 l-6 -4 M70 22 l-6 4" fill="none" stroke-width="1.6"/>
    <path d="M120 102 h30 M120 102 l6 -4 M120 102 l6 4 M150 102 l-6 -4 M150 102 l-6 4" fill="none" stroke-width="1.6"/>
    ${etichetta(30, 104, 'indice')}${etichetta(190, 104, 'pollice')}${etichetta(150, 16, 'strofina: granulosa,')}${etichetta(150, 28, 'liscia o appiccicosa?')}`),
  pugnoNastro: svg(`${dito(-10, 96, 28, 26, PELLE, 'destra')}${dito(-10, 90, 58, 24, PELLE_2, 'destra')}
    <path d="M100 52 C122 48 146 52 172 46 C178 45 180 52 175 54 C150 60 124 58 102 62 Z" fill="${TERRA}"/>
    <path d="M112 54 L164 50" fill="none" stroke="#C99460" stroke-width="1.4"/>
    <path d="M102 76 L176 76" stroke="#5C4A36" stroke-width="1.2" stroke-dasharray="3 3" fill="none"/><path d="M102 71 V81 M176 71 V81" stroke="#5C4A36" stroke-width="1.2"/>
    ${etichetta(140, 96, 'quanto si allunga?')}${etichetta(30, 104, 'pollice')}${etichetta(30, 20, 'indice')}`),
  acetoPiattino: svg(`<ellipse cx="110" cy="84" rx="70" ry="14" fill="#FFFFFF"/><ellipse cx="110" cy="80" rx="52" ry="8" fill="#F2EEE6" stroke-width="1.2"/>
    <path d="M86 80 C90 64 128 62 134 80 Z" fill="${TERRA}"/>${etichetta(110, 106, 'un cucchiaio di terra asciutta')}`),
  acetoGocce: svg(`<ellipse cx="80" cy="86" rx="60" ry="12" fill="#FFFFFF"/><path d="M56 84 C60 68 98 66 104 84 Z" fill="${TERRA}"/>
    <circle cx="70" cy="62" r="3" fill="#FFFFFF"/><circle cx="82" cy="56" r="4" fill="#FFFFFF"/><circle cx="92" cy="64" r="2.6" fill="#FFFFFF"/><circle cx="76" cy="50" r="2.2" fill="#FFFFFF"/>
    <path d="M150 10 h22 v8 l10 16 v40 a6 6 0 0 1 -6 6 h-30 a6 6 0 0 1 -6 -6 v-40 l10 -16 Z" fill="#F7E7B4" transform="rotate(-35 160 40)"/>
    <path d="M118 36 C118 42 126 42 126 36 C126 32 122 29 122 26 C122 29 118 32 118 36 Z" fill="#F7E7B4"/>${etichetta(170, 104, 'frizza?')}`),
  barattoloTerra: svg(barattolo(`<path d="M73 74 H147 V96 C147 101 143 105 138 105 H82 C77 105 73 101 73 96 Z" fill="${TERRA}"/>`) + etichetta(154, 94, '1/3 di terra', 'start') + `<path d="M140 90 h10" fill="none" stroke-width="1.4"/>`),
  barattoloAcqua: svg(barattolo(`<path d="M73 34 H147 V96 C147 101 143 105 138 105 H82 C77 105 73 101 73 96 Z" fill="${ACQUA}"/><path d="M73 74 H147 V96 C147 101 143 105 138 105 H82 C77 105 73 101 73 96 Z" fill="${TERRA}"/>`)
    + `<path d="M176 30 l20 -12 a4 4 0 0 1 4 6 l-20 12 Z" fill="#C9C9C9"/><ellipse cx="172" cy="34" rx="8" ry="5" fill="#C9C9C9"/>` + etichetta(36, 58, 'acqua') + etichetta(36, 72, 'fino a 3/4') + etichetta(182, 62, '+ cucchiaino') + etichetta(184, 76, 'di detersivo')),
  barattoloAgita: svg(`<g transform="rotate(-14 110 60)">${barattolo(`<path d="M73 34 H147 V96 C147 101 143 105 138 105 H82 C77 105 73 101 73 96 Z" fill="#A9845E"/>`)}</g>
    <path d="M40 40 q-10 10 0 20 M28 34 q-14 16 0 32 M180 40 q10 10 0 20 M192 34 q14 16 0 32" fill="none" stroke-width="2"/>${etichetta(36, 96, 'agita')}${etichetta(36, 108, '3 minuti')}`),
  barattoloStrati: svg(barattolo(`<path d="M73 30 H147 V54 H73 Z" fill="#DCEBEE"/><path d="M73 54 H147 V68 H73 Z" fill="#7A4A2A"/><path d="M73 68 H147 V84 H73 Z" fill="#B98A5A"/>
    <path d="M73 84 H147 V96 C147 101 143 105 138 105 H82 C77 105 73 101 73 96 Z" fill="#E3C27A"/>`)
    + righello(152, 54, 106) + etichetta(170, 64, 'argilla', 'start') + etichetta(170, 80, 'limo', 'start') + etichetta(170, 98, 'sabbia', 'start')
    + etichetta(40, 98, 'dopo 1 min') + etichetta(40, 80, 'dopo 2 ore') + etichetta(40, 64, 'dopo 1–2 gg')),
  bucaScava: svg(`${terreno(40)}<path d="M70 40 L76 96 H144 L150 40 Z" fill="${TERRA_SCURA}"/><path d="M70 40 L150 40" fill="none"/>
    <path d="M168 10 L186 40" stroke-width="3" fill="none"/><path d="M180 34 L196 30 L200 46 L184 50 Z" fill="#C9C9C9"/>
    <path d="M76 100 H144" stroke="#FFF8E7" stroke-width="1.4" fill="none"/>${etichetta(80, 16, '30 × 30 cm')}${etichetta(80, 30, 'profonda 30 cm')}`),
  bucaRiempi: svg(`${terreno(40)}<path d="M70 40 L76 96 H144 L150 40 Z" fill="${TERRA_SCURA}"/><path d="M73 52 L77 92 H143 L147 52 Z" fill="${ACQUA}"/>
    <path d="M150 10 h30 l10 10 v16 h-40 Z" fill="#7FB65A"/><path d="M150 18 L120 30" stroke-width="4" fill="none"/><path d="M120 30 l-6 2" fill="none"/>
    ${etichetta(60, 22, 'riempi due volte')}`),
  bucaMisura: svg(`${terreno(40)}<path d="M70 40 L76 96 H144 L150 40 Z" fill="${TERRA_SCURA}"/><path d="M75 66 L77 92 H143 L145 66 Z" fill="${ACQUA}"/>${righello(104, 30, 92)}
    <path d="M118 52 h34 M118 66 h34" stroke="#FFF8E7" stroke-width="1.4" stroke-dasharray="3 2" fill="none"/>
    <circle cx="188" cy="22" r="14" fill="#FFFFFF"/><path d="M188 22 V13 M188 22 h7" fill="none"/>${etichetta(186, 60, 'quanto è')}${etichetta(186, 74, 'sceso in')}${etichetta(186, 88, "un'ora?")}`),
  lombriciZolla: svg(`${terreno(70)}<path d="M80 50 L120 40 L150 50 L150 92 L110 102 L80 92 Z" fill="${TERRA}"/><path d="M80 50 L110 60 L150 50 M110 60 V102" fill="none"/>
    <path d="M40 10 L70 56" stroke-width="3" fill="none"/><path d="M62 48 L82 46 L84 66 L66 70 Z" fill="#C9C9C9"/>${etichetta(176, 36, '20 × 20 × 20 cm')}`),
  lombriciConta: svg(`<path d="M10 60 L210 60 L200 104 L20 104 Z" fill="#E8DFC8"/>
    <path d="M40 80 l8 -4 l6 6 l-8 4 Z M150 86 l6 -4 l6 5 l-6 4 Z M110 92 l6 -3 l5 4 l-6 3 Z M176 74 l6 -3 l5 4 l-6 3 Z" fill="${TERRA}"/>
    <path d="M60 86 c6 -6 12 4 18 -2 s10 2 14 -2" fill="none" stroke="#D97A8A" stroke-width="4"/><path d="M120 76 c6 -6 12 4 18 -2 s10 2 14 -2" fill="none" stroke="#D97A8A" stroke-width="4"/>
    <path d="M86 98 c5 -5 10 3 15 -2" fill="none" stroke="#D97A8A" stroke-width="4"/>${etichetta(110, 40, 'sbriciola la zolla e conta i lombrichi')}`),
};

// ---- Le cinque prove: passi con disegno; i passi con "scelte" o "numeri" chiedono una risposta ----

export const PROVE = {
  pugno: {
    nome: 'Prova del pugno', breve: 'Pugno', durata: '2 minuti', misura: 'tessitura',
    passi: [
      { titolo: 'Prendi la terra', disegno: DISEGNI.pugnoPrendi, testo: "Prendi un pugno di terra a circa 10 cm di profondità e togli sassi e radici. Se è secca, bagnala poco alla volta finché è umida come pasta frolla." },
      { titolo: 'Fai una palla', disegno: DISEGNI.pugnoPalla, testo: 'Stringila nel pugno e prova a farne una pallina.', chiave: 'palla',
        scelte: [['sbriciola', 'Si sbriciola, non sta insieme'], ['palla', 'Fa una pallina che sta insieme']] },
      { titolo: 'Strofinala', disegno: DISEGNI.pugnoDita, testo: 'Strofina un pezzetto tra pollice e indice, vicino all\'orecchio. Com\'è?', chiave: 'tatto', se: r => r.palla !== 'sbriciola',
        scelte: [['granulosa', 'Granulosa, si sentono i granelli'], ['liscia', 'Liscia come farina o sapone'], ['appiccicosa', 'Appiccicosa, si attacca alle dita']] },
      { titolo: 'Fai un nastro', disegno: DISEGNI.pugnoNastro, testo: 'Schiaccia la pallina tra pollice e indice, spingendola in avanti come per fare un nastro. Quanto si allunga prima di spezzarsi?', chiave: 'nastro', se: r => r.palla !== 'sbriciola',
        scelte: [['corto', 'Meno di 2,5 cm'], ['medio', 'Tra 2,5 e 5 cm'], ['lungo', 'Più di 5 cm, lucido']] },
    ],
    esito(r) {
      if (r.palla === 'sbriciola') return { tessitura: { valore: 'sabbioso' } };
      const tabella = {
        corto: { granulosa: 'medio', liscia: 'limoso', appiccicosa: 'medio' },
        medio: { granulosa: 'medio', liscia: 'limoso-argilloso', appiccicosa: 'limoso-argilloso' },
        lungo: { granulosa: 'argilloso', liscia: 'limoso-argilloso', appiccicosa: 'argilloso' },
      };
      return { tessitura: { valore: tabella[r.nastro][r.tatto] } };
    },
  },
  aceto: {
    nome: "Prova dell'aceto", breve: 'Aceto', durata: '1 minuto', misura: 'calcare',
    passi: [
      { titolo: 'Prepara la terra', disegno: DISEGNI.acetoPiattino, testo: 'Metti un cucchiaio di terra asciutta in un piattino.' },
      { titolo: "Versa l'aceto", disegno: DISEGNI.acetoGocce, testo: 'Versaci sopra qualche cucchiaio di aceto bianco, guarda e avvicina l\'orecchio. Cosa succede?', chiave: 'frizza',
        scelte: [['molto', 'Fa molta schiuma e frizza forte'], ['poco', 'Frizza poco, si sente appena'], ['no', 'Non succede niente']] },
    ],
    esito: r => ({ calcare: { valore: r.frizza } }),
  },
  barattolo: {
    nome: 'Prova del barattolo', breve: 'Barattolo', durata: '1–2 giorni', misura: 'sabbia, limo, argilla',
    passi: [
      { titolo: 'Metti la terra', disegno: DISEGNI.barattoloTerra, testo: 'Riempi per un terzo un barattolo di vetro da 1 litro con terra presa tra 5 e 20 cm, senza sassi e radici.' },
      { titolo: 'Aggiungi acqua', disegno: DISEGNI.barattoloAcqua, testo: 'Aggiungi acqua fino a tre quarti e un cucchiaino di detersivo in polvere per lavastoviglie: aiuta i granelli a separarsi.' },
      { titolo: 'Agita', disegno: DISEGNI.barattoloAgita, testo: 'Chiudi e agita forte per 3 minuti, poi appoggia il barattolo dove nessuno lo tocca.' },
      { titolo: 'Misura gli strati', disegno: DISEGNI.barattoloStrati, testo: "Dopo 1 minuto segna con un pennarello il fondo che si è depositato (sabbia); dopo 2 ore lo strato sopra (limo); dopo 1–2 giorni, quando l'acqua è limpida, l'ultimo strato (argilla). Scrivi quanto è alto ogni strato, in millimetri.",
        chiave: 'strati', numeri: [['sabbia', 'Sabbia (mm)'], ['limo', 'Limo (mm)'], ['argilla', 'Argilla (mm)']] },
    ],
    esito(r) {
      const { sabbia, limo, argilla } = r.strati;
      const tot = sabbia + limo + argilla;
      const p = v => Math.round(v / tot * 100);
      const ps = p(sabbia), pl = p(limo), pa = 100 - ps - pl;
      return { tessitura: { valore: classeDaPercentuali(ps, pl, pa), sabbia: ps, limo: pl, argilla: pa } };
    },
  },
  buca: {
    nome: 'Prova della buca', breve: 'Buca', durata: '2 ore', misura: 'drenaggio',
    passi: [
      { titolo: 'Scava la buca', disegno: DISEGNI.bucaScava, testo: 'Scava una buca di circa 30 × 30 cm, profonda 30 cm.' },
      { titolo: 'Bagna il terreno', disegno: DISEGNI.bucaRiempi, testo: "Riempila d'acqua e lasciala svuotare: così il terreno intorno si bagna. Poi riempila di nuovo fino all'orlo." },
      { titolo: "Misura dopo un'ora", disegno: DISEGNI.bucaMisura, testo: "Metti un righello o un bastoncino segnato nella buca. Dopo un'ora guarda di quanti centimetri è sceso il livello dell'acqua.",
        chiave: 'sceso', numeri: [['cm', 'Centimetri scesi in un\'ora']] },
    ],
    esito: r => ({ drenaggio: { valore: r.sceso.cm } }),
  },
  lombrichi: {
    nome: 'Conta dei lombrichi', breve: 'Lombrichi', durata: '5 minuti', misura: 'vita nel terreno',
    passi: [
      { titolo: 'Prendi una zolla', disegno: DISEGNI.lombriciZolla, testo: "Con la vanga togli una zolla di circa 20 × 20 cm, profonda 20 cm. Meglio in primavera o in autunno, con la terra umida." },
      { titolo: 'Conta', disegno: DISEGNI.lombriciConta, testo: 'Sbriciola la zolla su un telo o un sacco e conta i lombrichi che trovi. Poi rimetti tutto a posto.',
        chiave: 'conta', numeri: [['n', 'Lombrichi trovati']] },
    ],
    esito: r => ({ lombrichi: { valore: r.conta.n } }),
  },
};

// Spiegazione del risultato di una prova
export function spiegaEsito(id, esito) {
  if (esito.tessitura) {
    const t = esito.tessitura;
    const perc = t.sabbia !== undefined ? ` (sabbia ${t.sabbia}%, limo ${t.limo}%, argilla ${t.argilla}%)` : '';
    return `Terreno ${TESSITURE[t.valore].toLowerCase()}${perc}. ${DESCRIZIONE_TESSITURA[t.valore]}`;
  }
  if (esito.calcare) {
    return {
      molto: 'Terreno molto calcareo: il pH è quasi certamente sopra 7,5. Niente cenere né calce.',
      poco: 'Un po\' di calcare: il pH è probabilmente intorno a 7–7,5.',
      no: 'Niente calcare: il pH è probabilmente sotto 7. Se vuoi saperlo con precisione serve un\'analisi.',
    }[esito.calcare.valore];
  }
  if (esito.drenaggio) {
    const g = giudizioDrenaggio(esito.drenaggio.valore);
    return {
      Lento: "Drenaggio lento: d'inverno l'acqua ristagna. Alza l'aiuola di 10–15 cm spostando la terra dai passaggi.",
      Buono: "Drenaggio buono: l'acqua scende senza ristagnare.",
      Rapido: "Drenaggio rapido: l'acqua scende in fretta, bagna più spesso e usa la pacciamatura.",
    }[g];
  }
  if (esito.lombrichi) {
    return {
      Poca: 'Pochi lombrichi: il terreno ha poca vita. Aggiungi compost e tienilo sempre coperto.',
      Discreta: 'Un numero discreto di lombrichi: il terreno sta bene, il compost lo migliorerà ancora.',
      Buona: 'Tanti lombrichi: ottimo segno, il terreno è vivo e ben strutturato.',
    }[giudizioLombrichi(esito.lombrichi.valore)];
  }
  return '';
}

// ---- Avvisi: per il terreno in generale e per una coltura in certe aiuole ----

const sensibiliRistagno = ['aglio', 'cipolla', 'scalogno', 'carciofo', 'asparago', 'patata', 'fragola', 'rosmarino', 'salvia', 'timo', 'lavanda'];

// Consigli per il terreno di un'aiuola (pagina del terreno)
export function consigliTerreno(suolo) {
  const c = [];
  const t = suolo.tessitura?.valore;
  if (t === 'argilloso' || t === 'limoso-argilloso') c.push(['Terreno pesante', 'Non calpestarlo, lavoralo solo in tempera e aggiungi compost ogni anno: è l\'unico rimedio che funziona. Niente sabbia.']);
  if (t === 'sabbioso') c.push(['Terreno sabbioso', 'Bagna più spesso e poco alla volta, concima poco e spesso, pacciama sempre.']);
  const calc = suolo.calcare?.valore;
  if (calc === 'molto' || calc === 'poco' || calc === 'probabile' || (typeof suolo.ph?.valore === 'number' && suolo.ph.valore >= 7.5)) {
    c.push(['Terreno calcareo', 'Niente cenere né calce: alzerebbero ancora il pH.']);
  }
  if (typeof suolo.drenaggio?.valore === 'number' && suolo.drenaggio.valore < 2.5) c.push(['Drenaggio lento', "Alza l'aiuola di 10–15 cm: d'inverno non ristagna."]);
  if (typeof suolo.lombrichi?.valore === 'number' && suolo.lombrichi.valore < 5) c.push(['Poca vita nel terreno', 'Aggiungi compost e tieni la terra sempre coperta.']);
  return c;
}

// Avvisi per una coltura (voce del catalogo) nelle aiuole scelte: [titolo, testo, aiuole]
export function avvisiTerrenoColtura(scheda, aiuole) {
  if (!scheda || aiuole.length === 0) return [];
  const avvisi = [];
  const con = test => aiuole.filter(a => test(suoloDi(a))).map(a => a.id);
  const pesanti = con(s => ['argilloso', 'limoso-argilloso'].includes(s.tessitura?.valore));
  if (scheda.id === 'carota' && pesanti.length) {
    avvisi.push(['Carote e terreno argilloso. ', 'Le carote lunghe si deformano: scegli varietà corte o tonde e copri il seme con compost setacciato.', pesanti]);
  }
  const lente = con(s => typeof s.drenaggio?.valore === 'number' && s.drenaggio.valore < 2.5);
  if (sensibiliRistagno.includes(scheda.id) && lente.length) {
    avvisi.push(['Drenaggio lento. ', "Questa coltura soffre i ristagni d'acqua: alza l'aiuola di 10–15 cm prima di piantare.", lente]);
  }
  const sabbiose = con(s => s.tessitura?.valore === 'sabbioso');
  if (['alta', 'media'].includes(scheda.esigenza) && sabbiose.length) {
    avvisi.push(['Terreno sabbioso. ', `${scheda.nome} vuole acqua e nutrimento regolari: bagna spesso, concima poco e spesso e pacciama.`, sabbiose]);
  }
  return avvisi;
}
