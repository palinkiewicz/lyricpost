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