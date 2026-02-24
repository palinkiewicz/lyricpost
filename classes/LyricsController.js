class LyricsController {
    /**
     * @param {DOMHandler} domHandler
     */
    constructor(domHandler) {
        this.dom = domHandler;
    }

    /**
     * Searches for song lyrics and prepares lines selection list
     */
    async findLyrics() {
        this.dom.lineSelection.innerHTML = '';

        this.dom.displayScreen(3);
        this.displaySongInfo();
        this.dom.displaySearching(SEARCHING_FOR_LYRICS);

        /** @type {Song} */
        const song = this.dom.songs[this.dom.selectedSongIndex];

        const artists = song.artists.map((artist) => artist.name);
        let lyrics = null;
        let currentArtist = 0;

        try {
            while (lyrics === null && artists.length > currentArtist) {
                lyrics = await this.dom.fetcher.getSongLyrics(
                    artists[currentArtist],
                    song.name
                );
                currentArtist++;
            }

            if (lyrics === null) {
                throw Error('Lyrics not found');
            }
        } catch (error) {
            this.dom.hideSearching();

            if (
                document
                    .querySelector('.final-options')
                    .classList.contains('hidden')
            ) {
                this.dom.songImageController.displaySongImage();
            }

            return console.error(error);
        }

        this.dom.hideSearching();
        song.loadLyrics(lyrics);
        this.populateLineSelection();
    }

    /**
     * Displays song information (cover, name, artist) on the lyrics screen
     */
    displaySongInfo() {
        const song = this.dom.songs[this.dom.selectedSongIndex];

        this.dom.songInfoCover.setAttribute('src', song.albumCoverUrl);
        this.dom.songInfoName.textContent = song.name;
        this.dom.songInfoArtist.textContent = song.artists
            .map((artist) => artist.name)
            .join(', ');
    }

    /**
     * Creates line selection DOM elements from Lyric objects stored in the selected song's object
     */
    populateLineSelection() {
        let animationDelay = SELECTION_ANIMATION_DELAY;

        this.dom.songs[this.dom.selectedSongIndex].lyrics.forEach(
            (line, index) => {
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

                this.dom.lineSelection.append(element);
            }
        );
    }

    /**
     * Updates FAB visibility based on selected lines
     */
    updateFabVisibility() {
        const selectedLines = document.querySelectorAll(
            '.select-line.selected'
        );
        if (selectedLines.length > 0) {
            this.dom.lyricsFab.classList.remove('hidden');
        } else {
            this.dom.lyricsFab.classList.add('hidden');
        }
    }
}

