const SONGS_TO_FETCH = 6;
const DOWNLOAD_SCALING_FACTOR = 4;
const SELECTION_ANIMATION_DELAY = 300;
const NEXT_LINE_ANIMATION_DELAY = 30;
const SEARCHING_FOR_SONG = "Searching for your song...";
const SEARCHING_FOR_LYRICS = "Searching for song's lyrics...";
const NO_LYRICS_FOUND =
    "No lyrics found<br>You can still type your own lyrics by clicking here :)";
const SPOTIFY_LOGO = "https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg";

const COLORS = [
    "#008fd1",
    "#549aab",
    "#8fc00c",
    "#729962",
    "#a2904e",
    "#cd6800",
    "#fc302f",
];

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
        /** @type {Element} */
        this.goToFinal = document.querySelector(
            ".lyrics-image-screen .go-to-screen.right"
        );

        /** @type {Element} */
        this.lastGoBack = document.querySelector("#last-go-back");
        /** @type {Element} */
        this.downloadButton = document.querySelector("#download");
        /** @type {Element} */
        this.colorSelection = document.querySelector(".color-selection");
        /** @type {Element} */
        this.customColorInput = document.querySelector("#custom-color input");
        /** @type {Element} */
        this.lightTextSwitch = document.querySelector("#light-text");
        /** @type {Element} */
        this.spotifyTagSwitch = document.querySelector("#spotify-tag");
        /** @type {Element} */
        this.songImage = document.querySelector(".song-image");

        this.populateColorSelection();
        this.setListeners();

        this.setBase64Image(
            SPOTIFY_LOGO,
            ".song-image > .spotify > img",
            0
        );
    }

    /**
     * Sets static elements' listeners
     */
    setListeners() {
        this.searchButton.addEventListener("click", (e) => {
            e.preventDefault();
            this.findSong();
        });

        this.lastGoBack.addEventListener("click", () => {
            this.displayScreen(
                this.songs[this.selectedSongIndex].lyrics === undefined ? 2 : 3
            );
        });

        document.querySelectorAll(".go-to-screen").forEach((button) => {
            button.addEventListener("click", () => {
                this.displayScreen(Number(button.dataset.number));
            });
        });

        this.goToFinal.addEventListener("click", () => {
            this.displaySongImage();
        });

        this.customColorInput.addEventListener("input", () => {
            this.setSongImageColor(this.customColorInput.value);
        });

        this.lightTextSwitch.addEventListener("click", () => {
            const parent = this.lightTextSwitch.parentElement;
            parent.classList.toggle("light-text");

            this.setBase64Image(
                SPOTIFY_LOGO,
                ".song-image > .spotify > img",
                parent.classList.contains("light-text") ? 255 : 0
            );
        });

        this.spotifyTagSwitch.addEventListener("click", () => {
            this.spotifyTagSwitch.parentElement.classList.toggle("spotify-tag");
        });

        this.downloadButton.addEventListener("click", () => {
            this.downloadSongImage();
        });

        // Paste into contenteditable as plain text
        document.querySelectorAll("[contenteditable]").forEach((field) => {
            field.addEventListener("paste", function (event) {
                event.preventDefault();
                document.execCommand(
                    "inserttext",
                    false,
                    event.clipboardData.getData("text/plain")
                );
            });
        });
    }

    /**
     * Creates color selection DOM elements
     */
    populateColorSelection() {
        COLORS.forEach((color) => {
            const element = document.createElement("div");
            element.classList.add("select-color");
            element.style.backgroundColor = color;
            element.textContent = ".";

            element.addEventListener("click", () => {
                this.setSongImageColor(color);
            });

            this.colorSelection.insertBefore(
                element,
                this.colorSelection.querySelector("#custom-color")
            );
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

        this.songSelection.classList.add("hidden");

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

        setTimeout(() => {
            this.songSelection.classList.remove("hidden");
        }, SELECTION_ANIMATION_DELAY);
    }

    /**
     * Searches for song lyrics and prepares lines selection list
     */
    async findLyrics() {
        this.lineSelection.innerHTML = "";

        this.displayScreen(3);
        this.displaySearching(SEARCHING_FOR_LYRICS);

        /** @type {Song} */
        const song = this.songs[this.selectedSongIndex];

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
                throw Error("Lyrics not found");
            }
        } catch (error) {
            this.hideSearching();
            this.displaySongImage();
            return console.error(error);
        }

        this.hideSearching();
        song.loadLyrics(lyrics);
        this.populateLineSelection();
    }

    /**
     * Creates line selection DOM elements from Lyric objects stored in the selected song's object
     */
    populateLineSelection() {
        let animationDelay = SELECTION_ANIMATION_DELAY;

        this.songs[this.selectedSongIndex].lyrics.forEach((line, index) => {
            const element = document.createElement("div");
            element.classList.add("select-line", "hidden");
            element.textContent = line.text;
            element.dataset.index = index;

            element.addEventListener("click", () => {
                element.classList.toggle("selected");
            });

            setTimeout(() => {
                element.classList.remove("hidden");
            }, animationDelay);

            animationDelay += NEXT_LINE_ANIMATION_DELAY;

            this.lineSelection.append(element);
        });
    }

    /**
     * Displays song image final screen
     */
    displaySongImage() {
        this.setSongImage();
        this.displayScreen(4);
    }

    /**
     * Prepares song image DOM element
     */
    setSongImage() {
        this.setBase64Image(
            this.songs[this.selectedSongIndex].albumCoverUrl,
            ".song-image > .header > img"
        );
        this.setSongInfo();
        this.setSongLyrics(
            Array.from(document.querySelectorAll(".select-line.selected")).map(
                (selectLine) => Number(selectLine.dataset.index)
            )
        );
        this.setSongImageColor(
            COLORS[Math.floor(Math.random() * COLORS.length)]
        );
    }

    /**
     * Set's song image's colors
     * @param {string} background
     * @param {string} text
     */
    setSongImageColor(background) {
        this.songImage.style.backgroundColor = background;
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
        document.querySelector(".song-image > .lyrics").innerHTML =
            this.songs[this.selectedSongIndex].lyrics
                ?.filter((_, index) => indexes.includes(index))
                ?.map((lyric) => lyric.text)
                ?.join("<br>") ?? NO_LYRICS_FOUND;
    }

    /**
     * Downloads song image by generating canvas from its DOM elements
     */
    async downloadSongImage() {
        const canvas = await html2canvas(
            document.querySelector(".song-image"),
            {
                backgroundColor: null,
                scale: window.devicePixelRatio * DOWNLOAD_SCALING_FACTOR,
            }
        );

        canvas.toBlob((blob) => {
            window.saveAs(blob, "download.png");
        });
    }

    /**
     * Converts cover image to base64 and sets it as image's source in order to avoid canvas CORS policy
     * @param {string} url
     * @param {string} imgSelector
     */
    async setBase64Image(url, imgSelector, newColor = null) {
        const response = await fetch(url);
        const blob = await response.blob();

        const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        if (newColor === null)
            return document
                .querySelector(imgSelector)
                .setAttribute("src", base64);

        const img = new Image();
        img.src = base64;

        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                if (data[i + 3] > 0) {
                    data[i] = data[i + 1] = data[i + 2] = newColor; // Set RGB (0 = black, 255 = white)
                }
            }

            ctx.putImageData(imageData, 0, 0);
            document
                .querySelector(imgSelector)
                .setAttribute("src", canvas.toDataURL());
        };
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
