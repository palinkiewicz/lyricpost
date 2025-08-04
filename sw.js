const CACHE_NAME = 'v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles/main.css',
    '/styles/song-image.css',
    '/styles/wizard.css',
    '/index.js',
    '/classes/DOMHandler.js',
    '/classes/DataFetcher.js',
    '/classes/data/Artist.js',
    '/classes/data/Lyric.js',
    '/classes/data/Song.js',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches
            .match(event.request)
            .then((response) => response || fetch(event.request))
    );
});
