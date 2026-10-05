// Disegni degli ortaggi (SVG fisso, area 60×60) e riconoscimento dal nome della coltura.
// Per aggiungere un ortaggio: una voce in DISEGNI con le parole chiave (minuscole, senza accenti).

const DISEGNI = [
  { parole: ['carot'], svg: `
<ellipse cx="32" cy="47" rx="20" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M15 37 C10 31 7 27 4 23 C9 25 13 30 15 37 Z" fill="#5FA83C"></path><path d="M15 37 C11 29 10 24 10 18 C13 23 15 29 15 37 Z" fill="#6FBF45"></path><path d="M15 38 C9 36 6 35 2 34 C7 33 12 34 15 38 Z" fill="#5FA83C"></path>
<path d="M14 38 C14 34 18 32.5 21 33 L48 40 C51 41 51 43 48 43.5 L21 46 C17 46.5 14 42.5 14 38 Z" fill="#EE7F2D"></path>
<path d="M20 35.2 Q28 36.2 36 38.2" fill="none" stroke="#FFB070" stroke-width="1.4"></path>
<path d="M27 40.5 l1 3 M34 41 l0.8 2.6 M41 41.6 l0.6 2" fill="none" stroke="#B9561C"></path>` },

  { parole: ['pomodor'], svg: `
<ellipse cx="30" cy="48" rx="15" ry="3.2" fill="#4E3220" stroke="none"></ellipse>
<ellipse cx="30" cy="34" rx="15" ry="13" fill="#DB3F2E"></ellipse>
<path d="M30 22 Q25 32 27 46 M30 22 Q35 32 33 46" fill="none" stroke="#B32E22" stroke-width="1"></path>
<circle cx="22.5" cy="28" r="3" fill="#F28B7A" stroke="none"></circle>
<path d="M30 19 L32.3 22.3 L36.5 21.6 L34 24.6 L30 23 L26 24.6 L23.5 21.6 L27.7 22.3 Z" fill="#4E8F32"></path>
<path d="M30 20 V15" fill="none" stroke="#4E8F32" stroke-width="2.2"></path>` },

  { parole: ['lattug', 'insalat'], svg: `
<ellipse cx="30" cy="45" rx="18" ry="3.2" fill="#4E3220" stroke="none"></ellipse>
<path d="M11 41 C8 31 16 24 21 28 C21 19 30 16 32 23 C36 16 47 20 43 29 C51 29 52 40 46 43 Z" fill="#6FAE3A"></path>
<path d="M17 41 C15 33 21 29 25 32 C25 26 33 24 34 29 C38 25 45 29 42 34 C46 36 45 41 42 42 Z" fill="#8CC94F"></path>
<path d="M23 41 C22 35 27 32 30 34 C33 31 38 34 37 41 Z" fill="#C2E383"></path><path d="M30 42 V35 M30 39 L26 35 M30 39 L34 35" fill="none" stroke="#5E9A2E"></path>` },

  { parole: ['cavolfior'], svg: `
<ellipse cx="30" cy="46" rx="16" ry="3.2" fill="#4E3220" stroke="none"></ellipse>
<path d="M30 44 C21 45 13 41 13 32 C18 34 24 37 30 44 Z" fill="#4F8F34"></path><path d="M30 44 C39 45 47 41 47 32 C42 34 36 37 30 44 Z" fill="#4F8F34"></path>
<path d="M30 42 C24 37 22 27 25 20 C29 25 31 33 30 42 Z" fill="#5FA83C"></path><path d="M30 42 C36 37 38 27 35 20 C31 25 29 33 30 42 Z" fill="#5FA83C"></path>
<circle cx="24" cy="33" r="5.5" fill="#F3EAD0"></circle><circle cx="36" cy="33" r="5.5" fill="#F3EAD0"></circle><circle cx="30" cy="28" r="6" fill="#FBF6E6"></circle><circle cx="30" cy="36" r="5.5" fill="#F3EAD0"></circle><circle cx="28" cy="26.5" r="1.4" fill="#FFFFFF" stroke="none"></circle>` },

  { parole: ['zucchin'], svg: `
<ellipse cx="30" cy="46" rx="21" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M10 38 C10 33 14 31 18 31.5 L44 34 C49 34.5 51 37 50 40 C49 43 46 44 42 43.8 L17 43.5 C12 43.3 10 41 10 38 Z" fill="#3D7A2A"></path>
<path d="M15 35 L44 37 M15 39.5 L44 40.5" fill="none" stroke="#8CC46A" stroke-width="1.1"></path>
<path d="M50 37 l5 -2 l0.5 3 l-5 1.5 Z" fill="#5E8F3A"></path>
<path d="M10 37 l-4 -4 l1 4 l-4 1 l4 1 l-1 4 Z" fill="#F2C230"></path>
<path d="M18 33.5 Q30 34 40 35" fill="none" stroke="#B8DE78" stroke-width="1.3"></path>` },

  { parole: ['melanzan'], svg: `
<ellipse cx="32" cy="47" rx="19" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M16 35 C17 28 26 27 34 31 C43 35 51 37 50 42 C49 46.5 41 46.5 32 45 C21 43 15 41 16 35 Z" fill="#5B2A6E"></path>
<path d="M22 33 Q30 33 38 36.5" fill="none" stroke="#9A6BB0" stroke-width="1.8"></path>
<path d="M21 30 L16 26 L17 31 L12 32 L17 34 L15 38 L21 36 Z" fill="#4E8F32"></path>
<path d="M14 27 l-5 -4" fill="none" stroke="#4E8F32" stroke-width="2.4"></path>` },

  { parole: ['peperon'], svg: `
<ellipse cx="30" cy="47" rx="15" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M18 26 C14 30 14 42 20 45 C24 47 27 45 30 44 C33 45 36 47 40 45 C46 42 46 30 42 26 C38 23 22 23 18 26 Z" fill="#DB3F2E"></path>
<path d="M30 28 V43" fill="none" stroke="#A82A1F" stroke-width="1"></path>
<path d="M21 30 Q19 36 21 41" fill="none" stroke="#F28B7A" stroke-width="1.8"></path>
<ellipse cx="30" cy="25" rx="7" ry="2.6" fill="#4E8F32"></ellipse>
<path d="M30 24 C30 19 32 16 36 15" fill="none" stroke="#3E7D28" stroke-width="3"></path>` },

  { parole: ['cetriol'], svg: `
<ellipse cx="30" cy="46" rx="20" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M12 39 C11 34 15 31.5 20 32 L42 34.5 C48 35 50 38 49 41 C48 43.5 45 44 41 43.8 L19 43.5 C14 43.3 12 42 12 39 Z" fill="#2F6B20"></path>
<path d="M18 35 Q30 35.5 42 37.5" fill="none" stroke="#8CC46A" stroke-width="1.4"></path>
<circle cx="20" cy="39" r="0.9" fill="#B8DE78" stroke="none"></circle><circle cx="26" cy="41" r="0.9" fill="#B8DE78" stroke="none"></circle><circle cx="31" cy="39.5" r="0.9" fill="#B8DE78" stroke="none"></circle><circle cx="37" cy="41.5" r="0.9" fill="#B8DE78" stroke="none"></circle><circle cx="43" cy="40" r="0.9" fill="#B8DE78" stroke="none"></circle>
<path d="M49 39 l4 -1" fill="none" stroke="#3E7D28" stroke-width="2"></path>` },

  { parole: ['fagiolin'], svg: `
<ellipse cx="30" cy="44" rx="20" ry="3.5" fill="#4E3220" stroke="none"></ellipse>
<path d="M10 33 C18 28 32 28 46 33 C48 34 48 36 46 36.5 C32 33 18 33 11 36 C9 36 9 34 10 33 Z" fill="#6FB540"></path>
<path d="M12 39 C20 33 34 33 49 37 C51 38 50.5 40.5 48.5 40.5 C34 38 20 38 13 42 C11 42.5 10.5 40 12 39 Z" fill="#7CC04A"></path>
<path d="M14 26 C22 22 34 23 44 28 C46 29 45.5 31.5 43.5 31.3 C34 28 23 27 15 29.5 C13 30 12.5 27 14 26 Z" fill="#5FA83C"></path>
<path d="M46 33 l4 -3 M49 37 l4 -2 M44 28 l3 -4" fill="none" stroke="#3E7D28" stroke-width="1.6"></path>
<path d="M18 26.5 Q26 24.5 34 26 M17 33 Q27 31 37 32 M18 39 Q28 36.5 40 38" fill="none" stroke="#CBEA9A" stroke-width="1.2"></path>` },

  { parole: ['pisell'], svg: `
<ellipse cx="30" cy="45" rx="21" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M9 37 C17 26 43 26 51 35 C43 45 17 46 9 37 Z" fill="#6FB540"></path>
<path d="M13 36.5 C21 30.5 39 30.5 47 35 C39 40 21 41.5 13 36.5 Z" fill="#CBEA9A"></path>
<circle cx="19" cy="36" r="3.4" fill="#5FB03C"></circle><circle cx="26" cy="35.5" r="3.6" fill="#5FB03C"></circle><circle cx="33.5" cy="35.5" r="3.6" fill="#5FB03C"></circle><circle cx="40.5" cy="35.8" r="3.3" fill="#5FB03C"></circle>
<path d="M9 37 l-4 -3" fill="none" stroke="#3E7D28" stroke-width="2"></path>` },

  { parole: ['cipoll'], svg: `
<ellipse cx="30" cy="47" rx="15" ry="3.2" fill="#4E3220" stroke="none"></ellipse>
<path d="M27 46.5 l-2 3 M30 47 v3 M33 46.5 l2 3" fill="none" stroke="#D9CBB0" stroke-width="1.2"></path>
<path d="M30 12 C29 17 27 20 24 22 C14 26 13 40 20 45 C24 47.5 36 47.5 40 45 C47 40 46 26 36 22 C33 20 31 17 30 12 Z" fill="#C98A3E"></path>
<path d="M30 20 C24 26 23 38 26 46 M30 20 C36 26 37 38 34 46" fill="none" stroke="#9B6528" stroke-width="1"></path>
<path d="M19 30 Q20 25 24 23.5" fill="none" stroke="#EDC07F" stroke-width="1.6"></path>` },

  { parole: ['aglio'], svg: `
<ellipse cx="30" cy="47" rx="15" ry="3.5" fill="#4E3220" stroke="none"></ellipse>
<path d="M27 47 l-2 3 M30 47.5 v3 M33 47 l2 3" fill="none" stroke="#D9CBB0" stroke-width="1.2"></path>
<path d="M28 16 C28 12 29 9 30 7 C31 9 32 12 32 16 Z" fill="#E9E0C8"></path>
<path d="M23 21 C14 25 10 35 14 42 C16 45 19 46 21 45 C17 37 18 29 23 21 Z" fill="#E6DCC4"></path>
<path d="M37 21 C46 25 50 35 46 42 C44 45 41 46 39 45 C43 37 42 29 37 21 Z" fill="#E6DCC4"></path>
<path d="M30 16 C21 20 15 30 18 40 C20 45 24 47 27 46 C24 37 24 26 30 16 Z" fill="#F2EADA"></path>
<path d="M30 16 C39 20 45 30 42 40 C40 45 36 47 33 46 C36 37 36 26 30 16 Z" fill="#F2EADA"></path>
<path d="M30 16 C24 24 23 36 26 45 C28 47.5 32 47.5 34 45 C37 36 36 24 30 16 Z" fill="#FBF7EE"></path>
<path d="M19 40 C20 43 23 45.5 26 46 M41 40 C40 43 37 45.5 34 46 M27 43 Q30 45 33 43" fill="none" stroke="#A86FA6" stroke-width="1.5"></path>` },

  { parole: ['patat'], svg: `
<ellipse cx="30" cy="46" rx="21" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M10 37 C10 30 18 28 25 30 C31 31.5 33 36 31 41 C29 45 20 46 15 44 C11 42.5 10 40 10 37 Z" fill="#D2A86A"></path>
<path d="M30 39 C30 33 37 30 44 32 C50 33.5 52 38 50 42 C48 45.5 40 46 35 44.5 C31 43.5 30 41.5 30 39 Z" fill="#C99C5C"></path>
<circle cx="16" cy="35" r="0.8" fill="#8A6538" stroke="none"></circle><circle cx="22" cy="38" r="0.8" fill="#8A6538" stroke="none"></circle><circle cx="38" cy="36" r="0.8" fill="#8A6538" stroke="none"></circle><circle cx="44" cy="39" r="0.8" fill="#8A6538" stroke="none"></circle>
<path d="M14 33 Q17 31 21 31" fill="none" stroke="#EFD3A0" stroke-width="1.4"></path>` },

  { parole: ['biet'], svg: `
<ellipse cx="30" cy="46" rx="21" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M10 43 C18 40 24 37 30 33 M11 45 C20 43 27 41 34 38 M12 41 C17 37 21 33 25 28" fill="none" stroke="#D2373F" stroke-width="2.6"></path>
<path d="M11.5 44 C19 41.5 26 39 32 35.5" fill="none" stroke="#F2C230" stroke-width="2"></path>
<path d="M30 33 C33 24 44 20 52 24 C52 32 42 38 30 33 Z" fill="#3D7A2A"></path>
<path d="M34 38 C40 32 50 32 55 37 C51 43 42 43 34 38 Z" fill="#4F8F34"></path>
<path d="M25 28 C25 19 33 13 41 15 C42 22 35 29 25 28 Z" fill="#5FA83C"></path>
<path d="M31 32 Q41 28 50 25 M35 37.5 Q45 36 53 37 M26 27.5 Q33 21 40 16" fill="none" stroke="#D2373F" stroke-width="1"></path>` },

  { parole: ['finocch'], svg: `
<ellipse cx="30" cy="47" rx="15" ry="3.2" fill="#4E3220" stroke="none"></ellipse>
<path d="M24 26 L23 12 H27 L27.5 26 Z M28.5 26 L29 9 H32 L31.5 26 Z M32.5 26 L35 13 H38.5 L36 26 Z" fill="#B8D88A"></path>
<path d="M25 12 l-3 -4 M25 12 l1 -5 M30.5 9 l-2 -5 M30.5 9 l2 -5 M36.8 13 l1 -5 M36.8 13 l4 -3" fill="none" stroke="#5FA83C" stroke-width="1.3"></path>
<path d="M18 44 C13 36 17 27 25 25 L35 25 C43 27 47 36 42 44 C38 47.5 22 47.5 18 44 Z" fill="#EFF2D8"></path>
<path d="M25 25 C22 32 22 40 25 46 M35 25 C38 32 38 40 35 46 M30 25 V46.5" fill="none" stroke="#C3D59A" stroke-width="1"></path>` },

  { parole: ['broccol'], svg: `
<ellipse cx="30" cy="47" rx="14" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M25 46 L26.5 32 H33.5 L35 46 Z" fill="#9CC46A"></path>
<circle cx="20" cy="27" r="7" fill="#3E7D28"></circle><circle cx="40" cy="27" r="7" fill="#3E7D28"></circle><circle cx="30" cy="20" r="8" fill="#4E8F32"></circle><circle cx="30" cy="30" r="6.5" fill="#3E7D28"></circle><circle cx="24" cy="19" r="5" fill="#4E8F32"></circle><circle cx="36" cy="19" r="5" fill="#4E8F32"></circle>
<circle cx="27" cy="17" r="1.6" fill="#8CC46A" stroke="none"></circle><circle cx="18" cy="25" r="1.3" fill="#8CC46A" stroke="none"></circle><circle cx="38" cy="25" r="1.3" fill="#8CC46A" stroke="none"></circle>` },
];

// Piantina generica per gli ortaggi che non hanno ancora un disegno
const GENERICA = `
<ellipse cx="30" cy="46" rx="12" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M30 46 V30" fill="none" stroke="#3E7D28" stroke-width="2.4"></path>
<path d="M30 36 C22 36 16 30 16 24 C24 24 29 29 30 36 Z" fill="#6FBF45"></path>
<path d="M30 31 C38 31 44 25 44 19 C36 19 31 24 30 31 Z" fill="#5FA83C"></path>`;

// Minuscole e senza accenti: "Pomodòro" → "pomodoro"
function normalizza(testo) {
  return testo.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// SVG completo del disegno adatto al nome della coltura. Il nome serve solo a scegliere: non finisce nell'SVG
export function iconaSvg(nome, tratto = 1.6) {
  const testo = normalizza(nome);
  const disegno = DISEGNI.find(d => d.parole.some(p => testo.includes(p)))?.svg ?? GENERICA;
  return `<svg viewBox="0 0 60 60" stroke="#2B1D12" stroke-width="${tratto}" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">${disegno}</svg>`;
}
