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
        /** @type {HTMLInputElement | null} */
        this.spotifyLinkInput = document.querySelector('#spotify-link');
        /** @type {HTMLButtonElement | null} */
        this.loadLinkButton = document.querySelector('#load-link');
        /** @type {NodeListOf<Element>} */
        this.tabButtons = document.querySelectorAll('.tab-button');

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

        if (this.loadLinkButton) {
            this.loadLinkButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadFromSpotifyLink();
            });
        }

        this.tabButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const tab = button.dataset.tab;
                this.switchTab(tab);
            });
        });
    }

    /**
     * Switches between search and link input tabs
     * @param {string} tab
     */
    switchTab(tab) {
        this.tabButtons.forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        document.querySelectorAll('.tab-content').forEach((content) => {
            content.classList.toggle('active', content.id === `${tab}-tab`);
        });
    }

    /**
     * Loads a song directly from Spotify link
     */
    async loadFromSpotifyLink() {
        if (!this.spotifyLinkInput || !this.loadLinkButton) {
            return;
        }

        const url = this.spotifyLinkInput.value.trim();

        if (url === '') {
            return this.appShell.throwError('Please paste a Spotify link!');
        }

        const trackId = this.fetcher.parseSpotifyUrl(url);

        if (!trackId) {
            return this.appShell.throwError(
                'Invalid Spotify link. Try the Search tab instead!'
            );
        }

        this.spotifyLinkInput.setAttribute('disabled', 'true');
        this.loadLinkButton.setAttribute('disabled', 'true');

        this.appShell.hideError();
        this.appShell.displaySearching('Loading song from Spotify...');

        try {
            const song = await this.fetcher.getTrackById(trackId);
            this.state.songs = [song];
            this.state.selectedSongIndex = 0;
            this.state.usedDirectLink = true;

            await this.lyricsController.findLyrics();
        } catch (error) {
            console.error(error);

            this.appShell.throwError(
                "Couldn't load that song. Check the link and try again!"
            );
        }

        this.appShell.hideSearching();
        this.spotifyLinkInput.removeAttribute('disabled');
        this.loadLinkButton.removeAttribute('disabled');
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
            this.state.usedDirectLink = false;

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

            clone.querySelector('img').setAttribute('src', song.albumCoverUrl);
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
}

