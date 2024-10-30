const cacheName = 'langmentor-cache'; // Alterar o cacheName para forçar uma atualização
const filesToCache = [
  '/',
  '/index.html',
  '/settings.html',
  '/pricing.html',
  '/profile.html',
  '/read.html',
  '/stats.html',
  '/call_to_donate.js',
  '/tailwind.js',
  '/manifest.json',
  '/CNAME',
  '/README.md',
  '/CHANGELOG.md',
  '/google.svg',
  '/icon.svg',
  '/icons/',  // Se tiver ícones adicionais nesta pasta
  '/sounds/', // Se tiver sons específicos nesta pasta
  '/scripts/', // Inclui scripts adicionais, se existirem
  '/chat_stuff/', // Inclui diretório de chat, se aplicável
  '/info.html'
  // Adicione outros arquivos necessários
];

// Instalando o Service Worker e armazenando no cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(filesToCache);
    })
  );
});

// Ativando o Service Worker e removendo o cache antigo
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== cacheName) {
            return caches.delete(name);
          }
        })
      );
    })
  );
});

// Interceptando requisições e servindo o cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
