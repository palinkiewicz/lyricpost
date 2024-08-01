class Artist {
    /**
     * @param {object} artistObject
     */
    constructor(artistObject) {
        /** @type {string} */
        this.name = artistObject.name;
        
        /** @type {string} */
        this.spotifyUrl = artistObject.external_urls.spotify;
    }
}