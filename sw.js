const staticCacheName = 'currency-converter-static-v6';
const conversionsCache = 'currency-converter-conversions';
const allCaches = [staticCacheName, conversionsCache];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(staticCacheName)
            .then((cache) => {
                return cache.addAll([
                    'https://elikeyz.github.io/currency-converter/',
                    'https://elikeyz.github.io/currency-converter/styles.css',
                    'https://elikeyz.github.io/currency-converter/main.js',
                    'https://elikeyz.github.io/currency-converter/idb.js',
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
    const requestUrl = new URL(event.request.url);

    if (requestUrl.origin === 'https://free.currencyconverterapi.com' &&
         requestUrl.pathname.endsWith('/convert')) {
            event.respondWith(serveConversion(event.request));
            return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
    );

    function serveConversion(request) {
        return caches.open(conversionsCache).then((cache) => {
            return cache.match(request.url).then((response) => {
                const networkFetch = fetch(request).then((networkResponse) => {
                    cache.put(request, networkResponse.clone());
                    return networkResponse;
                });
                return response || networkFetch;
            })
        })
    }
});

self.addEventListener('message', (event) => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});