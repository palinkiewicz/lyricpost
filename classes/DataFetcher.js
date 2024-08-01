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
                this.accessToken = json.access_token;
            });
        });
    }
    
    /**
     * Searches for a song on spotify
     * 
     * @param {string} name
     * @returns {Song} song
     */
    async findSong(name) {
        if (this.accessToken === undefined) return {};

        const response = await fetch(`https://api.spotify.com/v1/search?q=${name}&type=track&limit=1`, {
            method: "GET",
            headers: { Authorization: "Bearer " + this.accessToken },
        });

        const result = await response.json();

        return new Song(result.tracks.items[0]);
    }
}
