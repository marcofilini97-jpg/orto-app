// Disegni degli ortaggi (SVG fisso, area 60×60) e riconoscimento dal nome della coltura.
// Per aggiungere un ortaggio: una voce in DISEGNI con le parole chiave (minuscole, senza accenti).

// L'ordine conta: vince la prima parola chiave trovata (es. "erba cipollina" prima di "cipolla")
const DISEGNI = [
  { parole: ['erba cipollina', 'cipollina'], svg: `
<ellipse cx="30" cy="47" rx="12" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M26 46 C24 36 21 26 18 16 M28 46 C27 34 26 22 25 10 M30 46 V8 M32 46 C33 34 34 22 36 12 M34 46 C36 36 39 26 42 18" fill="none" stroke="#4E9A3A" stroke-width="2.6"></path>
<path d="M29 46 C28 38 26 28 24 20 M31 46 C32 38 33 30 33 24" fill="none" stroke="#7FB65A" stroke-width="1.2"></path>
<circle cx="18" cy="13" r="4.2" fill="#B07AC8"></circle><circle cx="36" cy="9" r="4.2" fill="#B07AC8"></circle>
<path d="M16.5 11.5 l1 1 M19 14 l1 1 M34.5 7.5 l1 1 M37 10 l1 1" fill="none" stroke="#D8B2EA" stroke-width="1"></path>` },

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

  // Gruppo 2
  { parole: ['verz'], svg: `
<ellipse cx="30" cy="47" rx="17" ry="3.2" fill="#4E3220" stroke="none"></ellipse>
<path d="M13 40 C9 30 16 22 24 24 C28 16 40 18 41 25 C49 25 52 36 46 43 C40 47 20 47 13 40 Z" fill="#6F9E45"></path>
<circle cx="30" cy="35" r="11" fill="#A7CF72"></circle>
<path d="M30 24 C26 29 25 37 27 46 M30 24 C34 29 35 37 33 46 M20 32 Q25 34 28 39 M40 32 Q35 34 32 39" fill="none" stroke="#5E8F3A" stroke-width="1"></path>
<path d="M22 28 Q24 25 27 24.5" fill="none" stroke="#D2EBA8" stroke-width="1.4"></path>` },

  { parole: ['cavolo nero'], svg: `
<ellipse cx="30" cy="47" rx="16" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M28 46 C20 40 14 26 16 10 C22 16 27 30 28 46 Z" fill="#2F4F3A"></path>
<path d="M32 46 C40 40 46 26 44 11 C38 17 33 30 32 46 Z" fill="#2F4F3A"></path>
<path d="M30 46 C27 34 27 18 31 6 C34 18 33 34 30 46 Z" fill="#3A5E45"></path>
<path d="M27 44 C22 34 19 24 17 13 M30 44 C29.5 32 30 18 31 8 M33 44 C38 34 41 24 43 14" fill="none" stroke="#8FAE95" stroke-width="1"></path>` },

  { parole: ['cappucc', 'cavol'], svg: `
<ellipse cx="30" cy="47" rx="17" ry="3.2" fill="#4E3220" stroke="none"></ellipse>
<path d="M12 42 C8 30 18 22 30 24 C42 22 52 30 48 42 C42 47 18 47 12 42 Z" fill="#8DBE5A"></path>
<circle cx="30" cy="34" r="12" fill="#CBE5A0"></circle>
<path d="M19 35 Q24 26 35 24 M41 33 Q38 41 28 45 M22 41 Q30 38 36 30" fill="none" stroke="#8DBE5A" stroke-width="1.3"></path>
<path d="M22 29 Q24 25 28 24" fill="none" stroke="#EEF7DA" stroke-width="1.6"></path>` },

  { parole: ['spinac'], svg: `
<ellipse cx="30" cy="47" rx="15" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M30 46 L21 30 M30 46 L39 30 M30 46 V26 M30 46 L23 39 M30 46 L37 39" fill="none" stroke="#8CC46A" stroke-width="1.8"></path>
<path d="M21 31 C13 31 9 21 15 15 C23 15 25 25 21 31 Z" fill="#2E6B2A"></path>
<path d="M39 31 C47 31 51 21 45 15 C37 15 35 25 39 31 Z" fill="#2E6B2A"></path>
<path d="M30 27 C22 23 22 11 30 6 C38 11 38 23 30 27 Z" fill="#3D7A2A"></path>
<path d="M23 40 C15 42 9 36 11 30 C17 30 23 34 23 40 Z" fill="#3D7A2A"></path>
<path d="M37 40 C45 42 51 36 49 30 C43 30 37 34 37 40 Z" fill="#3D7A2A"></path>` },

  { parole: ['valerian', 'songino', 'gallinell'], svg: `
<ellipse cx="30" cy="45" rx="16" ry="3" fill="#4E3220" stroke="none"></ellipse>
<ellipse cx="30" cy="29" rx="4" ry="8" fill="#4F8F3A"></ellipse>
<ellipse cx="30" cy="29" rx="4" ry="8" transform="rotate(60 30 37)" fill="#3F7F35"></ellipse>
<ellipse cx="30" cy="29" rx="4" ry="8" transform="rotate(120 30 37)" fill="#4F8F3A"></ellipse>
<ellipse cx="30" cy="29" rx="4" ry="8" transform="rotate(180 30 37)" fill="#3F7F35"></ellipse>
<ellipse cx="30" cy="29" rx="4" ry="8" transform="rotate(240 30 37)" fill="#4F8F3A"></ellipse>
<ellipse cx="30" cy="29" rx="4" ry="8" transform="rotate(300 30 37)" fill="#3F7F35"></ellipse>
<circle cx="30" cy="37" r="2.4" fill="#8CC46A"></circle>` },

  { parole: ['rucol', 'rucchet'], svg: `
<ellipse cx="30" cy="47" rx="14" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M28 46 C25 38 22 32 18 24 L14 25 L16 21 L11 19 L16 16 L13 12 L19 13 C23 21 27 32 29 46 Z" fill="#4E8F32"></path>
<path d="M32 46 C35 38 38 32 42 24 L46 25 L44 21 L49 19 L44 16 L47 12 L41 13 C37 21 33 32 31 46 Z" fill="#4E8F32"></path>
<path d="M30 46 C29 36 28 26 27 18 L23 17 L27 14 L24 10 L29 9 L28 5 L32 8 L34 5 L33 10 L37 11 L33 14 L36 17 L32 18 C31 27 31 36 30 46 Z" fill="#5FA83C"></path>
<path d="M28.5 45 C26 35 22 26 18 18 M31.5 45 C34 35 38 26 42 18 M30 45 C30 34 30 22 30 10" fill="none" stroke="#A8D27A" stroke-width="1"></path>` },

  { parole: ['ravanell'], svg: `
<ellipse cx="30" cy="47" rx="19" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M17 32 C10 26 8 18 12 13 C18 17 19 25 17 32 Z" fill="#5FA83C"></path>
<path d="M19 31 C18 22 22 15 27 14 C28 21 25 27 19 31 Z" fill="#6FBF45"></path>
<path d="M31 39 C38 40.5 45 42 53 44 C45 44.5 38 44 31 43 Z" fill="#F4EEE6"></path>
<circle cx="24" cy="38" r="9" fill="#D83A55"></circle>
<path d="M19 34 Q21 31 24 30.5" fill="none" stroke="#F49AAC" stroke-width="1.6"></path>` },

  { parole: ['carciof'], svg: `
<ellipse cx="30" cy="48" rx="13" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M28 47 L28.5 37 H31.5 L32 47 Z" fill="#7F9A55"></path>
<path d="M30 9 C17 17 14 31 21 38 C25 41.5 35 41.5 39 38 C46 31 43 17 30 9 Z" fill="#6E8F4A"></path>
<path d="M30 9 C24 13 22 17 22 21 Q30 15 38 21 C38 17 36 13 30 9 Z" fill="#8A5A8A"></path>
<path d="M21 37 Q25.5 28 30 37 Q34.5 28 39 37 M19 29 Q24.5 20 30 29 Q35.5 20 41 29 M23 21 Q26.5 14 30 21 Q33.5 14 37 21" fill="none" stroke="#3E5F2A" stroke-width="1.1"></path>` },

  { parole: ['radicch'], svg: `
<ellipse cx="30" cy="47" rx="17" ry="3.2" fill="#4E3220" stroke="none"></ellipse>
<path d="M13 40 C10 30 18 22 30 23 C42 22 50 30 47 40 C42 46 18 46 13 40 Z" fill="#7A1F3A"></path>
<circle cx="30" cy="34" r="11" fill="#A8294E"></circle>
<path d="M30 24 C26 30 26 38 28 45 M30 24 C34 30 34 38 32 45 M20 32 Q25 33 27 40 M40 32 Q35 33 33 40" fill="none" stroke="#F4E6EA" stroke-width="1.4"></path>` },

  { parole: ['cicori', 'catalogn'], svg: `
<ellipse cx="30" cy="47" rx="14" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M27 46 C20 36 15 22 18 8 C24 14 28 28 27 46 Z" fill="#5FA83C"></path>
<path d="M33 46 C40 36 45 22 42 8 C36 14 32 28 33 46 Z" fill="#5FA83C"></path>
<path d="M30 46 C26 32 26 18 30 5 C34 18 34 32 30 46 Z" fill="#7CC04A"></path>
<path d="M27 45 C23 34 20 22 19 12 M33 45 C37 34 40 22 41 12 M30 45 C29.5 32 29.5 18 30 8" fill="none" stroke="#F2F2E0" stroke-width="1.5"></path>` },

  { parole: ['porr'], svg: `
<ellipse cx="32" cy="46" rx="22" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M40 35 C46 30 51 26 55 21 C54 27 49 32 44 36.5 Z" fill="#3D7A2A"></path>
<path d="M40 41 C46 43 51 45 56 48 C51 49 45 46 40 43 Z" fill="#3D7A2A"></path>
<path d="M40 37 C47 36 52 35 57 34 C53 37.5 47 39.5 40 40 Z" fill="#4F8F34"></path>
<path d="M32 35 L40 34.5 L40 41.5 L32 41 Z" fill="#C8E39A"></path>
<path d="M10 38 C10 35.5 12 34.5 14 34.5 L32 35 L32 41 L14 41.8 C12 41.8 10 40.8 10 38 Z" fill="#F4F2E6"></path>` },

  { parole: ['scalogn'], svg: `
<ellipse cx="31" cy="47" rx="19" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M14 44 C10 38 14 28 22 26 C24 22 26 20 27 18 C28 21 28 24 28 27 C34 31 32 42 26 45 C22 46.5 17 46 14 44 Z" fill="#C77A55"></path>
<path d="M32 45 C30 38 34 30 41 29 C43 25 45 23 46 21 C46.5 24 46 27 46 30 C51 34 50 42 45 45 C41 47 35 47 32 45 Z" fill="#B5674A"></path>
<path d="M22 27 C18 32 18 40 20 45 M41 30 C38 35 38 41 39 46" fill="none" stroke="#8E4A30" stroke-width="1"></path>` },

  { parole: ['fava', 'fave'], svg: `
<ellipse cx="30" cy="46" rx="22" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M8 38 C10 30 20 28 26 31 C30 27 36 27 40 31 C46 29 52 32 52 37 C52 42 46 44 40 42 C36 45 30 45 26 42 C20 45 10 44 8 38 Z" fill="#6FAE3A"></path>
<path d="M12 37 Q30 39.5 48 37" fill="none" stroke="#4E8F32" stroke-width="1"></path>
<path d="M15 33 Q19 31 23 33 M29 31.5 Q33 30 37 32 M42 33 Q45.5 32 48.5 34" fill="none" stroke="#C2E383" stroke-width="1.4"></path>` },

  { parole: ['fagiol', 'borlott'], svg: `
<ellipse cx="30" cy="46" rx="21" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M8 34 C16 27 40 27 52 34 C53 36 52 38 50 38 C40 33 18 33 10 38 C8 39 7 36 8 34 Z" fill="#F2E2C0"></path>
<path d="M14 33 l3 2 M20 31 l4 3 M27 30.5 l3 3 M34 31 l4 3 M41 32 l3 2.5" fill="none" stroke="#C0394A" stroke-width="1.6"></path>
<ellipse cx="22" cy="42.5" rx="4.5" ry="3.2" fill="#EED9C0"></ellipse><ellipse cx="33" cy="43" rx="4.5" ry="3.2" fill="#EED9C0"></ellipse>
<path d="M20 41.5 l1.5 1 M23 43 l1.5 0.5 M31 42 l1.5 1 M34 43.5 l1.5 0.5" fill="none" stroke="#B3304A" stroke-width="1.3"></path>` },

  { parole: ['zucca', 'zucche'], svg: `
<ellipse cx="30" cy="48" rx="19" ry="3" fill="#4E3220" stroke="none"></ellipse>
<ellipse cx="30" cy="36" rx="19" ry="12" fill="#E8822A"></ellipse>
<path d="M30 24 C24 28 24 44 30 48 M30 24 C36 28 36 44 30 48 M20 26 C14 31 14 41 20 46 M40 26 C46 31 46 41 40 46" fill="none" stroke="#B85E1A" stroke-width="1.2"></path>
<path d="M30 25 C29 20 31 17 34 15" fill="none" stroke="#6B4A2A" stroke-width="3"></path>
<path d="M16 32 Q18 28 22 26.5" fill="none" stroke="#F7B46A" stroke-width="1.6"></path>` },

  { parole: ['mais', 'granoturc'], svg: `
<ellipse cx="30" cy="46" rx="21" ry="3" fill="#4E3220" stroke="none"></ellipse>
<g transform="rotate(-20 30 34)">
<path d="M16 34 C10 26 7 22 4 17 C11 21 15 27 19 30 Z" fill="#8CC46A"></path>
<path d="M16 34 C10 42 7 46 4 51 C11 47 15 41 19 38 Z" fill="#7CB45A"></path>
<rect x="15" y="28" width="35" height="12" rx="6" fill="#F2C230"></rect>
<path d="M21 28.5 V39.5 M26 28 V40 M31 28 V40 M36 28 V40 M41 28 V40 M46 28.5 V39.5 M15.5 32 H49.5 M15.5 36 H49.5" fill="none" stroke="#D49A1A" stroke-width="0.8"></path>
</g>` },

  { parole: ['melon'], svg: `
<ellipse cx="30" cy="48" rx="15" ry="3" fill="#4E3220" stroke="none"></ellipse>
<circle cx="30" cy="34" r="14" fill="#E3C98A"></circle>
<path d="M18 27 Q30 35 42 27 M16.5 34 Q30 42 43.5 34 M18 41 Q30 48 42 41 M22 22 Q26 34 22 46 M30 20 V48 M38 22 Q34 34 38 46" fill="none" stroke="#B89A55" stroke-width="0.9"></path>
<path d="M30 20 q1 -4 4 -5" fill="none" stroke="#5E8F3A" stroke-width="2"></path>` },

  { parole: ['anguri', 'cocomer'], svg: `
<ellipse cx="30" cy="47" rx="21" ry="3" fill="#4E3220" stroke="none"></ellipse>
<ellipse cx="30" cy="35" rx="20" ry="12" fill="#5DA34A"></ellipse>
<path d="M12 31 Q16 29 20 31 Q24 33 28 31 Q32 29 36 31 Q40 33 44 31 Q47 30 48 31 M11 36 Q15 34 19 36 Q23 38 27 36 Q31 34 35 36 Q39 38 43 36 Q47 34 49 36 M13 41 Q17 39 21 41 Q25 43 29 41 Q33 39 37 41 Q41 43 45 41 M17 26 Q21 24 25 26 Q29 28 33 26 Q37 24 41 26" fill="none" stroke="#1F5A26" stroke-width="2.2"></path>
<path d="M50 35 l4 -2" fill="none" stroke="#6B4A2A" stroke-width="2"></path>` },

  { parole: ['asparag'], svg: `
<ellipse cx="30" cy="48" rx="13" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M21 47 L18.5 15 C18.5 11 21.5 11 21.5 15 L24 47 Z" fill="#7CB45A"></path>
<path d="M28.5 47 L28.5 11 C28.5 7 31.5 7 31.5 11 L31.5 47 Z" fill="#8CC46A"></path>
<path d="M36 47 L38.5 15 C38.5 11 41.5 11 41.5 15 L39 47 Z" fill="#7CB45A"></path>
<path d="M18.5 16 C18 10 20 7 20 7 C20 7 22 10 21.5 16 Z" fill="#8A6A9A"></path>
<path d="M28.5 12 C28 6 30 3 30 3 C30 3 32 6 31.5 12 Z" fill="#8A6A9A"></path>
<path d="M38.5 16 C38 10 40 7 40 7 C40 7 42 10 41.5 16 Z" fill="#8A6A9A"></path>
<rect x="17" y="34" width="26" height="4.5" rx="1.5" fill="#D9A86C"></rect>` },

  { parole: ['fragol'], svg: `
<ellipse cx="30" cy="48" rx="13" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M30 47 C20 41 15 31 18 25 C21 20 27 21 30 23 C33 21 39 20 42 25 C45 31 40 41 30 47 Z" fill="#E0303A"></path>
<path d="M30 23 L23 18 L28 20 L30 14 L32 20 L37 18 Z" fill="#4E8F32"></path>
<path d="M30 17 V12" fill="none" stroke="#4E8F32" stroke-width="2"></path>
<ellipse cx="24" cy="28" rx="0.8" ry="1.2" fill="#F2D25A" stroke="none"></ellipse><ellipse cx="30" cy="29" rx="0.8" ry="1.2" fill="#F2D25A" stroke="none"></ellipse><ellipse cx="36" cy="28" rx="0.8" ry="1.2" fill="#F2D25A" stroke="none"></ellipse><ellipse cx="25" cy="35" rx="0.8" ry="1.2" fill="#F2D25A" stroke="none"></ellipse><ellipse cx="35" cy="35" rx="0.8" ry="1.2" fill="#F2D25A" stroke="none"></ellipse><ellipse cx="30" cy="41" rx="0.8" ry="1.2" fill="#F2D25A" stroke="none"></ellipse>` },

  // Gruppo 3: aromatiche, fiori, sovesci, frutta
  { parole: ['basilic'], svg: `
<ellipse cx="30" cy="47" rx="13" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M30 46 V12" fill="none" stroke="#3E7D28" stroke-width="2.4"></path>
<ellipse cx="21" cy="37" rx="9" ry="5.5" transform="rotate(-20 21 37)" fill="#4FAE3A"></ellipse><ellipse cx="39" cy="37" rx="9" ry="5.5" transform="rotate(20 39 37)" fill="#4FAE3A"></ellipse>
<ellipse cx="22.5" cy="26" rx="7.5" ry="4.5" transform="rotate(-25 22.5 26)" fill="#5FBE45"></ellipse><ellipse cx="37.5" cy="26" rx="7.5" ry="4.5" transform="rotate(25 37.5 26)" fill="#5FBE45"></ellipse>
<ellipse cx="30" cy="13" rx="4" ry="6" fill="#7AD255"></ellipse>
<path d="M14 39 L28 35 M46 39 L32 35 M17 28 L28 24.5 M43 28 L32 24.5" fill="none" stroke="#B8E890" stroke-width="1"></path>
<g fill="none" stroke="#B8E890" stroke-width="0.8">
<path transform="translate(21 37) rotate(-20)" d="M-4.5 0 l-2 -3.6 M-4.5 0 l-2 3.6 M0 0 l-2 -4.2 M0 0 l-2 4.2 M4.5 0 l-1.6 -3.4 M4.5 0 l-1.6 3.4"></path>
<path transform="translate(39 37) rotate(20)" d="M4.5 0 l2 -3.6 M4.5 0 l2 3.6 M0 0 l2 -4.2 M0 0 l2 4.2 M-4.5 0 l1.6 -3.4 M-4.5 0 l1.6 3.4"></path>
<path transform="translate(22.5 26) rotate(-25)" d="M-3.5 0 l-1.8 -3 M-3.5 0 l-1.8 3 M1 0 l-1.8 -3.4 M1 0 l-1.8 3.4"></path>
<path transform="translate(37.5 26) rotate(25)" d="M3.5 0 l1.8 -3 M3.5 0 l1.8 3 M-1 0 l1.8 -3.4 M-1 0 l1.8 3.4"></path>
<path d="M30 17 V9 M30 14 l-2.4 -2 M30 14 l2.4 -2 M30 11 l-1.8 -1.6 M30 11 l1.8 -1.6"></path>
</g>` },

  { parole: ['prezzemol'], svg: `
<ellipse cx="30" cy="47" rx="13" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M30 46 L20 22 M30 46 L30 16 M30 46 L40 22 M30 46 L23 33 M30 46 L37 33" fill="none" stroke="#6FAE3A" stroke-width="1.6"></path>
<path transform="translate(20 23) rotate(-25) scale(1.25)" d="M0 0 C-2 -2 -5 -2 -6 -5 L-4 -5 L-5 -8 L-2 -7 L-1 -10 L1 -7 L4 -8 L3 -5 L6 -5 C5 -2 2 -2 0 0 Z" fill="#2F7A2A"></path>
<path transform="translate(30 17) scale(1.35)" d="M0 0 C-2 -2 -5 -2 -6 -5 L-4 -5 L-5 -8 L-2 -7 L-1 -10 L1 -7 L4 -8 L3 -5 L6 -5 C5 -2 2 -2 0 0 Z" fill="#2A6E26"></path>
<path transform="translate(40 23) rotate(25) scale(1.25)" d="M0 0 C-2 -2 -5 -2 -6 -5 L-4 -5 L-5 -8 L-2 -7 L-1 -10 L1 -7 L4 -8 L3 -5 L6 -5 C5 -2 2 -2 0 0 Z" fill="#2F7A2A"></path>
<path transform="translate(23 33) rotate(-55)" d="M0 0 C-2 -2 -5 -2 -6 -5 L-4 -5 L-5 -8 L-2 -7 L-1 -10 L1 -7 L4 -8 L3 -5 L6 -5 C5 -2 2 -2 0 0 Z" fill="#3A8A30"></path>
<path transform="translate(37 33) rotate(55)" d="M0 0 C-2 -2 -5 -2 -6 -5 L-4 -5 L-5 -8 L-2 -7 L-1 -10 L1 -7 L4 -8 L3 -5 L6 -5 C5 -2 2 -2 0 0 Z" fill="#3A8A30"></path>
<path d="M20 23 L16.5 14.5 M30 17 V4.5 M40 23 L43.5 14.5" fill="none" stroke="#8CC46A" stroke-width="0.9"></path>` },

  { parole: ['rosmarin'], svg: `
<ellipse cx="30" cy="46" rx="18" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M12 44 C22 34 34 24 48 12" fill="none" stroke="#7A5A3A" stroke-width="2.4"></path>
<g fill="#2A4A34" stroke-width="0.6">
<path d="M16 40 L12.5 33 L17.2 39 Z M16 40 L23 42.5 L16.6 41.2 Z"></path>
<path d="M20 36.5 L16.5 29.5 L21.2 35.5 Z M20 36.5 L27 39 L20.6 37.7 Z"></path>
<path d="M24 33 L20.5 26 L25.2 32 Z M24 33 L31 35.5 L24.6 34.2 Z"></path>
<path d="M28 29.5 L24.5 22.5 L29.2 28.5 Z M28 29.5 L35 32 L28.6 30.7 Z"></path>
<path d="M32 26 L28.5 19 L33.2 25 Z M32 26 L39 28.5 L32.6 27.2 Z"></path>
<path d="M36 22.5 L32.5 15.5 L37.2 21.5 Z M36 22.5 L43 25 L36.6 23.7 Z"></path>
<path d="M40 19 L37 12.5 L41.2 18 Z M40 19 L46 21 L40.6 20.2 Z"></path>
<path d="M44 15.5 L42 10 L45 14.6 Z M44 15.5 L49 16.8 L44.6 16.5 Z"></path>
<path d="M47 13 L49.5 7 L48.2 12.8 Z M47 13 L52 10.5 L48 13.6 Z"></path>
</g>
<circle cx="25" cy="27" r="1.8" fill="#8FA8E0" stroke="none"></circle><circle cx="37" cy="17" r="1.8" fill="#8FA8E0" stroke="none"></circle>` },

  { parole: ['salvia'], svg: `
<ellipse cx="30" cy="47" rx="15" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M30 46 V20" fill="none" stroke="#6E8A5A" stroke-width="2"></path>
<path d="M30 31 C20 33 12 27 14 19 C22 17 28 23 30 31 Z" fill="#8FA88A"></path><path d="M30 31 C40 33 48 27 46 19 C38 17 32 23 30 31 Z" fill="#8FA88A"></path>
<path d="M30 22 C24 18 24 8 30 4 C36 8 36 18 30 22 Z" fill="#9DB596"></path>
<path d="M30 41 C24 43 18 40 18 36 C23 35 28 37 30 41 Z M30 41 C36 43 42 40 42 36 C37 35 32 37 30 41 Z" fill="#9DB596"></path>` },

  { parole: ['timo'], svg: `
<ellipse cx="30" cy="46" rx="21" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M10 44 C10 34 18 26 30 26 C42 26 50 34 50 44 Z" fill="#5E8A5A"></path>
<ellipse cx="18" cy="38" rx="1.5" ry="2.3" fill="#86AE7E" stroke="none"></ellipse><ellipse cx="24" cy="33" rx="1.5" ry="2.3" fill="#86AE7E" stroke="none"></ellipse><ellipse cx="31" cy="31" rx="1.5" ry="2.3" fill="#86AE7E" stroke="none"></ellipse><ellipse cx="38" cy="34" rx="1.5" ry="2.3" fill="#86AE7E" stroke="none"></ellipse><ellipse cx="43" cy="39" rx="1.5" ry="2.3" fill="#86AE7E" stroke="none"></ellipse><ellipse cx="28" cy="39" rx="1.5" ry="2.3" fill="#86AE7E" stroke="none"></ellipse>
<circle cx="21" cy="30" r="1.6" fill="#D48AB8"></circle><circle cx="32" cy="26" r="1.6" fill="#D48AB8"></circle><circle cx="41" cy="30" r="1.6" fill="#D48AB8"></circle>` },

  { parole: ['origan'], svg: `
<ellipse cx="30" cy="47" rx="14" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M30 46 C28 36 22 26 20 16 M30 46 V12 M30 46 C32 36 38 26 40 16" fill="none" stroke="#6E7A4A" stroke-width="1.6"></path>
<circle cx="24" cy="32" r="2.6" fill="#5E9A4A"></circle><circle cx="27" cy="36" r="2.6" fill="#5E9A4A"></circle><circle cx="22" cy="24" r="2.4" fill="#5E9A4A"></circle><circle cx="30" cy="28" r="2.6" fill="#6FAE58"></circle><circle cx="30" cy="20" r="2.4" fill="#6FAE58"></circle><circle cx="36" cy="32" r="2.6" fill="#5E9A4A"></circle><circle cx="33" cy="36" r="2.6" fill="#5E9A4A"></circle><circle cx="38" cy="24" r="2.4" fill="#5E9A4A"></circle>
<circle cx="19" cy="14" r="2" fill="#F0D2E6"></circle><circle cx="21.5" cy="12" r="2" fill="#F0D2E6"></circle><circle cx="29" cy="10" r="2" fill="#F0D2E6"></circle><circle cx="31.5" cy="11" r="2" fill="#F0D2E6"></circle><circle cx="39" cy="14" r="2" fill="#F0D2E6"></circle><circle cx="41.5" cy="12" r="2" fill="#F0D2E6"></circle>` },

  { parole: ['menta'], svg: `
<ellipse cx="30" cy="47" rx="14" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M30 46 V10" fill="none" stroke="#4E8F4A" stroke-width="2.2"></path>
<path d="M30 39 C24 33 14 35 12 41 C18 45 26 43 30 39 Z M30 39 C36 33 46 35 48 41 C42 45 34 43 30 39 Z" fill="#4FBF6A"></path>
<path d="M30 28 C25 22 16 24 14 29 C20 33 27 31 30 28 Z M30 28 C35 22 44 24 46 29 C40 33 33 31 30 28 Z" fill="#5FCB7A"></path>
<path d="M30 17 C27 12 21 13 20 17 C24 20 28 19 30 17 Z M30 17 C33 12 39 13 40 17 C36 20 32 19 30 17 Z" fill="#7AD88E"></path>
<path d="M14 40.5 L28 39.5 M46 40.5 L32 39.5 M16 28.5 L28 28 M44 28.5 L32 28" fill="none" stroke="#C2F0CC" stroke-width="1"></path>` },

  { parole: ['lavand'], svg: `
<ellipse cx="30" cy="47" rx="15" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M24 46 L19 14 M30 46 V10 M36 46 L41 14" fill="none" stroke="#7A9A6A" stroke-width="1.6"></path>
<path d="M22 46 C18 42 16 38 16 34 M38 46 C42 42 44 38 44 34 M26 46 C24 42 23 39 23 36 M34 46 C36 42 37 39 37 36" fill="none" stroke="#9DB596" stroke-width="2.2"></path>
<ellipse cx="19" cy="14" rx="2.6" ry="2.2" fill="#8A6CC8"></ellipse><ellipse cx="19.6" cy="18" rx="2.6" ry="2.2" fill="#7A5CB8"></ellipse><ellipse cx="20.2" cy="22" rx="2.6" ry="2.2" fill="#8A6CC8"></ellipse>
<ellipse cx="30" cy="10" rx="2.6" ry="2.2" fill="#8A6CC8"></ellipse><ellipse cx="30" cy="14" rx="2.6" ry="2.2" fill="#7A5CB8"></ellipse><ellipse cx="30" cy="18" rx="2.6" ry="2.2" fill="#8A6CC8"></ellipse><ellipse cx="30" cy="22" rx="2.6" ry="2.2" fill="#7A5CB8"></ellipse>
<ellipse cx="41" cy="14" rx="2.6" ry="2.2" fill="#8A6CC8"></ellipse><ellipse cx="40.4" cy="18" rx="2.6" ry="2.2" fill="#7A5CB8"></ellipse><ellipse cx="39.8" cy="22" rx="2.6" ry="2.2" fill="#8A6CC8"></ellipse>` },

  { parole: ['santolin'], svg: `
<ellipse cx="30" cy="46" rx="20" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M22 32 V20 M30 30 V14 M38 32 V20" fill="none" stroke="#8A9A80" stroke-width="1.4"></path>
<path d="M11 44 C11 36 18 30 30 30 C42 30 49 36 49 44 Z" fill="#A7B5A0"></path>
<path d="M16 40 l2 -2 M22 36 l2 -2 M30 34 l2 -2 M38 36 l2 -2 M43 40 l2 -2 M26 41 l2 -2 M34 41 l2 -2" fill="none" stroke="#C8D2C2" stroke-width="1.2"></path>
<circle cx="22" cy="19" r="3.6" fill="#F2C230"></circle><circle cx="30" cy="13" r="3.6" fill="#F2C230"></circle><circle cx="38" cy="19" r="3.6" fill="#F2C230"></circle>` },

  { parole: ['calendul'], svg: `
<ellipse cx="30" cy="47" rx="13" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M30 31 V46" fill="none" stroke="#4E8F32" stroke-width="2.4"></path>
<path d="M30 42 C22 42 16 38 15 33 C21 32 27 36 30 42 Z M30 40 C38 40 44 36 45 31 C39 30 33 34 30 40 Z" fill="#5FA83C"></path>
<ellipse cx="30" cy="17" rx="3" ry="6.5" fill="#F28C1E"></ellipse><ellipse cx="30" cy="17" rx="3" ry="6.5" transform="rotate(30 30 25)" fill="#F59A2E"></ellipse><ellipse cx="30" cy="17" rx="3" ry="6.5" transform="rotate(60 30 25)" fill="#F28C1E"></ellipse><ellipse cx="30" cy="17" rx="3" ry="6.5" transform="rotate(90 30 25)" fill="#F59A2E"></ellipse><ellipse cx="30" cy="17" rx="3" ry="6.5" transform="rotate(120 30 25)" fill="#F28C1E"></ellipse><ellipse cx="30" cy="17" rx="3" ry="6.5" transform="rotate(150 30 25)" fill="#F59A2E"></ellipse><ellipse cx="30" cy="17" rx="3" ry="6.5" transform="rotate(180 30 25)" fill="#F28C1E"></ellipse><ellipse cx="30" cy="17" rx="3" ry="6.5" transform="rotate(210 30 25)" fill="#F59A2E"></ellipse><ellipse cx="30" cy="17" rx="3" ry="6.5" transform="rotate(240 30 25)" fill="#F28C1E"></ellipse><ellipse cx="30" cy="17" rx="3" ry="6.5" transform="rotate(270 30 25)" fill="#F59A2E"></ellipse><ellipse cx="30" cy="17" rx="3" ry="6.5" transform="rotate(300 30 25)" fill="#F28C1E"></ellipse><ellipse cx="30" cy="17" rx="3" ry="6.5" transform="rotate(330 30 25)" fill="#F59A2E"></ellipse>
<circle cx="30" cy="25" r="5" fill="#B5651D"></circle>` },

  { parole: ['aliss'], svg: `
<ellipse cx="30" cy="46" rx="22" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M8 44 C8 37 16 31 30 31 C44 31 52 37 52 44 Z" fill="#5E9A4A"></path>
<g fill="#FFFFFF" stroke="none">
<circle cx="14" cy="40" r="1.9"></circle><circle cx="18" cy="37" r="1.9"></circle><circle cx="22" cy="40" r="1.9"></circle><circle cx="23" cy="34.5" r="1.9"></circle><circle cx="27" cy="37.5" r="1.9"></circle><circle cx="30" cy="33.5" r="1.9"></circle><circle cx="31" cy="40.5" r="1.9"></circle><circle cx="34" cy="36.5" r="1.9"></circle><circle cx="37" cy="33.5" r="1.9"></circle><circle cx="38" cy="40" r="1.9"></circle><circle cx="42" cy="37" r="1.9"></circle><circle cx="46" cy="40.5" r="1.9"></circle><circle cx="18" cy="42.5" r="1.9"></circle><circle cx="26" cy="42.5" r="1.9"></circle><circle cx="35" cy="42.5" r="1.9"></circle><circle cx="43" cy="42.5" r="1.9"></circle>
</g>` },

  { parole: ['facelia', 'phacelia'], svg: `
<ellipse cx="30" cy="47" rx="14" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M30 46 C30 36 31 28 34 20" fill="none" stroke="#5E8A4A" stroke-width="2"></path>
<path d="M30 40 L22 38 L24 36 L19 34 L23 33 L19 30 L25 31 C27 34 29 37 30 40 Z M30 36 L38 34 L36 32 L41 30 L37 29 L41 26 L35 27 C33 30 31 33 30 36 Z" fill="#5FA83C"></path>
<circle cx="35" cy="19" r="2.8" fill="#9A8AE0"></circle><circle cx="37.5" cy="15" r="2.8" fill="#9A8AE0"></circle><circle cx="36" cy="10.5" r="2.8" fill="#9A8AE0"></circle><circle cx="32" cy="8.5" r="2.8" fill="#9A8AE0"></circle><circle cx="28" cy="10" r="2.6" fill="#9A8AE0"></circle><circle cx="26.5" cy="14" r="2.4" fill="#9A8AE0"></circle><circle cx="29" cy="16.5" r="2.2" fill="#B8ACF0"></circle>` },

  { parole: ['borragin'], svg: `
<ellipse cx="30" cy="47" rx="17" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M30 40 C30 32 26 26 22 22 M30 40 C32 30 35 22 38 16" fill="none" stroke="#5E8A5A" stroke-width="1.8"></path>
<path d="M30 45 C20 47 11 42 12 35 C19 34 26 38 30 45 Z M30 45 C40 47 49 42 48 35 C41 34 34 38 30 45 Z" fill="#4F8F5A"></path>
<path transform="translate(22 22)" d="M0 -7 L1.76 -2.43 L6.66 -2.16 L2.85 0.93 L4.11 5.66 L0 3 L-4.11 5.66 L-2.85 0.93 L-6.66 -2.16 L-1.76 -2.43 Z" fill="#4A7BE0"></path>
<path transform="translate(38 16)" d="M0 -7 L1.76 -2.43 L6.66 -2.16 L2.85 0.93 L4.11 5.66 L0 3 L-4.11 5.66 L-2.85 0.93 L-6.66 -2.16 L-1.76 -2.43 Z" fill="#5A8AF0"></path>
<circle cx="22" cy="22" r="1.6" fill="#2B1D12"></circle><circle cx="38" cy="16" r="1.6" fill="#2B1D12"></circle>` },

  { parole: ['favino'], svg: `
<ellipse cx="30" cy="47" rx="14" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M30 46 V8" fill="none" stroke="#5E8A4A" stroke-width="2.2"></path>
<ellipse cx="23" cy="36" rx="6" ry="3.5" transform="rotate(-20 23 36)" fill="#6E9A5E"></ellipse><ellipse cx="37" cy="30" rx="6" ry="3.5" transform="rotate(20 37 30)" fill="#6E9A5E"></ellipse><ellipse cx="23" cy="20" rx="5.5" ry="3.2" transform="rotate(-20 23 20)" fill="#7AAA6A"></ellipse><ellipse cx="37" cy="14" rx="5" ry="3" transform="rotate(20 37 14)" fill="#7AAA6A"></ellipse>
<path d="M31 40 C34 40 37 42 38 46 C35 46 32 44 31 40 Z M29 27 C26 27 23 29 22 33 C25 33 28 31 29 27 Z" fill="#2F5A26"></path>
<path d="M31 22 c3 -1 5 0 5 2 c-2 1 -4 0 -5 -2 Z M29 11 c-3 -1 -5 0 -5 2 c2 1 4 0 5 -2 Z" fill="#FFFFFF"></path>` },

  { parole: ['veccia'], svg: `
<ellipse cx="30" cy="47" rx="18" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M16 46 C20 36 26 28 34 22 C40 18 44 14 46 8" fill="none" stroke="#5E8A4A" stroke-width="1.8"></path>
<path d="M46 8 q4 -3 2 -6 q-2 -1 -3 1 M34 22 q6 -4 9 0 q1 3 -2 3" fill="none" stroke="#7FB65A" stroke-width="1"></path>
<path d="M22 36 L12 30 M26 30 L18 22" fill="none" stroke="#5E8A4A" stroke-width="1"></path>
<ellipse cx="13" cy="30.5" rx="2.4" ry="1.4" fill="#6FAE4A"></ellipse><ellipse cx="16" cy="32.3" rx="2.4" ry="1.4" fill="#6FAE4A"></ellipse><ellipse cx="19" cy="34.1" rx="2.4" ry="1.4" fill="#6FAE4A"></ellipse><ellipse cx="19" cy="22.8" rx="2.4" ry="1.4" fill="#6FAE4A"></ellipse><ellipse cx="21.5" cy="25.3" rx="2.4" ry="1.4" fill="#6FAE4A"></ellipse><ellipse cx="24" cy="27.8" rx="2.4" ry="1.4" fill="#6FAE4A"></ellipse>
<path d="M36 25 c3 -2 6 0 6 3 c-3 1 -6 0 -6 -3 Z M40 17 c3 -2 6 0 6 3 c-3 1 -6 0 -6 -3 Z M30 30 c3 -2 6 0 6 3 c-3 1 -6 0 -6 -3 Z" fill="#A0509A"></path>` },

  { parole: ['avena'], svg: `
<ellipse cx="30" cy="47" rx="12" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M30 46 C30 34 30 22 32 8" fill="none" stroke="#B8A85A" stroke-width="1.8"></path>
<path d="M31 14 C26 16 22 20 20 25 M31 20 C36 22 40 26 42 31 M30.5 26 C26 28 23 32 22 37 M31 11 C35 12 38 15 40 19" fill="none" stroke="#B8A85A" stroke-width="1"></path>
<path d="M20 25 C18 27 18 30 20 31 C22 30 22 27 20 25 Z M42 31 C40 33 40 36 42 37 C44 36 44 33 42 31 Z M22 37 C20 39 20 42 22 43 C24 42 24 39 22 37 Z M40 19 C38 21 38 24 40 25 C42 24 42 21 40 19 Z M32 8 C30 10 30 13 32 14 C34 13 34 10 32 8 Z" fill="#D9C27A"></path>
<path d="M30 40 C25 38 20 39 17 42 M30 34 C35 32 40 33 43 36" fill="none" stroke="#7FA65A" stroke-width="1.8"></path>` },

  { parole: ['orzo'], svg: `
<ellipse cx="30" cy="47" rx="12" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M30 46 V26" fill="none" stroke="#C9A04A" stroke-width="1.8"></path>
<path d="M27 26 L20 4 M33 26 L40 4 M27 21 L22 3 M33 21 L38 3 M28 16 L25 2 M32 16 L35 2 M30 14 V1" fill="none" stroke="#D9B85A" stroke-width="0.9"></path>
<ellipse cx="27.5" cy="26" rx="2.6" ry="3.4" transform="rotate(-20 27.5 26)" fill="#E3B85A"></ellipse><ellipse cx="32.5" cy="26" rx="2.6" ry="3.4" transform="rotate(20 32.5 26)" fill="#E3B85A"></ellipse>
<ellipse cx="27.5" cy="21" rx="2.6" ry="3.4" transform="rotate(-20 27.5 21)" fill="#EBC46A"></ellipse><ellipse cx="32.5" cy="21" rx="2.6" ry="3.4" transform="rotate(20 32.5 21)" fill="#EBC46A"></ellipse>
<ellipse cx="28" cy="16" rx="2.4" ry="3.2" transform="rotate(-20 28 16)" fill="#E3B85A"></ellipse><ellipse cx="32" cy="16" rx="2.4" ry="3.2" transform="rotate(20 32 16)" fill="#E3B85A"></ellipse>
<path d="M30 40 C25 38 21 38 18 41" fill="none" stroke="#9AB05A" stroke-width="1.8"></path>` },

  { parole: ['saracen'], svg: `
<ellipse cx="30" cy="47" rx="14" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M30 46 C29 36 28 26 26 16 M29 32 C33 28 37 24 39 18" fill="none" stroke="#B5545A" stroke-width="2"></path>
<path d="M29 40 C22 41 16 37 16 31 C22 31 27 35 29 40 Z M29 30 C34 30 40 32 42 37 C36 38 31 35 29 30 Z" fill="#5FA83C"></path>
<g fill="#FBE6EE"><circle cx="24" cy="13" r="2.2"></circle><circle cx="27.5" cy="12" r="2.2"></circle><circle cx="25" cy="16.5" r="2.2"></circle><circle cx="28" cy="15.5" r="2"></circle><circle cx="37.5" cy="15" r="2.2"></circle><circle cx="41" cy="14.5" r="2.2"></circle><circle cx="39" cy="18" r="2"></circle></g>` },

  { parole: ['pesc'], svg: `
<ellipse cx="30" cy="48" rx="14" ry="3" fill="#4E3220" stroke="none"></ellipse>
<circle cx="30" cy="34" r="13" fill="#F5A65B"></circle>
<path d="M30 21 C38 22 43 28 43 35 C43 42 37 47 31 47 C37 42 38 30 30 21 Z" fill="#E8705A" stroke="none"></path>
<circle cx="30" cy="34" r="13" fill="none"></circle>
<path d="M30 22 Q26 34 30 46" fill="none" stroke="#C9603E" stroke-width="1.2"></path>
<path d="M30 21 C30 17 31 15 33 13" fill="none" stroke="#6B4A2A" stroke-width="2"></path>
<path d="M32 15 C36 9 44 9 46 12 C42 16 36 17 32 15 Z" fill="#5FA83C"></path>
<path d="M23 27 Q25 24 28 23" fill="none" stroke="#FFD2A6" stroke-width="1.6"></path>` },

  { parole: ['vite', 'uva'], svg: `
<ellipse cx="30" cy="48" rx="12" ry="3" fill="#4E3220" stroke="none"></ellipse>
<path d="M30 16 C30 12 32 9 35 7" fill="none" stroke="#6B4A2A" stroke-width="2"></path>
<path d="M33 9 C34 2 44 1 47 6 C50 10 46 15 40 14 C37 14 34 12 33 9 Z" fill="#5FA83C"></path>
<g fill="#6A3C8A"><circle cx="24" cy="20" r="4"></circle><circle cx="31" cy="19" r="4"></circle><circle cx="38" cy="20" r="4"></circle><circle cx="27.5" cy="26.5" r="4"></circle><circle cx="34.5" cy="26.5" r="4"></circle><circle cx="21" cy="27" r="3.6"></circle><circle cx="31" cy="33" r="4"></circle><circle cx="24.5" cy="33.5" r="3.6"></circle><circle cx="37.5" cy="32.5" r="3.6"></circle><circle cx="28" cy="39.5" r="3.8"></circle><circle cx="34.5" cy="39" r="3.6"></circle><circle cx="31" cy="45" r="3.4"></circle></g>` },
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
