class DataFetcher {
    constructor() {
    }

    /**
     * Searches for songs via the LyricPost backend (which proxies Last.fm).
     *
     * @private
     * @param {string} name
     * @param {number} limit
     * @returns {Song[]} an array of Song objects
     */
    async getSongInfos(name, limit = 1) {
        try {
            const url = `/api/songs/search?name=${encodeURIComponent(name)}&limit=${encodeURIComponent(limit)}`;
            const response = await fetch(url);

            if (!response.ok) {
                console.error('Song search failed:', response.status);
                return [];
            }

            const tracks = await response.json();
            if (!Array.isArray(tracks)) return [];

            return tracks.map((track) => new Song(track));
        } catch (err) {
            console.error('Failed to search songs:', err);
            return [];
        }
    }

    /**
     * Gets a single track by Last.fm track MBID via the LyricPost backend.
     *
     * @private
     * @param {string} mbid
     * @returns {Song|null} a Song object
     */
    async getTrackById(mbid) {
        try {
            const response = await fetch(`/api/songs/track/${encodeURIComponent(mbid)}`);

            if (!response.ok) return null;
            const track = await response.json();

            if (track) {
                return new Song(track);
            }
        } catch (err) {
            console.error('Failed to fetch track by mbid:', err);
        }

        return null;
    }

    /**
     * Searches for song lyrics via the LyricPost backend (which proxies lrclib).
     *
     * @private
     * @param {string} artistName
     * @param {string} trackName
     * @returns {object} song lyrics object
     */
    async getSongLyrics(artistName, trackName) {
        try {
            const url = `/api/lyrics?artist=${encodeURIComponent(artistName)}&track=${encodeURIComponent(trackName)}`;
            const response = await fetch(url);

            if (!response.ok) return null;
            return await response.json();
        } catch (err) {
            console.error('Failed to fetch lyrics:', err);
            return null;
        }
    }
}
