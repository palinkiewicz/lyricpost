class DataFetcher {
    constructor() {
        const params = new URLSearchParams();
    
        params.append("grant_type", "client_credentials");
        /**
         * Yeah, I know this should never be just left here,
         * but I wanted to make it really cost-free (front-end only),
         * and I decided I didn't care about those keys
         */
        params.append("client_id", "4d6b7066ac2443cf82a29b79e9920e88");
        params.append("client_secret", "cddfc0b1c87e4131ae0f3622bdc5b731");
    
        fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params,
        }).then((res) => {
            res.json().then((json) => {
                /**
                 * @type {string}
                 * @private
                 */
                this._accessToken = json.access_token;
            });
        });
    }
    
    /**
     * Searches for a song on Spotify
     * 
     * @private
     * @param {string} name
     * @returns {object} song information object
     */
    async getSongInfo(name) {
        if (this._accessToken === undefined) return {};

        const response = await fetch(`https://api.spotify.com/v1/search?q=${name}&type=track&limit=1`, {
            method: "GET",
            headers: { Authorization: "Bearer " + this._accessToken },
        });

        const result = await response.json();

        return result.tracks.items[0];
    }
    
    /**
     * Searches for song lyrics on lrclib
     * 
     * @private
     * @param {string} name
     * @returns {object} song lyrics object
     */
    async getSongLyrics(name) {
        const response = await fetch(`https://lrclib.net/api/search?q=${name}`, {
            method: "GET",
        });

        const result = await response.json();

        return result[0] ?? {};
    }
    
    /**
     * Creates Song object with fetched song information and lyrics
     * 
     * @private
     * @param {string} name
     * @returns {Song} fetched song information and lyrics
     */
    async findSong(name) {
        const songInfo = await this.getSongInfo(name);
        const lyrics = await this.getSongLyrics(name);

        return new Song(songInfo, lyrics);
    }
}
