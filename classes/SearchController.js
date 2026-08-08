class SearchController {
    /**
     * @param {AppState} state
     * @param {DataFetcher} fetcher
     * @param {AppShell} appShell
     * @param {LyricsController} lyricsController
     */
    constructor(state, fetcher, appShell, lyricsController) {
        this.state = state;
        this.fetcher = fetcher;
        this.appShell = appShell;
        this.lyricsController = lyricsController;

        /** @type {HTMLInputElement | null} */
        this.searchInput = document.querySelector('#song-name');
        /** @type {HTMLButtonElement | null} */
        this.searchButton = document.querySelector('#search');

        /** @type {Element | null} */
        this.cloneableSelectSong = document.querySelector(
            '.select-song.cloneable'
        );
        /** @type {Element | null} */
        this.songSelection = document.querySelector('.song-selection');

        this.registerListeners();
    }

    registerListeners() {
        if (this.searchButton) {
            this.searchButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.findSong();
            });
        }

    }

    /**
     * Searches for a song and prepares song selection list
     */
    async findSong() {
        if (!this.searchInput || !this.searchButton) {
            return;
        }

        const name = this.searchInput.value
            .replaceAll('\\', '')
            .replaceAll('/', '')
            .trim();

        if (name === '') {
            return this.appShell.throwError(
                `Hold on! Haven't you forgotten about something?`
            );
        }

        this.searchInput.setAttribute('disabled', 'true');
        this.searchButton.setAttribute('disabled', 'true');

        this.appShell.hideError();
        this.appShell.displaySearching(SEARCHING_FOR_SONG);

        try {
            this.state.songs = await this.fetcher.getSongInfos(name, SONGS_TO_FETCH);

            this.populateSongSelection();
            this.appShell.displayScreen(2);
        } catch (error) {
            console.error(error);

            this.appShell.throwError(
                `Oops! Looks like we couldn't find any songs for \"${name}\".`
            );
        }

        this.appShell.hideSearching();
        this.searchInput.removeAttribute('disabled');
        this.searchButton.removeAttribute('disabled');
    }

    /**
     * Creates song selection DOM elements from Song objects stored in songs variable
     */
    populateSongSelection() {
        if (!this.songSelection || !this.cloneableSelectSong) {
            return;
        }

        this.songSelection
            .querySelectorAll('.select-song:not(.cloneable)')
            .forEach((el) => el.remove());

        this.songSelection.classList.add('hidden');

        this.state.songs.forEach((song, index) => {
            const clone = this.cloneableSelectSong.cloneNode(true);

            this.loadCoverImage(clone.querySelector('img'), song);
            clone.querySelector('.name').textContent = song.name;
            clone.querySelector('.authors').textContent = song.artists
                .map((artist) => artist.name)
                .join(', ');

            clone.addEventListener('click', () => {
                this.state.selectedSongIndex = index;
                this.lyricsController.findLyrics();
            });

            clone.classList.remove('cloneable');

            this.songSelection.append(clone);
        });

        setTimeout(() => {
            this.songSelection.classList.remove('hidden');
        }, SELECTION_ANIMATION_DELAY);
    }

    /**
     * Loads a song's album cover into an img element using the Song's cached
     * cors-fetched object URL (see Song.getCoverObjectUrl), avoiding the no-cors
     * <img> request that Firefox's Opaque Response Blocking can abort.
     *
     * @param {HTMLImageElement | null} img
     * @param {Song} song
     */
    async loadCoverImage(img, song) {
        if (!img) {
            return;
        }

        const src = await song.getCoverObjectUrl();

        if (src) {
            img.addEventListener(
                'load',
                () => img.classList.add('cover-loaded'),
                { once: true }
            );
            img.setAttribute('src', src);
        }
    }
}

