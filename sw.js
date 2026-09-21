/* ============================================================
   Service worker — deixa o jogo funcionar offline e como app.

   Estratégia: "cache primeiro, atualiza em segundo plano".
   O jogo abre na hora (do cache) e, quando há internet, baixa a
   versão nova; ela aparece na próxima vez que abrir.

   IMPORTANTE ao publicar mudanças:
   - Editou arquivos existentes? Nada a fazer (atualiza sozinho).
   - Criou um arquivo NOVO que o jogo precisa (imagem, som...)?
     Adicione-o em PRECACHE e aumente VERSION.
   ============================================================ */

const VERSION = 'v1';
const CACHE = 'jogo-dos-cliques-' + VERSION;

const PRECACHE = [
    './',
    'index.html',
    'styles.css',
    'script.js',
    'minigames.js',
    'manifest.webmanifest',
    'fonts/nunito-latin.woff2',
    'sounds/correct.mp3',
    'sounds/wrong.mp3',
    'icons/icon.svg',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE)
            .then((cache) => cache.addAll(PRECACHE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((k) => k.startsWith('jogo-dos-cliques-') && k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    const url = new URL(req.url);
    if (req.method !== 'GET' || url.origin !== self.location.origin) return;

    event.respondWith(
        caches.match(req, { ignoreSearch: true }).then((cached) => {
            const network = fetch(req)
                .then((res) => {
                    if (res && res.ok) {
                        const copy = res.clone();
                        caches.open(CACHE).then((cache) => cache.put(req, copy));
                    }
                    return res;
                })
                .catch(() => cached || (req.mode === 'navigate' ? caches.match('index.html') : undefined));
            return cached || network;
        })
    );
});
