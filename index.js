const fetcher = new DataFetcher();
const appState = new AppState();
const appShell = new AppShell();

const songImageController = new SongImageController(appState, appShell);
const lyricsController = new LyricsController(
    appState,
    fetcher,
    appShell,
    songImageController
);
const searchController = new SearchController(
    appState,
    fetcher,
    appShell,
    lyricsController
);
const navigationController = new NavigationController(
    appState,
    appShell,
    lyricsController,
    songImageController
);

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('Service Worker registered'))
        .catch((err) =>
            console.error('Service Worker registration failed:', err)
        );
}
