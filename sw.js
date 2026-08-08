const CACHE_NAME = 'v4';

// Paths are relative to this file's location, not the domain root: the app is
// served from a GitHub Pages subpath (/lyricpost/), where a leading slash would
// point outside the app and make the install fail.
const urlsToCache = [
    './',
    './index.html',
    './styles/main.css',
    './styles/song-image.css',
    './styles/wizard.css',
    './index.js',
    './classes/constants.js',
    './classes/AppShell.js',
    './classes/AppState.js',
    './classes/DataFetcher.js',
    './classes/LyricsController.js',
    './classes/SearchController.js',
    './classes/NavigationController.js',
    './classes/SongImageController.js',
    './classes/PresetsController.js',
    './classes/data/Artist.js',
    './classes/data/Lyric.js',
    './classes/data/Song.js',
    './manifest.json',
    './icons/favicon.ico',
    './icons/icon-192.png',
    './icons/icon-512.png',
];

// The libraries and fonts loaded from other origins. Cached best-effort at
// install (a CDN hiccup must not fail the whole install, unlike the app shell)
// and again whenever one is fetched — the latter is what picks up the woff2
// files, whose URLs live inside the stylesheets and are not known upfront.
const externalHosts = [
    'html2canvas.hertzen.com',
    'cdnjs.cloudflare.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com',
];

// The stylesheets mirror the <link> in index.html and the @imports at the top
// of styles/main.css. They are listed here because on a first visit they load
// before this worker controls the page, so only precaching gets them in.
// If they ever drift, caching them simply falls back to the next visit.
const externalUrlsToCache = [
    'https://html2canvas.hertzen.com/dist/html2canvas.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.0/FileSaver.min.js',
    'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0',
    'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap',
    'https://fonts.googleapis.com/css2?family=Noto+Sans+HK&family=Noto+Sans+JP&family=Noto+Sans+KR&family=Noto+Sans+SC&family=Noto+Sans+TC&display=swap',
];

/**
 * Whether a request goes to one of the external hosts the app depends on.
 * @param {Request} request
 * @returns {boolean}
 */
function isExternalAsset(request) {
    return externalHosts.includes(new URL(request.url).hostname);
}

/**
 * Whether a response is worth storing. Cross-origin subresources come back
 * opaque (status 0) when the request was made in no-cors mode, which is still
 * perfectly usable for a script, stylesheet or font.
 * @param {Response} response
 * @returns {boolean}
 */
function isCacheable(response) {
    return response.ok || response.type === 'opaque';
}

/**
 * Caches one external asset, and — when it is a stylesheet — the font files it
 * references, whose URLs are only knowable by reading it. Never rejects: these
 * assets are a bonus, the app shell is what the install must not lose.
 * @param {Cache} cache
 * @param {string} url
 * @returns {Promise<void>}
 */
async function cacheExternalAsset(cache, url) {
    try {
        if (!externalHosts.includes(new URL(url).hostname)) return;

        const response = await fetch(url);
        if (!isCacheable(response)) return;

        const type = response.headers.get('content-type') || '';

        if (type.includes('text/css')) {
            const css = await response.clone().text();
            const fontUrls = [
                ...css.matchAll(/url\(['"]?(https:\/\/[^)'"]+)['"]?\)/g),
            ].map((match) => match[1]);

            // Font files are not stylesheets, so this recursion stops here.
            await Promise.all(
                fontUrls.map((fontUrl) => cacheExternalAsset(cache, fontUrl))
            );
        }

        await cache.put(url, response);
    } catch (error) {
        // Best effort — an unreachable CDN must not fail the install.
    }
}

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(async (cache) => {
                await cache.addAll(urlsToCache);
                await Promise.all(
                    externalUrlsToCache.map((url) =>
                        cacheExternalAsset(cache, url)
                    )
                );
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((names) =>
                Promise.all(
                    names
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => caches.delete(name))
                )
            )
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
        return;
    }

    // Matched against the current cache only. `caches.match()` searches every
    // cache in the origin, so an old CACHE_NAME would keep serving stale files
    // even after a version bump.
    event.respondWith(
        caches.open(CACHE_NAME).then(async (cache) => {
            const cached = await cache.match(event.request);

            if (cached) {
                return cached;
            }

            const response = await fetch(event.request);

            if (isExternalAsset(event.request) && isCacheable(response)) {
                event.waitUntil(cache.put(event.request, response.clone()));
            }

            return response;
        })
    );
});
