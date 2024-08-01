class Song {
    /**
     * @param {object} songObject
     */
    constructor(songObject, lyricsObject) {
        /** @type {string} */
        this.name = songObject.name;

        /** @type {number} */
        this.durationMs = songObject.duration_ms;
        
        /** @type {string} */
        this.spotifyUrl = songObject.external_urls.spotify;

        /** @type {Artist[]} */
        this.artists = songObject.artists.map(artist => new Artist(artist));

        /** @type {string} */
        this.albumCoverUrl = songObject.album.images[0].url;
    }
}