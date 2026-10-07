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
// Mano aperta, palmo verso chi guarda: un solo contorno con dita affusolate (spostata di dx, dy)
const manoAperta = (dx = 0, dy = 0) => `<g transform="translate(${dx} ${dy})">
  <path d="M50 108 C50 96 46 86 44 80 C40 72 30 62 24 56 C20 52 24 46 30 49 C38 53 46 62 52 66
    C52 52 52 40 53 30 C53 23 63 23 64 30 L66 54 C66 40 67 26 68 18 C69 11 79 11 79 18 L80 52
    C81 40 82 28 83 22 C84 15 94 16 93 23 L93 54 C94 46 96 38 98 33 C100 27 109 29 107 36 C105 46 106 60 106 70
    C106 82 100 92 98 108 Z" fill="${PELLE}"/>
  <path d="M66 54 L66 60 M80 52 L80 58 M93 54 L93 60" fill="none" stroke="#C98F6A" stroke-width="1.5"/>
  <path d="M58 82 C68 86 84 86 98 78 M54 70 C60 76 64 82 62 92" fill="none" stroke="#C98F6A" stroke-width="1.5"/></g>`;
const DISEGNI = {
  pugnoPrendi: svg(`${terreno(92)}<path d="M150 92 C152 78 178 74 198 82 L202 92 Z" fill="${TERRA_SCURA}"/>${etichetta(176, 106, 'a 10 cm')}
    ${manoAperta(0, -2)}<path d="M58 78 C60 66 90 64 96 76 C90 84 64 86 58 78 Z" fill="${TERRA}"/>
    <path d="M156 22 C156 30 166 30 166 22 C166 16 161 12 161 8 C161 12 156 16 156 22 Z" fill="${ACQUA}"/>
    <path d="M176 40 C176 46 184 46 184 40 C184 36 180 33 180 30 C180 33 176 36 176 40 Z" fill="${ACQUA}"/>${etichetta(170, 62, 'un po\' d\'acqua')}`),
  pugnoPalla: svg(`${manoAperta(-6, -2)}<circle cx="74" cy="70" r="15" fill="${TERRA}"/><path d="M66 63 C69 60 74 59 77 60" fill="none" stroke="#C99460" stroke-width="2"/>
    ${etichetta(170, 30, 'sta insieme?')}<path d="M126 44 L104 60" fill="none" stroke-width="1.6"/><path d="M104 60 l3 -7 M104 60 l7 -2" fill="none" stroke-width="1.6"/>
    <path d="M150 70 l6 -4 l5 5 l-6 4 Z M168 76 l5 -3 l4 4 l-5 3 Z M158 88 l6 -2 l3 5 l-6 2 Z M180 86 l4 -4 l5 3 l-4 4 Z M190 72 l5 -3 l4 4 l-5 3 Z" fill="${TERRA}"/>
    ${etichetta(172, 106, 'o si sbriciola?')}`),
  pugnoDita: svg(`
    <circle cx="40" cy="48" r="26" fill="#C99460"/><circle cx="30" cy="40" r="3" fill="${TERRA_SCURA}"/><circle cx="44" cy="36" r="2.6" fill="${TERRA}"/><circle cx="50" cy="50" r="3.2" fill="${TERRA_SCURA}"/>
    <circle cx="34" cy="56" r="2.8" fill="${TERRA}"/><circle cx="44" cy="62" r="2.2" fill="${TERRA_SCURA}"/><circle cx="26" cy="50" r="2" fill="${TERRA}"/><circle cx="56" cy="40" r="2" fill="${TERRA}"/>
    <circle cx="110" cy="48" r="26" fill="#A87A55"/><path d="M92 40 C102 36 116 36 128 42 M92 54 C104 50 118 52 128 56" fill="none" stroke="#C99A72" stroke-width="2"/>
    <circle cx="180" cy="48" r="26" fill="#7A4A2A"/><path d="M164 30 C170 46 168 56 166 70 M180 26 C184 42 184 56 180 72 M194 32 C192 46 194 56 196 66" fill="none" stroke="#A86F48" stroke-width="2.2"/>
    <path d="M168 66 q2 6 -2 10 M182 70 q3 6 0 10" fill="none" stroke="#7A4A2A" stroke-width="3"/>
    ${etichetta(40, 94, 'granulosa')}${etichetta(40, 107, 'sabbia')}${etichetta(110, 94, 'liscia')}${etichetta(110, 107, 'limo')}${etichetta(180, 94, 'appiccicosa')}${etichetta(180, 107, 'argilla')}`),
  pugnoNastro: svg(`
    <circle cx="26" cy="44" r="14" fill="${TERRA}"/><path d="M18 38 C21 35 26 34 29 35" fill="none" stroke="#C99460" stroke-width="2"/>
    <path d="M44 44 h14 M52 38 l6 6 -6 6" fill="none" stroke-width="1.6"/>
    <path d="M66 38 C96 34 128 40 160 36 C168 35 170 44 162 46 C130 50 98 46 68 50 C62 50 60 39 66 38 Z" fill="${TERRA}"/>
    <path d="M76 42 L154 40" fill="none" stroke="#C99460" stroke-width="1.4"/>
    <rect x="64" y="60" width="140" height="18" rx="2" fill="#F2C230"/>
    ${Array.from({ length: 15 }, (_, i) => `<path d="M${68 + i * 9.3} 60 v${i % 5 === 0 ? 9 : 5}" stroke-width="1.2" fill="none"/>`).join('')}
    <path d="M64 60 H87 V78 H64 Z" fill="#F7DC74" stroke="none"/><path d="M87 60 H110.5 V78 H87 Z" fill="#E9B83C" stroke="none"/><rect x="64" y="60" width="140" height="18" rx="2" fill="none"/><path d="M87 56 V82 M110.5 56 V82" stroke="#5C4A36" stroke-width="2" fill="none"/>
    ${etichetta(72, 96, '< 2,5')}${etichetta(99, 108, '2,5–5')}${etichetta(158, 96, 'più di 5 cm')}`),
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
    <g transform="translate(-12 3) rotate(-22 175 22)">
      <path d="M160 14 C160 2 192 2 192 14" fill="none" stroke-width="4"/>
      <path d="M156 14 H196 L192 40 C192 43 189 45 186 45 H166 C163 45 160 43 160 40 Z" fill="#7FB65A"/>
      <path d="M158 22 H194" fill="none" stroke="#B8DE8A" stroke-width="2"/>
      <path d="M160 32 L124 22 L126 17 L160 26 Z" fill="#6AA34A"/>
      <path d="M124 14 L120 26 L126 27 L130 15 Z" fill="#6AA34A"/>
    </g>
    <path d="M112 47 l-3 10 M117 48 l-2 10 M122 48 l-1 10" fill="none" stroke="${ACQUA}" stroke-width="2.4"/>
    ${etichetta(52, 22, 'riempi due volte')}`),
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
