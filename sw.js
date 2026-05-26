const CACHE_NAME = 'ziyomap-v1';
const assets = [
  '/',
  '/index.html'
];

// O'rnatish jarayoni
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Tarmoq so'rovlarini boshqarish (Sayt tezroq ochilishi uchun)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
