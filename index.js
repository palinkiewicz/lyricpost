const fetcher = new DataFetcher();
const domHandler = new DOMHandler(fetcher);

if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('Service Worker registered'))
        .catch((err) =>
            console.error('Service Worker registration failed:', err)
        );
}
