class NavigationController {
    /**
     * @param {AppState} state
     * @param {AppShell} appShell
     * @param {LyricsController} lyricsController
     * @param {SongImageController} songImageController
     */
    constructor(state, appShell, lyricsController, songImageController) {
        this.state = state;
        this.appShell = appShell;
        this.lyricsController = lyricsController;
        this.songImageController = songImageController;

        /** @type {Element | null} */
        this.lastGoBack = document.querySelector('#last-go-back');
        /** @type {NodeListOf<Element>} */
        this.goToButtons = document.querySelectorAll('.go-to-screen');
        /** @type {Element | null} */
        this.lyricsFab = document.querySelector('#lyrics-fab');
        /** @type {Element | null} */
        this.goToFinal = document.querySelector('#go-to-final');

        this.registerListeners();
    }

    registerListeners() {
        if (this.lastGoBack) {
            this.lastGoBack.addEventListener('click', () => {
                const song = this.state.selectedSong;
                const targetScreen =
                    song && song.lyrics !== undefined ? 3 : 2;
                this.changeScreen(targetScreen);
            });
        }

        this.goToButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const targetScreen = Number(button.dataset.number);

                if (targetScreen === 2 && this.state.usedDirectLink) {
                    this.changeScreen(1);
                    this.state.usedDirectLink = false;
                } else {
                    this.changeScreen(targetScreen);
                }
            });
        });

        if (this.goToFinal) {
            this.goToFinal.addEventListener('click', () => {
                this.songImageController.displaySongImage();
            });
        }

        if (this.lyricsFab) {
            this.lyricsFab.addEventListener('click', () => {
                this.songImageController.displaySongImage();
            });
        }
    }

    /**
     * @param {number} number
     */
    changeScreen(number) {
        this.appShell.displayScreen(number);

        if (number === 3) {
            this.lyricsController.updateFabVisibility();
        } else if (this.lyricsFab) {
            this.lyricsFab.classList.add('hidden');
        }
    }
}

