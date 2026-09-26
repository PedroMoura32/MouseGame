/* ============================================================
   Service worker — deixa o jogo funcionar offline e como app.

   Estratégia (F2-06): "cache primeiro, verifica atualização de vez
   em quando". O jogo abre na hora, direto do cache, SEM buscar nada
   na rede — só quando abre a tela do jogo (navegação) é que, em
   segundo plano, verifica se faz mais de 1 dia desde a última
   checagem; se sim, baixa os arquivos de novo e atualiza o cache
   pra próxima abertura. Antes disso, toda pergunta/imagem/som saía
   pela rede em paralelo ao cache, gastando dado à toa numa criança
   que já tinha tudo salvo.

   IMPORTANTE ao publicar mudanças:
   - Editou arquivos existentes? Nada a fazer (a checagem periódica
     pega sozinha, em até 1 dia — ou o navegador percebe o sw.js
     mudado e atualiza mais cedo).
   - Criou um arquivo NOVO que o jogo precisa (imagem, som...)?
     Adicione-o em PRECACHE e aumente VERSION (assim ele entra no
     cache na hora, sem esperar a checagem periódica).
   ============================================================ */

const VERSION = 'v1';
const CACHE = 'jogo-dos-cliques-' + VERSION;
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // não verifica de novo antes de 1 dia
const LAST_CHECK_KEY = new Request('__sw-last-check__');

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

// Verifica se faz mais de 1 dia desde a última vez e, se sim, baixa PRECACHE de
// novo por trás dos panos (não atrasa nem interfere na tela que já está aberta).
async function maybeCheckForUpdate() {
    const cache = await caches.open(CACHE);
    const marker = await cache.match(LAST_CHECK_KEY);
    const last = marker ? Number(await marker.text()) : 0;
    if (Date.now() - last < CHECK_INTERVAL_MS) return;

    await cache.put(LAST_CHECK_KEY, new Response(String(Date.now())));
    await Promise.all(PRECACHE.map(async (path) => {
        try {
            const res = await fetch(path, { cache: 'no-store' });
            if (res && res.ok) await cache.put(path, res);
        } catch (_) { /* sem internet agora: tenta nas próximas aberturas */ }
    }));
}

self.addEventListener('fetch', (event) => {
    const req = event.request;
    const url = new URL(req.url);
    if (req.method !== 'GET' || url.origin !== self.location.origin) return;

    event.respondWith(
        caches.match(req, { ignoreSearch: true }).then((cached) => {
            if (cached) {
                // Só liga a checagem de atualização ao abrir/recarregar a página em
                // si (navegação) — não a cada arquivo (imagem, som, etc.) pedido por ela.
                if (req.mode === 'navigate') event.waitUntil(maybeCheckForUpdate());
                return cached;
            }
            // Nada em cache (arquivo novo desde a última visita): busca na rede.
            return fetch(req).catch(() => (req.mode === 'navigate' ? caches.match('index.html') : undefined));
        })
    );
});
