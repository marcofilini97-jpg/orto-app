// Service worker: con la rete prende sempre la versione più recente e ne tiene una copia;
// senza rete usa la copia salvata.
// Ogni nuovo file dell'app va aggiunto a FILE.
const CACHE = 'orto-v3';
const FILE = [
  './', './index.html', './manifest.webmanifest', './css/style.css',
  './js/app.js', './js/dati.js', './js/server.js', './js/viste.js', './js/disegni.js', './js/catalogo.js', './js/terreno.js', './js/arcade.js',
  './font/baloo2.woff2', './font/fredoka.woff2', './icone/icona-192.png', './icone/icona-512.png', './icone/terra-arata.svg',
];

// Alla prima installazione salva una copia di tutti i file
self.addEventListener('install', evento => {
  evento.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILE)));
  self.skipWaiting();
});

// Cancella le copie di versioni vecchie del service worker
self.addEventListener('activate', evento => {
  evento.waitUntil(caches.keys().then(nomi =>
    Promise.all(nomi.filter(n => n !== CACHE).map(n => caches.delete(n)))));
  self.clients.claim();
});

// Prima la rete (chiedendo sempre al server se il file è cambiato), poi la copia salvata
self.addEventListener('fetch', evento => {
  if (evento.request.method !== 'GET') return;
  // Le richieste verso altri siti (es. Supabase) non si toccano: servono i loro dati di accesso
  if (new URL(evento.request.url).origin !== self.location.origin) return;
  evento.respondWith((async () => {
    try {
      const risposta = await fetch(evento.request.url, { cache: 'no-cache' });
      const cache = await caches.open(CACHE);
      cache.put(evento.request, risposta.clone());
      return risposta;
    } catch {
      return (await caches.match(evento.request, { ignoreSearch: true }))
        ?? caches.match('./index.html');
    }
  })());
});
