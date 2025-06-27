
// Service Worker mínimo para registro do PWA
// Sem cache offline - apenas para habilitar instalação

const CACHE_NAME = 'jarosmart-v1';

// Instalar o service worker
self.addEventListener('install', (event) => {
  console.log('JaroSmart PWA: Service Worker instalado');
  self.skipWaiting();
});

// Ativar o service worker
self.addEventListener('activate', (event) => {
  console.log('JaroSmart PWA: Service Worker ativado');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('JaroSmart PWA: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch - apenas passa as requisições sem cache
self.addEventListener('fetch', (event) => {
  // Apenas deixa as requisições passarem normalmente
  // Sem cache offline conforme solicitado
  event.respondWith(fetch(event.request));
});

// Mensagem para clientes quando houver atualizações
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
