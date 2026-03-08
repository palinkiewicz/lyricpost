class DataFetcher {
    constructor() {
    }

    /**
     * Searches for songs on MusicBrainz
     *
     * @private
     * @param {string} name
     * @param {string} artist
     * @param {number} limit
     * @returns {Song[]} an array of Song objects
     */
    async getSongInfos(name, artist, limit = 9) {
        let query = "";
        if (name && artist) {
            query = `${name} AND artist:${artist}`;
        } else if (name) {
            query = name;
        } else if (artist) {
            query = `artist:${artist}`;
        }

        const requestUrl = `https://musicbrainz.org/ws/2/recording?query=${query}&limit=${limit}&fmt=json`;

        const response = await fetch(requestUrl, {
            headers: {
                'User-Agent': 'Application LyricPost/1.0 (pogromca.ap@gmail.com)',
            },
        });

        const result = await response.json();

        const recordings = result.recordings;

        const songs = await Promise.all(recordings.map(async (recording) => {
            let albumCoverUrl = null;
            if (recording.releases && recording.releases.length > 0) {
                const mbid = recording.releases[0].id;
                try {
                    const coverResponse = await fetch(`https://coverartarchive.org/release/${mbid}`);
                    if (coverResponse.ok) {
                        const coverData = await coverResponse.json();
                        if (coverData.images && coverData.images.length > 0) {
                            albumCoverUrl = coverData.images[0].thumbnails['250'] || coverData.images[0].image;
                        }
                    }
                } catch (err) {
                    console.error('Failed to fetch cover art for', mbid, err);
                }
            }
            recording.albumCoverUrl = albumCoverUrl?.replace('http://', 'https://');
            return new Song(recording);
        }));

        return songs;
    }

    /**
     * Gets a single track by MusicBrainz recording ID
     *
     * @private
     * @param {string} trackId
     * @returns {Song|null} a Song object
     */
    async getTrackById(trackId) {
        const requestUrl = `https://musicbrainz.org/ws/2/recording/${trackId}?inc=artist-credits+releases&fmt=json`;

        const response = await fetch(requestUrl, {
            headers: {
                'User-Agent': 'Application LyricPost/1.0 (pogromca.ap@gmail.com)',
            },
        });

        if (!response.ok) return null;
        const recording = await response.json();

        let albumCoverUrl = null;
        if (recording.releases && recording.releases.length > 0) {
            const mbid = recording.releases[0].id;
            try {
                const coverResponse = await fetch(`https://coverartarchive.org/release/${mbid}`);
                if (coverResponse.ok) {
                    const coverData = await coverResponse.json();
                    if (coverData.images && coverData.images.length > 0) {
                        albumCoverUrl = coverData.images[0].thumbnails['250'] || coverData.images[0].image;
                    }
                }
            } catch (err) {
                console.error('Failed to fetch cover art for', mbid, err);
            }
        }

        recording.albumCoverUrl = albumCoverUrl;

        return new Song(recording);
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
