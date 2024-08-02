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
        /** @type {NodeListOf<Element>} */
        this.errorTexts = document.querySelectorAll(".error");
        /** @type {NodeListOf<Element>} */
        this.searchingTexts = document.querySelectorAll(".searching");
        /** @type {NodeListOf<Element>} */
        this.screens = document.querySelectorAll(".lyrics-image-screen");

        /** @type {Element} */
        this.searchInput = document.querySelector("#song-name");
        /** @type {Element} */
        this.searchButton = document.querySelector("#search");

        /** @type {Element} */
        this.cloneableSelectSong = document.querySelector(
            ".select-song.cloneable"
        );
        /** @type {Element} */
        this.songSelection = document.querySelector(".song-selection");
        /** @type {Element} */
        this.lineSelection = document.querySelector(".lines-selection");
    }

    /**
     * Sets static elements' listeners
     */
    setListeners() {
        this.searchButton.addEventListener("click", (e) => {
            e.preventDefault();
            this.findSong();
        });

        document.querySelectorAll(".go-to-screen").forEach((button) => {
            button.addEventListener("click", () => {
                this.displayScreen(Number(button.dataset.number));
            });
        });
    }

    /**
     * Searches for a song and prepares song selection list
     * @param {string} name
     */
    async findSong() {
        const name = this.searchInput.value
            .replaceAll("\\", "")
            .replaceAll("/", "")
            .trim();

        if (name === "") {
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

            this.populateSongSelection();
            this.displayScreen(2);
        } catch (error) {
            console.error(error);

            this.throwError(
                `Oops! Looks like we couldn't find any songs for \"${name}\".`
            );
        }

        this.hideSearching();
        this.searchInput.removeAttribute("disabled");
        this.searchButton.removeAttribute("disabled");
    }

    /**
     * Creates song selection DOM elements from Song objects stored in songs variable
     */
    populateSongSelection() {
        this.songSelection
            .querySelectorAll(".select-song:not(.cloneable)")
            .forEach((el) => el.remove());

        this.songs.forEach((song, index) => {
            const clone = this.cloneableSelectSong.cloneNode(true);

            clone.querySelector("img").setAttribute("src", song.albumCoverUrl);
            clone.querySelector(".name").textContent = song.name;
            clone.querySelector(".authors").textContent = song.artists
                .map((artist) => artist.name)
                .join(", ");

            clone.addEventListener("click", () => {
                this.selectedSongIndex = index;
                this.findLyrics();
            });

            clone.classList.remove("cloneable");

            this.songSelection.append(clone);
        });
    }

    /**
     * Searches for song lyrics and prepares lines selection list
     */
    async findLyrics() {
        this.displayScreen(3);

        /** @type {Song} */
        const song = this.songs[this.selectedSongIndex];

        const artists = [...song.artists.map((artist) => artist.name), ""];
        let lyrics = null;
        let currentArtist = 0;

        while (lyrics === null && artists.length > currentArtist) {
            lyrics = await this.fetcher.getSongLyrics(
                artists[currentArtist],
                song.name
            );
        }

        if (lyrics === null) {
            return this.displayScreen(4);
        }

        song.loadLyrics(lyrics);
        this.populateLineSelection();
    }

    populateLineSelection() {
        this.lineSelection.innerHTML = "";

        this.songs[this.selectedSongIndex].lyrics.forEach((line, index) => {
            const element = document.createElement("div");
            element.classList.add("select-line");
            element.textContent = line.text;
            element.dataset.index = index;

            element.addEventListener("click", () => {
                element.classList.toggle("selected");
            });

            this.lineSelection.append(element);
        });
    }

    /**
     * Converts cover image to base64 and sets it as song image's cover image
     */
    async setCoverImage() {
        const response = await fetch(
            this.songs[this.selectedSongIndex].albumCoverUrl
        );
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
            this.songs[this.selectedSongIndex].artists
                .map((artist) => artist.name)
                .join(", ");
    }

    /**
     * Sets song image's lyric section to the specified lyrics lines
     * @param {number[]} indexes
     */
    setSongLyrics(indexes) {
        document.querySelector(".song-image > .lyrics").innerHTML = this.songs[
            this.selectedSongIndex
        ].lyrics
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
        this.errorTexts.forEach((element) => {
            element.innerHTML = html;
            element.classList.remove("hidden");
        });
    }

    /**
     * Hides the error message
     */
    hideError() {
        this.errorTexts.forEach((element) => {
            element.classList.add("hidden");
        });
    }

    /**
     * Displays a searching text
     * @param {string} text
     */
    displaySearching(text) {
        this.searchingTexts.forEach((element) => {
            element.textContent = text;
            element.classList.remove("hidden");
        });
    }

    /**
     * Hides the searching text
     */
    hideSearching() {
        this.searchingTexts.forEach((element) => {
            element.classList.add("hidden");
        });
    }

    /**
     * Displays a searching text
     * @param {number} number
     */
    displayScreen(number) {
        this.screens.forEach((screen) => {
            if (Number(screen.dataset.number) < number) {
                screen.classList.add("hidden");
                screen.classList.add("left");
            } else if (Number(screen.dataset.number) === number) {
                screen.classList.remove("hidden");
                screen.classList.remove("left");
            } else {
                screen.classList.add("hidden");
                screen.classList.remove("left");
            }
        });
    }
}
