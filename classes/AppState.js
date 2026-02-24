class AppState {
    constructor() {
        /** @type {Song[]} */
        this.songs = [];

        /** @type {number | null} */
        this.selectedSongIndex = null;

        /** @type {boolean} */
        this.usedDirectLink = false;
    }

    /**
     * @returns {Song | null}
     */
    get selectedSong() {
        if (this.selectedSongIndex === null) {
            return null;
        }

        return this.songs[this.selectedSongIndex] ?? null;
    }
}

