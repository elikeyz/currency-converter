const staticCacheName = 'currency-converter-static-v1';
const allCaches = [staticCacheName];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(staticCacheName)
            .then((cache) => {
                return cache.addAll([
                    '/',
                    '/styles.css',
                    '/main.js',
                    'https://use.fontawesome.com/releases/v5.7.2/webfonts/fa-solid-900.woff2',
                    'https://fonts.gstatic.com/s/oswald/v16/TK3iWkUHHAIjg752GT8G.woff2',
                    'https://fonts.gstatic.com/s/opensans/v15/mem8YaGs126MiZpBA-UFVZ0b.woff2',
                    'https://fonts.googleapis.com/css?family=Open+Sans|Oswald',
                    'https://use.fontawesome.com/releases/v5.7.2/css/all.css'
                ]);
            })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.filter((cacheName) => {
                        return cacheName.startsWith('currency-converter-') &&
                                !allCaches.includes(cacheName);
                    }).map(cacheName => caches.delete(cacheName))
                );
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
    );
});

self.addEventListener('message', (event) => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});