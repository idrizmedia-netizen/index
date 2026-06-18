const CACHE_NAME = 'ziyomap-v2'; // Versiyani v2 ga o'zgartirdik
const assets = [
  '/',
  '/index.html',
  '/icon-192x192.png', // Logotip fayllarini qo'shing
  '/icon-512x512.png'  // Logotip fayllarini qo'shing
];

// O'rnatish jarayoni: Yangi fayllarni keshga qo'shish
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Aktivlashtirish jarayoni: Eski keshni o'chirish (Siz so'ragan kod shu yerda)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
      );
    })
  );
});

// Tarmoq so'rovlarini boshqarish
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
