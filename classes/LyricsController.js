class LyricsController {
    /**
     * @param {AppState} state
     * @param {DataFetcher} fetcher
     * @param {AppShell} appShell
     * @param {SongImageController} songImageController
     */
    constructor(state, fetcher, appShell, songImageController) {
        this.state = state;
        this.fetcher = fetcher;
        this.appShell = appShell;
        this.songImageController = songImageController;

        /** @type {Element | null} */
        this.lineSelection = document.querySelector('.lines-selection');
        /** @type {HTMLImageElement | null} */
        this.songInfoCover = document.querySelector('.song-info-cover');
        /** @type {Element | null} */
        this.songInfoName = document.querySelector('.song-info-name');
        /** @type {Element | null} */
        this.songInfoArtist = document.querySelector('.song-info-artist');
        /** @type {Element | null} */
        this.lyricsFab = document.querySelector('#lyrics-fab');
    }

    /**
     * Searches for song lyrics and prepares lines selection list
     */
    async findLyrics() {
        if (!this.lineSelection) {
            return;
        }

        this.lineSelection.innerHTML = '';

        this.appShell.displayScreen(3);
        this.displaySongInfo();
        this.appShell.displaySearching(SEARCHING_FOR_LYRICS);

        /** @type {Song} */
        const song = this.state.selectedSong;

        if (!song) {
            this.appShell.hideSearching();
            return;
        }

        const artists = song.artists.map((artist) => artist.name);
        let lyrics = null;
        let currentArtist = 0;

        try {
            while (lyrics === null && artists.length > currentArtist) {
                lyrics = await this.fetcher.getSongLyrics(
                    artists[currentArtist],
                    song.name
                );
                currentArtist++;
            }

            if (lyrics === null) {
                throw Error('Lyrics not found');
            }
        } catch (error) {
            this.appShell.hideSearching();

            if (
                document
                    .querySelector('.final-options')
                    .classList.contains('hidden')
            ) {
                this.songImageController.displaySongImage();
            }

            return console.error(error);
        }

        this.appShell.hideSearching();
        song.loadLyrics(lyrics);
        this.populateLineSelection();
    }

    /**
     * Displays song information (cover, name, artist) on the lyrics screen
     */
    displaySongInfo() {
        const song = this.state.selectedSong;

        if (!song || !this.songInfoCover || !this.songInfoName || !this.songInfoArtist) {
            return;
        }

        this.songInfoCover.setAttribute('src', song.albumCoverUrl);
        this.songInfoName.textContent = song.name;
        this.songInfoArtist.textContent = song.artists
            .map((artist) => artist.name)
            .join(', ');
    }

    /**
     * Creates line selection DOM elements from Lyric objects stored in the selected song's object
     */
    populateLineSelection() {
        if (!this.lineSelection) {
            return;
        }

        let animationDelay = SELECTION_ANIMATION_DELAY;

        this.state.selectedSong?.lyrics.forEach((line, index) => {
            const element = document.createElement('div');
            element.classList.add('select-line', 'hidden');
            element.textContent = line.text;
            element.dataset.index = index;

            element.addEventListener('click', () => {
                element.classList.toggle('selected');
                this.updateFabVisibility();
            });

            setTimeout(() => {
                element.classList.remove('hidden');
            }, animationDelay);

            animationDelay += NEXT_LINE_ANIMATION_DELAY;

            this.lineSelection.append(element);
        });
    }

    /**
     * Updates FAB visibility based on selected lines
     */
    updateFabVisibility() {
        if (!this.lyricsFab || !this.lineSelection) {
            return;
        }

        const selectedLines =
            this.lineSelection.querySelectorAll('.select-line.selected');
        if (selectedLines.length > 0) {
            this.lyricsFab.classList.remove('hidden');
        } else {
            this.lyricsFab.classList.add('hidden');
        }
    }
}

