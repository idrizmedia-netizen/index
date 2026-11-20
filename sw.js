// Ziyomap service worker.
// Strategiya: HTML — avval tarmoq (yangi kontent), oflayn bo'lsa kesh; statik fayllar
// (rasm/css/js/shrift) — avval kesh, fonda yangilanadi. /api/* va boshqa domenlar KESHLANMAYDI.
const CACHE_NAME = 'ziyomap-v3';
const PRECACHE = ['/', '/index.html', '/icon-192x192.png', '/icon-512x512.png', '/favicon.ico'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;   // Firebase, CDN va h.k. — brauzerga qoldiramiz
    if (url.pathname.startsWith('/api/')) return;      // AI/Telegram so'rovlari hech qachon keshlanmaydi

    const isHtml = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

    if (isHtml) {
        event.respondWith(
            fetch(req)
                .then((res) => {
                    if (res.ok) {
                        const copy = res.clone();
                        caches.open(CACHE_NAME).then((c) => c.put(req, copy));
                    }
                    return res;
                })
                .catch(() => caches.match(req).then((hit) => hit || caches.match('/index.html')))
        );
        return;
    }

    event.respondWith(
        caches.match(req).then((hit) => {
            const network = fetch(req)
                .then((res) => {
                    if (res.ok) {
                        const copy = res.clone();
                        caches.open(CACHE_NAME).then((c) => c.put(req, copy));
                    }
                    return res;
                })
                .catch(() => hit);
            return hit || network;
        })
    );
});
