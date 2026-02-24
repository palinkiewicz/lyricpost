class DOMHandler {
    /**
     * @param {DataFetcher} fetcher
     */
    constructor(fetcher) {
        /** @type {DataFetcher} */
        this.fetcher = fetcher;

        /** @type {Song[]} */
        this.songs = [];

        /** @type {number?} */
        this.selectedSongIndex = null;

        /** @type {boolean} */
        this.usedDirectLink = false;

        /**
         * Below all are DOM elements
         */
        /** @type {NodeListOf<Element>} */
        this.errorTexts = document.querySelectorAll('.error');
        /** @type {NodeListOf<Element>} */
        this.searchingTexts = document.querySelectorAll('.searching');
        /** @type {NodeListOf<Element>} */
        this.screens = document.querySelectorAll('.lyrics-image-screen');

        /** @type {Element} */
        this.searchInput = document.querySelector('#song-name');
        /** @type {Element} */
        this.searchButton = document.querySelector('#search');
        /** @type {Element} */
        this.spotifyLinkInput = document.querySelector('#spotify-link');
        /** @type {Element} */
        this.loadLinkButton = document.querySelector('#load-link');
        /** @type {NodeListOf<Element>} */
        this.tabButtons = document.querySelectorAll('.tab-button');

        /** @type {Element} */
        this.cloneableSelectSong = document.querySelector(
            '.select-song.cloneable'
        );
        /** @type {Element} */
        this.songSelection = document.querySelector('.song-selection');
        /** @type {Element} */
        this.lineSelection = document.querySelector('.lines-selection');
        /** @type {Element} */
        this.songInfoCover = document.querySelector('.song-info-cover');
        /** @type {Element} */
        this.songInfoName = document.querySelector('.song-info-name');
        /** @type {Element} */
        this.songInfoArtist = document.querySelector('.song-info-artist');
        /** @type {Element} */
        this.goToFinal = document.querySelector('#go-to-final');
        /** @type {Element} */
        this.lyricsFab = document.querySelector('#lyrics-fab');

        /** @type {Element} */
        this.lastGoBack = document.querySelector('#last-go-back');
        /** @type {Element} */
        this.downloadButton = document.querySelector('#download');
        /** @type {Element} */
        this.colorSelection = document.querySelector('.color-selection');
        /** @type {Element} */
        this.customColorInput = document.querySelector('#custom-color input');
        /** @type {Element} */
        this.lightTextSwitch = document.querySelector('#light-text');
        /** @type {Element} */
        this.spotifyTagSwitch = document.querySelector('#spotify-tag');
        /** @type {Element} */
        this.additionalBgSwitch = document.querySelector('#additional-bg');
        /** @type {Element} */
		this.fontLangSelect = document.querySelector('#font-lang');
        /** @type {Element} */
        this.songImage = document.querySelector('.song-image');

        /** @type {Element} */
        this.widthSlider = document.querySelector('#width-slider');
        /** @type {Element} */
        this.widthValue = document.querySelector('#width-value');

        /** @type {Element} */
        this.toggleDarkMode = document.querySelector('#dark-mode-toggle');

        this.searchController = new SearchController(this);
        this.lyricsController = new LyricsController(this);
        this.songImageController = new SongImageController(this);

        this.songImageController.populateColorSelection();
        this.setListeners();
        this.songImageController.setBase64Image(
            SPOTIFY_LOGO,
            '.song-image > .spotify > img',
            0
        );
        this.setTheme(
            localStorage.getItem('theme') ??
                (window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light')
        );
    }

    /**
     * Sets static elements' listeners
     */
    setListeners() {
        this.searchButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.searchController.findSong();
        });

        this.loadLinkButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.searchController.loadFromSpotifyLink();
        });

        this.tabButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const tab = button.dataset.tab;
                this.searchController.switchTab(tab);
            });
        });

        this.lastGoBack.addEventListener('click', () => {
            this.displayScreen(
                this.songs[this.selectedSongIndex].lyrics === undefined ? 2 : 3
            );
        });

        document.querySelectorAll('.go-to-screen').forEach((button) => {
            button.addEventListener('click', () => {
                const targetScreen = Number(button.dataset.number);

                if (targetScreen === 2 && this.usedDirectLink) {
                    this.displayScreen(1);
                    this.usedDirectLink = false;
                } else {
                    this.displayScreen(targetScreen);
                }
            });
        });

        this.goToFinal.addEventListener('click', () => {
            this.songImageController.displaySongImage();
        });

        this.lyricsFab.addEventListener('click', () => {
            this.songImageController.displaySongImage();
        });

        this.customColorInput.addEventListener('input', () => {
            this.songImageController.setSongImageColor(
                this.customColorInput.value
            );
        });

        document.querySelectorAll('.switch-container').forEach((container) => {
            container.addEventListener('click', () => {
                container.classList.toggle('on');
            });
        });

        this.lightTextSwitch.addEventListener('click', () => {
            this.songImage.classList.toggle('light-text');

            this.songImageController.setBase64Image(
                SPOTIFY_LOGO,
                '.song-image > .spotify > img',
                this.songImage.classList.contains('light-text') ? 255 : 0
            );
        });

        this.spotifyTagSwitch.addEventListener('click', () => {
            this.songImage.classList.toggle('spotify-tag');
        });

        this.additionalBgSwitch.addEventListener('click', () => {
            this.songImage.classList.toggle(
                'additional-bg'
            );
        });

        this.downloadButton.addEventListener('click', () => {
            this.songImageController.downloadSongImage();
        });

        // Tabs
        document
            .querySelectorAll('.tab-selectors > button')
            .forEach((selector) => {
                selector.addEventListener('click', () => {
                    document
                        .querySelector('.tab-selectors > .primary')
                        .classList.remove('primary');
                    selector.classList.add('primary');
                    document
                        .querySelector('.tabs > .selected')
                        .classList.remove('selected');

                    const newlySelected = document.querySelector(
                        `.tabs > div:nth-child(${selector.dataset.number})`
                    );
                    newlySelected.classList.add('selected');
                    document.querySelector('.options').style.height =
                        newlySelected.offsetHeight + 44 + 'px';
                });
            });

        // Paste into contenteditable as plain text
        document.querySelectorAll('[contenteditable]').forEach((field) => {
            field.addEventListener('paste', function (event) {
                event.preventDefault();
                document.execCommand(
                    'inserttext',
                    false,
                    event.clipboardData.getData('text/plain')
                );
            });
        });

        this.widthSlider.addEventListener('input', () => {
            const width = this.widthSlider.value;
            this.songImageController.setSongImageWidth(width);
            this.widthValue.textContent = `${width}px`;
        });

        window.addEventListener('resize', () => {
            this.songImageController.setSongImageWidth(
                this.widthSlider.value
            );
        });

        this.fontLangSelect.addEventListener('change', (e) => {
            document.documentElement.lang = e.target.value;
        });

        this.toggleDarkMode.addEventListener('click', () => {
            this.setTheme(
                document.body.classList.contains('dark-mode') ? 'light' : 'dark'
            );
        });
    }

    /**
     * Displays an error message with provided html
     * @param {string} html
     */
    throwError(html) {
        this.errorTexts.forEach((element) => {
            element.innerHTML = html;
            element.classList.remove('hidden');
        });
    }

    /**
     * Hides the error message
     */
    hideError() {
        this.errorTexts.forEach((element) => {
            element.classList.add('hidden');
        });
    }

    /**
     * Displays a searching text
     * @param {string} text
     */
    displaySearching(text) {
        this.searchingTexts.forEach((element) => {
            element.textContent = text;
            element.classList.remove('hidden');
        });
    }

    /**
     * Hides the searching text
     */
    hideSearching() {
        this.searchingTexts.forEach((element) => {
            element.classList.add('hidden');
        });
    }

    /**
     * Displays a searching text
     * @param {number} number
     */
    displayScreen(number) {
        this.screens.forEach((screen) => {
            if (Number(screen.dataset.number) < number) {
                screen.classList.add('hidden');
                screen.classList.add('left');
            } else if (Number(screen.dataset.number) === number) {
                screen.classList.remove('hidden');
                screen.classList.remove('left');
            } else {
                screen.classList.add('hidden');
                screen.classList.remove('left');
            }
        });
        
        // Update FAB visibility when returning to lyrics selection screen
        if (number === 3) {
            this.lyricsController.updateFabVisibility();
        } else {
            this.lyricsFab.classList.add('hidden');
        }
    }

    /**
     * Sets color theme
     * @param {string} theme
     */
    setTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    }
}
