const fetcher = new DataFetcher();
const domHandler = new DOMHandler(fetcher);

document.querySelector('#search').addEventListener('click', (e) => {
    e.preventDefault();
    domHandler.findSong();
})