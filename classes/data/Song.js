class Song {
    /**
     * @param {object} songInfo
     * @param {object} lyrics
     */
    constructor(songInfo, lyrics) {
        /** @type {string} */
        this.name = songInfo.name;

        /** @type {number} */
        this.durationMs = songInfo.duration_ms;
        
        /** @type {string} */
        this.spotifyUrl = songInfo.external_urls.spotify;

        /** @type {Artist[]} */
        this.artists = songInfo.artists.map(artist => new Artist(artist));

        /** @type {string} */
        this.albumCoverUrl = songInfo.album.images[0].url;

        /** @type {bool} */
        this.hasSyncedLyrics = lyrics?.syncedLyrics ? true : false;

        /** @type {string} */
        this.lyrics = lyrics?.syncedLyrics ?? lyrics?.plainLyrics;
    }
}