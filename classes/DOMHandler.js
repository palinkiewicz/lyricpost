const SONGS_TO_FETCH = 6;
const DOWNLOAD_SCALING_FACTOR = 4;
const SEARCHING_FOR_SONG = "Searching for your song...";
const SEARCHING_FOR_LYRICS = "Searching for song's lyrics...";

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

        /**
         * Below all are DOM elements
         */
        /** @type {Element} */
        this.errorText = document.querySelector(".error");
        /** @type {Element} */
        this.searchInput = document.querySelector("#song-name");
        /** @type {Element} */
        this.searchButton = document.querySelector("#search");
        /** @type {Element} */
        this.searchingText = document.querySelector(".searching");
    }

    setListeners() {
        this.searchButton.addEventListener("click", (e) => {
            e.preventDefault();
            this.findSong();
        });
    }

    /**
     * Searches for a song and prepares the user to select lyrics lines
     * @param {string} name
     */
    async findSong() {
        const name = this.searchInput.value.replaceAll('\\', '').replaceAll('/', '').trim();

        if (name === '') {
            return this.throwError(
                `Hold on! Haven't you forgotten about something?`
            );
        }

        this.searchInput.setAttribute("disabled", "true");
        this.searchButton.setAttribute("disabled", "true");

        this.hideError();
        this.displaySearching(SEARCHING_FOR_SONG);

        try {
            this.songs = await this.fetcher.getSongInfos(name, SONGS_TO_FETCH);
            this.hideSearching();
        } catch (error) {
            console.e(error);

            this.searchInput.removeAttribute("disabled");
            this.searchButton.removeAttribute("disabled");

            this.throwError(
                `Oops! Looks like we couldn't find any songs for \"${name}\".`
            );
            this.hideSearching();
        }

        console.log(this.songs);

        // this.setSongInfo();
        // await this.setCoverImage();
        // this.setSongLyrics([0,1,2,3]);

        // this.downloadSongImage();
    }

    /**
     * Converts cover image to base64 and sets it as song image's cover image
     */
    async setCoverImage() {
        const response = await fetch(this.songs[this.selectedSongIndex].albumCoverUrl);
        const blob = await response.blob();

        const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        document
            .querySelector(".song-image > .header > img")
            .setAttribute("src", base64);
    }

    /**
     * Sets song image's name and author to the name of the fetched song
     */
    setSongInfo() {
        document.querySelector(".song-image > .header .name").textContent =
            this.songs[this.selectedSongIndex].name;
        document.querySelector(".song-image > .header .authors").textContent =
            this.songs[this.selectedSongIndex].artists.map((artist) => artist.name).join(", ");
    }

    /**
     * Sets song image's lyric section to the specified lyrics lines
     * @param {number[]} indexes
     */
    setSongLyrics(indexes) {
        document.querySelector(".song-image > .lyrics").innerHTML =
            this.songs[this.selectedSongIndex].lyrics
                .filter((_, index) => indexes.includes(index))
                .map((lyric) => lyric.text)
                .join("<br>");
    }

    /**
     * Downloads song image by generating canvas from its DOM elements
     */
    downloadSongImage() {
        html2canvas(
            document.querySelector(".song-image"),
            { backgroundColor: null },
            { scale: window.devicePixelRatio * DOWNLOAD_SCALING_FACTOR }
        ).then((canvas) => {
            canvas.toBlob(function (blob) {
                window.saveAs(blob, "download.png");
            });
        });
    }

    /**
     * Displays an error message with provided html
     * @param {string} html
     */
    throwError(html) {
        this.errorText.innerHTML = html;
        this.errorText.classList.remove("hidden");
    }

    /**
     * Hides the error message
     */
    hideError() {
        this.errorText.classList.add("hidden");
    }

    /**
     * Displays a searching text
     * @param {string} text
     */
    displaySearching(text) {
        this.searchingText.textContent = text;
        this.searchingText.classList.remove("hidden");
    }

    /**
     * Hides the searching text
     */
    hideSearching() {
        this.searchingText.classList.add("hidden");
    }
}
