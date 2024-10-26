self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('langmentor-cache').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/styles.css',  // Se você tiver um arquivo CSS
                '/script.js',    // Se você tiver um arquivo JS separado
                '/icon.svg',     // O ícone que você usa na navbar
                '/icons/icon-192x192.png',
                '/icons/icon-512x512.png',
                // Adicione outros arquivos que você deseja armazenar em cache
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
