class Artist {
    /**
     * @param {object} artist
     */
    constructor(artist) {
        /** @type {string} */
        this.name = artist.name;
        
        /** @type {string} */
        this.spotifyUrl = artist.external_urls.spotify;
    }
}