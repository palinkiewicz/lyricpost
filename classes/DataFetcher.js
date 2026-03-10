class DataFetcher {
    constructor() {
    }

    /**
     * Searches for songs on Last.fm
     *
     * @private
     * @param {string} name
     * @param {number} limit
     * @returns {Song[]} an array of Song objects
     */
    async getSongInfos(name, limit = 1) {
        const query = name;

        const apiKey = 'b362b9a7f5f0c5a7f749d568b68bc32a';
        const searchUrl = `https://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(query)}&api_key=${apiKey}&format=json&limit=${limit}`;

        const response = await fetch(searchUrl);

        const result = await response.json();
        const tracks = result?.results?.trackmatches?.track || [];

        const songs = await Promise.all(tracks.map(async (searchTrack) => {
            try {
                const infoUrl = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${apiKey}&artist=${encodeURIComponent(searchTrack.artist)}&track=${encodeURIComponent(searchTrack.name)}&format=json`;
                const infoResponse = await fetch(infoUrl, {
                    headers: {
                        'User-Agent': 'Application LyricPost/1.0 (pogromca.ap@gmail.com)',
                    },
                });
                const infoResult = await infoResponse.json();

                if (infoResult.track) {
                    return new Song(infoResult.track);
                }
            } catch (err) {
                console.error('Failed to fetch track info for', searchTrack.name, err);
            }
            return null;
        }));

        return songs.filter(song => song !== null);
    }

    /**
     * Gets a single track by Last.fm track MBID
     *
     * @private
     * @param {string} mbid
     * @returns {Song|null} a Song object
     */
    async getTrackById(mbid) {
        const apiKey = 'b362b9a7f5f0c5a7f749d568b68bc32a';
        const requestUrl = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${apiKey}&mbid=${mbid}&format=json`;

        const response = await fetch(requestUrl, {
            headers: {
                'User-Agent': 'Application LyricPost/1.0 (pogromca.ap@gmail.com)',
            },
        });

        if (!response.ok) return null;
        const result = await response.json();

        if (result.track) {
            return new Song(result.track);
        }

        return null;
    }

    /**
     * Searches for song lyrics on lrclib
     *
     * @private
     * @param {string} artistName
     * @param {string} trackName
     * @returns {object} song lyrics object
     */
    async getSongLyrics(artistName, trackName) {
        const response = await fetch(
            `https://lrclib.net/api/search?q=${artistName} ${trackName}`,
            {
                method: "GET",
            }
        );

        const result = await response.json();

        const filteredResult = result.filter(
            (data) =>
                data.trackName.toLowerCase().trim() ===
                trackName.toLowerCase().trim()
        );

        return filteredResult[0] ?? result[0] ?? null;
    }
}
