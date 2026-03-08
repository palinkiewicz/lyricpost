class Song {
    /**
     * @param {object} songInfo
     * @param {object} lyrics
     */
    constructor(songInfo, lyrics = null) {
        /** @type {string} */
        this.name = songInfo.title;

        /** @type {number} */
        this.durationMs = songInfo.length;

        /** @type {Artist[]} */
        this.artists = songInfo['artist-credit'].map(artist => new Artist(artist));

        /** @type {string} */
        this.albumCoverUrl = songInfo.albumCoverUrl || null;

        /** @type {bool} */
        this.hasSyncedLyrics = lyrics?.syncedLyrics ? true : false;

        /** @type {Lyric[]} */
        this.lyrics = (lyrics?.syncedLyrics ?? lyrics?.plainLyrics)
            ?.replace(/\n+/g, '\n')
            ?.split('\n')
            ?.map(lyric => new Lyric(lyric));
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
            ?.map(lyric => new Lyric(lyric))
            ?.filter(lyric => lyric.text !== '');
    }
}