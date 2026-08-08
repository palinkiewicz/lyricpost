class Song {
    /**
     * @param {object} songInfo
     * @param {object} lyrics
     */
    constructor(songInfo, lyrics = null) {
        /** @type {string} */
        this.name = songInfo.name;

        /** @type {number} */
        this.durationMs = songInfo.duration ? Number(songInfo.duration) : 0;

        /** @type {Artist[]} */
        this.artists = songInfo.artist ? [new Artist({ name: songInfo.artist.name })] : [];

        /** @type {string} */
        this.albumCoverUrl = songInfo.album?.image?.[2]?.['#text'] || songInfo.album?.image?.[1]?.['#text'] || songInfo.album?.image?.[0]?.['#text'] || null;

        /** @type {bool} */
        this.hasSyncedLyrics = lyrics?.syncedLyrics ? true : false;

        /** @type {Lyric[]} */
        this.lyrics = (lyrics?.syncedLyrics ?? lyrics?.plainLyrics)
            ?.replace(/\n+/g, '\n')
            ?.split('\n')
            ?.map((lyric) => new Lyric(lyric));
    }

    /**
     * Lazily fetches the album cover in cors mode and caches it as an object
     * URL. A plain <img src> makes a no-cors request that Firefox's Opaque
     * Response Blocking (ORB) can abort for some Last.fm covers, and it re-blocks
     * on every screen regardless of the HTTP cache. Fetching once and reusing
     * the object URL avoids that and shares a single request across all screens.
     * Falls back to the direct URL if the fetch fails.
     *
     * @returns {Promise<string | null>}
     */
    getCoverObjectUrl() {
        if (!this.albumCoverUrl) {
            return Promise.resolve(null);
        }

        if (!this._coverPromise) {
            this._coverPromise = fetch(this.albumCoverUrl)
                .then((response) => response.blob())
                .then((blob) => URL.createObjectURL(blob))
                .catch((error) => {
                    console.error(
                        'Failed to load album cover',
                        this.albumCoverUrl,
                        error
                    );
                    return this.albumCoverUrl;
                });
        }

        return this._coverPromise;
    }

    /**
     * Loads lyrics parameters by scraping them from an API lyrics object
     * @param {object} lyrics
     */
    loadLyrics(lyrics) {
        this.hasSyncedLyrics = lyrics?.syncedLyrics ? true : false;
        this.lyrics = (lyrics?.syncedLyrics ?? lyrics?.plainLyrics)
            ?.replace(/\n+/g, '\n')
            ?.split('\n')
            ?.map((lyric) => new Lyric(lyric))
            ?.filter((lyric) => lyric.text !== '');
    }
}
