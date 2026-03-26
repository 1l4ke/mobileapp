const CACHE_NAME = 'dashboard-v1';

// Кэшируем ТОЛЬКО index.html
self.addEventListener('install', e => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.add('/public/index.html');
        })
    );
});

self.addEventListener('fetch', e => {
    // ТОЛЬКО index.html и SPA routes
    if (e.request.destination === 'document' || 
        e.request.url.includes('/tasks') || 
        e.request.url.includes('/notes') ||
        e.request.url.includes('/tracker')) {
        
        e.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match('/public/index.html').then(cached => {
                    return cached || fetch(e.request);
                });
            })
        );
    } else {
        // ВСЁ ОСТАЛЬНОЕ — ПРОСТО СЕТЬ (JS/CSS/API)
        e.respondWith(fetch(e.request));
    }
});