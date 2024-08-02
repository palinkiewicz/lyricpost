const DOWNLOAD_SCALING_FACTOR = 4;

class DOMHandler {
    /**
     * @param {DataFetcher} fetcher
     */
    constructor(fetcher) {
        /** @type {DataFetcher} */
        this.fetcher = fetcher;

        /** @type {Song?} */
        this.song = null;
    }

    /**
     * Searches for a song and prepares the user to select lyrics lines
     * @param {string} name
     */
    async findSong() {
        const name = document.querySelector("#song-name").value.trim();

        this.song = await this.fetcher.findSong(name);

        console.log(this.song);

        this.setSongInfo();
        await this.setCoverImage();
        this.setSongLyrics([0,1,2,3]);

        this.downloadSongImage();
    }

    /**
     * Converts cover image to base64 and sets it as song image's cover image
     */
    async setCoverImage() {
        const response = await fetch(this.song.albumCoverUrl);
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
            this.song.name;
        document.querySelector(".song-image > .header .authors").textContent =
            this.song.artists.map((artist) => artist.name).join(", ");
    }

    /**
     * Sets song image's lyric section to the specified lyrics lines
     * @param {number[]} indexes
     */
    setSongLyrics(indexes) {
        document.querySelector(".song-image > .lyrics").innerHTML =
            this.song.lyrics
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
}
