class SearchController {
    /**
     * @param {DOMHandler} domHandler
     */
    constructor(domHandler) {
        this.dom = domHandler;
    }

    /**
     * Switches between search and link input tabs
     * @param {string} tab
     */
    switchTab(tab) {
        this.dom.tabButtons.forEach((btn) => {
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
        const url = this.dom.spotifyLinkInput.value.trim();

        if (url === '') {
            return this.dom.throwError('Please paste a Spotify link!');
        }

        const trackId = this.dom.fetcher.parseSpotifyUrl(url);

        if (!trackId) {
            return this.dom.throwError(
                'Invalid Spotify link. Try the Search tab instead!'
            );
        }

        this.dom.spotifyLinkInput.setAttribute('disabled', 'true');
        this.dom.loadLinkButton.setAttribute('disabled', 'true');

        this.dom.hideError();
        this.dom.displaySearching('Loading song from Spotify...');

        try {
            const song = await this.dom.fetcher.getTrackById(trackId);
            this.dom.songs = [song];
            this.dom.selectedSongIndex = 0;
            this.dom.usedDirectLink = true;

            await this.dom.lyricsController.findLyrics();
        } catch (error) {
            console.error(error);

            this.dom.throwError(
                "Couldn't load that song. Check the link and try again!"
            );
        }

        this.dom.hideSearching();
        this.dom.spotifyLinkInput.removeAttribute('disabled');
        this.dom.loadLinkButton.removeAttribute('disabled');
    }

    /**
     * Searches for a song and prepares song selection list
     */
    async findSong() {
        const name = this.dom.searchInput.value
            .replaceAll('\\', '')
            .replaceAll('/', '')
            .trim();

        if (name === '') {
            return this.dom.throwError(
                `Hold on! Haven't you forgotten about something?`
            );
        }

        this.dom.searchInput.setAttribute('disabled', 'true');
        this.dom.searchButton.setAttribute('disabled', 'true');

        this.dom.hideError();
        this.dom.displaySearching(SEARCHING_FOR_SONG);

        try {
            this.dom.songs = await this.dom.fetcher.getSongInfos(
                name,
                SONGS_TO_FETCH
            );
            this.dom.usedDirectLink = false;

            this.populateSongSelection();
            this.dom.displayScreen(2);
        } catch (error) {
            console.error(error);

            this.dom.throwError(
                `Oops! Looks like we couldn't find any songs for \"${name}\".`
            );
        }

        this.dom.hideSearching();
        this.dom.searchInput.removeAttribute('disabled');
        this.dom.searchButton.removeAttribute('disabled');
    }

    /**
     * Creates song selection DOM elements from Song objects stored in songs variable
     */
    populateSongSelection() {
        this.dom.songSelection
            .querySelectorAll('.select-song:not(.cloneable)')
            .forEach((el) => el.remove());

        this.dom.songSelection.classList.add('hidden');

        this.dom.songs.forEach((song, index) => {
            const clone = this.dom.cloneableSelectSong.cloneNode(true);

            clone.querySelector('img').setAttribute('src', song.albumCoverUrl);
            clone.querySelector('.name').textContent = song.name;
            clone.querySelector('.authors').textContent = song.artists
                .map((artist) => artist.name)
                .join(', ');

            clone.addEventListener('click', () => {
                this.dom.selectedSongIndex = index;
                this.dom.lyricsController.findLyrics();
            });

            clone.classList.remove('cloneable');

            this.dom.songSelection.append(clone);
        });

        setTimeout(() => {
            this.dom.songSelection.classList.remove('hidden');
        }, SELECTION_ANIMATION_DELAY);
    }
}

