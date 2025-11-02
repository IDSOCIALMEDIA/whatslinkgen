// Nome do cache
const CACHE_NAME = 'whatsapp-link-gen-v1';
// Arquivos para cache
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js' 
    // Adicione aqui os caminhos para 'icon-192.png' e 'icon-512.png'
    // '/icon-192.png',
    // '/icon-512.png'
];

// Evento de Instalação: Salva os arquivos no cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aberto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Evento de Fetch: Tenta buscar da rede, se falhar, busca do cache
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .catch(() => {
                // Se falhar (offline), tenta pegar do cache
                return caches.match(event.request);
            })
    );
});
